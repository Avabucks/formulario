import DeleteAccount from "@/src/components/auth/delete-account";
import { Header } from "@/src/components/navigation/header";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function TermsPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  return (
    <>
      <Header />
      <div className="flex flex-col gap-4 w-full pt-16 px-2 md:px-6">
        <div className="max-w-3xl mx-auto w-full py-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Ultimo aggiornamento: Febbraio 2026</p>
            <h1 className="text-3xl font-bold">Termini di Servizio</h1>
            <p className="text-muted-foreground">Leggere attentamente i presenti termini prima di utilizzare la piattaforma.</p>
          </div>

          <Section title="1. Accettazione dei termini">
            <p>Utilizzando la piattaforma Formulario, accetti integralmente i presenti Termini di Servizio. Se non accetti questi termini, ti invitiamo a non utilizzare il servizio.</p>
          </Section>

          <Section title="2. Descrizione del servizio">
            <p>Formulario è una piattaforma che consente agli utenti registrati di creare, organizzare e consultare formulari strutturati in capitoli e argomenti. Il servizio è fornito così com'è, senza garanzie di disponibilità continua.</p>
          </Section>

          <Section title="3. Registrazione e account">
            <p>Per utilizzare il servizio è necessario creare un account tramite il provider di autenticazione supportato. L'utente è responsabile della sicurezza del proprio account e delle attività svolte attraverso di esso. In caso di accesso non autorizzato, è necessario notificarcelo immediatamente.</p>
          </Section>

          <Section title="4. Contenuti dell'utente">
            <p>L'utente è l'unico responsabile dei contenuti (formulari, capitoli, argomenti) che carica o crea sulla piattaforma. È vietato inserire contenuti:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 mt-2 text-muted-foreground">
              <li>Illegali o che violino diritti di terzi</li>
              <li>Offensivi, diffamatori o discriminatori</li>
              <li>Contenenti malware o codice dannoso</li>
            </ul>
            <p className="mt-3">Ci riserviamo il diritto di rimuovere contenuti che violino questi termini.</p>
          </Section>

          <Section title="5. Proprietà intellettuale">
            <p>I contenuti creati dall'utente rimangono di sua proprietà. Utilizzando il servizio, l'utente concede alla piattaforma una licenza limitata, non esclusiva e non trasferibile per archiviare ed erogare tali contenuti esclusivamente ai fini del servizio.</p>
          </Section>

          <Section title="6. Limitazione di responsabilità">
            <p>La piattaforma non è responsabile per perdita di dati, interruzioni del servizio o danni derivanti dall'utilizzo o dall'impossibilità di utilizzo del servizio. Il servizio è fornito "così com'è" senza garanzie di alcun tipo.</p>
          </Section>

          <Section title="7. Cancellazione dell'account">
            <p>L'utente può richiedere la cancellazione del proprio account in qualsiasi momento. A seguito della cancellazione, tutti i dati personali e i contenuti associati verranno eliminati entro 30 giorni, salvo obblighi di legge contrari.</p>
            <div>
              {session.uid && (
                <DeleteAccount />
              )}
            </div>
          </Section>

          <Section title="8. Modifiche ai termini">
            <p>Ci riserviamo il diritto di modificare i presenti termini in qualsiasi momento. Le modifiche saranno comunicate agli utenti e avranno effetto dalla data di pubblicazione. L'uso continuato del servizio dopo la pubblicazione delle modifiche costituisce accettazione dei nuovi termini.</p>
          </Section>

          <Section title="9. Legge applicabile">
            <p>I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il foro del luogo di residenza del titolare del servizio, salvo diversa disposizione di legge applicabile ai consumatori.</p>
          </Section>

          <Section title="10. Contatti">
            <p>Per qualsiasi domanda relativa ai presenti termini, puoi contattarci tramite i canali indicati nella piattaforma.</p>
          </Section>
        </div>
      </div>
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