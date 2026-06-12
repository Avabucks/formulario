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

  if (!uid) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { formularioId } = await params;

  try {
    // 1. Fetch Formulario details
    const { rows: formularioRows, rowCount: formularioCount } = await pool.query(
      `SELECT F.beautiful_id AS "id", F.titolo, F.descrizione, F.owner_uid as "ownerUid", COALESCE(U_A.display_name, 'Utente eliminato') AS "nomeAutore"
       FROM formulari F
       LEFT JOIN users U_A ON F.author_uid = U_A.uid
       WHERE F.beautiful_id = $1
         AND (F.owner_uid = $2 OR F.visibility > 0)`,
      [formularioId, uid],
    );

    if (formularioCount === 0) {
      return NextResponse.json(
        { error: "Formulario non trovato o accesso negato" },
        { status: 404 },
      );
    }

    const formulario = formularioRows[0];

    // 2. Fetch Capitoli
    const { rows: capitoli } = await pool.query(
      `SELECT beautiful_id AS "id", COALESCE(titolo, 'Senza titolo') AS "titolo"
       FROM capitoli
       WHERE formulario = $1
       ORDER BY sort_order ASC`,
      [formularioId],
    );

    // 3. Fetch Argomenti (Notes)
    const { rows: argomenti } = await pool.query(
      `SELECT A.beautiful_id AS "id", A.capitolo AS "capitoloId", A.content
       FROM argomenti A
       JOIN capitoli C ON A.capitolo = C.beautiful_id
       WHERE C.formulario = $1
       ORDER BY C.sort_order ASC, A.sort_order ASC`,
      [formularioId],
    );

    // Group notes by capitolo
    const notesByCapitolo = new Map<string, typeof argomenti>();
    argomenti.forEach((arg) => {
      if (!notesByCapitolo.has(arg.capitoloId)) {
        notesByCapitolo.set(arg.capitoloId, []);
      }
      notesByCapitolo.get(arg.capitoloId)!.push(arg);
    });

    const structuredChapters = capitoli.map((c) => {
      const rawNotes = notesByCapitolo.get(c.id) || [];
      const notes = rawNotes.map((n) => {
        const firstLine = n.content?.split("\n")[0] ?? "";
        const title = firstLine.startsWith("#")
          ? firstLine.replace(/^#+\s*/, "")
          : "Senza titolo";
        return {
          id: n.id,
          title,
          content: n.content,
        };
      });

      return {
        id: c.id,
        title: c.titolo,
        notes,
      };
    });

    return NextResponse.json({
      id: formulario.id,
      title: formulario.titolo,
      description: formulario.descrizione,
      author: formulario.nomeAutore,
      chapters: structuredChapters,
    });
  } catch (error: any) {
    console.error("Errore export api:", error.message);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
