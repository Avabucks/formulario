import { PrintableFormulario } from "@/src/components/export/printable-formulario";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ExportFormularioPage({
  params,
}: Readonly<{
  params: Promise<{ formularioId: string }>;
}>) {
  const { formularioId } = await params;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid) {
    redirect("/login");
  }

  // 1. Fetch Formulario details
  const { rows: formularioRows, rowCount: formularioCount } = await pool.query(
    `SELECT F.beautiful_id AS "id", F.titolo, F.descrizione, F.owner_uid as "ownerUid", U_A.display_name AS "nomeAutore"
     FROM formulari F
     LEFT JOIN users U_A ON F.author_uid = U_A.uid
     WHERE F.beautiful_id = $1
       AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [formularioId, uid],
  );

  if (formularioCount === 0) {
    redirect("/home");
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

  return (
    <PrintableFormulario 
      formulario={formulario} 
      chapters={structuredChapters} 
    />
  );
}
