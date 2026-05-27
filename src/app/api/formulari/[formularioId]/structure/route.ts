import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type StructureRow = {
  capitoloId: string;
  capitoloTitolo: string;
  capitoloSortOrder: number;
  argomentoId: string | null;
  argomentoSortOrder: number | null;
  content: string | null;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ formularioId: string }> },
) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { formularioId } = await params;

  const { rowCount } = await pool.query(
    `SELECT 1
         FROM formulari F
         WHERE F.beautiful_id = $1
           AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [formularioId, uid],
  );

  if (rowCount === 0)
    return NextResponse.json(
      { error: "Formulario non trovato" },
      { status: 404 },
    );

  const { rows } = await pool.query<StructureRow>(
    `SELECT
            C.beautiful_id AS "capitoloId",
            COALESCE(C.titolo, 'Senza titolo') AS "capitoloTitolo",
            C.sort_order AS "capitoloSortOrder",
            A.beautiful_id AS "argomentoId",
            A.sort_order AS "argomentoSortOrder",
            A.content AS "content"
         FROM capitoli C
         LEFT JOIN argomenti A ON A.capitolo = C.beautiful_id
         WHERE C.formulario = $1
         ORDER BY C.sort_order ASC, A.sort_order ASC`,
    [formularioId],
  );

  const capitoli = rows.reduce<
    Array<{
      id: string;
      titolo: string;
      sortOrder: number;
      argomenti: Array<{
        id: string;
        titolo: string;
        empty: boolean;
        sortOrder: number;
      }>;
    }>
  >((acc, row) => {
    let capitolo = acc.find((item) => item.id === row.capitoloId);

    if (!capitolo) {
      capitolo = {
        id: row.capitoloId,
        titolo: row.capitoloTitolo,
        sortOrder: row.capitoloSortOrder,
        argomenti: [],
      };
      acc.push(capitolo);
    }

    if (row.argomentoId) {
      const firstLine = row.content?.split("\n")[0] ?? "";
      const titleFromHeading = firstLine.startsWith("#")
        ? firstLine.replace(/^#+\s*/, "").trim()
        : "";
      const titolo = titleFromHeading || "Senza titolo";

      capitolo.argomenti.push({
        id: row.argomentoId,
        titolo,
        empty: !row.content?.trim(),
        sortOrder: row.argomentoSortOrder ?? 0,
      });
    }

    return acc;
  }, []);

  const argomenti = capitoli.flatMap((capitolo) => capitolo.argomenti);

  return NextResponse.json({
    capitoli,
    stats: {
      capitoliCount: capitoli.length,
      argomentiCount: argomenti.length,
      emptyCapitoliCount: capitoli.filter(
        (capitolo) => capitolo.argomenti.length === 0,
      ).length,
      emptyArgomentiCount: argomenti.filter((argomento) => argomento.empty)
        .length,
      untitledArgomentiCount: argomenti.filter(
        (argomento) => argomento.titolo === "Senza titolo",
      ).length,
    },
  });
}
