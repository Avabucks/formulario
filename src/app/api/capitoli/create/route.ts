import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const formularioId = formData.get("formularioId") as string;

    if (!formularioId) return NextResponse.json({ error: "Formulario non specificato" }, { status: 400 });

    const { rows: formularioRows } = await pool.query(
        `SELECT id FROM formulari WHERE beautiful_id = $1 AND owner_uid = $2`,
        [formularioId, uid]
    );

    if (!formularioRows.length) return NextResponse.json({ error: "Formulario non trovato" }, { status: 404 });

    const capitolo_id = crypto.randomUUID();
    const argomento_id = crypto.randomUUID();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM capitoli WHERE formulario = $1`,
            [formularioId]
        );

        await client.query(
            `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [capitolo_id, titolo == '' ? null : titolo, formularioId, rows[0].next_order]
        );

        await client.query(
            `INSERT INTO argomenti (beautiful_id, capitolo, sort_order, content)
             VALUES ($1, $2, 0, '')`,
            [argomento_id, capitolo_id]
        );

        await client.query(
            `UPDATE formulari SET data_modifica = CURRENT_TIMESTAMP WHERE beautiful_id = $1`,
            [formularioId]
        );

        await client.query("COMMIT");

        revalidatePath(`/formulari/${formularioId}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        await client.query("ROLLBACK");
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio del capitolo" }, { status: 500 });
    } finally {
        client.release();
    }
}