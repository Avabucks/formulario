import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowRight } from "lucide-react"
import packageJson from '@/package.json'

export function Cta() {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Pronto a organizzare le tue formule?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Crea il tuo primo formulario in meno di un minuto — con l'AI o da zero.
          Nessuna carta di credito, nessuna configurazione.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="login">
              Inizia Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
