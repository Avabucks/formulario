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
        `SELECT A.beautiful_id AS "id", A.titolo, A.capitolo AS "capitoloId", C.titolo AS "capitoloTitolo", C.formulario AS "formularioId", F.titolo AS "formularioTitolo", F.owner_uid AS "ownerUid"
        FROM argomenti A JOIN capitoli C ON A.capitolo = C.beautiful_id JOIN formulari F ON C.formulario = F.beautiful_id
        WHERE F.owner_uid = $1`,
        [uid]
    );

    const results = rows
        .map((r) => ({
            ...r,
            titolo: decrypt(r.titolo, r.ownerUid),
            capitoloTitolo: decrypt(r.capitoloTitolo, r.ownerUid),
            formularioTitolo: decrypt(r.formularioTitolo, r.ownerUid),
            content: r.content ? decrypt(r.content, r.ownerUid) : null,
        }))
        .filter((r) =>
            r.titolo.toLowerCase().includes(titolo.toLowerCase()) ||
            r.content?.toLowerCase().includes(titolo.toLowerCase())
        )
        .slice(0, 4);

    return NextResponse.json(results);

    return NextResponse.json(rows);
}