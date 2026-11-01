import { CATEGORIA_NOME_MAX, isValidColore } from "@/src/lib/categorie";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MAX_CATEGORIE = 50;

async function getUid() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  return session.uid;
}

const unauthorized = () =>
  NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

function parseNome(nome: unknown) {
  if (typeof nome !== "string") return null;
  const trimmed = nome.trim();
  if (!trimmed || trimmed.length > CATEGORIA_NOME_MAX) return null;
  return trimmed;
}

function handleDbError(error: unknown) {
  const { code, message } = (error ?? {}) as {
    code?: string;
    message?: string;
  };
  // unique_violation on (user_uid, nome)
  if (code === "23505")
    return NextResponse.json(
      { error: "Esiste già una categoria con questo nome" },
      { status: 409 },
    );
  console.error(message);
  return NextResponse.json({ error: "Errore del server" }, { status: 500 });
}

/** Lists the current user's categories, with how many formulari use each one */
export async function GET() {
  const uid = await getUid();
  if (!uid) return unauthorized();

  const { rows } = await pool.query(
    `SELECT C.id, C.nome, C.colore,
       (SELECT COUNT(*)::int FROM formulari F WHERE F.categoria_id = C.id) AS "formulariCount"
     FROM categorie C WHERE C.user_uid = $1 ORDER BY C.sort_order, C.id`,
    [uid],
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const uid = await getUid();
  if (!uid) return unauthorized();

  const { nome: rawNome, colore } = await request.json().catch(() => ({}));
  const nome = parseNome(rawNome);
  if (!nome)
    return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
  if (!isValidColore(colore))
    return NextResponse.json({ error: "Colore non valido" }, { status: 400 });

  try {
    const { rows: count } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM categorie WHERE user_uid = $1`,
      [uid],
    );
    if (count[0].n >= MAX_CATEGORIE)
      return NextResponse.json(
        { error: `Puoi creare al massimo ${MAX_CATEGORIE} categorie` },
        { status: 400 },
      );

    const { rows } = await pool.query(
      // New categories go to the end of the user's list
      `INSERT INTO categorie (user_uid, nome, colore, sort_order)
       VALUES ($1, $2, $3,
         (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categorie WHERE user_uid = $1))
       RETURNING id, nome, colore`,
      [uid, nome, colore.toLowerCase()],
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return handleDbError(error);
  }
}

export async function PUT(request: Request) {
  const uid = await getUid();
  if (!uid) return unauthorized();

  const { id, nome: rawNome, colore } = await request.json().catch(() => ({}));
  const nome = parseNome(rawNome);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "ID mancante" }, { status: 400 });
  if (!nome)
    return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
  if (!isValidColore(colore))
    return NextResponse.json({ error: "Colore non valido" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `UPDATE categorie SET nome = $1, colore = $2
       WHERE id = $3 AND user_uid = $4
       RETURNING id, nome, colore`,
      [nome, colore.toLowerCase(), id, uid],
    );
    if (rows.length === 0)
      return NextResponse.json(
        { error: "Categoria non trovata" },
        { status: 404 },
      );

    revalidatePath("/home");
    return NextResponse.json(rows[0]);
  } catch (error) {
    return handleDbError(error);
  }
}

/** Saves the display order: body is { ids } with every category id of the user, in order */
export async function PATCH(request: Request) {
  const uid = await getUid();
  if (!uid) return unauthorized();

  const { ids } = await request.json().catch(() => ({}));
  if (
    !Array.isArray(ids) ||
    !ids.every(Number.isInteger) ||
    new Set(ids).size !== ids.length
  )
    return NextResponse.json({ error: "Ordine non valido" }, { status: 400 });

  try {
    // Only the user's own categories are touched; ids must cover all of them
    const result = await pool.query(
      `UPDATE categorie C SET sort_order = O.pos
       FROM unnest($1::int[]) WITH ORDINALITY AS O(id, pos)
       WHERE C.id = O.id AND C.user_uid = $2`,
      [ids, uid],
    );
    const { rows: count } = await pool.query(
      `SELECT COUNT(*)::int AS n FROM categorie WHERE user_uid = $1`,
      [uid],
    );
    if (result.rowCount !== ids.length || count[0].n !== ids.length)
      return NextResponse.json(
        { error: "Elenco categorie non aggiornato, ricarica la pagina" },
        { status: 409 },
      );

    revalidatePath("/home");
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleDbError(error);
  }
}

/** Deletes a category; its formulari fall back to "no category" (ON DELETE SET NULL) */
export async function DELETE(request: Request) {
  const uid = await getUid();
  if (!uid) return unauthorized();

  const { id } = await request.json().catch(() => ({}));
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "ID mancante" }, { status: 400 });

  try {
    const result = await pool.query(
      `DELETE FROM categorie WHERE id = $1 AND user_uid = $2`,
      [id, uid],
    );
    if (result.rowCount === 0)
      return NextResponse.json(
        { error: "Categoria non trovata" },
        { status: 404 },
      );

    revalidatePath("/home");
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleDbError(error);
  }
}
