"use client";

import { Button } from "@/src/components/ui/button";
import { ArrowRight, ScanEye } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedGridPattern } from "@/src/components/ui/animated-grid-pattern";
import { cn } from "@/src/lib/utils";
import { Highlighter } from "../ui/highlighter";

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

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
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

      <div className="relative z-10 mx-auto max-w-4xl text-center">
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
                className={`inline-block mr-[0.3em] last:mr-0 ${word.muted ? "text-muted-foreground" : ""}`}
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
                <span key={i} className="inline-block mr-[0.3em] last:mr-0">
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
    </section>
  );
}
