import { Header } from "@/src/components/navigation/header";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
import { VideoDemo } from "../components/landing/video-demo";

export default function Home() {
  return (
    <>
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
// -- [ ] TABLE
// -- bug switch view smonta editor

// - [GENERALI]
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)
// - video 04
// - titolo come notion e sistemare <p> e quote

// - [PREMIUM]
// - abbonamento a 1,99 che ti da accesso illimitato a creazione formulari e 200 crediti AI (senza crediti ma con tokens cosi e piu preciso ma senza scrivere il ilmite, semplicemente quando finiscono esce popup)

// - [NOVITA]
// - ⁠categorie per organizzare formulari + colori titoli
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - flashcards con ai per ogni argomento
// - image manager nelle impostazioni
// - tree del formulario (accessibile da tasto di fianco a impostazioni e apre drawer laterale)
// - console errori
// - note protette da password
// - supporto piu lingue