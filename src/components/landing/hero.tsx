"use client"

import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowRight, Play, ScanEye, UsersRound } from "lucide-react"
import packageJson from '@/package.json'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-background" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cross" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M16 0v50M0 16h50" stroke="currentColor" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cross)" />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400"></span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Ora disponibile v{packageJson.version}
          </span>
        </div>

        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          Le tue formule.{" "}
          <span className="text-muted-foreground">Sempre a portata di mano.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          La piattaforma completa per creare, organizzare e condividere formulari
          scientifici. Scrivi in LaTeX, genera con l'AI, dividi per capitoli, condividi via QR o link.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="login">
              Inizia ora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="secondary" size="lg" className="gap-2 px-8"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ScanEye className="h-5 w-5" />
            Guarda la demo
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-muted-foreground">
          <span>Gratuito per iniziare</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Generazione formule con AI</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Supporto LaTeX completo</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Condivisione via QR code</span>
        </div>
      </div>
    </section>
  )
}