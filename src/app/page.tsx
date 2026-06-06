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
  return (
    <>
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

// - [IDEE]
// - flashcards con ai per ogni argomento
// - console errori della preview
// - note protette da password
