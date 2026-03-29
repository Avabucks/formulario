import { Header } from "@/src/components/navigation/header"
import packageJson from '@/package.json'
import { Button } from "@/src/components/ui/button"
import { Footer } from "@/src/components/landing/footer"

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 w-full px-2 md:px-6 pt-16">
        <div className="max-w-3xl mx-auto w-full py-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Ultimo aggiornamento: Febbraio 2026</p>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).</p>
          </div>

          <Section title="1. Titolare del trattamento">
            <p>Il titolare del trattamento dei dati personali è il gestore della piattaforma {packageJson.displayName}. Per qualsiasi richiesta relativa al trattamento dei tuoi dati, puoi contattarci tramite i canali indicati nella sezione "Contatti".</p>
          </Section>

          <Section title="2. Dati raccolti">
            <p>In fase di creazione dell'account raccogliamo esclusivamente i seguenti dati personali forniti tramite il provider di autenticazione:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li><span className="text-foreground font-medium">Display name</span> — nome visualizzato pubblicamente agli altri utenti</li>
              <li><span className="text-foreground font-medium">Indirizzo email</span> — utilizzato esclusivamente per l'autenticazione, non visibile ad altri utenti</li>
              <li><span className="text-foreground font-medium">URL foto profilo</span> — utilizzato esclusivamente internamente, non visibile ad altri utenti</li>
            </ul>
            <p className="mt-3">Non raccogliamo dati sensibili, dati di pagamento, né effettuiamo profilazione a fini pubblicitari o commerciali.</p>
          </Section>

          <Section title="3. Finalità e base giuridica">
            <p>I dati raccolti vengono trattati esclusivamente per la seguente finalità:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li><span className="text-foreground font-medium">Creazione e gestione dell'account</span> — necessaria per l'erogazione del servizio (art. 6, par. 1, lett. b GDPR)</li>
            </ul>
            <p className="mt-3">Non trattiamo i tuoi dati per finalità diverse da quelle indicate, né li cediamo a terzi per scopi commerciali.</p>
          </Section>

          <Section title="4. Visibilità dei dati">
            <p>Solo il <strong>display name</strong> è visibile agli altri utenti della piattaforma. L'indirizzo email e l'URL della foto profilo sono trattati in modo strettamente riservato e non vengono mai resi visibili ad altri utenti.</p>
          </Section>

          <Section title="5. Conservazione dei dati">
            <p>I dati vengono conservati per tutta la durata dell'account. In caso di cancellazione dell'account, i dati personali verranno eliminati dai nostri sistemi entro 30 giorni, salvo obblighi di legge contrari.</p>
          </Section>

          <Section title="6. Sicurezza">
            <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati personali da accessi non autorizzati, perdita o divulgazione, in conformità con l'art. 32 del GDPR.</p>
          </Section>

          <Section title="7. Contatti">
            <p>Per qualsiasi richiesta relativa alla presente informativa o al trattamento dei tuoi dati personali, puoi contattarci all'indirizzo email.</p>
            <Button variant="link">
              <a href={`mailto:${packageJson.email}`}>
                {packageJson.email}
              </a>
            </Button>
          </Section>
        </div>
      </div>
      <Footer />
    </>
  )
}

function Section({ title, children }: Readonly<{ title: string, children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}