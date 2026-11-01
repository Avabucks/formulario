import { pool } from "@/src/lib/db";
import { getR2 } from "@/src/lib/r2";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per immagine
const MAX_USER_STORAGE = 200 * 1024 * 1024; // 200MB per utente
const ALLOWED_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

/** Returns a presigned URL to upload one image straight to R2 */
export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;
  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const r2 = getR2();
  if (!r2)
    return NextResponse.json(
      { error: "Caricamento immagini non configurato" },
      { status: 503 },
    );

  const { argomentoId, contentType, size } = await request.json();

  const ext = ALLOWED_TYPES[contentType];
  if (!ext)
    return NextResponse.json(
      { error: "Formato immagine non supportato" },
      { status: 415 },
    );
  if (!Number.isInteger(size) || size <= 0 || size > MAX_FILE_SIZE)
    return NextResponse.json(
      { error: "Immagine troppo grande (max 5MB)" },
      { status: 413 },
    );

  try {
    // Without an argomento the image goes to the user's library (uploaded from the image manager)
    let folder = "library";
    if (argomentoId) {
      const { rows } = await pool.query(
        `SELECT f.beautiful_id AS "formularioId" FROM argomenti a
         JOIN capitoli c ON c.beautiful_id = a.capitolo
         JOIN formulari f ON f.beautiful_id = c.formulario
         WHERE a.beautiful_id = $1 AND f.owner_uid = $2`,
        [argomentoId, uid],
      );
      if (!rows.length)
        return NextResponse.json(
          { error: "Argomento non trovato" },
          { status: 404 },
        );
      folder = rows[0].formularioId;
    }

    const { rows: usage } = await pool.query(
      `SELECT COALESCE(SUM(size), 0)::bigint AS total FROM uploads WHERE user_uid = $1`,
      [uid],
    );
    if (Number(usage[0].total) + size > MAX_USER_STORAGE)
      return NextResponse.json(
        { error: "Hai raggiunto lo spazio massimo per le immagini" },
        { status: 413 },
      );

    const key = `${folder}/${crypto.randomUUID()}.${ext}`;
    const uploadUrl = await getSignedUrl(
      r2.client,
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: size,
      }),
      // Signing type and length makes R2 reject a different file than declared
      {
        expiresIn: 300,
        signableHeaders: new Set(["content-type", "content-length"]),
      },
    );

    await pool.query(
      `INSERT INTO uploads (key, user_uid, argomento_id, size) VALUES ($1, $2, $3, $4)`,
      [key, uid, argomentoId || null, size],
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${r2.publicUrl}/${key}`,
    });
  } catch (error: any) {
    console.error("Errore upload:", error.message);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}

async function getUid() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  return session.uid;
}

/** Lists the user's uploaded images, with storage usage and whether a note still uses each one */
export async function GET() {
  const uid = await getUid();
  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const r2 = getR2();
  if (!r2)
    return NextResponse.json(
      { error: "Caricamento immagini non configurato" },
      { status: 503 },
    );

  try {
    const { rows } = await pool.query(
      `SELECT u.key, u.size, u.created_at AS "createdAt",
              EXISTS (
                SELECT 1 FROM argomenti a2
                JOIN capitoli c2 ON c2.beautiful_id = a2.capitolo
                JOIN formulari f2 ON f2.beautiful_id = c2.formulario
                WHERE f2.owner_uid = $1 AND strpos(a2.content, u.key) > 0
              ) AS "inUse"
       FROM uploads u
       WHERE u.user_uid = $1
       ORDER BY u.created_at DESC`,
      [uid],
    );

    return NextResponse.json({
      images: rows.map((row) => ({
        ...row,
        url: `${r2.publicUrl}/${row.key}`,
      })),
      used: rows.reduce((sum, row) => sum + Number(row.size), 0),
      max: MAX_USER_STORAGE,
    });
  } catch (error) {
    console.error("Errore lista upload:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}

/** Deletes one of the user's images from R2 and frees its quota */
export async function DELETE(request: Request) {
  const uid = await getUid();
  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const r2 = getR2();
  if (!r2)
    return NextResponse.json(
      { error: "Caricamento immagini non configurato" },
      { status: 503 },
    );

  const { key } = await request.json().catch(() => ({}));
  if (typeof key !== "string" || !key)
    return NextResponse.json({ error: "Chiave mancante" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM uploads WHERE key = $1 AND user_uid = $2`,
      [key, uid],
    );
    if (!rows.length)
      return NextResponse.json(
        { error: "Immagine non trovata" },
        { status: 404 },
      );

    await r2.client.send(
      new DeleteObjectCommand({ Bucket: r2.bucket, Key: key }),
    );
    await pool.query(`DELETE FROM uploads WHERE key = $1 AND user_uid = $2`, [
      key,
      uid,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione upload:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
