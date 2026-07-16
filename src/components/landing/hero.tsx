"use client";

import { Button } from "@/src/components/ui/button";
import {
  ArrowRight,
  ScanEye,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedGridPattern } from "@/src/components/ui/animated-grid-pattern";
import { cn } from "@/src/lib/utils";
import { Highlighter } from "../ui/highlighter";
import { ScrollVelocityContainer, ScrollVelocityRow } from "@/src/components/ui/scroll-based-velocity";
import katex from "katex";
import "katex/dist/katex.min.css";

const ease = [0.22, 1, 0.36, 1] as const;

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease, delay },
  }),
};

const titleWords: { text: string; muted: boolean }[] = [
  { text: "Crea", muted: false },
  { text: "formulari scientifici", muted: false },
  { text: "in pochi secondi", muted: false },
];

const subWords =
  "Scrivi in LaTeX, usa l'AI per generare formule all'istante, organizza lo studio in capitoli e condividi i tuoi schemi tramite QR o link.".split(
    " ",
  );

const TITLE_START = 0.1;
const TITLE_STEP = 0.055;
const SUB_START = TITLE_START + titleWords.length * TITLE_STEP + 0.1;
const SUB_STEP = 0.03;
const AFTER_SUB = SUB_START + subWords.length * SUB_STEP + 0.05;

const row1Formulas = [
  {
    title: "Definizione di Derivata",
    math: String.raw`f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}`,
  },
  {
    title: "Formula di Eulero",
    math: String.raw`e^{ix} = \cos x + i\sin x`,
  },
  {
    title: "Forza Elettrostatica di Coulomb",
    math: String.raw`F = \frac{1}{4\pi\varepsilon_0} \frac{q_1 q_2}{r^2}`,
  },
  {
    title: "Equazione di Dirac",
    math: String.raw`(i\gamma^\mu \partial_\mu - m)\psi = 0`,
  },
];

const row2Formulas = [
  {
    title: "Equazione dei Gas Perfetti",
    math: "pV = nRT",
  },
  {
    title: "Equazione di Einstein",
    math: String.raw`G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4} T_{\mu\nu}`,
  },
  {
    title: "Distribuzione Normale di Gauss",
    math: String.raw`f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}`,
  },
  {
    title: "Trasformata di Laplace",
    math: String.raw`L\{f(t)\} = \int_{0}^{\infty} e^{-st} f(t) dt`,
  },
];

function KatexFormula({ math }: Readonly<{ math: string }>) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} className="text-foreground text-center" />;
}

function FormulaSnippet({ formula }: Readonly<{ formula: typeof row1Formulas[number] }>) {
  return (
    <div className="mx-6 md:mx-12 flex items-center gap-6 md:gap-12 select-none cursor-default pt-2 pb-2 md:pt-6 md:pb-2">
      {/* Title + Formula Container */}
      <div className="relative group flex flex-col items-center justify-center min-w-30">
        {/* Caption revealed on Hover (desktop only) */}
        <span className="absolute -top-4 text-xs font-medium text-muted-foreground opacity-0 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300 select-none pointer-events-none whitespace-nowrap">
          {formula.title}
        </span>
        
        {/* KaTeX Formula (dims slightly on hover on desktop only) */}
        <div className="scale-95 md:scale-100 text-foreground flex items-center justify-center min-h-11 select-none md:group-hover:opacity-30 md:transition-opacity md:duration-300">
          <KatexFormula math={formula.math} />
        </div>
      </div>
      
      {/* Separator / Zap Icon */}
      <Zap size={18} className="text-muted-foreground/25 shrink-0 select-none" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 bg-background" />
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.2}
        duration={3}
        repeatDelay={1}
        className={cn(
          "mask-[radial-gradient(350px_circle_at_center,white,transparent)]",
          "md:mask-[radial-gradient(900px_circle_at_center,white,transparent)]",
          "inset-y-0 h-full w-full opacity-40",
        )}
      />
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 bg-brand-purple/10 dark:bg-brand-purple/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center my-auto">
        {/* Titolo — parola per parola */}
        <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          {titleWords.map((word, i) => {
            const isHighlighted = word.text === "formulari scientifici";
            const span = (
              <motion.span
                key={i}
                custom={TITLE_START + i * TITLE_STEP}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`inline-block md:mr-[0.3em] last:mr-0 ${word.muted ? "text-muted-foreground" : ""}`}
              >
                {word.text}
              </motion.span>
            );

            if (isHighlighted) {
              const innerSpan = (
                <motion.span
                  key={i}
                  custom={TITLE_START + i * TITLE_STEP}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className={`inline-block ${word.muted ? "text-muted-foreground" : ""}`}
                >
                  {word.text}
                </motion.span>
              );

              return (
                <span key={i} className="inline-block mr-1.5 md:mr-[0.3em] last:mr-0">
                  <Highlighter
                    action="highlight"
                    color="var(--brand-purple-highlight)"
                    delay={750}
                    animationDuration={600}
                  >
                    {innerSpan}
                  </Highlighter>
                </span>
              );
            }

            return span;
          })}
        </h1>

        {/* Sottotitolo — parola per parola */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          {subWords.map((word, i) => (
            <motion.span
              key={i}
              custom={SUB_START + i * SUB_STEP}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="inline-block mr-[0.27em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: AFTER_SUB }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild className="gap-2 px-8">
            <Link href="login">
              Inizia ora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="gap-2 px-8 cursor-pointer"
            onClick={() =>
              document
                .getElementById("demo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <ScanEye className="h-5 w-5" />
            Guarda la demo
          </Button>
        </motion.div>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: AFTER_SUB + 0.2 }}
        className="relative flex w-full flex-col items-center justify-center overflow-hidden select-none"
      >
        <ScrollVelocityContainer className="py-2 select-none">
          <ScrollVelocityRow baseVelocity={0.8} direction={1}>
            {row1Formulas.map((formula, index) => (
              <FormulaSnippet key={index} formula={formula} />
            ))}
          </ScrollVelocityRow>
          <ScrollVelocityRow baseVelocity={0.8} direction={-1} className="mt-1 md:mt-3">
            {row2Formulas.map((formula, index) => (
              <FormulaSnippet key={index} formula={formula} />
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
        <div className="from-background to-transparent pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r z-10"></div>
        <div className="from-background to-transparent pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l z-10"></div>
      </motion.div>
    </section>
  );
}
