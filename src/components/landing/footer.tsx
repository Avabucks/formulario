import packageJson from "@/package.json";
import { ModeToggle } from "@/src/components/theme/theme-toggler";
import { SessionData, sessionOptions } from "@/src/lib/session";
import { getIronSession } from "iron-session";
import { Mail, Pi } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { DiscordTrigger } from "../shared/discord-widget";
import { GithubButton } from "../shared/github-button";

type FooterLink = { href: string; label: string };

// Logged out: landing links
const GUEST_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Piattaforma",
    links: [
      { href: "/login", label: "Accedi" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    title: "Scopri",
    links: [
      { href: "/#features", label: "Funzionalità" },
      { href: "/#demo", label: "Video Demo" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

// Logged in: app and settings links
const USER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Piattaforma",
    links: [
      { href: "/home", label: "I tuoi formulari" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    title: "Impostazioni",
    links: [
      { href: "/settings/profile", label: "Profilo" },
      { href: "/settings/account", label: "Account" },
      { href: "/settings/preferences", label: "Preferenze" },
      { href: "/settings/categories", label: "Categorie" },
      { href: "/settings/images", label: "Gestore immagini" },
    ],
  },
];

const linkClass =
  "text-muted-foreground hover:text-foreground transition-colors";

export async function Footer() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );
  const columns = session.uid ? USER_COLUMNS : GUEST_COLUMNS;

  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-3 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 w-fit"
            >
              <Pi className="h-6 w-6 text-foreground" />
              <span className="text-lg font-bold tracking-tight">
                {packageJson.displayName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Crea, organizza e condividi i tuoi formulari scientifici con un
              editor LaTeX avanzato e l&apos;assistente AI.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:flex sm:justify-end sm:gap-8 sm:*:w-44 lg:*:w-52 md:col-span-7">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <span className="text-sm font-medium tracking-wide text-foreground">
                  {column.title}
                </span>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

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
              <GithubButton showStars={false} />
            </div>
            <div className="h-4 w-px bg-border" />
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
