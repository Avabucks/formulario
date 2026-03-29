import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const formData = await request.formData();
    const titolo = formData.get("titolo") as string;
    const capitoloId = formData.get("capitoloId") as string;

    if (!titolo) return NextResponse.json({ error: "Titolo obbligatorio" }, { status: 400 });
    if (!capitoloId) return NextResponse.json({ error: "ID obbligatorio" }, { status: 400 });

    try {
        const result = await pool.query(
            `UPDATE capitoli SET titolo = $1
             WHERE beautiful_id = $2
             AND formulario IN (SELECT beautiful_id AS "id" FROM formulari WHERE owner_uid = $3)`,
            [titolo, capitoloId, uid]
        );

        if (result.rowCount === 0) return NextResponse.json({ error: "Capitolo non trovato o non autorizzato" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: "Errore nella modifica del capitolo" }, { status: 500 });
    }
}