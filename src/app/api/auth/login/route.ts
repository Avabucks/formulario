import { pool } from "@/src/lib/db";
import { adminAuth } from "@/src/lib/firebase-admin";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  const decoded = await adminAuth.verifyIdToken(idToken);

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.uid = decoded.uid;

  const { rows } = await pool.query(
    `INSERT INTO users (display_name, email, uid, foto_profilo)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (uid) 
          DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, foto_profilo = EXCLUDED.foto_profilo
          RETURNING (xmax = 0) AS inserted`,
    [decoded.name, decoded.email, decoded.uid, decoded.picture]
  );

  const isNewUser = rows[0].inserted;

  if (isNewUser) {
    await pool.query(
      `INSERT INTO preferiti (user_uid, formulario_id) VALUES ($1, $2)`,
      [decoded.uid, process.env.NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID]
    );
  }

  await session.save();
  return res;
}