import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { recordAiTokenUsage } from "@/src/lib/usage";
import Groq from "groq-sdk";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  throw new Error("Manca la variabile d'ambiente GROQ_API_KEY");
}

const groq = new Groq({ apiKey });

const SYSTEM_INSTRUCTION =
  "Agisci come un assistente accademico esperto in formulari universitari. " +
  "Usa Markdown (usa per le liste il trattino - non l'asterisco) e LaTeX ($ per inline, $$ per display), " +
  "suddividendo bene i paragrafi con gli headings. Rispondi in modo conciso. " +
  "Niente introduzioni come 'Certamente' o 'Ecco la risposta', devi generare un testo ready to use.";

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  const { rows: users } = await pool.query(
    `SELECT id FROM users WHERE uid = $1`,
    [uid],
  );
  if (users.length === 0) {
    redirect("/api/auth/logout");
  }

  try {
    const { prompt, context } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt mancante o non valido" },
        { status: 400 },
      );
    }

    const userMessage = context?.trim()
      ? `<documento>\n${context}\n</documento>\n\nDomanda: ${prompt}`
      : prompt;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: userMessage },
      ],
    });

    const usage = completion.usage;
    await recordAiTokenUsage({
      userId: uid,
      provider: "groq",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      const finishReason = completion.choices[0]?.finish_reason;
      return NextResponse.json(
        {
          error: `Risposta vuota dal modello (finish_reason: ${finishReason})`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("Groq error details:", error);

    if (getErrorStatus(error) === 429) {
      return NextResponse.json(
        { error: "Limite di richieste raggiunto. Riprova tra un minuto." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Errore durante la generazione. Riprova più tardi." },
      { status: 500 },
    );
  }
}

function getErrorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : null;
}
