"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Lock, QrCode, ScanLine, Search, Wand2 } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Assistente AI Integrato",
    description:
      "Chiedi all'AI nell'editor di strutturare note, spiegare snippet di codice, creare riassunti intelligenti e quiz di ripasso.",
  },
  {
    icon: Search,
    title: "Ricerca Istantanea nello Stack",
    description:
      "Trova qualsiasi appunto, snippet o capitolo in pochi secondi. Cerca per titolo, tag o contenuto del tuo stack.",
  },
  {
    icon: BookOpen,
    title: "Struttura a Moduli & Stack",
    description:
      "Organizza i tuoi progetti in stack, sezioni e capitoli ad albero. Tieni ogni idea, appunto o documentazione al suo posto.",
  },
  {
    icon: ScanLine,
    title: "Editor e Anteprima Live",
    description:
      "Scrivi le pagine del tuo stack in Markdown con anteprima in tempo reale, blocchi di codice evidenziati e formattazione semplice.",
  },
  {
    icon: QrCode,
    title: "Sharing via Link & QR Code",
    description:
      "Genera un codice QR dinamico o un link unico per ogni stack. Perfetto per condividere note e progetti con colleghi e compagni.",
  },
  {
    icon: Lock,
    title: "Stack Privati & Community",
    description:
      "Mantieni i tuoi stack riservati oppure pubblicali nella Community. Gli altri utenti potranno consultarli e duplicarli al volo.",
  },
];

export function Features() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Funzionalità
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tutto ciò che serve per il tuo Knowledge Stack
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Un ambiente di lavoro fluido progettato per developer, builder e studenti. Meno distrazioni, più esecuzione.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 3) * 0.08,
      }}
      className="group rounded-xl border p-8 transition-colors border-border bg-card hover:border-muted-foreground/30"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        <feature.icon className="h-5 w-5 text-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </motion.div>
  );
}
