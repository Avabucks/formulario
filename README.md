# FormulaBase

**FormulaBase** è la piattaforma per costruire il tuo **Knowledge Stack**. Ogni Stack è un workspace personale per costruire e mantenere una knowledge base intelligente, potenziata dall’AI per organizzare, collegare e far evolvere la conoscenza. Permette di organizzare contenuti complessi in Markdown e LaTeX, formattare note e snippet di codice, visualizzare equazioni matematiche KaTeX e utilizzare l'intelligenza artificiale per riassumere, spiegare ed estendere i tuoi appunti.

## Funzionalità principali

- **Autenticazione Sicura**: Accesso tramite Google Authentication e Google One Tap integrato con Firebase Auth.
- **Sessioni Server-Side**: Gestione delle sessioni sicura e performante lato server tramite `iron-session`.
- **Architettura a Knowledge Stack**:
  - **Navigatore Struttura (Albero dello Stack)**: Un menu ad albero laterale che mostra l'indice dello stack organizzato in Sezioni e Pagine per una navigazione istantanea.
  - **Editor a 3 Pannelli & Anteprima**: Scrittura fluida in Markdown e LaTeX con anteprima live in tempo reale per testo, formule KaTeX e snippet.
- **Assistente AI Integrato**: Chat AI accessibile direttamente dall'editor (supportata da Gemini e Groq) che legge il contesto della pagina corrente per generare spiegazioni, riassunti ed estensioni.
- **Condivisione & Community**:
  - Pubblicazione degli stack nella sezione **Community** con filtri e ricerca globale.
  - Condivisione immediata tramite link condivisibili o codici QR dinamici generati in-app.
  - Possibilità di duplicare (clonare) gli stack della community per personalizzarli.
  - Sistema di preferiti e contatore di visualizzazioni.
- **Dashboard di Amministrazione**: Pannello `/admin` dedicato per il monitoraggio degli utenti attivi, la creazione di stack, l'analisi delle risorse e la lettura dei feedback degli utenti.
- **Aesthetics & UX**: Design premium moderno basato su Tailwind CSS 4, Radix UI e framer-motion per micro-animazioni fluide.
- **Ottimizzazione SEO**: Sitemap e robots dinamici, metadati semantici ottimizzati per ciascuno stack pubblico.

---

## Stack tecnologico

- **Framework**: Next.js 16 (App Router)
- **Libreria Core**: React 19 (con React 19.2.3)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS 4, PostCSS, framer-motion (animazioni)
- **Database**: PostgreSQL (con estensione `pg_trgm` per la ricerca fuzzy)
- **Autenticazione**: Firebase Client Auth + Firebase Admin SDK
- **Editor di testo**: Monaco Editor (`@monaco-editor/react`)
- **Rendering scientifico & diagrammi**: KaTeX (`react-katex`, `rehype-katex`), React Markdown e Mermaid.js
- **Motori AI**: Google Gemini API (`@google/generative-ai`) e Groq API (`groq-sdk`)
- **Analytics**: Umami Analytics integrato

---

## Setup Locale

### Requisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js 20** o superiore
- **npm** o un package manager equivalente
- Un database **PostgreSQL** attivo

### 1. Installazione dipendenze

Clona la repository ed installa i pacchetti necessari:

```bash
npm install
```

### 2. Configurazione Variabili Ambiente

Crea il tuo file `.env.local` partendo dal modello di esempio:

```bash
cp .env.example .env.local
```

_(Su Windows PowerShell)_:

```powershell
Copy-Item .env.example .env.local
```

Compila il file `.env.local` configurando le chiavi per Firebase, il database PostgreSQL, Gemini/Groq e Umami.

### 3. Inizializzazione Database

Esegui lo script SQL fornito per generare le tabelle:

```bash
psql "$DATABASE_URL" -f sql/create_tables.sql
```

> [!IMPORTANT]
> **Dashboard di Amministrazione (`/admin`)**:
> Lo schema SQL di base non include di default privilegi di amministrazione per gli utenti. Per abilitare l'accesso alla dashboard admin, aggiungi la colonna `is_admin` alla tabella `users`:
>
> ```sql
> ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
> ```
>
> Dopodiché, imposta a `TRUE` il flag per il tuo specifico `uid` utente (assegnato da Firebase):
>
> ```sql
> UPDATE users SET is_admin = TRUE WHERE uid = 'IL_TUO_UID_FIREBASE';
> ```

### 4. Avvio in Sviluppo

Avvia il server locale di sviluppo:

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo:
[http://localhost:3000](http://localhost:3000)

---

## Variabili Ambiente

| Variabile                                  | Descrizione                                                           |
| :----------------------------------------- | :-------------------------------------------------------------------- |
| `DATABASE_URL`                             | Stringa di connessione a PostgreSQL                                   |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Chiave API Firebase Client                                            |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`             | Client ID OAuth Google per il login ed il Google One Tap              |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Dominio di autenticazione Firebase                                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | ID progetto Firebase                                                  |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Bucket di storage Firebase                                            |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID mittente messaggi Firebase                                         |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | App ID Firebase Client                                                |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | ID di misurazione Analytics Firebase                                  |
| `FIREBASE_PRIVATE_KEY`                     | Chiave privata del Service Account Firebase Admin                     |
| `FIREBASE_CLIENT_EMAIL`                    | Email del Service Account Firebase Admin                              |
| `SESSION_SECRET`                           | Chiave segreta di crittografia per `iron-session` (min. 32 caratteri) |
| `NEXT_PUBLIC_APP_URL`                      | URL pubblico dell'applicazione (es. per canonical URL/condivisione)   |
| `NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID`      | `beautiful_id` del formulario predefinito clonato per i nuovi utenti  |
| `GEMINI_API_KEY`                           | API Key per l'accesso ai modelli Google Gemini                        |
| `GROQ_API_KEY`                             | API Key per l'accesso ai modelli di inferenza Groq                    |
| `NEXT_PUBLIC_UMAMI_APP_ID`                 | ID del sito configurato per il tracciamento Umami Analytics           |

---

## Scorciatoie da Tastiera (Keyboard Shortcuts)

L'applicazione dispone di scorciatoie da tastiera integrate per velocizzare la navigazione e la formattazione scientifica all'interno dell'editor.

<details>
<summary><b>Visualizza elenco scorciatoie</b></summary>

### Navigazione & Applicazione

- **Cerca nei formulari**: `Ctrl + K`
- **Impostazioni Formulario**: `Ctrl + Shift + I`
- **Aggiungi nuovo capitolo/argomento**: `Ctrl + Shift + A`
- **Genera con AI**: `Alt + A`
- **Visualizzazione Editor**: `Alt + 1`
- **Visualizzazione Dividi (Split)**: `Alt + 2`
- **Visualizzazione Anteprima**: `Alt + 3`

### Formattazione Contenuto

- **Grassetto**: `Ctrl + B`
- **Corsivo**: `Ctrl + I`
- **Citazione (Quote)**: `Ctrl + Shift + Q`
- **Lista ordinata**: `Ctrl + Shift + 7`
- **Lista non ordinata**: `Ctrl + Shift + 8`
- **Divisore**: `Ctrl + Shift + 9`
- **Tabella**: `Alt + T`
- **Codice inline**: `Ctrl + Shift + J`
- **Codice in blocco**: `Ctrl + Shift + U`
- **Formula inline**: `Ctrl + Shift + G`
- **Formula in blocco**: `Ctrl + Shift + H`
- **Titoli (da H1 a H6)**: `Ctrl + Shift + [1-6]`

### Comandi Editor (Monaco)

- **Salva**: `Ctrl + S`
- **Annulla / Ripristina**: `Ctrl + Z` / `Ctrl + Y`
- **Seleziona prossima occorrenza**: `Ctrl + D`
- **Seleziona tutte le occorrenze**: `Ctrl + Shift + L`
- **Inserisci cursore multiplo**: `Alt + Click`
- **Sposta riga su/giù**: `Alt + ↑` / `Alt + ↓`
- **Duplica riga**: `Shift + Alt + ↓`
- **Elimina riga**: `Ctrl + Shift + K`

</details>

---

## Struttura del Progetto

```text
src/
  ├── app/             # Pagine, rotte, API Next.js e logica di routing (robots.ts, sitemap.ts)
  ├── components/      # Componenti UI riutilizzabili e moduli di dominio (editor, auth, home)
  ├── data/            # Configurazione statica e costanti (es. kbs.json per shortcut)
  ├── hooks/           # Custom hooks di React (es. useIsMobile, useFilters)
  ├── lib/             # Utility, inizializzazione DB (pg), Firebase SDK e iron-session
  ├── proxy.ts         # Logica e matcher per la protezione delle rotte ed i reindirizzamenti
  └── styles/          # Fogli di stile CSS globali, KaTeX ed editor personalizzati

public/                # Asset statici (loghi, manifest.json, immagini e icone)
sql/                   # Script di creazione delle tabelle del database PostgreSQL
```

---

## Struttura del Database

Il database PostgreSQL utilizza le seguenti tabelle configurate in `sql/create_tables.sql`:

- `users`: Informazioni sul profilo degli utenti registrati (UID Firebase, nome, email, foto profilo).
- `formulari`: Testata del formulario (titolo, descrizione, visibilità privata/pubblica/condivisa, contatore visualizzazioni, owner).
- `capitoli`: Sezioni intermedie collegate a un formulario con ordine di ordinamento personalizzato.
- `argomenti`: Le pagine effettive contenenti il testo scritto in Markdown/LaTeX.
- `preferiti`: Relazione molti-a-molti che traccia i formulari salvati dagli utenti nella dashboard.
- `feedback`: Valutazioni da 1 a 5 stelle e recensioni fornite dagli utenti per il monitoraggio della qualità.

Viene inoltre abilitata l'estensione `pg_trgm` per supportare ricerche testuali con corrispondenze parziali e similarità di stringhe.

---

## Flusso Logico di Funzionamento

1. **Accesso utente**: L'utente si autentica con Google Auth (Client). L'ID Token viene trasmesso via POST a `/api/auth/login`.
2. **Verifica sessione**: Il backend verifica il token con Firebase Admin SDK e crea una sessione cifrata server-side salvata tramite `iron-session`. Se l'utente non è censito nel DB locale, viene registrato automaticamente nella tabella `users`.
3. **Controllo Accessi**: La logica definita in `src/proxy.ts` protegge le rotte riservate (come `/home`, `/editor`, `/settings`, `/admin`) reindirizzando gli utenti non autenticati al login.
4. **Scrittura e Modifica**: Dall'editor `/editor/[argomentoId]`, l'utente può scrivere note con formattazione istantanea KaTeX. Può chiedere supporto all'AI Chat, che recupera il contenuto corrente per ottimizzare il prompt. I dati vengono salvati automaticamente su PostgreSQL.
5. **Condivisione**: L'utente può cambiare la visibilità del formulario. Se impostato su pubblico, questo apparirà nella scheda `/community` e i motori di ricerca lo indicizzeranno grazie alla sitemap dinamica (`/sitemap.ts`).

---

## Script disponibili

- `npm run dev`: Avvia il server di sviluppo locale.
- `npm run build`: Esegue la compilazione del progetto per l'ambiente di produzione.
- `npm run start`: Avvia l'applicazione Next.js già compilata in produzione.
- `npm run lint`: Esegue i controlli statici del codice con ESLint.
- `npm run format:check`: Controlla lo stile del codice usando Prettier.
- `npm run format:fix`: Applica automaticamente le correzioni di formattazione di Prettier in tutto il progetto.
