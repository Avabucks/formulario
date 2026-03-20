import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { adminAuth } from "@/src/lib/firebase-admin";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { pool } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.uid = decoded.uid;

    await pool.query(
      `INSERT INTO users (display_name, email, uid, foto_profilo)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (uid) 
          DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, foto_profilo = EXCLUDED.foto_profilo`,
          [decoded.name, decoded.email, decoded.uid, decoded.picture]
    );

    await session.save();
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Token non valido" }, { status: 401 });
  }
}
