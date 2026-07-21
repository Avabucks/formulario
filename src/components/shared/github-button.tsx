"use client";

import { NumberTicker } from "@/src/components/ui/number-ticker";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

const REPO_URL = "https://github.com/Avabucks/formulario";
const REPO_API_URL = "https://api.github.com/repos/Avabucks/formulario";

interface RepoInfo {
  stargazers_count: number;
  open_issues_count: number;
  image?: string;
  title?: string;
  description?: string;
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
          const image = `https://opengraph.githubassets.com/1/${data.full_name}`;

          setRepoInfo({
            stargazers_count: data.stargazers_count ?? 0,
            open_issues_count: data.open_issues_count ?? 0,
            image,
            title: data.name ?? undefined,
            description: data.description ?? undefined,
          });
        }
      })
      .catch((err) => {
        console.error("Errore fetch GitHub info:", err);
      });
  }, []);

  return (
    <HoverCard>
      <HoverCardTrigger delay={10} closeDelay={100} render={
        <Button
          variant="ghost"
          size="lg"
          className="px-2.5 h-8"
          asChild
          aria-label="Repository GitHub"
        >
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GithubIcon className="h-5 w-5 fill-current" />
            <NumberTicker
              value={repoInfo?.stargazers_count || 0}
              className="text-xs font-medium text-current dark:text-current inline-block"
            />
          </a>
        </Button>
      } />
      <HoverCardContent className="w-100">
        <a className="flex flex-col gap-2" href={REPO_URL} target="_blank" rel="noopener noreferrer">
          <img className="w-full h-auto rounded-lg" src={repoInfo?.image ?? ""} alt={repoInfo?.title} />
          <span className="font-semibold">{repoInfo?.title}</span>
          {repoInfo?.description && <p>{repoInfo?.description}</p>}
        </a>
      </HoverCardContent>
    </HoverCard>
  );
}
