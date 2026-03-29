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
// - toolbar
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - search anche nel content
// - migliorare sicurezza db (RLS)

// - [COMMUNITY]
// - home con elenco formulari community
// - pagina nuova accessibile anche da fuori ma che quando apri devi fare il login per vedere il formulario
// - ceerca nella community