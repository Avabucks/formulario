import { pool } from "@/src/lib/db";
import { adminAuth } from "@/src/lib/firebase-admin";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.uid) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const idToken = request.headers.get("X-Firebase-ID-Token");
    if (idToken) {
        try {
            const decoded = await adminAuth.verifyIdToken(idToken, true);

            if (decoded.uid !== session.uid) {
                return NextResponse.json({ error: "Token non corrispondente" }, { status: 403 });
            }

            if (Date.now() / 1000 - decoded.iat > 300) {
                return NextResponse.json({ error: "Token scaduto, riprova" }, { status: 403 });
            }
        } catch {
            return NextResponse.json({ error: "ID token non valido" }, { status: 403 });
        }
    }

    const body = await request.json().catch(() => ({}));
    const { confirmUsername } = body as { confirmUsername?: string };

    const { rows: users } = await pool.query(
        `SELECT display_name as "displayName" FROM users WHERE uid = $1`,
        [session.uid]
    );

    const displayName = users[0]?.displayName;
    if (!displayName || !confirmUsername || confirmUsername.trim() !== displayName) {
        return NextResponse.json({ error: "Nome utente di conferma non corretto" }, { status: 400 });
    }

    await pool.query(`DELETE FROM formulari WHERE owner_uid = $1`, [session.uid]);
    await pool.query(`DELETE FROM users WHERE uid = $1`, [session.uid]);

    session.destroy();
    return NextResponse.redirect(new URL("/login", request.url));
}