import DeleteAccount from "@/src/components/auth/delete-account";
import { Header } from "@/src/components/navigation/header";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import packageJson from "@/package.json";
import { Footer } from "@/src/components/landing/footer";
import { Button } from "@/src/components/ui/button";
import { Metadata } from "next";
import { pool } from "@/src/lib/db";

export const metadata: Metadata = {
  title: `Termini e condizioni - ${packageJson.displayName}`,
  description: `Termini di servizio e condizioni d'uso della piattaforma ${packageJson.displayName}.`,
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsPage() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  const { rows: users } = await pool.query(
    `SELECT display_name as "displayName" FROM users WHERE uid = $1`,
    [session.uid],
  );

  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 w-full pt-16 px-2 md:px-6">
        <div className="max-w-3xl mx-auto w-full py-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Ultimo aggiornamento: Luglio 2026
            </p>
            <h1 className="text-3xl font-bold">Termini di Servizio</h1>
            <p className="text-muted-foreground">
              Leggere attentamente i presenti termini prima di utilizzare la
              piattaforma.
            </p>
          </div>

          <Section title="1. Accettazione dei termini">
            <p>
              Utilizzando la piattaforma {packageJson.displayName}, accetti
              integralmente i presenti Termini di Servizio. Se non accetti
              questi termini, ti invitiamo a non utilizzare il servizio.
            </p>
          </Section>

          <Section title="2. Descrizione del servizio">
            <p>
              {packageJson.displayName} è una piattaforma che consente agli
              utenti registrati di creare, organizzare e consultare formulari
              strutturati in capitoli e argomenti. Gli utenti possono inoltre
              condividere i propri formulari tramite link diretto o pubblicarli
              nella Community pubblica della piattaforma. Il servizio è fornito
              così com'è, senza garanzie di disponibilità continua.
            </p>
          </Section>

          <Section title="3. Registrazione e account">
            <p>
              Per utilizzare il servizio è necessario creare un account tramite
              il provider di autenticazione supportato (Google Account gestito
              tramite Firebase Authentication). L'utente è responsabile della
              sicurezza del proprio account e delle attività svolte attraverso
              di esso. In caso di accesso non autorizzato, è necessario
              notificarcelo immediatamente.
            </p>
          </Section>

          <Section title="4. Contenuti dell'utente e Condivisione">
            <p>
              L'utente è l'unico responsabile dei contenuti (formulari,
              capitoli, argomenti) che carica, crea o condivide sulla
              piattaforma. Quando pubblichi un formulario nella Community o lo
              condividi tramite link, questo diventa accessibile ad altri
              soggetti. È vietato inserire o condividere contenuti:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                Illegali, protetti da copyright senza autorizzazione o che
                violino diritti di terzi
              </li>
              <li>Offensivi, diffamatori o discriminatori</li>
              <li>Contenenti malware o codice dannoso</li>
              <li>
                Contenenti dati personali o sensibili di terze persone senza
                consenso
              </li>
            </ul>
            <p className="mt-3">
              Ci riserviamo il diritto di rimuovere, oscurare o modificare
              qualsiasi contenuto che violi questi termini.
            </p>
          </Section>

          <Section title="5. Proprietà intellettuale e Licenze">
            <p>
              I contenuti creati dall'utente rimangono di sua proprietà.
              Utilizzando il servizio e impostando i formulari come privati,
              l'utente concede alla piattaforma una licenza limitata, non
              esclusiva e non trasferibile per archiviare ed erogare tali
              contenuti esclusivamente al fine di fornirgli il servizio.
            </p>
            <p className="mt-2">
              Se l'utente imposta un formulario come "Pubblico" nella Community
              o lo condivide tramite link, concede alla piattaforma e a tutti
              gli utenti della stessa una licenza gratuita, mondiale, non
              esclusiva e irrevocabile (fino a quando il formulario non viene
              rimosso o reso privato) per visualizzare, consultare ed aggiungere
              ai preferiti tale contenuto.
            </p>
          </Section>

          <Section title="6. Utilizzo dei Servizi AI">
            <p>
              La piattaforma mette a disposizione funzionalità di intelligenza
              artificiale basate su servizi di terze parti (Groq e Google
              Gemini) per supportare la creazione di formule e testi.
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                L'utente è consapevole che i contenuti generati dall'AI
                potrebbero contenere errori, inesattezze o formule non corrette.
              </li>
              <li>
                L'utente è l'unico responsabile della verifica e della
                correttezza delle formule generate prima di farne uso accademico
                o professionale.
              </li>
              <li>
                È vietato l'uso delle funzionalità AI per generare contenuti
                abusivi, illegali o spam.
              </li>
            </ul>
          </Section>

          <Section title="7. Limitazione di responsabilità">
            <p>
              La piattaforma non è responsabile per perdita di dati,
              interruzioni del servizio, malfunzionamenti o danni derivanti
              dall'utilizzo o dall'impossibilità di utilizzare il servizio.
              Inoltre, non garantiamo la correttezza scientifica o accademica
              dei formulari presenti sulla piattaforma, siano essi creati dagli
              utenti o generati/supportati dai sistemi di intelligenza
              artificiale.
            </p>
          </Section>

          <Section title="8. Cancellazione dell'account">
            <p>
              L'utente può richiedere la cancellazione del proprio account in
              qualsiasi momento tramite la sezione apposita nelle impostazioni.
              A seguito della cancellazione, l'account dell'utente ed i relativi
              formulari caricati o creati (compresi quelli condivisi o
              pubblicati nella Community) verranno eliminati in modo definitivo
              ed immediato dai database di produzione.
            </p>
            <div className="mt-2">
              {session.uid && (
                <DeleteAccount username={users[0]?.displayName} />
              )}
            </div>
          </Section>

          <Section title="9. Modifiche ai termini">
            <p>
              Ci riserviamo il diritto di modificare i presenti termini in
              qualsiasi momento. Le modifiche saranno comunicate agli utenti e
              avranno effetto dalla data di pubblicazione. L'uso continuato del
              servizio dopo la pubblicazione delle modifiche costituisce
              accettazione dei nuovi termini.
            </p>
          </Section>

          <Section title="10. Legge applicabile">
            <p>
              I presenti termini sono regolati dalla legge italiana. Per
              qualsiasi controversia è competente il foro del luogo di residenza
              del titolare del servizio, salvo diversa disposizione di legge
              applicabile ai consumatori.
            </p>
          </Section>

          <Section title="11. Contatti">
            <p>
              Per qualsiasi domanda relativa ai presenti termini, puoi
              contattarci tramite mail.
            </p>
            <Button variant="link">
              <a href={`mailto:${packageJson.email}`}>{packageJson.email}</a>
            </Button>
          </Section>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}
