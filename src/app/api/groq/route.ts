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
  "Agisci come un assistente accademico esperto in formulari universitari.\n" +
  "Il tuo compito principale è modificare, correggere o arricchire il documento fornito in base alle istruzioni dell'utente.\n" +
  "IMPORTANTE:\n" +
  "1. Non limitarti a spiegare le modifiche o a rispondere alla domanda: devi restituire l'INTERO documento modificato, incorporando i cambiamenti richiesti e preservando il resto del testo esistente.\n" +
  "2. Non includere alcuna introduzione, conclusione o commento (come 'Certamente', 'Ecco il documento modificato:', ecc.). Il testo generato deve essere pronto all'uso e sostituire integralmente il documento precedente.\n" +
  "3. NON racchiudere il testo generato in tag XML o delimitatori di alcun tipo (come <documento>, ecc.). Restituisci esclusivamente il testo pulito del documento.\n" +
  "4. Se non viene fornito alcun documento da modificare, genera da zero il formulario richiesto seguendo le stesse regole.\n" +
  String.raw`5. Usa Markdown (per le liste usa il trattino '-' e non l'asterisco '*') e LaTeX ($ per formule inline, $$ per formule display, non usare \[), organizzando i contenuti con opportuni headings (es. #, ##, ###).`;

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
    const { prompt, context, messages } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt mancante o non valido" },
        { status: 400 },
      );
    }

    const apiMessages: any[] = [
      { role: "system", content: SYSTEM_INSTRUCTION },
    ];

    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.status === "loading" || msg.status === "error") {
          continue;
        }

        if (msg.sender === "user") {
          if (msg.text?.trim()) {
            apiMessages.push({ role: "user", content: msg.text.trim() });
          }
        } else if (msg.sender === "ai") {
          const content = msg.suggestedContent ?? msg.text;
          if (content?.trim()) {
            apiMessages.push({ role: "assistant", content: content.trim() });
          }
        }
      }
    }

    const userMessage = context?.trim()
      ? `Documento:\n${context}\n\nRichiesta di modifica: ${prompt}`
      : prompt;

    apiMessages.push({ role: "user", content: userMessage });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.5,
      messages: apiMessages,
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
