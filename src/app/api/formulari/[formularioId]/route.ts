import { decrypt } from "@/src/lib/crypto";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ formularioId: string }> }) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { formularioId } = await params;

    const { rows, rowCount } = await pool.query(
        `SELECT F.beautiful_id AS "id", F.titolo, F.descrizione, F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore", F.anno, F.views, F.visibility,
            EXISTS (SELECT 1 FROM preferiti P WHERE P.formulario_id = F.beautiful_id AND P.user_uid = $2) AS starred,
            (SELECT COUNT(*) FROM preferiti P2 WHERE P2.formulario_id = F.beautiful_id) AS likes
         FROM formulari F
         JOIN users U_A ON F.author_uid = U_A.uid
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility > 0)`,
        [formularioId, uid]
    );

    if (rowCount === 0) return NextResponse.json({ error: "Formulario non trovato" }, { status: 404 });

    const formularioDecrypted = {
        ...rows[0],
        titolo: decrypt(rows[0].titolo, rows[0].ownerUid),
        descrizione: decrypt(rows[0].descrizione, rows[0].ownerUid),
        editable: rows[0].ownerUid === uid,
    };

    return NextResponse.json(formularioDecrypted);
}