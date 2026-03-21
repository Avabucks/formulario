import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const argomentoId = formData.get("argomentoId") as string;
    const direction = formData.get("direction") as string;

    if (!argomentoId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });
    if (direction !== "up" && direction !== "down") return NextResponse.json({ error: "Direzione non valida" }, { status: 400 });

    try {
        const { rows } = await pool.query(
            `SELECT a.sort_order, a.capitolo AS parent FROM argomenti a
             JOIN capitoli c ON c.beautiful_id = a.capitolo
             JOIN formulari f ON f.beautiful_id = c.formulario
             WHERE a.beautiful_id = $1 AND f.autore = $2`,
            [argomentoId, uid]
        );

        if (rows.length === 0) return NextResponse.json({ error: "Argomento non trovato o non autorizzato" }, { status: 404 });

        const { sort_order, parent } = rows[0];
        const targetOrder = direction === "up" ? sort_order - 1 : sort_order + 1;

        const { rows: adjacent } = await pool.query(
            `SELECT beautiful_id FROM argomenti WHERE capitolo = $1 AND sort_order = $2`,
            [parent, targetOrder]
        );

        if (adjacent.length === 0) return NextResponse.json({ error: "Movimento non possibile" }, { status: 400 });

        await pool.query(`UPDATE argomenti SET sort_order = $1 WHERE beautiful_id = $2`, [targetOrder, argomentoId]);
        await pool.query(`UPDATE argomenti SET sort_order = $1 WHERE beautiful_id = $2`, [sort_order, adjacent[0].beautiful_id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nello spostamento dell'argomento" }, { status: 500 });
    }
}