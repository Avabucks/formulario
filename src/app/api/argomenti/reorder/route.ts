import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PoolClient } from "pg";

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const formData = await request.formData();
  const argomentoId = formData.get("argomentoId") as string;
  const targetCapitoloId = formData.get("capitoloId") as string;
  const targetIndex = Number(formData.get("index"));

  if (!argomentoId)
    return NextResponse.json(
      { error: "Argomento obbligatorio" },
      { status: 400 },
    );
  if (!targetCapitoloId)
    return NextResponse.json(
      { error: "Capitolo obbligatorio" },
      { status: 400 },
    );
  if (!Number.isInteger(targetIndex) || targetIndex < 0)
    return NextResponse.json(
      { error: "Posizione non valida" },
      { status: 400 },
    );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: sourceRows } = await client.query(
      `SELECT A.capitolo AS "sourceCapitoloId", C.formulario AS "formularioId"
             FROM argomenti A
             JOIN capitoli C ON C.beautiful_id = A.capitolo
             JOIN formulari F ON F.beautiful_id = C.formulario
             WHERE A.beautiful_id = $1 AND F.owner_uid = $2`,
      [argomentoId, uid],
    );

    if (sourceRows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Argomento non trovato o non autorizzato" },
        { status: 404 },
      );
    }

    const { sourceCapitoloId, formularioId } = sourceRows[0];

    const { rows: targetRows } = await client.query(
      `SELECT C.beautiful_id
             FROM capitoli C
             JOIN formulari F ON F.beautiful_id = C.formulario
             WHERE C.beautiful_id = $1 AND C.formulario = $2 AND F.owner_uid = $3`,
      [targetCapitoloId, formularioId, uid],
    );

    if (targetRows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Capitolo di destinazione non valido" },
        { status: 404 },
      );
    }

    const { rows: sourceArgomenti } = await client.query<{
      beautiful_id: string;
    }>(
      `SELECT beautiful_id FROM argomenti WHERE capitolo = $1 ORDER BY sort_order ASC`,
      [sourceCapitoloId],
    );
    const { rows: targetArgomenti } = await client.query<{
      beautiful_id: string;
    }>(
      `SELECT beautiful_id FROM argomenti WHERE capitolo = $1 ORDER BY sort_order ASC`,
      [targetCapitoloId],
    );

    const sourceIds = sourceArgomenti.map((row) => row.beautiful_id);
    const targetIds =
      sourceCapitoloId === targetCapitoloId
        ? sourceIds
        : targetArgomenti.map((row) => row.beautiful_id);
    const sourceIndex = sourceIds.indexOf(argomentoId);

    if (sourceIndex === -1) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Argomento non trovato" },
        { status: 404 },
      );
    }

    sourceIds.splice(sourceIndex, 1);

    const normalizedTargetIndex =
      sourceCapitoloId === targetCapitoloId && sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;
    const boundedTargetIndex = Math.max(
      0,
      Math.min(normalizedTargetIndex, targetIds.length),
    );

    if (sourceCapitoloId === targetCapitoloId) {
      sourceIds.splice(boundedTargetIndex, 0, argomentoId);
    } else {
      const targetWithoutMoved = targetIds.filter((id) => id !== argomentoId);
      targetWithoutMoved.splice(
        Math.max(0, Math.min(targetIndex, targetWithoutMoved.length)),
        0,
        argomentoId,
      );
      targetIds.splice(0, targetIds.length, ...targetWithoutMoved);
    }

    await updateArgomentiOrder(client, sourceCapitoloId, sourceIds);

    if (sourceCapitoloId !== targetCapitoloId) {
      await client.query(
        `UPDATE argomenti SET capitolo = $1 WHERE beautiful_id = $2`,
        [targetCapitoloId, argomentoId],
      );
      await updateArgomentiOrder(client, targetCapitoloId, targetIds);
    }

    await client.query(
      `UPDATE formulari SET data_modifica = CURRENT_TIMESTAMP WHERE beautiful_id = $1`,
      [formularioId],
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Errore durante il riordino dell'argomento" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

async function updateArgomentiOrder(
  client: PoolClient,
  capitoloId: string,
  argomentoIds: string[],
) {
  for (const [index, argomentoId] of argomentoIds.entries()) {
    await client.query(
      `UPDATE argomenti SET capitolo = $1, sort_order = $2 WHERE beautiful_id = $3`,
      [capitoloId, index + 1, argomentoId],
    );
  }
}
