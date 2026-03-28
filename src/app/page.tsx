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
// - migliorare l'editor con supporto a formule matematiche, codice, ecc.
// - aggiungere formulario d'esempio nel nuovo account
// - migliorare sicurezza db (RLS)

// - [COMMUNITY]
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - pubblico/link/privato con possibilità di cercare pubblico (proprio pagina nuova accessibile anche da fuori ma che quando apri devi fare il login per vedere il formulario)