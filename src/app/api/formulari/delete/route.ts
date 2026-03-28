import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { formularioId } = await request.json();

    if (!formularioId) {
        return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    try {
        const result = await pool.query(
            `DELETE FROM formulari WHERE beautiful_id = $1 AND owner_uid = $2`,
            [formularioId, uid]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Formulario non trovato o non autorizzato" }, { status: 404 });
        }

        revalidatePath("/home");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nel cancellare" }, { status: 500 });
    }
}