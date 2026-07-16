"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center text-foreground">
      {/* Subtle grid backdrop, like graph paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Illustration: a "formula card" being written on */}
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 220 200"
            className="h-48 w-52 text-muted-foreground"
            fill="none"
          >
            {/* Easel Stand Legs */}
            <line
              x1="65"
              y1="144"
              x2="50"
              y2="185"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="155"
              y1="144"
              x2="170"
              y2="185"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="110"
              y1="144"
              x2="110"
              y2="180"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              className="opacity-40"
            />

            {/* Whiteboard Frame */}
            <rect
              x="28"
              y="20"
              width="164"
              height="124"
              rx="8"
              fill="var(--card)"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Inner Board Area */}
            <rect
              x="34"
              y="26"
              width="152"
              height="112"
              rx="4"
              fill="var(--background)"
              stroke="currentColor"
              strokeWidth="0.5"
              className="opacity-10"
            />

            {/* Shelf / Tray at the bottom */}
            <rect
              x="22"
              y="142"
              width="176"
              height="5"
              rx="2.5"
              fill="currentColor"
              className="text-foreground"
            />

            {/* Hand-drawn "404" */}
            <g
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              {/* 4 */}
              <path d="M 62 55 L 62 82 L 84 82" />
              <path d="M 78 50 L 78 95" />

              {/* 0 */}
              <path d="M 110 50 C 97 50, 97 95, 110 95 C 123 95, 123 50, 110 50 Z" />

              {/* 4 */}
              <path d="M 137 55 L 137 82 L 159 82" />
              <path d="M 153 50 L 153 95" />
            </g>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pagina non trovata
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            Questa equazione non ha soluzione. La pagina che cercavi non esiste
            o è stata spostata.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row mt-4">
          <Button
            className="order-2 md:order-first"
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            Pagina precedente
          </Button>
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="size-4" />
              Vai alla home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
