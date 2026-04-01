import { decrypt, encrypt } from "@/src/lib/crypto";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const titolo = searchParams.get("titolo");

    if (!titolo) return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });

    const { rows } = await pool.query(
        `SELECT beautiful_id AS "id", titolo
        FROM formulari
        WHERE owner_uid = $1`,
        [uid]
    );

    // Decifra tutto e filtra in memoria
    const results = rows
        .map((r) => ({ ...r, titolo: decrypt(r.titolo, uid) }))
        .filter((r) => r.titolo.toLowerCase().includes(titolo.toLowerCase()))
        .slice(0, 4);

    return NextResponse.json(results);
}