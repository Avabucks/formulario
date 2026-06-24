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

  try {
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
             SET titolo = $1, descrizione = $2, visibility = $3
             WHERE beautiful_id = $4 AND owner_uid = $5`,
      [titolo, descrizione, visibility, id, uid],
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

    // Notifica Discord solo se il formulario diventa pubblico per la prima volta (visibility 2)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (oldVisibility !== 2 && visibility === 2 && webhookUrl) {
      const { rows: users } = await pool.query(
        `SELECT display_name as "displayName" FROM users WHERE uid = $1`,
        [uid],
      );
      const authorName = users[0]?.displayName || "Uno studente";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `📚 Nuovo Formulario Pubblicato!`,
              description: `**${authorName}** ha appena reso pubblico il formulario [**${titolo}**](${appUrl}/formulario/${id}).`,
              color: 0x610a9e,
              timestamp: new Date().toISOString(),
              footer: {
                text: "FormulaBase Community",
              },
            },
          ],
        }),
      }).catch((err) => console.error("Errore webhook Discord:", err));
    }

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
