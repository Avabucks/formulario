import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const capitoloId = formData.get("capitoloId") as string;
    const direction = formData.get("direction") as string;

    if (!capitoloId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });
    if (direction !== "up" && direction !== "down") return NextResponse.json({ error: "Direzione non valida" }, { status: 400 });

    try {
        const { rows } = await pool.query(
            `SELECT c.sort_order, c.formulario AS parent FROM capitoli c
             JOIN formulari f ON f.beautiful_id = c.formulario
             WHERE c.beautiful_id = $1 AND f.autore = $2`,
            [capitoloId, uid]
        );

        if (rows.length === 0) return NextResponse.json({ error: "Capitolo non trovato o non autorizzato" }, { status: 404 });

        const { sort_order, parent } = rows[0];
        const targetOrder = direction === "up" ? sort_order - 1 : sort_order + 1;

        const { rows: adjacent } = await pool.query(
            `SELECT beautiful_id FROM capitoli WHERE formulario = $1 AND sort_order = $2`,
            [parent, targetOrder]
        );

        if (adjacent.length === 0) return NextResponse.json({ error: "Movimento non possibile" }, { status: 400 });

        await pool.query(`UPDATE capitoli SET sort_order = $1 WHERE beautiful_id = $2`, [targetOrder, capitoloId]);
        await pool.query(`UPDATE capitoli SET sort_order = $1 WHERE beautiful_id = $2`, [sort_order, adjacent[0].beautiful_id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nello spostamento del capitolo" }, { status: 500 });
    }
}