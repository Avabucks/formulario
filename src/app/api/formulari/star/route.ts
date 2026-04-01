import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const formularioId = formData.get("formularioId") as string;

    if (!formularioId) return NextResponse.json({ error: "formularioId mancante" }, { status: 400 });

    try {
        await pool.query(
            `WITH deleted AS (
                DELETE FROM preferiti WHERE user_uid = $1 AND formulario_id = $2
                RETURNING *
            )
            INSERT INTO preferiti (user_uid, formulario_id)
            SELECT $1, $2
            WHERE NOT EXISTS (SELECT 1 FROM deleted)`,
            [uid, formularioId]
        );

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }
}