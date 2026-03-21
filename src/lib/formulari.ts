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

type Capitolo = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    argomentiCount?: number
    sortOrder: number
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
    content: string
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
            `SELECT titolo, content FROM argomenti WHERE beautiful_id = $1`,
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

export async function saveContent(content: string, id?: string) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;
    if (!uid || !id) throw new Error("Non autorizzato");

    if (!content) throw new Error("Contenuto obbligatorio");

    try {
        const query = `
            UPDATE argomenti
            SET content = $1
            WHERE beautiful_id = $2
                AND capitolo IN (
                SELECT beautiful_id
                FROM capitoli
                WHERE formulario IN (
                    SELECT beautiful_id
                    FROM formulari
                    WHERE autore = $3
                )
                )
            `;

        const result = await pool.query(query, [content, id, uid]);

        if (result.rowCount === 0) {
            throw new Error("Argomento non trovato o non autorizzato");
        }
        return { success: true };
    } catch (error) {
        console.error(error);
        throw new Error(`Errore nel salvataggio`);
    }
}