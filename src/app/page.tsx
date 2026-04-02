import { Header } from "@/src/components/navigation/header";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

// TODOs:

// - [EDITOR]
// - toolbar (con regex), anche con kb e tooltip
// - ctrl + c, ctrl + x funziona sulla parola o su tutta la linea se la selezione è vuota
// - [FORSE] auto refactor che sistema spazi mentre scrivi (per evitare non ritorni a capi che)
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)

// - [GENERALI]
// - [BUG] preferiti in settings
// - padding bottom nelle liste
// - seo
// - disabilita elimina formulario per quella con id dell'env (formlario di benvenuto)
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)

// - [NOVITA]
// - image manager nelle impostazioni
// - tree del formulario (accessibile da tasto di fianco a impostazioni e apre drawer laterale)
// - note protette da password