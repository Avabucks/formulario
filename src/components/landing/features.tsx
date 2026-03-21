import {
  Search,
  QrCode,
  BookOpen,
  Lock,
  Share2,
  ScanLine,
} from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Ricerca Intelligente",
    description:
      "Trova qualsiasi formula in secondi. Cerca per nome, simbolo, argomento o parola chiave e ottieni risultati istantanei.",
  },
  {
    icon: BookOpen,
    title: "Organizzazione per Capitoli",
    description:
      "Struttura i tuoi formulari in capitoli e argomenti. Dalla meccanica classica alla termodinamica, tutto al suo posto.",
  },
  {
    icon: ScanLine,
    title: "Editor LaTeX Integrato",
    description:
      "Scrivi e modifica formule direttamente in LaTeX con anteprima in tempo reale. Nessun software aggiuntivo richiesto.",
  },
  {
    icon: QrCode,
    title: "Condivisione via QR Code",
    description:
      "Genera un QR code per ogni formula. Perfetto per stampare e distribuire durante lezioni ed esami.",
  },
  {
    icon: Share2,
    title: "Link di Condivisione",
    description:
      "Condividi formulari pubblici con un semplice link. Imposta la visibilità: privato o pubblico.",
  },
  {
    icon: Lock,
    title: "Formulari Privati e Pubblici",
    description:
      "Tieni le tue formule per te oppure rendile disponibili alla community. Il controllo è sempre nelle tue mani.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Funzionalità
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tutto ciò che serve per i tuoi formulari
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Uno strumento pensato per studenti, docenti e ricercatori. Meno confusione, più formule.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-muted-foreground/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
