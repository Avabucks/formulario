import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { argomentoId, content } = await request.json();

    if (!argomentoId) return NextResponse.json({ error: "Argomento non specificato" }, { status: 400 });
    if (content === undefined) return NextResponse.json({ error: "Contenuto mancante" }, { status: 400 });

    const { rows } = await pool.query(
        `SELECT a.beautiful_id FROM argomenti a
         JOIN capitoli c ON c.beautiful_id = a.capitolo
         JOIN formulari f ON f.beautiful_id = c.formulario
         WHERE a.beautiful_id = $1 AND f.owner_uid = $2`,
        [argomentoId, uid]
    );

    if (!rows.length) return NextResponse.json({ error: "Argomento non trovato" }, { status: 404 });

    try {
        await pool.query(
            `UPDATE argomenti SET content = $1 WHERE beautiful_id = $2`,
            [content, argomentoId]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio del contenuto" }, { status: 500 });
    }
}