import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { cookies } from "next/headers";
import { pool } from "@/src/lib/db";

export async function GET(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.uid) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    await pool.query(`DELETE FROM formulari WHERE autore = $1`, [session.uid]);
    await pool.query(`DELETE FROM users WHERE uid = $1`, [session.uid]);
    
    session.destroy();
    return NextResponse.redirect(new URL("/login", request.url));
}