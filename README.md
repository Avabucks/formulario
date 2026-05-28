# FormulaBase

FormulaBase è una web app per creare, organizzare e condividere formulari scientifici e cheat sheet. Permette di scrivere contenuti in Markdown e LaTeX, dividerli in capitoli e argomenti, salvarli nel proprio spazio personale, condividerli tramite link o QR code e usare assistenti AI per generare o migliorare appunti.

## Funzionalità principali

* Autenticazione Google tramite Firebase
* Sessioni server-side con `iron-session`
* Database PostgreSQL per utenti, formulari, capitoli, argomenti e preferiti
* Editor Markdown/LaTeX con Monaco Editor
* Anteprima KaTeX e strumenti di formattazione
* Generazione contenuti tramite Gemini e Groq
* Formulari privati, condivisi o pubblici nella community
* Sistema di preferiti, visualizzazioni, ricerca e duplicazione formulari
* Condivisione tramite link e QR code
* Tema chiaro/scuro con UI basata su Radix UI e shadcn/ui

## Stack tecnologico

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS 4
* PostgreSQL (`pg`)
* Firebase Auth + Firebase Admin
* Monaco Editor
* KaTeX, React Markdown e Mermaid
* Gemini API e Groq API

## Requisiti

Prima di iniziare assicurati di avere:

* Node.js 20 o superiore
* npm
* Un database PostgreSQL
* Un progetto Firebase con autenticazione Google abilitata
* Una chiave API Gemini e/o Groq per le funzionalità AI

## Setup locale

Installa le dipendenze:

```bash
npm install
```

Crea il file delle variabili ambiente:

```bash
cp .env.example .env.local
```

Su PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Compila `.env.local` con le tue credenziali.

Inizializza il database:

```bash
psql "$DATABASE_URL" -f sql/create_tables.sql
```

Avvia il server di sviluppo:

```bash
npm run dev
```

L'app sarà disponibile su:

```text
http://localhost:3000
```

## Variabili ambiente

| Variabile                                  | Descrizione                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| `DATABASE_URL`                             | URL di connessione PostgreSQL                            |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | API key Firebase client                                  |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`             | Client ID OAuth Google usato anche per Google One Tap    |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Auth domain Firebase                                     |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | ID del progetto Firebase                                 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Storage bucket Firebase                                  |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase                                       |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase App ID                                          |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Firebase Measurement ID                                  |
| `FIREBASE_PRIVATE_KEY`                     | Chiave privata del service account Firebase Admin        |
| `FIREBASE_CLIENT_EMAIL`                    | Email del service account Firebase Admin                 |
| `SESSION_SECRET`                           | Segreto usato da `iron-session`                          |
| `NEXT_PUBLIC_APP_URL`                      | URL pubblico dell'app                                    |
| `NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID`      | ID del formulario di benvenuto assegnato ai nuovi utenti |
| `GEMINI_API_KEY`                           | API key Gemini                                           |
| `GROQ_API_KEY`                             | API key Groq                                             |
| `NEXT_PUBLIC_UMAMI_APP_ID`                 | ID sito Umami per analytics                              |

> Nota: il codice usa `NEXT_PUBLIC_FORMULARIO_BENVENUTO_ID`. Se trovi `FORMULARIO_BENVENUTO_ID` nel file `.env.example`, rinominala aggiungendo il prefisso `NEXT_PUBLIC_`.

## Script disponibili

### Avvio sviluppo

```bash
npm run dev
```

Avvia Next.js in modalità sviluppo.

### Build produzione

```bash
npm run build
```

Genera la build di produzione.

### Avvio produzione

```bash
npm run start
```

Avvia la build di produzione.

### Lint

```bash
npm run lint
```

Esegue ESLint.

### Controllo formattazione

```bash
npm run format:check
```

Controlla la formattazione con Prettier.

### Formattazione automatica

```bash
npm run format:fix
```

Formatta automaticamente il progetto con Prettier.

## Struttura del progetto

```text
src/
  app/                 Route, pagine e API Next.js
  components/          Componenti UI e componenti di dominio
  data/                Dati statici e configurazioni
  hooks/               Hook React condivisi
  lib/                 Configurazioni DB, Firebase, sessioni e utility
  styles/              Stili globali ed editor

public/                Asset statici, icone, manifest e video tutorial
sql/                   Script SQL per inizializzare il database
```

## Database

Lo schema iniziale si trova in:

```text
sql/create_tables.sql
```

Lo script crea le seguenti tabelle:

* `users` → utenti autenticati tramite Firebase
* `formulari` → formulari creati o duplicati dagli utenti
* `capitoli` → sezioni ordinate dei formulari
* `argomenti` → contenuti Markdown/LaTeX associati ai capitoli
* `preferiti` → relazione tra utenti e formulari salvati

Viene inoltre abilitata l'estensione PostgreSQL `pg_trgm`, utilizzata per migliorare le ricerche testuali.

## Flusso principale

1. L'utente accede con Google
2. Il backend verifica l'ID token tramite Firebase Admin
3. L'utente viene creato o aggiornato nel database PostgreSQL
4. I formulari vengono gestiti tramite:

   * `/home`
   * `/formulario/[formularioId]`
   * `/capitolo/[capitoloId]`
   * `/editor/[argomentoId]`
5. Le API in `src/app/api` gestiscono:

   * salvataggio contenuti
   * struttura formulari
   * preferiti
   * visibilità
   * richieste AI

## Deploy

Per il deploy configura le stesse variabili ambiente usate in locale sulla piattaforma di hosting scelta.

Prima del rilascio esegui:

```bash
npm run lint
npm run build
```