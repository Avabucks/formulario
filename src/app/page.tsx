import { Header } from "@/src/components/navigation/header";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
import { VideoDemo } from "../components/landing/video-demo";
import { GoogleOneTap } from "../components/auth/google-one-tap";

export default function Home() {
  return (
    <>
      <GoogleOneTap />
      <Header />
      <Hero />
      <VideoDemo />
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

// TODOs:

// - [EDITOR]
// - titoli come notion con "scaletta"
// - sistemare preview <p>, code, titoli (hanno margin sbagliati), ...
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
// - flashcards con ai per ogni argomento
// - console errori della preview
// - note protette da password