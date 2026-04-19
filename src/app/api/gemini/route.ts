import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("Manca la variabile d'ambiente GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
    },
    systemInstruction: "Agisci come un assistente accademico esperto in formulari universitari. Usa Markdown e LaTeX ($ per inline, $$ per display). Rispondi in modo conciso. Niente introduzioni come 'Certamente' o 'Ecco la risposta', devi generare un testo ready to use.",
});
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt mancante o non valido" },
                { status: 400 },
            );
        }

        const result = await model.generateContent(prompt);
        
        const response = result.response;
        const text = response.text();

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
            { error: "Errore durante la generazione: " + error.message },
            { status: 500 },
        );
    }
}