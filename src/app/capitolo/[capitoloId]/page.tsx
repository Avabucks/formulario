import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Capitoli no longer have their own page: they live in the workspace explorer
export default async function Capitolo({
  params,
}: Readonly<{
  params: Promise<{ capitoloId: string }>;
}>) {
  const { capitoloId } = await params;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  const { rows, rowCount } = await pool.query(
    `SELECT C.formulario AS "formularioId",
            (SELECT A.beautiful_id FROM argomenti A
              WHERE A.capitolo = C.beautiful_id
              ORDER BY A.sort_order ASC LIMIT 1) AS "argomentoId"
       FROM capitoli C
       JOIN formulari F ON F.beautiful_id = C.formulario
       WHERE C.beautiful_id = $1
         AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [capitoloId, uid || null],
  );

  if (rowCount === 0) redirect(uid ? "/home" : "/login");

  const { formularioId, argomentoId } = rows[0];
  redirect(
    argomentoId ? `/editor/${argomentoId}` : `/formulario/${formularioId}`,
  );
}
