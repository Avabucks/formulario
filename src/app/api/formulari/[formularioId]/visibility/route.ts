import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ formularioId: string }> }) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { formularioId } = await params;
    const { visibilityPublic } = await request.json();

    console.log(formularioId);

    if (typeof visibilityPublic !== "boolean") return NextResponse.json({ error: "Valore non valido" }, { status: 400 });

    try {
        const result = await pool.query(
            `UPDATE formulari SET visibility_public = $1 WHERE beautiful_id = $2 AND autore = $3`,
            [visibilityPublic, formularioId, uid]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: "Formulario non trovato o non autorizzato" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
    }
}