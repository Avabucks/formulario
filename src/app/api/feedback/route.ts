import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  const uid = session.uid;

  if (!uid)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { rating, testo } = await request.json();

  if (!rating || !testo)
    return NextResponse.json(
      { error: "Campi obbligatori mancanti" },
      { status: 400 },
    );

  if (rating < 1 || rating > 5)
    return NextResponse.json(
      { error: "Rating deve essere tra 1 e 5" },
      { status: 400 },
    );

  try {
    const result = await pool.query(
      `INSERT INTO feedback (user_uid, rating, testo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [uid, rating, testo],
    );

    return NextResponse.json({
      success: true,
      feedback: result.rows[0],
    });
  } catch (error: any) {
    console.error(error.message);

    return NextResponse.json(
      { error: "Errore nell'invio del feedback" },
      { status: 500 },
    );
  }
}
