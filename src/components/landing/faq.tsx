"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const faqs = [
  {
    question: "Cos'è uno Stack di Memoria su FormulaBase?",
    answer:
      "È il tuo spazio di lavoro principale in cui impili i tuoi Knowledge Trees (alberi di conoscenza), strutturato come una memoria in cui ogni livello mantiene i riferimenti ai tuoi argomenti per una consultazione rapida e ordinata.",
  },
  {
    question: "Come funzionano i puntatori e gli alberi di conoscenza?",
    answer:
      "Ogni materia o progetto è organizzato ad albero con nodi e knowledge, mentre i puntatori concettuali ti permettono di accedere istantaneamente a qualsiasi ramo o foglia tramite ricerca rapida e collegamenti diretti.",
  },
  {
    question: "Come funziona l'Assistente AI nell'editor?",
    answer:
      "È una chat contestuale nativa che legge in tempo reale la scheda su cui stai lavorando per strutturare, rifinire o generare contenuti, proponendo le modifiche direttamente nell'editor con un'anteprima visiva che puoi approvare con un click.",
  },
  {
    question: "Come posso formattare le note nei vari nodi?",
    answer:
      "L'editor di FormulaBase supporta la scrittura in Markdown live con formule matematiche in LaTeX, blocchi di codice evidenziati e anteprima in tempo reale.",
  },
  {
    question: "Come funziona la condivisione e il 'fork' dello Stack?",
    answer:
      "Ogni Knowledge Stack può generare un QR code o link unico per condividere il tuo progetto in modalità privata, pubblica o community e consentire ad altri di consultarlo o duplicarlo nel proprio profilo.",
  },
  {
    question: "È gratuito?",
    answer:
      "Sì, puoi iniziare gratuitamente e senza carta di credito per creare i tuoi stack, organizzare i tuoi alberi di conoscenza e utilizzare l'assistente AI con l'editor live fin da subito.",
  },
];

export function Faq() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

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
  );
}

function FaqItem({
  faq,
  index,
}: Readonly<{ faq: (typeof faqs)[number]; index: number }>) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.07,
      }}
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
  );
}
