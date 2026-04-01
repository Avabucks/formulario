import { encrypt } from "@/src/lib/crypto";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const id = formData.get("formularioId") as string;
    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const visibility = Number(formData.get("visibility")) as 0 | 1 | 2;

    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    if (!titolo || !descrizione) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    if (![0, 1, 2].includes(visibility)) return NextResponse.json({ error: "Visibility non valida" }, { status: 400 });

    try {
        const result = await pool.query(
            `UPDATE formulari 
             SET titolo = $1, descrizione = $2, visibility = $3
             WHERE beautiful_id = $4 AND owner_uid = $5`,
            [encrypt(titolo, uid), encrypt(descrizione, uid), visibility, id, uid]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: "Formulario non trovato o non autorizzato" }, { status: 404 });

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
    }
}