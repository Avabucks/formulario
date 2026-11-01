import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const formData = await request.formData();
  const id = formData.get("formularioId") as string;
  const titolo = formData.get("titolo") as string;
  const descrizione = formData.get("descrizione") as string;
  const visibility = Number(formData.get("visibility")) as 0 | 1 | 2;
  const rawCategoriaId = formData.get("categoriaId");
  const categoriaId = rawCategoriaId ? Number(rawCategoriaId) : null;

  if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });
  if (!titolo)
    return NextResponse.json(
      { error: "Campi obbligatori mancanti" },
      { status: 400 },
    );
  if (![0, 1, 2].includes(visibility))
    return NextResponse.json(
      { error: "Visibility non valida" },
      { status: 400 },
    );

  if (categoriaId !== null && !Number.isInteger(categoriaId))
    return NextResponse.json(
      { error: "Categoria non valida" },
      { status: 400 },
    );

  try {
    // La categoria deve appartenere all'utente
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

    // Recupera la visibilità precedente per evitare notifiche duplicate ad ogni modifica
    const { rows: currentFormulari } = await pool.query(
      `SELECT visibility FROM formulari WHERE beautiful_id = $1 AND owner_uid = $2`,
      [id, uid],
    );

    if (currentFormulari.length === 0)
      return NextResponse.json(
        { error: "Formulario non trovato o non autorizzato" },
        { status: 404 },
      );

    const oldVisibility = currentFormulari[0].visibility;

    const result = await pool.query(
      `UPDATE formulari 
             SET titolo = $1, descrizione = $2, visibility = $3, categoria_id = $6
             WHERE beautiful_id = $4 AND owner_uid = $5`,
      [titolo, descrizione, visibility, id, uid, categoriaId],
    );

    if (result.rowCount === 0)
      return NextResponse.json(
        { error: "Formulario non trovato o non autorizzato" },
        { status: 404 },
      );

    await pool.query(
      `UPDATE formulari
            SET data_modifica = CURRENT_TIMESTAMP
            WHERE beautiful_id = $1`,
      [id],
    );

    revalidatePath("/home");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento" },
      { status: 500 },
    );
  }
}
