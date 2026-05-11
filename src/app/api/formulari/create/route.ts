import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;

    if (!titolo) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });

    const beautiful_id = slugify(titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();
    const capitolo_id = "capitolo-" + crypto.randomUUID();
    const argomento_id = "argomento-" + crypto.randomUUID();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid)
            VALUES ($1, $2, $3, $4, $5)`,
            [beautiful_id, titolo, descrizione, uid, uid]
        );

        await client.query(
            `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
            VALUES ($1, NULL, $2, 0)`,
            [capitolo_id, beautiful_id]
        );

        await client.query(
            `INSERT INTO argomenti (beautiful_id, capitolo, sort_order, content)
            VALUES ($1, $2, 0, '')`,
            [argomento_id, capitolo_id]
        );

        await client.query("COMMIT");

        revalidatePath("/home");
        return NextResponse.json({ success: true, formulario_id: beautiful_id });
    } catch (error: any) {
        await client.query("ROLLBACK");
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    } finally {
        client.release();
    }
}