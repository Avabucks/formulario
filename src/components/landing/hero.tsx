"use client"

import { Button } from "@/src/components/ui/button"
import { ArrowRight, ScanEye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease, delay },
  }),
}

const titleWords: { text: string; muted: boolean }[] = [
  { text: "Le", muted: false },
  { text: "tue", muted: false },
  { text: "formule.", muted: false },
  { text: "Sempre", muted: true },
  { text: "a", muted: true },
  { text: "portata", muted: true },
  { text: "di", muted: true },
  { text: "mano.", muted: true },
]

const subWords =
  "La piattaforma completa per creare, organizzare e condividere formulari scientifici. Scrivi in LaTeX, genera con l'AI, dividi per capitoli, condividi via QR o link.".split(" ")

const TITLE_START = 0.1
const TITLE_STEP = 0.055
const SUB_START = TITLE_START + titleWords.length * TITLE_STEP + 0.1
const SUB_STEP = 0.03
const AFTER_SUB = SUB_START + subWords.length * SUB_STEP + 0.05

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

        {/* Titolo — parola per parola */}
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              custom={TITLE_START + i * TITLE_STEP}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={`inline-block mr-[0.3em] last:mr-0 ${word.muted ? "text-muted-foreground" : ""}`}
            >
              {word.text}
            </motion.span>
          ))}
        </h1>

        {/* Sottotitolo — parola per parola */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          {subWords.map((word, i) => (
            <motion.span
              key={i}
              custom={SUB_START + i * SUB_STEP}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="inline-block mr-[0.27em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: AFTER_SUB }}
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

        {/* Badge features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: AFTER_SUB + 0.15 }}
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