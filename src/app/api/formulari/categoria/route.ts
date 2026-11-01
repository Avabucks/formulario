import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/** Assigns one of the user's categories (or none) to a formulario they own */
export async function PUT(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;
  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { formularioId, categoriaId } = await request.json().catch(() => ({}));

  if (typeof formularioId !== "string" || !formularioId)
    return NextResponse.json({ error: "ID mancante" }, { status: 400 });
  if (categoriaId !== null && !Number.isInteger(categoriaId))
    return NextResponse.json(
      { error: "Categoria non valida" },
      { status: 400 },
    );

  try {
    if (categoriaId !== null) {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM categorie WHERE id = $1 AND user_uid = $2`,
        [categoriaId, uid],
      );
      if (rowCount === 0)
        return NextResponse.json(
          { error: "Categoria non trovata" },
          { status: 404 },
        );
    }

    // data_modifica untouched: changing category isn't a content edit
    const result = await pool.query(
      `UPDATE formulari SET categoria_id = $1
       WHERE beautiful_id = $2 AND owner_uid = $3`,
      [categoriaId, formularioId, uid],
    );
    if (result.rowCount === 0)
      return NextResponse.json(
        { error: "Formulario non trovato o non autorizzato" },
        { status: 404 },
      );

    revalidatePath("/home");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error((error as Error).message);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento" },
      { status: 500 },
    );
  }
}
