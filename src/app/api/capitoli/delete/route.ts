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
    const capitoloId = formData.get("capitoloId") as string;

    if (!capitoloId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });

    try {
        const { rows } = await pool.query(
            `SELECT c.sort_order, c.formulario AS parent
             FROM capitoli c
             JOIN formulari f ON f.beautiful_id = c.formulario
             WHERE c.beautiful_id = $1 AND f.owner_uid = $2`,
            [capitoloId, uid]
        );

        if (rows.length === 0) return NextResponse.json({ error: "Capitolo non trovato o non autorizzato" }, { status: 404 });

        const { sort_order, parent } = rows[0];

        await pool.query(`DELETE FROM capitoli WHERE beautiful_id = $1`, [capitoloId]);

        await pool.query(
            `UPDATE capitoli SET sort_order = sort_order - 1
             WHERE formulario = $1 AND sort_order > $2`,
            [parent, sort_order]
        );

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Errore nell'eliminazione del capitolo" }, { status: 500 });
    }
}