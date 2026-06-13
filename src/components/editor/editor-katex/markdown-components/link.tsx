"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

export const LinkComponent = ({ href, children }: any) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [safetyCheck, setSafetyCheck] = useState<
    "loading" | "safe" | "unsafe" | "notexists" | "unchecked"
  >("unchecked");

  const isMail = href?.startsWith("mailto:");

  const isInternal =
    href?.startsWith("/") ||
    href?.startsWith(process.env.NEXT_PUBLIC_APP_URL || "");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!href) return;
    if (isMail) {
      window.location.href = href;
      return;
    }
    if (isInternal) {
      const topicMatch = href.match(/\/editor\/topic\/([a-zA-Z0-9_-]+)/);
      if (topicMatch) {
        const id = topicMatch[1];
        router.push(`/editor/${id}`);
      } else {
        router.push(href);
      }
    } else {
      setDialogOpen(true);
    }
  };

  let domain = "";
  if (href && !isInternal) {
    try {
      const url = new URL(href);
      domain = url.hostname;
      if (domain.startsWith("www.")) {
        domain = domain.substring(4);
      }
    } catch {
      domain = href;
    }
  }

  useEffect(() => {
    if (dialogOpen && href && !isInternal) {
      setSafetyCheck("loading");
      fetch(`/api/security/check-link?domain=${encodeURIComponent(domain)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.safe === false) {
            if (data.reason === "domain_not_found") setSafetyCheck("notexists");
            else setSafetyCheck("unsafe");
          } else {
            setSafetyCheck("safe");
          }
        })
        .catch(() => {
          setSafetyCheck("unchecked");
        });
    }
  }, [dialogOpen, isInternal, domain, href]);

  if (!href) return <span>{children}</span>;

  const handleOpenExternal = () => {
    window.open(href, "_blank", "noopener,noreferrer");
    setDialogOpen(false);
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className="text-violet-600 dark:text-violet-400 underline underline-offset-4 decoration-violet-600/30 hover:decoration-violet-600 dark:decoration-violet-400/30 dark:hover:decoration-violet-400 font-semibold cursor-pointer transition-colors"
      >
        {children}
      </a>

      {!isInternal && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                Sito Esterno
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="space-y-4">
              <span>
                Stai per aprire un sito esterno. Vuoi continuare verso:
              </span>
              <span className="block text-base font-bold text-primary mt-2 select-all break-all">
                {domain}
              </span>

              <span className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs">
                {safetyCheck === "loading" && (
                  <>
                    <Spinner />
                    <span className="text-muted-foreground">
                      Verifica di sicurezza in corso...
                    </span>
                  </>
                )}
                {safetyCheck === "safe" && (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-medium dark:text-emerald-400">
                      Nessuna minaccia rilevata (Verificato)
                    </span>
                  </>
                )}
                {safetyCheck === "unsafe" && (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive animate-pulse" />
                    <span className="text-destructive font-bold">
                      Attenzione! Questo sito è stato segnalato come non sicuro.
                    </span>
                  </>
                )}
                {safetyCheck === "unchecked" && (
                  <>
                    <ShieldQuestion className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Verifica di sicurezza non disponibile.
                    </span>
                  </>
                )}
                {safetyCheck === "notexists" && (
                  <>
                    <ShieldQuestion className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Dominio non trovato.
                    </span>
                  </>
                )}
              </span>
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annulla</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant={safetyCheck === "unsafe" ? "destructive" : "default"}
                  onClick={handleOpenExternal}
                  className="gap-2"
                  disabled={safetyCheck === "loading"}
                >
                  <ExternalLink size={15} />
                  {safetyCheck === "loading" ? <Spinner /> : "Apri"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
