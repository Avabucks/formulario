import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ formularioId: string }> },
) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  const { formularioId } = await params;

  try {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM formulari F
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility > 0)`,
      [formularioId, uid || null],
    );

    if (rowCount === 0)
      return NextResponse.json(
        { error: "Formulario non trovato" },
        { status: 404 },
      );

    const { rows } = await pool.query(
      `SELECT
          c.beautiful_id AS "capitoloId",
          COALESCE(c.titolo, 'Senza titolo') AS "capitoloTitolo",
          a.beautiful_id AS "argomentoId",
          a.content
         FROM capitoli c
         LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
         WHERE c.formulario = $1
         ORDER BY c.sort_order ASC, a.sort_order ASC`,
      [formularioId],
    );

    const capitoli: {
      id: string;
      titolo: string;
      argomenti: { id: string; titolo: string; content: string }[];
    }[] = [];

    for (const row of rows) {
      let capitolo = capitoli.at(-1);
      if (!capitolo || capitolo.id !== row.capitoloId) {
        capitolo = {
          id: row.capitoloId,
          titolo: row.capitoloTitolo,
          argomenti: [],
        };
        capitoli.push(capitolo);
      }
      if (!row.argomentoId) continue;

      const content: string = row.content ?? "";
      const firstLine = content.split("\n")[0] ?? "";
      const titolo = firstLine.startsWith("#")
        ? firstLine.replace(/^#+\s*/, "")
        : "Senza titolo";

      capitolo.argomenti.push({ id: row.argomentoId, titolo, content });
    }

    return NextResponse.json({ capitoli });
  } catch (error: any) {
    console.error("Errore database:", error.message);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
