import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { formularioId } = await request.json();

    if (!formularioId) {
        return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows: [formulario] } = await client.query(
            `SELECT * FROM formulari WHERE beautiful_id = $1 AND visibility > 0`,
            [formularioId]
        );

        if (!formulario) {
            await client.query("ROLLBACK");
            return NextResponse.json({ error: "Formulario non trovato" }, { status: 404 });
        }

        const newFormularioId = slugify(formulario.titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();

        await client.query(
            `INSERT INTO formulari (beautiful_id, titolo, owner_uid, author_uid, data_creazione, data_modifica, descrizione, visibility)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)`,
            [newFormularioId, formulario.titolo, uid, formulario.author_uid, formulario.data_creazione, formulario.descrizione, 0]
        );

        const { rows: capitoli } = await client.query(
            `SELECT * FROM capitoli WHERE formulario = $1 ORDER BY sort_order`,
            [formularioId]
        );

        for (const capitolo of capitoli) {
            const newCapitoloId = crypto.randomUUID();

            await client.query(
                `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
                 VALUES ($1, $2, $3, $4)`,
                [newCapitoloId, capitolo.titolo, newFormularioId, capitolo.sort_order]
            );

            const { rows: argomenti } = await client.query(
                `SELECT * FROM argomenti WHERE capitolo = $1 ORDER BY sort_order`,
                [capitolo.beautiful_id]
            );

            for (const argomento of argomenti) {
                await client.query(
                    `INSERT INTO argomenti (beautiful_id, capitolo, sort_order, content)
                     VALUES ($1, $2, $3, $4)`,
                    [crypto.randomUUID(), newCapitoloId, argomento.sort_order, argomento.content]
                );
            }
        }

        await client.query("COMMIT");

        revalidatePath("/home");
        return NextResponse.json({ success: true });

    } catch (error: any) {
        await client.query("ROLLBACK");
        console.error(error.message);
        return NextResponse.json({ error: "Errore nella duplicazione" }, { status: 500 });
    } finally {
        client.release();
    }
}