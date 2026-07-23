"use client";

import packageJson from "@/package.json";
import Link from "next/link";
import { Pi, Mail } from "lucide-react";
import { ModeToggle } from "@/src/components/theme/theme-toggler";
import { DiscordTrigger } from "../shared/discord-widget";
import { GithubButton } from "../shared/github-button";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 w-fit"
            >
              <Pi className="h-6 w-6 text-foreground" />
              <span className="text-lg font-bold tracking-tight">
                {packageJson.displayName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Impila i tuoi progetti come uno stack di memoria, naviga tra alberi concettuali ordinati ed elabora tutto con l'assistente AI.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium tracking-wide text-foreground">
                Piattaforma
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Accedi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium tracking-wide text-foreground">
                Scopri
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Funzionalità
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#demo"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Video Demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="text-sm font-medium tracking-wide text-foreground">
                Risorse & Legale
              </span>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <DiscordTrigger variant="link" />
                </li>
                <li>
                  <a
                    href={`mailto:${packageJson.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contatti <Mail className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-border/60" />

        {/* Bottom Section */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} {packageJson.displayName}. Tutti i
              diritti riservati.
            </p>
            <p className="text-[11px] text-muted-foreground/60 text-center sm:text-left">
              Sviluppato per facilitare lo studio e la condivisione delle
              materie scientifiche.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Discord */}
              <DiscordTrigger variant="button" />
              <GithubButton />
            </div>
            <div className="h-4 w-px bg-border" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
