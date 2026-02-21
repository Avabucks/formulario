"use server"
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/src/lib/session";
import { pool } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import slugify from 'slugify';

type Formulario = {
    id: string
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

export async function getListFormulari(variant: string): Promise<Formulario[]> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    const query = variant === "all"
        ? `SELECT F.beautiful_id AS "id", titolo, autore, U.display_name AS "nomeAutore", anno, descrizione, visibility_public AS "visibilityPublic"
           FROM formulari F JOIN users U ON F.autore = U.uid
           WHERE autore = $1 OR visibility_public = true
           ORDER BY titolo DESC`
        : `SELECT F.beautiful_id AS "id", titolo, autore, U.display_name AS "nomeAutore", anno, descrizione, visibility_public AS "visibilityPublic"
           FROM formulari F JOIN users U ON F.autore = U.uid
           WHERE autore = $1
           ORDER BY titolo DESC`;

    const result = await pool.query(query, [uid]);

    return result.rows;
}

export async function createFormulario(formData: FormData): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) throw new Error("Non autorizzato");

    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const anno = new Date().getFullYear().toString();
    const visibilityPublic = formData.get("visibilityPublic") === "on";

    const beautiful_id = slugify(titolo, { lower: true, strict: true }) + "-" + Date.now().toString(36)

    if (!titolo || !descrizione) throw new Error("Campi obbligatori mancanti");

    try {
        await pool.query(
            `INSERT INTO formulari (beautiful_id, titolo, descrizione, autore, anno, visibility_public)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [beautiful_id, titolo, descrizione, uid, anno, visibilityPublic]
        );

        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nel salvataggio");
    }
}

export async function updateFormulario(id: string, formData: FormData) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) throw new Error("Non autorizzato");

    const titolo = formData.get("titolo") as string;
    const descrizione = formData.get("descrizione") as string;
    const visibilityPublic = formData.get("visibilityPublic") === "on";

    if (!titolo || !descrizione) throw new Error("Campi obbligatori mancanti");

    try {
        const result = await pool.query(
            `UPDATE formulari 
             SET titolo = $1, descrizione = $2, visibility_public = $3
             WHERE beautiful_id = $4 AND autore = $5`,
            [titolo, descrizione, visibilityPublic, id, uid]
        );

        if (result.rowCount === 0) throw new Error("Formulario non trovato o non autorizzato");

        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nell'aggiornamento");
    }
}

export async function findFormularioByTitle(titolo: string): Promise<Formulario[]> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        const result = await pool.query(
            `SELECT beautiful_id AS "id", titolo, similarity(titolo, $1) AS "similarity"
                FROM formulari 
                WHERE autore = $2 AND similarity(titolo, $1) > 0.2
                ORDER BY similarity DESC, titolo DESC
                LIMIT 4`,
            [titolo, uid]
        );

        return result.rows as Formulario[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function changeVisibilityFormulario(visibilityPublic: boolean): Promise<boolean> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");
    try {
        const result = await pool.query
            (`UPDATE formulari SET visibility_public = $1 WHERE autore = $2`,
                [visibilityPublic, uid]
            );
        if (result.rowCount === 0) throw new Error("Formulario non trovato o non autorizzato");
        return true;
    } catch (error) {
        console.error(error);
        throw new Error("Errore nell'aggiornamento");
    }
}

export async function deleteFormulario(formularioId: string): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        const result = await pool.query(
            `DELETE FROM formulari 
             WHERE beautiful_id = $1 AND autore = $2`,
            [formularioId, uid]
        );
        if (result.rowCount === 0) {
            throw new Error("Formulario non trovato o non autorizzato");
        }
        revalidatePath("/home");
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nel cancellare");
    }
}

type Capitolo = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    argomentiCount?: number
}

export async function getListCapitoli(currentFormulario: Formulario | null): Promise<{success: boolean, capitoli: Capitolo[], editable: boolean}> {
    if (!currentFormulario) {
        return { success: false, capitoli: [], editable: false };
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // controlla che il formulario esista e appartenga all'utente
    const formularioCheck = await pool.query(
        `SELECT beautiful_id AS "id", autore FROM formulari WHERE beautiful_id = $1 AND (autore = $2 OR visibility_public = true)`,
        [currentFormulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, capitoli: [], editable: false };
    }

    const result = await pool.query(
        `SELECT c.beautiful_id AS "id", c.titolo, c.formulario as "formularioId", COUNT(a.beautiful_id) AS "argomentiCount"
        FROM capitoli c
        LEFT JOIN argomenti a ON a.capitolo = c.beautiful_id
        WHERE c.formulario = $1
        GROUP BY c.beautiful_id, c.titolo, c.formulario, c.sort_order
        ORDER BY c.sort_order ASC`,
        [currentFormulario.id]
    );

    return {
        success: true,
        capitoli: result.rows,
        editable: formularioCheck.rows[0].autore === uid
    }
}

export async function createCapitolo(formData: FormData, formulario: Formulario): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid) throw new Error("Non autorizzato");

    const titolo = formData.get("titolo") as string;

    const beautiful_id = Date.now().toString(36)

    if (!titolo) throw new Error("Campi obbligatori mancanti");

    try {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM capitoli WHERE formulario = $1`,
            [formulario.id]
        )

        await pool.query(
            `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
            VALUES ($1, $2, $3, $4)`,
            [beautiful_id, titolo, formulario.id, rows[0].next_order]
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nel salvataggio del capitolo");
    }
}

export async function findCapitoloByTitle(titolo: string): Promise<Capitolo[]> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        const result = await pool.query(
            `SELECT C.beautiful_id AS "id", C.titolo, C.formulario as "formularioId", F.titolo as "formularioTitolo", similarity(C.titolo, $1) AS similarity
                FROM capitoli C JOIN formulari F ON C.formulario = F.beautiful_id
                WHERE F.autore = $2 AND similarity(C.titolo, $1) > 0.2
                ORDER BY similarity DESC, C.titolo DESC
                LIMIT 4`,
            [titolo, uid]
        );

        return result.rows as Capitolo[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    capitoloId: string
    capitoloTitolo?: string
}

export async function getListArgomenti(currentCapitolo: Capitolo | null, currentFormulario: Formulario | null): Promise<{success: boolean, argomenti: Argomento[], editable: boolean}> {
    if (!currentCapitolo || !currentFormulario) {
        return { success: false, argomenti: [], editable: false };
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // controlla che il formulario esista e appartenga all'utente o sia pubblico
    const formularioCheck = await pool.query(
        `SELECT beautiful_id AS "id", autore FROM formulari WHERE beautiful_id = $1 AND (autore = $2 OR visibility_public = true)`,
        [currentFormulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, argomenti: [], editable: false };
    }

    // controlla che il capitolo appartenga al formulario
    const capitoloCheck = await pool.query(
        `SELECT beautiful_id AS "id" FROM capitoli WHERE beautiful_id = $1 AND formulario = $2`,
        [currentCapitolo.id, currentFormulario.id]
    );

    if (capitoloCheck.rowCount === 0) {
        return { success: false, argomenti: [], editable: false };
    }

    const result = await pool.query(
        `SELECT A.beautiful_id AS "id", A.titolo, C.formulario as "formularioId", A.capitolo as "capitoloId"
            FROM argomenti A JOIN capitoli C ON A.capitolo = C.beautiful_id
            WHERE A.capitolo = $1
            ORDER BY A.sort_order ASC`,
        [currentCapitolo.id]
    );

    return {
        success: true,
        argomenti: result.rows,
        editable: formularioCheck.rows[0].autore === uid
    }
}

export async function getArgomentoFromId(formulario: Formulario, id: string): Promise<{ success: boolean, result?: Argomento, editable: boolean }> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid || !formulario) throw new Error("Non autorizzato");

    // controlla che il formulario esista e appartenga all'utente o sia pubblico
    const formularioCheck = await pool.query(
        `SELECT beautiful_id AS "id", autore FROM formulari WHERE beautiful_id = $1 AND (autore = $2 OR visibility_public = true)`,
        [formulario.id, uid]
    );

    if (formularioCheck.rowCount === 0) {
        return { success: false, editable: false };
    }

    try {
        const result = await pool.query(
            `SELECT * FROM argomenti WHERE beautiful_id = $1`,
            [id]
        );

        if (result.rowCount === 0) throw new Error("Argomento non trovato");

        const argomento = result.rows[0] as Argomento;
        const editable = formularioCheck.rows[0].autore === uid;

        return { success: true, result: argomento, editable };
    } catch (error) {
        console.error(error);
        return { success: false, editable: false };
    }
}

export async function createArgomento(formData: FormData, capitolo?: Capitolo): Promise<{ success: boolean, error?: string }> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    if (!uid || !capitolo) throw new Error("Non autorizzato");

    const titolo = formData.get("titolo") as string;

    const beautiful_id = Date.now().toString(36)

    if (!titolo) throw new Error("Campi obbligatori mancanti");

    try {
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM argomenti WHERE capitolo = $1`,
            [capitolo.id]
        )

        await pool.query(
            `INSERT INTO argomenti (beautiful_id, titolo, capitolo, sort_order)
            VALUES ($1, $2, $3, $4)`,
            [beautiful_id, titolo, capitolo.id, rows[0].next_order]
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nel salvataggio");
    }
}

export async function findArgomentoByTitle(titolo: string): Promise<Argomento[]> {

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        const result = await pool.query(
            `SELECT A.beautiful_id AS "id", A.titolo, A.capitolo as "capitoloId", C.titolo as "capitoloTitolo", C.formulario as "formularioId", F.titolo as "formularioTitolo", similarity(A.titolo, $1) AS similarity
                FROM argomenti A JOIN capitoli C ON A.capitolo = C.beautiful_id JOIN formulari F ON C.formulario = F.beautiful_id
                WHERE F.autore = $2 AND similarity(A.titolo, $1) > 0.2
                ORDER BY similarity DESC, A.titolo DESC
                LIMIT 4`,
            [titolo, uid]
        );

        return result.rows as Argomento[];
    } catch (error) {
        console.error(error);
        return [];
    }
}