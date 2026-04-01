import { encrypt } from "@/src/lib/crypto";
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
    const visibility = Number(formData.get("visibility")) as 0 | 1 | 2;
    const anno = new Date().getFullYear().toString();

    if (!titolo || !descrizione) return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
    if (titolo.length > 30) return NextResponse.json({ error: "Il titolo è troppo lungo" }, { status: 400 });
    if (descrizione.length > 200) return NextResponse.json({ error: "La descrizione è troppo lunga" }, { status: 400 });
    if (![0, 1, 2].includes(visibility)) return NextResponse.json({ error: "Visibility non valida" }, { status: 400 });

    const beautiful_id = slugify(titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();

    try {
        await pool.query(
            `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid, anno, visibility)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [beautiful_id, encrypt(titolo, uid), encrypt(descrizione, uid), uid, uid, anno, visibility]
        );

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }
}