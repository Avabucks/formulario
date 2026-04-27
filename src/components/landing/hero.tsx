"use client"

import packageJson from '@/package.json'
import { Button } from "@/src/components/ui/button"
import { ArrowRight, ScanEye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

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

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
        >
          Le tue formule.{" "}
          <span className="text-muted-foreground">Sempre a portata di mano.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          La piattaforma completa per creare, organizzare e condividere formulari
          scientifici. Scrivi in LaTeX, genera con l'AI, dividi per capitoli, condividi via QR o link.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="login">
              Inizia ora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="secondary" size="lg" className="gap-2 px-8 cursor-pointer"
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
          >
            <ScanEye className="h-5 w-5" />
            Guarda la demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-muted-foreground"
        >
          <span>Gratuito per iniziare</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Generazione formule con AI</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Supporto LaTeX completo</span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <span>Condivisione via QR code</span>
        </motion.div>

      </div>
    </section>
  )
}