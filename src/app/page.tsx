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
// - [BUG] preferiti in settings
// - toolbar (con regex)
// - sistemare components katex e aggiungere highlight codice
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - migliorare sicurezza db (RLS)