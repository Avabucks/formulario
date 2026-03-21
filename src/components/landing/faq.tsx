import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion"

const faqs = [
  {
    question: "Come funziona l'editor LaTeX?",
    answer:
      "L'editor LaTeX integrato ti permette di scrivere formule usando la sintassi LaTeX standard e vedere l'anteprima renderizzata in tempo reale. Non è richiesta nessuna installazione aggiuntiva: tutto funziona direttamente nel browser.",
  },
  {
    question: "Come funziona la condivisione via QR code?",
    answer:
      "Ogni formula ha un QR code univoco generato automaticamente. Puoi scaricarlo e stamparlo, così chiunque punta la fotocamera ottiene accesso immediato alla versione online aggiornata.",
  },
  {
    question: "Qual è la differenza tra formulario privato e pubblico?",
    answer:
      "I formulari privati sono visibili solo a te. Quelli condivisi tramite link sono accessibili a chi ha l'URL o il QR code e sono cercabili da tutti gli utenti della piattaforma.",
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
