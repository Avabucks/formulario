import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.uid) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    await pool.query(`DELETE FROM formulari WHERE owner_uid = $1`, [session.uid]);
    await pool.query(`DELETE FROM users WHERE uid = $1`, [session.uid]);
    
    session.destroy();
    return NextResponse.redirect(new URL("/login", request.url));
}