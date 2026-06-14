import { pool } from "@/src/lib/db";
import { SessionData, sessionOptions } from "@/src/lib/session";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { getIronSession } from "iron-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

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
    temperature: 0.2,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        titolo: {
          type: "string",
          description: "Il titolo complessivo del formulario (massimo 30 caratteri, deve essere descrittivo e conciso)",
        },
        descrizione: {
          type: "string",
          description: "Una breve descrizione o introduzione del formulario",
        },
        capitoli: {
          type: "array",
          description: "Lista di capitoli che compongono il formulario",
          items: {
            type: "object",
            properties: {
              titolo: {
                type: "string",
                description: "Titolo descrittivo del capitolo (es. 'Meccanica classica', 'Limiti e derivate')",
              },
              argomenti: {
                type: "array",
                description: "Elenco degli argomenti dettagliati del capitolo",
                items: {
                  type: "object",
                  properties: {
                    content: {
                      type: "string",
                      description: "Contenuto dell'argomento in formato Markdown. DEVE iniziare con '# Titolo Argomento' alla prima riga, seguito da formule in LaTeX ($ per inline, $$ per block) e spiegazioni. Usa trattini '-' per elenchi puntati.",
                    },
                  },
                  required: ["content"],
                },
              },
            },
            required: ["titolo", "argomenti"],
          },
        },
      },
      required: ["titolo", "descrizione", "capitoli"],
    },
  },
  systemInstruction:
    "Sei un esperto accademico nella creazione di formulari e cheat sheet. Analizza il materiale fornito e genera un formulario strutturato in capitoli e argomenti. Scrivi tutte le formule matematiche e scientifiche usando la sintassi LaTeX ($...$ per formule inline, $$...$$ per blocchi separati). Ogni argomento deve essere esaustivo, includere formule e commenti descrittivi. Il contenuto di ogni singolo argomento DEVE tassativamente iniziare con '# Titolo Argomento' alla primissima riga.",
  safetySettings,
});

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const uid = session.uid;

  if (!uid) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // check if user exists
  const { rows: users } = await pool.query(
    `SELECT id FROM users WHERE uid = $1`,
    [uid],
  );
  if (users.length === 0) {
    redirect("/api/auth/logout");
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nessun file selezionato" },
        { status: 400 },
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Puoi caricare al massimo 5 file" },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    const parts = [];
    let totalSize = 0;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Il file "${file.name}" supera il limite di 20MB.` },
          { status: 400 },
        );
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Il file "${file.name}" ha un formato non supportato. Sono consentiti solo PDF, immagini e file di testo.`,
          },
          { status: 400 },
        );
      }
      totalSize += file.size;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      parts.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      });
    }

    if (totalSize > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La dimensione totale dei file non può superare i 20MB." },
        { status: 400 },
      );
    }

    const prompt =
      "Analizza i file allegati e crea un formulario completo e ben organizzato. Suddividi il formulario in capitoli e per ciascun capitolo in diversi argomenti. " +
      "Ogni argomento deve contenere formule dettagliate in LaTeX e spiegazioni in Markdown. Il contenuto di ciascun argomento DEVE iniziare con '# Titolo Argomento' come prima riga.";

    // Stima dei token totali (1 token ≈ 4 caratteri) per evitare richieste di rete aggiuntive


    // Generazione contenuto
    const result = await model.generateContent([prompt, ...parts]);
    const response = result.response;

    // Controllo sicurezza
    if (response.promptFeedback?.blockReason) {
      return NextResponse.json(
        {
          error: `La richiesta è stata bloccata per motivi di sicurezza: ${response.promptFeedback.blockReason}`,
        },
        { status: 400 },
      );
    }

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      response.candidates[0].finishReason === "SAFETY"
    ) {
      return NextResponse.json(
        {
          error:
            "La generazione del formulario è stata bloccata dai filtri di sicurezza. Riprova con altro materiale.",
        },
        { status: 400 },
      );
    }

    const responseText = response.text();
    const data = JSON.parse(responseText);

    if (!data.titolo || !data.capitoli || !Array.isArray(data.capitoli)) {
      return NextResponse.json(
        { error: "Risposta AI non valida o incompleta." },
        { status: 500 },
      );
    }

    // Taglia il titolo a massimo 30 caratteri per vincolo DB
    const titoloValido = data.titolo.substring(0, 30);
    const descrizioneValida = data.descrizione || "";

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Crea formulario
      const beautiful_id =
        slugify(titoloValido, { lower: true, strict: true }) +
        "-" +
        crypto.randomUUID();

      await client.query(
        `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid)
         VALUES ($1, $2, $3, $4, $5)`,
        [beautiful_id, titoloValido, descrizioneValida, uid, uid],
      );

      // Inserisci capitoli e argomenti
      let capSortOrder = 1;
      for (const cap of data.capitoli) {
        const capitolo_id = crypto.randomUUID();
        const capTitolo = cap.titolo || `Capitolo ${capSortOrder}`;

        await client.query(
          `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [capitolo_id, capTitolo, beautiful_id, capSortOrder],
        );

        let argSortOrder = 1;
        for (const arg of cap.argomenti || []) {
          const argomento_id = crypto.randomUUID();
          const content = arg.content || "";

          await client.query(
            `INSERT INTO argomenti (beautiful_id, capitolo, sort_order, content)
             VALUES ($1, $2, $3, $4)`,
            [argomento_id, capitolo_id, argSortOrder, content],
          );
          argSortOrder++;
        }
        capSortOrder++;
      }

      await client.query("COMMIT");

      revalidatePath("/home");
      return NextResponse.json({ success: true, formulario_id: beautiful_id });
    } catch (dbError: any) {
      await client.query("ROLLBACK");
      console.error("Errore salvataggio database:", dbError);
      return NextResponse.json(
        { error: "Errore durante il salvataggio nel database." },
        { status: 500 },
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Errore generale create-ai:", error);
    return NextResponse.json(
      { error: error.message || "Errore durante l'elaborazione dei file." },
      { status: 500 },
    );
  }
}
