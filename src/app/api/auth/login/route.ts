import { pool } from "@/src/lib/db";
import { adminAuth } from "@/src/lib/firebase-admin";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.uid = decoded.uid;

    const { rows } = await pool.query(
      `INSERT INTO users (display_name, email, uid, foto_profilo)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (uid) 
          DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, foto_profilo = EXCLUDED.foto_profilo
          RETURNING (xmax = 0) AS inserted`,
      [decoded.name, decoded.email, decoded.uid, decoded.picture]
    );

    const isNewUser = rows[0].inserted;

    if (isNewUser) {
      await creaFormularioBenvenuto(decoded.uid);
    }

    await session.save();
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Token non valido" }, { status: 401 });
  }
}

async function creaFormularioBenvenuto(uid: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const formularioId = slugify("Benvenuto su FormulaBase", { lower: true, strict: true }) + "-" + crypto.randomUUID();

    await client.query(
      `INSERT INTO formulari (beautiful_id, titolo, descrizione, owner_uid, author_uid, anno, visibility_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        formularioId,
        "Benvenuto su FormulaBase",
        "Guida introduttiva alle funzionalità di FormulaBase",
        uid,
        uid,
        new Date().getFullYear().toString(),
        false,
      ]
    );

    const capitoli = [
      {
        titolo: "Editor KaTeX",
        sort_order: 1,
        argomenti: [
          {
            titolo: "Formule inline",
            sort_order: 1,
            content: `Le formule inline si inseriscono tra simboli dollaro singoli: $E = mc^2$ appare nel testo corrente.

Puoi scrivere qualsiasi espressione matematica inline, ad esempio $\\frac{a}{b}$ o $\\sqrt{x^2 + y^2}$.`,
          },
          {
            titolo: "Formule in blocco",
            sort_order: 2,
            content: `Le formule in blocco si inseriscono tra doppi dollaro e appaiono centrate su una riga separata:

$$\\int_{-\\infty}^{+\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$`,
          },
          {
            titolo: "Titoli e intestazioni",
            sort_order: 4,
            content: `I titoli si creano con il simbolo cancelletto:

# Titolo di primo livello
## Titolo di secondo livello
### Titolo di terzo livello
#### Titolo di quarto livello
##### Titolo di quinto livello
###### Titolo di sesto livello

I titoli principali (H1 e H2) hanno una linea separatrice sotto.`,
          },
          {
            titolo: "Testo in grassetto e corsivo",
            sort_order: 4,
            content: `Puoi formattare il testo normalmente:

**Grassetto** per i concetti importanti.
*Corsivo* per termini tecnici o enfasi.
**_Grassetto e corsivo_** combinati.

All'interno delle formule puoi usare \\textbf{testo} per il grassetto matematico.`,
          },
          {
            titolo: "Altre funzionalità dell'editor",
            sort_order: 5,
            content: `L'editor supporta:

- **Frazioni**: $\\frac{numeratore}{denominatore}$
- **Pedici e apici**: $x_i^2$
- **Radici**: $\\sqrt[n]{x}$
- **Matrici**: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
- **Limiti**: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$
- **Integrali**: $\\int_a^b f(x)\\,dx$
- **Sommatorie**: $\\sum_{i=0}^{n} i$`,
          },
        ],
      },
      {
        titolo: "Condivisione e Visibilità",
        sort_order: 2,
        argomenti: [
          {
            titolo: "Condivisione tramite QR",
            sort_order: 1,
            content: `Ogni formulario può essere condiviso tramite un **QR code** generato automaticamente.

Puoi scegliere la visibilità prima di condividere:
- **Privato**: solo tu puoi vederlo, il link funziona solo per te
- **Pubblico con link**: chiunque abbia il QR o il link può visualizzarlo
- **Community**: visibile a tutti nella community di FormulaBase`,
          },
          {
            titolo: "Community",
            sort_order: 2,
            content: `La **community** raccoglie tutti i formulari pubblici condivisi dagli utenti.

Puoi sfogliare i formulari degli altri, cercare per materia o argomento e trovare risorse già pronte da usare o da cui prendere ispirazione.`,
          },
        ],
      },
      {
        titolo: "Rendi tuo un formulario",
        sort_order: 3,
        argomenti: [
          {
            titolo: "Duplica e modifica",
            sort_order: 1,
            content: `Quando trovi un formulario nella community che ti interessa, puoi **renderlo tuo** con un click.

Questo crea una copia identica nel tuo account con:
- Tutti i capitoli e gli argomenti originali
- Te come nuovo proprietario (**owner**)
- L'autore originale conservato come riferimento

Da quel momento puoi modificarlo liberamente: aggiungere capitoli, correggere formule, personalizzare i contenuti senza toccare l'originale.`,
          },
        ],
      },
    ];

    for (const capitolo of capitoli) {
      const capitoloId = slugify(capitolo.titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID();

      await client.query(
        `INSERT INTO capitoli (beautiful_id, titolo, formulario, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [capitoloId, capitolo.titolo, formularioId, capitolo.sort_order]
      );

      for (const argomento of capitolo.argomenti) {
        await client.query(
          `INSERT INTO argomenti (beautiful_id, titolo, capitolo, sort_order, content)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            slugify(argomento.titolo, { lower: true, strict: true }) + "-" + crypto.randomUUID(),
            argomento.titolo,
            capitoloId,
            argomento.sort_order,
            argomento.content,
          ]
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}