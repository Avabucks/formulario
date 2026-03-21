import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const formularioId = formData.get("formularioId") as string;

    if (!titolo) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    if (!formularioId) return NextResponse.json({ error: "Formulario non specificato" }, { status: 400 });

    const beautiful_id = Date.now().toString(36);

    const { rows: formularioRows } = await pool.query(
        `SELECT id FROM formulari WHERE beautiful_id = $1 AND autore = $2`,
        [formularioId, uid]
    );

    if (!formularioRows.length) return NextResponse.json({ error: "Formulario non trovato" }, { status: 404 });

    try {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM capitoli WHERE formulario = $1`,
            [formularioId]
        );

        await pool.query(
            `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [beautiful_id, titolo, formularioId, rows[0].next_order]
        );

        revalidatePath(`/formulari/${formularioId}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nel salvataggio del capitolo" }, { status: 500 });
    }
}