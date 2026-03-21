import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";

export async function DELETE(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const capitoloId = formData.get("capitoloId") as string;

    if (!capitoloId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });

    try {
        const { rows } = await pool.query(
            `SELECT sort_order, formulario AS parent FROM capitoli WHERE beautiful_id = $1`,
            [capitoloId]
        );

        if (rows.length === 0) return NextResponse.json({ error: "Capitolo non trovato" }, { status: 404 });

        const { sort_order, parent } = rows[0];

        const result = await pool.query(
            `DELETE FROM capitoli
             WHERE beautiful_id = $1
             AND formulario IN (SELECT beautiful_id AS "id" FROM formulari WHERE autore = $2)`,
            [capitoloId, uid]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: "Capitolo non trovato o non autorizzato" }, { status: 404 });

        await pool.query(
            `UPDATE capitoli SET sort_order = sort_order - 1
             WHERE formulario = $1 AND sort_order > $2`,
            [parent, sort_order]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nell'eliminazione del capitolo" }, { status: 500 });
    }
}