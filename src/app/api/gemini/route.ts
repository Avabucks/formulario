import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("Manca la variabile d'ambiente GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.5,
    },
    systemInstruction: "Agisci come un assistente accademico esperto in formulari universitari. Usa Markdown (usa per le liste il trattino - non l'asterisco) e LaTeX ($ per inline, $$ per display), suddividendo bene i paragrafi con gli headings. Rispondi in modo conciso. Niente introduzioni come 'Certamente' o 'Ecco la risposta', devi generare un testo ready to use.",
    safetySettings,
});
export async function POST(req: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const uid = session.uid;

    // check if user exists
    const { rows: users } = await pool.query(`SELECT id FROM users WHERE uid = $1`, [uid]);
    if (users.length === 0) {
        redirect('/api/auth/logout')
    }

    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt mancante o non valido" },
                { status: 400 },
            );
        }

        const { totalTokens } = await model.countTokens(prompt);
        const INPUT_LIMIT = 500;

        if (totalTokens > INPUT_LIMIT) {
            return NextResponse.json(
                { error: `Prompt troppo lungo (${totalTokens} token). Il limite è ${INPUT_LIMIT}.` },
                { status: 400 }
            );
        }

        // TODO:
        //const { rows: updated } = await pool.query(
        //    `UPDATE users SET credits = credits - 1
        //     WHERE uid = $1 AND credits > 0
        //     RETURNING credits`,
        //    [uid]
        //);
        //if (updated.length === 0) {
        //    return NextResponse.json({ error: "Crediti esauriti" }, { status: 403 });
        //}

        const tmp_prompt = `ISTRUZIONI DI SISTEMA: Agisci come un assistente accademico esperto in formulari universitari. Usa Markdown (usa per le liste il trattino - non l’asterisco) e LaTeX ($ per inline, $$ per display), suddividendo bene i paragrafi con gli headings. Rispondi in modo conciso. Niente introduzioni come "Certamente" o "Ecco la risposta", devi generare un testo ready to use.\n\nDOMANDA: ${prompt}`;

        const result = await model.generateContent(tmp_prompt);

        const response = result.response;

        const usage = response.usageMetadata;

        console.log(`Token Prompt: ${usage?.promptTokenCount}`);
        console.log(`Token Risposta: ${usage?.candidatesTokenCount}`);
        console.log(`Token Totali: ${usage?.totalTokenCount}`);

        const text = response.text();

        // CONTROLLO SICUREZZA
        if (response.promptFeedback?.blockReason) {
            return NextResponse.json(
                { error: `Il prompt è stato bloccato per motivi di sicurezza: ${response.promptFeedback.blockReason}` },
                { status: 400 }
            );
        }
        if (!response.candidates || response.candidates.length === 0 || response.candidates[0].finishReason === 'SAFETY') {
            return NextResponse.json(
                { error: "La risposta è stata bloccata dai filtri di sicurezza. Prova a riformulare la domanda." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini error details:", error);

        if (error.status === 429) {
            return NextResponse.json(
                { error: "Limite di richieste raggiunto. Riprova tra un minuto." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Errore durante la generazione. Riprova più tardi." },
            { status: 500 },
        );
    }
}