import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const anno = new Date().getFullYear().toString();
    const visibilityPublic = formData.get("visibilityPublic") === "on";

    if (!titolo || !descrizione) {
        return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    }

    const beautiful_id = slugify(titolo, { lower: true, strict: true }) + "-" + Date.now().toString(36);

    try {
        await pool.query(
            `INSERT INTO formulari (beautiful_id, titolo, descrizione, autore, anno, visibility_public)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [beautiful_id, titolo, descrizione, uid, anno, visibilityPublic]
        );

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }
}