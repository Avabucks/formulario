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
    sortOrder: number
}

export async function getListCapitoli(currentFormulario: Formulario | null): Promise<{ success: boolean, capitoli: Capitolo[], editable: boolean }> {
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
        `SELECT c.beautiful_id AS "id", c.titolo, c.formulario as "formularioId", COUNT(a.beautiful_id) AS "argomentiCount", c.sort_order AS "sortOrder"
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
    sortOrder: number
}

export async function getListArgomenti(currentCapitolo: Capitolo | null, currentFormulario: Formulario | null): Promise<{ success: boolean, argomenti: Argomento[], editable: boolean }> {
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
        `SELECT A.beautiful_id AS "id", A.titolo, C.formulario as "formularioId", A.capitolo as "capitoloId", A.sort_order AS "sortOrder"
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

export async function renameItem(id: string, type: "capitolo" | "argomento", formData: FormData) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    const titolo = formData.get("titolo") as string;
    if (!titolo) throw new Error("Titolo obbligatorio");

    try {
        const query = type === "capitolo"
            ? `UPDATE capitoli SET titolo = $1
               WHERE beautiful_id = $2
               AND formulario IN (SELECT beautiful_id FROM formulari WHERE autore = $3)`
            : `UPDATE argomenti SET titolo = $1
               WHERE beautiful_id = $2
               AND capitolo IN (
                  SELECT beautiful_id FROM capitoli
                  WHERE formulario IN (SELECT beautiful_id FROM formulari WHERE autore = $3)
               )`;

        const result = await pool.query(query, [titolo, id, uid]);
        if (result.rowCount === 0) throw new Error(`${type === "capitolo" ? "Capitolo" : "Argomento"} non trovato o non autorizzato`);
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error(`Errore nella modifica del ${type}`);
    }
}

export async function deleteItem(id: string, type: "capitolo" | "argomento") {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    const table = type === "capitolo" ? "capitoli" : "argomenti";
    const parentCol = type === "capitolo" ? "formulario" : "capitolo";

    try {
        // Prendi sort_order e parent prima di eliminare
        const { rows } = await pool.query(
            `SELECT sort_order, ${parentCol} AS parent FROM ${table} WHERE beautiful_id = $1`,
            [id]
        );
        if (rows.length === 0) throw new Error(`${type === "capitolo" ? "Capitolo" : "Argomento"} non trovato o non autorizzato`);

        const { sort_order, parent } = rows[0];

        const query = type === "capitolo"
            ? `DELETE FROM capitoli
               WHERE beautiful_id = $1
               AND formulario IN (SELECT beautiful_id FROM formulari WHERE autore = $2)`
            : `DELETE FROM argomenti
               WHERE beautiful_id = $1
               AND capitolo IN (
                  SELECT beautiful_id FROM capitoli
                  WHERE formulario IN (SELECT beautiful_id FROM formulari WHERE autore = $2)
               )`;

        const result = await pool.query(query, [id, uid]);
        if (result.rowCount === 0) throw new Error(`${type === "capitolo" ? "Capitolo" : "Argomento"} non trovato o non autorizzato`);

        // Scala i sort_order degli elementi successivi
        await pool.query(
            `UPDATE ${table} SET sort_order = sort_order - 1
             WHERE ${parentCol} = $1 AND sort_order > $2`,
            [parent, sort_order]
        );

        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error(`Errore nell'eliminazione del ${type}`);
    }
}

export async function moveItem(id: string, type: "capitolo" | "argomento", direction: "up" | "down") {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        const { rows } = type === "capitolo"
            ? await pool.query(
                `SELECT c.sort_order, c.formulario AS parent FROM capitoli c
                 JOIN formulari f ON f.beautiful_id = c.formulario
                 WHERE c.beautiful_id = $1 AND f.autore = $2`,
                [id, uid]
            )
            : await pool.query(
                `SELECT a.sort_order, a.capitolo AS parent FROM argomenti a
                 JOIN capitoli c ON c.beautiful_id = a.capitolo
                 JOIN formulari f ON f.beautiful_id = c.formulario
                 WHERE a.beautiful_id = $1 AND f.autore = $2`,
                [id, uid]
            );

        if (rows.length === 0) throw new Error(`${type === "capitolo" ? "Capitolo" : "Argomento"} non trovato o non autorizzato`);

        const { sort_order, parent } = rows[0];
        const targetOrder = direction === "up" ? sort_order - 1 : sort_order + 1;
        const table = type === "capitolo" ? "capitoli" : "argomenti";
        const parentCol = type === "capitolo" ? "formulario" : "capitolo";

        const { rows: adjacent } = await pool.query(
            `SELECT beautiful_id FROM ${table} WHERE ${parentCol} = $1 AND sort_order = $2`,
            [parent, targetOrder]
        );
        if (adjacent.length === 0) throw new Error("Movimento non possibile");

        await pool.query(`UPDATE ${table} SET sort_order = $1 WHERE beautiful_id = $2`, [targetOrder, id]);
        await pool.query(`UPDATE ${table} SET sort_order = $1 WHERE beautiful_id = $2`, [sort_order, adjacent[0].beautiful_id]);

        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error(`Errore nello spostamento del ${type}`);
    }
}

// ELIMINAZIONE ACCOUNT PER GDPR
export async function deleteAccountGDPR() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid) throw new Error("Non autorizzato");

    try {
        await pool.query(`DELETE FROM formulari WHERE autore = $1`, [uid]);
        await pool.query(`DELETE FROM users WHERE uid = $1`, [uid]);

        session.destroy();

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error("Errore nell'eliminazione dell'account");
    }
}