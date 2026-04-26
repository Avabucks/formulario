"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function Cta() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="border-t border-border py-24 md:py-32">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Pronto a organizzare le tue formule?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Crea il tuo primo formulario in meno di un minuto con l'AI o da zero.
          Nessuna carta di credito, nessuna configurazione.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="login">
              Inizia Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}