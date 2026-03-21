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
// - migliorare l'editor con supporto a formule matematiche, codice, ecc.
// - aggiungere formulario d'esempio nel nuovo account

// - [COMMUNITY] cerca e aggiungi ai preferiti formulari e rendi tuo (modifiche i formulari pubblici e salvali nei tuoi)
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)