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

    try {
        const { rows } = await pool.query(
            `SELECT sort_order, capitolo AS parent FROM argomenti WHERE beautiful_id = $1`,
            [argomentoId]
        );

        if (rows.length === 0) return NextResponse.json({ error: "Argomento non trovato" }, { status: 404 });

        const { sort_order, parent } = rows[0];

        const result = await pool.query(
            `DELETE FROM argomenti
             WHERE beautiful_id = $1
             AND capitolo IN (
                SELECT beautiful_id FROM capitoli
                WHERE formulario IN (SELECT beautiful_id FROM formulari WHERE autore = $2)
             )`,
            [argomentoId, uid]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: "Argomento non trovato o non autorizzato" }, { status: 404 });

        await pool.query(
            `UPDATE argomenti SET sort_order = sort_order - 1
             WHERE capitolo = $1 AND sort_order > $2`,
            [parent, sort_order]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nell'eliminazione dell'argomento" }, { status: 500 });
    }
}