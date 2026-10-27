import { StructureCapitolo } from "@/src/components/home/settings-sections/types";
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
    const { rows: formularioRows, rowCount } = await pool.query(
      `SELECT F.titolo, COALESCE(U.display_name, 'Utente eliminato') AS "nomeAutore", U.foto_profilo AS "photoURL"
         FROM formulari F
         LEFT JOIN users U ON F.author_uid = U.uid
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
          c.sort_order AS "capitoloSortOrder",
          a.beautiful_id AS "argomentoId",
          a.sort_order AS "argomentoSortOrder",
          split_part(COALESCE(a.content, ''), E'\\n', 1) AS "firstLine",
          (COALESCE(TRIM(a.content), '') = '') AS "empty"
         FROM capitoli c
         LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
         WHERE c.formulario = $1
         ORDER BY c.sort_order ASC, a.sort_order ASC`,
      [formularioId],
    );

    const capitoli: StructureCapitolo[] = [];

    for (const row of rows) {
      let capitolo = capitoli.at(-1);
      if (!capitolo || capitolo.id !== row.capitoloId) {
        capitolo = {
          id: row.capitoloId,
          titolo: row.capitoloTitolo,
          sortOrder: row.capitoloSortOrder,
          argomenti: [],
        };
        capitoli.push(capitolo);
      }
      if (!row.argomentoId) continue;

      const firstLine: string = row.firstLine ?? "";
      capitolo.argomenti.push({
        id: row.argomentoId,
        titolo: firstLine.startsWith("#")
          ? firstLine.replace(/^#+\s*/, "").trim()
          : "Senza titolo",
        empty: row.empty,
        sortOrder: row.argomentoSortOrder,
      });
    }

    return NextResponse.json({ ...formularioRows[0], capitoli });
  } catch (error: any) {
    console.error("Errore database:", error.message);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
