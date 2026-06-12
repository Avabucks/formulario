import { PrintableNote } from "@/src/components/export/printable-note";
import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ExportArgomentoPage({
  params,
}: Readonly<{
  params: Promise<{ argomentoId: string }>;
}>) {
  const { argomentoId } = await params;

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid) {
    redirect("/login");
  }

  // Check if user has access to the argomento (owner or public)
  const { rows, rowCount } = await pool.query(
    `SELECT A.beautiful_id AS "id",
            A.content AS "content",
            F.beautiful_id AS "formularioId"
     FROM argomenti A
     JOIN capitoli C ON A.capitolo = C.beautiful_id
     JOIN formulari F ON F.beautiful_id = C.formulario
     WHERE A.beautiful_id = $1
       AND (F.owner_uid = $2 OR F.visibility > 0)`,
    [argomentoId, uid],
  );

  if (rowCount === 0) {
    redirect("/home");
  }

  const { content, formularioId } = rows[0];
  const firstLine = content?.split("\n")[0] ?? "";
  const title = firstLine.startsWith("#")
    ? firstLine.replace(/^#+\s*/, "")
    : "Senza titolo";

  return (
    <PrintableNote 
      title={title} 
      content={content} 
      formularioId={formularioId} 
    />
  );
}
