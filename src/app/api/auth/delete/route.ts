import { pool } from "@/src/lib/db";
import { adminAuth } from "@/src/lib/firebase-admin";
import { getR2 } from "@/src/lib/r2";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.uid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const idToken = request.headers.get("X-Firebase-ID-Token");
  if (idToken) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken, true);

      if (decoded.uid !== session.uid) {
        return NextResponse.json(
          { error: "Token non corrispondente" },
          { status: 403 },
        );
      }

      if (Date.now() / 1000 - decoded.iat > 300) {
        return NextResponse.json(
          { error: "Token scaduto, riprova" },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "ID token non valido" },
        { status: 403 },
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const { confirmUsername } = body as { confirmUsername?: string };

  const { rows: users } = await pool.query(
    `SELECT display_name as "displayName" FROM users WHERE uid = $1`,
    [session.uid],
  );

  const displayName = users[0]?.displayName;
  if (
    !displayName ||
    !confirmUsername ||
    confirmUsername.trim() !== displayName
  ) {
    return NextResponse.json(
      { error: "Nome utente di conferma non corretto" },
      { status: 400 },
    );
  }

  // Remove the user's images from R2 before dropping their rows
  const r2 = getR2();
  const { rows: uploads } = await pool.query<{ key: string }>(
    `SELECT key FROM uploads WHERE user_uid = $1`,
    [session.uid],
  );
  if (r2 && uploads.length) {
    try {
      // DeleteObjects accepts at most 1000 keys per request
      for (let i = 0; i < uploads.length; i += 1000) {
        await r2.client.send(
          new DeleteObjectsCommand({
            Bucket: r2.bucket,
            Delete: {
              Objects: uploads
                .slice(i, i + 1000)
                .map(({ key }) => ({ Key: key })),
              Quiet: true,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Errore eliminazione immagini account:", error);
      return NextResponse.json(
        { error: "Errore durante l'eliminazione delle immagini, riprova" },
        { status: 500 },
      );
    }
  }
  await pool.query(`DELETE FROM uploads WHERE user_uid = $1`, [session.uid]);

  await pool.query(`DELETE FROM formulari WHERE owner_uid = $1`, [session.uid]);
  await pool.query(`DELETE FROM users WHERE uid = $1`, [session.uid]);

  session.destroy();
  return NextResponse.redirect(new URL("/login", request.url));
}
