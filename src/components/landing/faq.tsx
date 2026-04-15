import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion"

const faqs = [
  {
    question: "Come funziona l'editor?",
    answer:
      "L'editor utilizza il linguaggio Markdown per la formattazione del testo e supporta pienamente le formule in LaTeX. Puoi inserire espressioni matematiche inline usando $ ... $ oppure in blocco con $$ ... $$. L'anteprima è istantanea e viene elaborata direttamente dal browser.",
  },
  {
    question: "Come funziona la condivisione via QR code?",
    answer:
      "Ogni formulario ha un QR code univoco generato automaticamente. Prima di condividere scegli la visibilità: privato (solo tu), pubblico con link (chiunque abbia il QR o l'URL) o community (visibile a tutti gli utenti di FormulaBase).",
  },
  {
    question: "Qual è la differenza tra privato, pubblico e community?",
    answer:
      "Privato: visibile solo a te. Pubblico con link: accessibile a chiunque abbia il link o il QR code. Community: appare nella raccolta pubblica di FormulaBase e può essere trovato e duplicato da altri utenti.",
  },
  {
    question: "Posso modificare il formulario di qualcun altro?",
    answer:
      "Sì. Dalla community puoi rendere tuo qualsiasi formulario pubblico con un click. Viene creata una copia nel tuo account, con te come proprietario, che puoi modificare liberamente senza toccare l'originale.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Domande frequenti
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
