import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";

export async function GET(request: Request, { params }: { params: { formularioId: string } }) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { formularioId } = await params;

    const { rows, rowCount } = await pool.query(
        `SELECT F.beautiful_id AS "id", F.titolo, F.descrizione, F.autore, F.anno,
                F.visibility_public AS "visibilityPublic", U.display_name AS "nomeAutore"
         FROM formulari F
         JOIN users U ON F.autore = U.uid
         WHERE F.beautiful_id = $1
           AND (F.autore = $2 OR F.visibility_public = true)`,
        [formularioId, uid]
    );

    if (rowCount === 0) return NextResponse.json({ error: "Formulario non trovato" }, { status: 404 });

    const formulario = {
        ...rows[0],
        editable: rows[0].autore === uid,
    };

    return NextResponse.json(formulario);
}