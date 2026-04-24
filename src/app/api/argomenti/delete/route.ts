import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const argomentoId = formData.get("argomentoId") as string;

    if (!argomentoId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `UPDATE formulari f
            SET data_modifica = CURRENT_TIMESTAMP
            FROM capitoli c
            JOIN argomenti a ON a.capitolo = c.beautiful_id
            WHERE a.beautiful_id = $1
            AND c.formulario = f.beautiful_id`,
            [argomentoId]
        );

        const { rows } = await client.query(
            `SELECT a.sort_order, a.capitolo AS parent
             FROM argomenti a
             JOIN capitoli c ON c.beautiful_id = a.capitolo
             JOIN formulari f ON f.beautiful_id = c.formulario
             WHERE a.beautiful_id = $1 AND f.owner_uid = $2`,
            [argomentoId, uid]
        );

        if (rows.length === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json({ error: "Argomento non trovato o non autorizzato" }, { status: 404 });
        }

        const { sort_order, parent } = rows[0];

        await client.query(
            `DELETE FROM argomenti WHERE beautiful_id = $1`,
            [argomentoId]
        );

        await client.query(
            `UPDATE argomenti
             SET sort_order = sort_order - 1
             WHERE capitolo = $1 AND sort_order > $2`,
            [parent, sort_order]
        );

        await client.query("COMMIT");

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        await client.query("ROLLBACK");
        console.error(error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Errore nell'eliminazione dell'argomento" }, { status: 500 });
    } finally {
        client.release();
    }
}