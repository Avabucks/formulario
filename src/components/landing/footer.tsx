import packageJson from "@/package.json";
import Link from "next/link";
import { Pi, Mail, ExternalLink } from "lucide-react";
import { ModeToggle } from "@/src/components/theme/theme-toggler";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 w-fit"
            >
              <Pi className="h-6 w-6 text-foreground" />
              <span className="text-lg font-bold tracking-tight">{packageJson.displayName}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Crea, organizza e condividi i tuoi formulari scientifici con un editor LaTeX avanzato e l&apos;assistente AI.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium tracking-wide text-foreground">Piattaforma</span>
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
              <span className="text-sm font-medium tracking-wide text-foreground">Scopri</span>
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
              <span className="text-sm font-medium tracking-wide text-foreground">Risorse & Legale</span>
              <ul className="flex flex-col gap-2.5 text-sm">
                <li>
                  <a
                    href="https://discord.gg/xygMZVYDSB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Discord <ExternalLink className="h-3 w-3" />
                  </a>
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
              © {new Date().getFullYear()} {packageJson.displayName}. Tutti i diritti riservati.
            </p>
            <p className="text-[11px] text-muted-foreground/60 text-center sm:text-left">
              Sviluppato per facilitare lo studio e la condivisione delle materie scientifiche.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Discord */}
              <a
                href="https://discord.gg/xygMZVYDSB"
                target="_blank"
                rel="noreferrer"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
                aria-label="Discord"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 127.14 96.36" aria-hidden="true">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C-3,41.25-8.73,73.41,5.52,95.23a108.43,108.43,0,0,0,32.74,16.59,80.4,80.4,0,0,0,6.9-11.23,71.74,71.74,0,0,1-10.9-5.22c.92-.67,1.82-1.39,2.68-2.14a77.81,77.81,0,0,0,73.4,0c.87.75,1.76,1.47,2.68,2.14a72,72,0,0,1-10.9,5.22,79.52,79.52,0,0,0,6.9,11.23,108.2,108.2,0,0,0,32.77-16.59C136.27,73.41,130.34,41.25,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
              </a>
            </div>
            <div className="h-4 w-px bg-border" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

