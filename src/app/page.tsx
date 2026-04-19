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
// - toolbar (con regex), anche con kb e tooltip

// - [GENERALI]
// - seo
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)
// - tasto rendi tuo anche nella toolbar quando !editable
// - keyboard shortcuts list con anche quelle vscode
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)

// - [NOVITA]
// - image manager nelle impostazioni
// - tree del formulario (accessibile da tasto di fianco a impostazioni e apre drawer laterale)
// - console errori
// - note protette da password