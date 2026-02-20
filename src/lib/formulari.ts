"use server"
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

type Formulario = {
    id: number
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

export async function getListFormulari(variant: string): Promise<{ success: boolean, result: Formulario[] }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    const query = variant === "all"
        ? `SELECT F.id, titolo, autore, U.display_name AS "nomeAutore", anno, descrizione, visibility_public AS "visibilityPublic"
           FROM formulari F JOIN users U ON F.autore = U.uid
           WHERE autore = $1 OR visibility_public = true
           ORDER BY titolo DESC`
        : `SELECT F.id, titolo, autore, U.display_name AS "nomeAutore", anno, descrizione, visibility_public AS "visibilityPublic"
           FROM formulari F JOIN users U ON F.autore = U.uid
           WHERE autore = $1
           ORDER BY titolo DESC`;

    const result = await pool.query(query, [uid]);

    return {
        success: true,
        result: result.rows
    }
}

export async function createFormulario(formData: FormData): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return { success: false, error: "Non autorizzato" };

    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const anno = new Date().getFullYear().toString();
    const visibilityPublic = formData.get("visibilityPublic") === "on";

    if (!titolo || !descrizione) return { success: false, error: "Campi obbligatori mancanti" };

    try {
        await pool.query(
            `INSERT INTO formulari (titolo, descrizione, autore, anno, visibility_public)
             VALUES ($1, $2, $3, $4, $5)`,
            [titolo, descrizione, uid, anno, visibilityPublic]
        );

        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Errore nel salvataggio" };
    }
}

export async function updateFormulario(id: number, formData: FormData) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return { success: false, error: "Non autorizzato" };

    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const visibilityPublic = formData.get("visibilityPublic") === "on";

    if (!titolo || !descrizione) return { success: false, error: "Campi obbligatori mancanti" };

    try {
        const result = await pool.query(
            `UPDATE formulari 
             SET titolo = $1, descrizione = $2, visibility_public = $3
             WHERE id = $4 AND autore = $5`,
            [titolo, descrizione, visibilityPublic, id, uid]
        );

        if (result.rowCount === 0) return { success: false, error: "Formulario non trovato o non autorizzato" };

        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Errore nell'aggiornamento" };
    }
}

export async function deleteFormulario(formularioId: number): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) return { success: false, error: "Non autorizzato" };

    try {
        const result = await pool.query(
            `DELETE FROM formulari 
             WHERE id = $1 AND autore = $2`,
            [formularioId, uid]
        );
        if (result.rowCount === 0) {
            return { success: false, error: "Formulario non trovato o non autorizzato" };
        }
        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Errore nel cancellare" };
    }
}

type Capitolo = {
    id: number
    titolo: string
    argomentiCount?: number
}

export async function getListCapitoli(currentFormulario: Formulario | null): Promise<{ success: boolean, result: Capitolo[], editable: boolean }> {
    if (!currentFormulario) {
        return { success: false, result: [], editable: false }
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // controlla che il formulario esista e appartenga all'utente
    const formularioCheck = await pool.query(
        `SELECT id, autore FROM formulari WHERE id = $1 AND (autore = $2 OR visibility_public = true)`,
        [currentFormulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, result: [], editable: false }
    }

    const result = await pool.query(
        `SELECT c.id, c.titolo, COUNT(a.id) AS "argomentiCount"
        FROM capitoli c
        LEFT JOIN argomenti a ON a.capitolo = c.id
        WHERE c.formulario = $1
        GROUP BY c.id, c.titolo
        ORDER BY c.sort_order ASC`,
        [currentFormulario.id]
    );

    return {
        success: true,
        result: result.rows,
        editable: formularioCheck.rows[0].autore === uid
    }
}

export async function createCapitolo(formData: FormData, formulario: Formulario): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) return { success: false, error: "Non autorizzato" };

    const titolo = formData.get("titolo") as string;

    if (!titolo) return { success: false, error: "Campi obbligatori mancanti" };

    try {
        await pool.query(
            `INSERT INTO capitoli (titolo, formulario, sort_order)
             VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM capitoli WHERE formulario = $2))`,
            [titolo, formulario.id]
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Errore nel salvataggio" };
    }
}

type Argomento = {
    id: number
    titolo: string
    formula?: string
}

export async function getListArgomenti(currentCapitolo: Capitolo | null, currentFormulario: Formulario | null): Promise<{ success: boolean, result: Argomento[], editable: boolean }> {
    if (!currentCapitolo || !currentFormulario) {
        return { success: false, result: [], editable: false }
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // controlla che il formulario esista e appartenga all'utente o sia pubblico
    const formularioCheck = await pool.query(
        `SELECT id, autore FROM formulari WHERE id = $1 AND (autore = $2 OR visibility_public = true)`,
        [currentFormulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, result: [], editable: false }
    }

    // controlla che il capitolo appartenga al formulario
    const capitoloCheck = await pool.query(
        `SELECT id FROM capitoli WHERE id = $1 AND formulario = $2`,
        [currentCapitolo.id, currentFormulario.id]
    );

    if (capitoloCheck.rowCount === 0) {
        return { success: false, result: [], editable: false }
    }

    const result = await pool.query(
        `SELECT id, titolo  
            FROM argomenti
            WHERE capitolo = $1
            ORDER BY sort_order ASC`,
        [currentCapitolo.id]
    );

    return {
        success: true,
        result: result.rows,
        editable: formularioCheck.rows[0].autore === uid
    }
}

export async function getArgomentoFromId(formulario: Formulario, id: number): Promise<{ success: boolean, result?: Argomento, editable: boolean }> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid || !formulario) return { success: false, editable: false };

    // controlla che il formulario esista e appartenga all'utente o sia pubblico
    const formularioCheck = await pool.query(
        `SELECT id, autore FROM formulari WHERE id = $1 AND (autore = $2 OR visibility_public = true)`,
        [formulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, editable: false }
    }

    try {
        const result = await pool.query(
            `SELECT * FROM argomenti WHERE id = $1`,
            [id]
        );

        if (result.rowCount === 0) return { success: false, editable: false };

        const argomento = result.rows[0] as Argomento;
        const editable = formulario.autore === uid;

        return { success: true, result: argomento, editable };
    } catch (error) {
        console.error(error);
        return { success: false, editable: false };
    }
}

export async function createArgomento(formData: FormData, capitolo?: Capitolo): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid || !capitolo) return { success: false, error: "Non autorizzato" };

    const titolo = formData.get("titolo") as string;

    if (!titolo) return { success: false, error: "Campi obbligatori mancanti" };

    try {
        await pool.query(
            `INSERT INTO argomenti (titolo, capitolo, sort_order)
             VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM argomenti WHERE capitolo = $2))`,
            [titolo, capitolo.id]
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Errore nel salvataggio" };
    }
}