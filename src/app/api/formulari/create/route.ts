import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  // check if user exists
  const { rows: users } = await pool.query(
    `SELECT id, display_name as "displayName" FROM users WHERE uid = $1`,
    [uid],
  );
  if (users.length === 0) {
    redirect("/api/auth/logout");
  }

  const formData = await request.formData();
  const titolo = formData.get("titolo") as string;
  const descrizione = formData.get("descrizione") as string;
  const shareDiscord = formData.get("shareDiscord") === "on";

  if (!titolo)
    return NextResponse.json(
      { error: "Campi obbligatori mancanti" },
      { status: 400 },
    );

  const beautiful_id =
    slugify(titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();
  const capitolo_id = crypto.randomUUID();
  const argomento_id = crypto.randomUUID();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid)
            VALUES ($1, $2, $3, $4, $5)`,
      [beautiful_id, titolo, descrizione, uid, uid],
    );

    await client.query(
      `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
            VALUES ($1, NULL, $2, 1)`,
      [capitolo_id, beautiful_id],
    );

    await client.query(
      `INSERT INTO argomenti (beautiful_id, capitolo, sort_order, content)
            VALUES ($1, $2, 1, '')`,
      [argomento_id, capitolo_id],
    );

    await client.query("COMMIT");

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (shareDiscord && webhookUrl) {
      const authorName = users[0]?.displayName || "Uno studente";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `📚 Nuovo Formulario Creato!`,
              description: `**${authorName}** ha appena creato un nuovo formulario su [FormulaBase](${appUrl}).`,
              color: 5814783,
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
    return NextResponse.json({ success: true, formulario_id: beautiful_id });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error(error.message);
    return NextResponse.json(
      { error: "Errore nel salvataggio" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
