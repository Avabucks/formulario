import { Header } from "@/src/components/navigation/header";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
import { Pricing } from "../components/landing/pricing";
import { VideoDemo } from "../components/landing/video-demo";
import { GoogleOneTap } from "../components/auth/google-one-tap";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FormulaBase",
    url:
      process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app",
    description:
      "Crea, organizza e condividi i tuoi formulari e cheat sheet scientifici. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app"}/community/page/1?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GoogleOneTap />
      <Header />
      <Hero />
      <VideoDemo />
      <Features />
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

<<<<<<< HEAD
// TODOs:

// - [BUG]
// - mettere webhook paddle
// - creare le tabelle nel db per i pagamenti e testare tutto il flow di acquisto, rinnovo, cancellazione, ecc.

// - [EDITOR]
// - refactor formatting-utils

// - [GENERALI]
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)
// - aggiornare video e formulario di benvenuto

// - [PREMIUM]
// - abbonamento che ti da accesso illimitato a creazione formulari e tokens cosi e piu preciso ma senza scrivere il ilmite, semplicemente quando finiscono esce popup
// - creazione del formulario vuoto/da files con AI (es. carica un pdf e te lo trasforma in formulario)
// - image manager nelle impostazioni

// - [NOVITA]
// - ⁠categorie per organizzare formulari + colori titoli
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - link share solo con chi selezioni
// - supporto piu lingue

// - [LUNGO TERMINE]
=======
// - [IDEE]
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
// - flashcards con ai per ogni argomento
// - console errori della preview
// - note protette da password
