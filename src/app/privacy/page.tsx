import packageJson from "@/package.json";
import { Button } from "@/src/components/ui/button";
import { Footer } from "@/src/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy - ${packageJson.displayName}`,
  description: `Informativa sul trattamento dei dati personali (Privacy Policy) di ${packageJson.displayName} ai sensi del Regolamento (UE) 2016/679 (GDPR).`,
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16">
        <div className="max-w-3xl mx-auto w-full py-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Ultimo aggiornamento: Luglio 2026
            </p>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Informativa sul trattamento dei dati personali ai sensi del
              Regolamento (UE) 2016/679 (GDPR).
            </p>
          </div>

          <Section title="1. Titolare del trattamento">
            <p>
              Il titolare del trattamento dei dati personali è il gestore della
              piattaforma {packageJson.displayName}. Per qualsiasi richiesta
              relativa al trattamento dei tuoi dati, puoi contattarci tramite i
              canali indicati nella sezione "Contatti".
            </p>
          </Section>

          <Section title="2. Dati raccolti">
            <p>
              Raccogliamo e trattiamo i dati personali degli utenti per
              l'erogazione dei nostri servizi.
            </p>
            <h3 className="text-foreground font-semibold mt-3 mb-1">
              Dati forniti volontariamente dall'utente:
            </h3>
            <p>
              In fase di creazione dell'account tramite il provider di
              autenticazione (Google Account gestito tramite Firebase
              Authentication) raccogliamo esclusivamente:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">
                  Display name
                </span>
                : nome visualizzato pubblicamente agli altri utenti
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Indirizzo email
                </span>
                : utilizzato esclusivamente per l'autenticazione, non visibile
                pubblicamente ad altri utenti
              </li>
              <li>
                <span className="text-foreground font-medium">
                  URL foto profilo
                </span>
                : utilizzato per personalizzare l'esperienza d'uso e mostrato
                pubblicamente nel caso in cui decidi di condividere i tuoi
                formulari
              </li>
            </ul>
            <h3 className="text-foreground font-semibold mt-3 mb-1">
              Dati raccolti automaticamente:
            </h3>
            <p>
              Raccogliamo informazioni sull'utilizzo della piattaforma per scopi
              analitici e statistici, come descritto nella sezione dedicata a
              cookie e tracciamento.
            </p>
            <p className="mt-3">
              Non raccogliamo dati sensibili o particolari ai sensi dell'art. 9
              del GDPR, dati di pagamento, né effettuiamo profilazione a fini
              commerciali o pubblicitari.
            </p>
          </Section>

          <Section title="3. Finalità e base giuridica">
            <p>I dati raccolti vengono trattati per le seguenti finalità:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">
                  Creazione e gestione dell'account e dei formulari
                </span>
                : necessaria per l'erogazione del servizio e per l'esecuzione
                del contratto di servizio di cui l'utente è parte (art. 6, par.
                1, lett. b GDPR)
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Miglioramento ed ottimizzazione del servizio
                </span>
                : trattamento effettuato sulla base del legittimo interesse del
                titolare (art. 6, par. 1, lett. f GDPR) tramite analisi
                aggregate e non identificative sull'utilizzo dell'app
              </li>
            </ul>
          </Section>

          <Section title="4. Servizi di intelligenza artificiale">
            <p>
              La piattaforma integra servizi esterni di intelligenza artificiale
              per consentire la generazione di contenuti e l'assistenza
              nell'editor:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">Groq API</span>{" "}
                (con modello Llama 3.3 70B): utilizzato per l'elaborazione dei
                prompt. Il trattamento è regolato dalla{" "}
                <a
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground"
                >
                  Privacy Policy di Groq
                </a>
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Google Gemini API
                </span>{" "}
                (con modello Gemini 2.5 Flash): utilizzato per la generazione di
                formule e spiegazioni. Il trattamento è regolato dalla{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground"
                >
                  Privacy Policy di Google
                </a>
              </li>
            </ul>
            <p className="mt-3">
              Quando utilizzi queste funzionalità, inviamo alle rispettive API
              solo il testo del prompt digitato ed il contesto dell'argomento
              correntemente in uso.{" "}
              <strong>Non inviamo dati identificativi</strong> (come indirizzi
              email o nomi utente) alle API dei servizi di IA. Ti invitiamo ad
              evitare l'inserimento di dati personali nei prompt inviati.
            </p>
          </Section>

          <Section title="5. Visibilità dei dati e condivisione">
            <p>
              La visibilità delle informazioni collegate ai formulari che crei
              dipende dal livello di privacy che selezioni:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">
                  Formulari Privati (Visibilità 0)
                </span>
                : sono visibili ed accessibili esclusivamente a te. I relativi
                dati non vengono condivisi con alcun altro utente.
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Formulari Condivisi tramite Link (Visibilità 1)
                </span>
                : sono accessibili a chiunque possieda il link diretto. Accanto
                al formulario, i visitatori potranno visualizzare il tuo{" "}
                <strong>display name</strong> e la tua{" "}
                <strong>foto profilo</strong>.
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Formulari Pubblici nella Community (Visibilità 2)
                </span>
                : sono pubblicati nell'elenco pubblico della Community di{" "}
                {packageJson.displayName}. Chiunque acceda alla piattaforma
                potrà visualizzare il formulario, oltre al tuo{" "}
                <strong>display name</strong> e alla tua{" "}
                <strong>foto profilo</strong>.
              </li>
            </ul>
          </Section>

          <Section title="6. Web Analytics e Cookie">
            <p>
              Utilizziamo strumenti di analisi statistica per monitorare l'uso
              della nostra applicazione in forma aggregata e anonima, al fine di
              ottimizzarne il funzionamento:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">
                  Umami Analytics
                </span>
                : un servizio di web analytics rispettoso della privacy che non
                utilizza cookie di tracciamento personali e non raccoglie dati
                personali identificativi degli utenti.
              </li>
              <li>
                <span className="text-foreground font-medium">
                  Firebase Analytics / Google Analytics
                </span>
                : utilizzato per analizzare eventi di utilizzo della piattaforma
                in forma anonima e aggregata.
              </li>
            </ul>
            <p className="mt-3">
              Puoi disabilitare o bloccare l'uso dei cookie o dei tracker in
              qualsiasi momento modificando opportunamente le impostazioni del
              tuo browser web.
            </p>
          </Section>

          <Section title="7. Conservazione dei dati e Cancellazione">
            <p>
              I dati personali e i formulari vengono conservati per tutta la
              durata dell'account. Puoi richiedere la cancellazione del tuo
              account e di tutti i dati ad esso associati in qualsiasi momento
              tramite la "Zona Pericolosa" nelle Impostazioni del tuo profilo.
              In caso di cancellazione, tutti i dati personali relativi al
              profilo e l'intero archivio dei formulari creati (sia privati sia
              pubblici/condivisi), saranno{" "}
              <strong>definitivamente ed immediatamente eliminati</strong> dai
              nostri sistemi, salvo obblighi di conservazione previsti dalle
              leggi vigenti.
            </p>
          </Section>

          <Section title="8. Sicurezza">
            <p>
              Adottiamo misure tecniche e organizzative adeguate per proteggere
              i tuoi dati personali da accessi non autorizzati, perdita o
              divulgazione, in conformità con l'art. 32 del GDPR.
            </p>
          </Section>

          <Section title="9. I tuoi diritti (GDPR)">
            <p>
              In conformità con il Regolamento Generale sulla Protezione dei
              Dati (GDPR), hai il diritto di:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>
                Richiedere l'accesso ai tuoi dati personali (art. 15 GDPR) ed
                ottenerne una copia.
              </li>
              <li>
                Richiedere la rettifica o correzione di dati inesatti (art. 16
                GDPR).
              </li>
              <li>
                Richiedere la cancellazione dei tuoi dati personali (diritto
                all'oblio - art. 17 GDPR), esercitabile in autonomia eliminando
                l'account.
              </li>
              <li>
                Ottenere la limitazione del trattamento dei tuoi dati (art. 18
                GDPR).
              </li>
              <li>
                Richiedere la portabilità dei dati in un formato strutturato e
                leggibile (art. 20 GDPR).
              </li>
              <li>Opporti al trattamento dei tuoi dati (art. 21 GDPR).</li>
            </ul>
            <p className="mt-3">
              Per esercitare questi diritti o per richiedere chiarimenti, puoi
              inviare una comunicazione scritta all'indirizzo email indicato di
              seguito.
            </p>
          </Section>

          <Section title="10. Contatti">
            <p>
              Per qualsiasi richiesta relativa alla presente informativa o al
              trattamento dei tuoi dati personali, puoi contattarci
              all'indirizzo email:
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
