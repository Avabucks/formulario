import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    const cookieStore = await cookies();

    const { formularioId } = await request.json();

    if (!formularioId) {
        return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    const cookieKey = `viewed_${formularioId}`;

    // Se già visto → esci
    if (cookieStore.has(cookieKey)) {
        return NextResponse.json({ success: true });
    }

    // Set cookie PRIMA della query
    cookieStore.set(cookieKey, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });

    try {
        await pool.query(
            `UPDATE formulari
       SET views = views + 1
       WHERE beautiful_id = $1
         AND owner_uid != $2
         AND visibility > 0`,
            [formularioId, uid]
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json(
            { error: "Errore incremento views" },
            { status: 500 }
        );
    }
}