"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { NumberTicker } from "@/src/components/ui/number-ticker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

const REPO_URL = "https://github.com/Avabucks/formulario";
const REPO_API_URL = "https://api.github.com/repos/Avabucks/formulario";

interface RepoInfo {
  stargazers_count: number;
  open_issues_count: number;
}

function GithubIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function GithubButton() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  useEffect(() => {
    fetch(REPO_API_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRepoInfo({
            stargazers_count: data.stargazers_count ?? 0,
            open_issues_count: data.open_issues_count ?? 0,
          });
        }
      })
      .catch((err) => {
        console.error("Errore fetch GitHub info:", err);
      });
  }, []);

  const stars = repoInfo?.stargazers_count ?? null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="px-2.5 h-8"
            asChild
            aria-label="Repository GitHub"
          >
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="h-5 w-5 fill-current" />
              <span>{stars || 0}</span>
              <NumberTicker
                value={stars || 0}
                className="text-xs font-medium text-current dark:text-current inline-block"
              />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="p-3 w-56 text-left space-y-1">
          <div className="flex items-center gap-2 font-semibold text-xs leading-none border-b border-background/20 pb-1.5">
            <GithubIcon className="h-4.5 w-4.5 fill-current shrink-0" />
            <span className="truncate">Avabucks/formulario</span>
          </div>

          <p className="text-[11px] opacity-90 leading-relaxed text-left">
            Contribuisci allo sviluppo open source di FormulaBase, proponi nuove funzionalità o lascia una stella!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
