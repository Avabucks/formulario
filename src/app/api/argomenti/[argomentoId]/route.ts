import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{ argomentoId: string }> }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // Controllo autenticazione
    if (!uid) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { argomentoId } = await params;

    try {
        const { rows, rowCount } = await pool.query(
            `SELECT 
                a.beautiful_id AS id, 
                a.titolo, 
                a.content, 
                a.sort_order,
                a.capitolo AS "capitoloId"
             FROM argomenti a
             JOIN capitoli c ON a.capitolo = c.beautiful_id
             JOIN formulari f ON c.formulario = f.beautiful_id
             WHERE a.beautiful_id = $1 
               AND (f.owner_uid = $2 OR f.visibility > 0)`,
            [argomentoId, uid]
        );

        if (rowCount === 0) {
            return NextResponse.json({ error: "Argomento non trovato o accesso negato" }, { status: 404 });
        }

        // Restituisce l'oggetto dell'argomento con il campo 'content'
        return NextResponse.json(rows[0]);

    } catch (error: any) {
        console.error("Errore database:", error.message);
        return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
    }
}