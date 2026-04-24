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

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const dataCreazione = new Date().toISOString();

    if (!titolo || !descrizione) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });

    const beautiful_id = slugify(titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();

    try {
        await pool.query(
            `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid, data_creazione)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [beautiful_id, titolo, descrizione, uid, uid, dataCreazione]
        );

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }
}