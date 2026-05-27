"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const plans = [
  {
    name: "Free",
    price: "0 euro",
    period: "per sempre",
    description: "Per iniziare a creare e provare l'AI senza carta.",
    features: ["Massimo 5 formulari", "10k token AI al mese"],
    cta: "Inizia gratis",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "2,99 euro",
    period: "al mese",
    description: "Per studiare senza limiti sui formulari e usare piu AI.",
    features: ["Formulari illimitati", "1 milione di token AI al mese"],
    cta: "Scegli Pro",
    href: "/settings/billing",
    highlighted: true,
  },
] as const;

export function Pricing() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="border-t py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Parti gratis, passa a Pro quando ti serve
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Il piano gratuito copre l&apos;uso leggero. Pro sblocca formulari
            illimitati e piu token AI ogni mese.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  index,
}: Readonly<{ plan: (typeof plans)[number]; index: number }>) {
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
        delay: index * 0.08,
      }}
      className={`flex h-full flex-col rounded-xl border p-8 ${
        plan.highlighted ? "border-primary bg-card shadow-sm" : "bg-card"
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {plan.description}
          </p>
        </div>
        {plan.highlighted && (
          <Badge className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Pro
          </Badge>
        )}
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold tracking-tight">{plan.price}</p>
        <p className="mt-1 text-sm text-muted-foreground">{plan.period}</p>
      </div>

      <ul className="mb-8 flex flex-col gap-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={plan.highlighted ? "default" : "secondary"}
        className="mt-auto"
      >
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>
    </motion.div>
  );
}
