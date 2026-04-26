"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion"

const faqs = [
  {
    question: "Come fa l'AI a creare un formulario per me?",
    answer:
      "Ti basta inserire l'argomento, ad esempio 'Elettromagnetismo', e l'AI genera istantaneamente una struttura completa. Otterrai capitoli organizzati, formule precise e descrizioni pronte all'uso. È la fine del 'foglio bianco': l'AI fa il lavoro pesante, tu rifinisci i dettagli.",
  },
  {
    question: "Non conosco il linguaggio LaTeX. Posso usare FormulaBase?",
    answer:
      "Assolutamente sì. Non devi scrivere una riga di codice se non vuoi. L'AI si occupa della formattazione tecnica, mentre tu interagisci con un editor intuitivo.",
  },
  {
    question: "Come funziona la condivisione via QR code?",
    answer:
      "Ogni formulario ha un QR code univoco generato automaticamente. Prima di condividere scegli la visibilità: privato (solo tu), pubblico con link (chiunque abbia il QR o l'URL) o community (visibile a tutti gli utenti di FormulaBase). Stampalo direttamente o salvalo come immagine.",
  },
  {
    question: "Qual è la differenza tra privato, pubblico e community?",
    answer:
      "Privato: visibile solo a te, ideale per i formulari in lavorazione. Pubblico con link: accessibile a chiunque abbia il link o il QR code, ottimo per condividere con la tua classe senza rendere tutto pubblico. Community: appare nella raccolta pubblica e può essere trovato e duplicato da altri utenti.",
  },
  {
    question: "Posso modificare un formulario creato da altri?",
    answer:
      "Sì! Se trovi un formulario utile nella Community, puoi duplicarlo nel tuo profilo con un click. Otterrai una copia personale che potrai modificare, integrare o accorciare come preferisci, senza alterare il lavoro originale dell'autore.",
  },
  {
    question: "È gratuito?",
    answer:
      "Sì, puoi iniziare gratuitamente senza carta di credito. Crei formulari, usi l'editor LaTeX e condividi via QR code o link da subito.",
  },
]

export function Faq() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" })

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Domande frequenti
          </h2>
        </motion.div>

        {/* Items */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </Accordion>

      </div>
    </section>
  )
}

function FaqItem({ faq, index }: Readonly<{ faq: typeof faqs[number]; index: number }>) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
    >
      <AccordionItem value={`item-${index}`} className="border-border">
        <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
          {faq.question}
        </AccordionTrigger>
        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
          {faq.answer}
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  )
}