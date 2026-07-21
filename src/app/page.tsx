import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
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
      <Hero />
      <VideoDemo />
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

// - [IDEE]
// - flashcards con ai per ogni argomento
// - console errori della preview
// - note protette da password
