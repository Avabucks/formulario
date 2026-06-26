import packageJson from "@/package.json";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-xs text-muted-foreground order-2 md:order-1">
          © 2026 {packageJson.displayName}. Tutti i diritti riservati.
        </p>
        <div className="flex gap-6 order-1 md:order-2">
          <Link
            href="/terms"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Termini di servizio
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

