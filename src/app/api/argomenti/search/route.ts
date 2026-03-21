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
        `SELECT A.beautiful_id AS "id", A.titolo, A.capitolo AS "capitoloId", C.titolo AS "capitoloTitolo", C.formulario AS "formularioId", F.titolo AS "formularioTitolo", similarity(A.titolo, $1) AS similarity
         FROM argomenti A JOIN capitoli C ON A.capitolo = C.beautiful_id JOIN formulari F ON C.formulario = F.beautiful_id
         WHERE F.autore = $2 AND similarity(A.titolo, $1) > 0.2
         ORDER BY similarity DESC, A.titolo DESC
         LIMIT 4`,
        [titolo, uid]
    );

    return NextResponse.json(rows);
}