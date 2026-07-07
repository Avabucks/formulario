import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const titolo = searchParams.get("titolo");

  if (!titolo)
    return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });

  const { rows } = await pool.query(
    `SELECT F.beautiful_id AS "id", 
            F.titolo, 
            similarity(F.titolo, $1) AS "similarity",
            (SELECT A.beautiful_id 
             FROM argomenti A 
             JOIN capitoli C ON A.capitolo = C.beautiful_id 
             WHERE C.formulario = F.beautiful_id 
             ORDER BY C.sort_order ASC, A.sort_order ASC 
             LIMIT 1) AS "firstArgomentoId"
         FROM formulari F
         WHERE F.owner_uid = $2 AND similarity(F.titolo, $1) > 0.2
         ORDER BY similarity DESC, F.titolo DESC
         LIMIT 4`,
    [titolo, uid],
  );

  return NextResponse.json(rows);
}
