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
    const capitoloId = formData.get("capitoloId") as string;

    if (!titolo) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    if (!capitoloId) return NextResponse.json({ error: "Capitolo non specificato" }, { status: 400 });

    const beautiful_id = Date.now().toString(36);

    const { rows: capitoloRows } = await pool.query(
        `SELECT c.beautiful_id FROM capitoli c
         JOIN formulari f ON f.beautiful_id = c.formulario
         WHERE c.beautiful_id = $1 AND f.autore = $2`,
        [capitoloId, uid]
    );

    if (!capitoloRows.length) return NextResponse.json({ error: "Capitolo non trovato" }, { status: 404 });

    try {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM argomenti WHERE capitolo = $1`,
            [capitoloId]
        );

        await pool.query(
            `INSERT INTO argomenti (beautiful_id, titolo, capitolo, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [beautiful_id, titolo, capitoloId, rows[0].next_order]
        );

        revalidatePath(`/formulari/${capitoloId}`);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio dell'argomento" }, { status: 500 });
    }
}