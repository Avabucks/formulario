"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { MermaidBlock } from "./mermaid";

export const CodeBlock = ({ className, children, node, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  // Caso 1: Mermaid
  if (language === "mermaid") {
    return <MermaidBlock code={codeString} />;
  }

  // Caso 2: Blocco con linguaggio (SyntaxHighlighter)
  if (language) {
    return <SyntaxBlock language={language} codeString={codeString} />;
  }

  // Caso 3: Blocco senza linguaggio (Multiriga)
  const isBlock =
    node?.position?.start.line !== node?.position?.end.line ||
    codeString.includes("\n");

  if (isBlock) {
    return (
      <pre className="my-6 bg-muted/50 border border-border rounded-lg p-4 text-[85%] font-mono overflow-x-auto text-foreground/90 leading-relaxed shadow-xs">
        <code>{children}</code>
      </pre>
    );
  }

  // Caso 4: Inline code
  return (
    <code
      className="bg-muted border border-border/80 text-rose-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[85%] font-mono font-medium"
      {...props}
    >
      {children}
    </code>
  );
};

function SyntaxBlock({
  language,
  codeString,
}: Readonly<{ language: string; codeString: string }>) {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === "dark" ? oneDark : oneLight;

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    toast.success("Codice copiato con successo.", {
      position: "bottom-center",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 w-full rounded-lg border border-foreground/10 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-1 border-b bg-muted">
        <span className="text-[12px] lowercase font-mono">{language}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <div className="relative bg-foreground/7">
        <SyntaxHighlighter
          language={language}
          style={mounted ? style : oneLight}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "13px",
            lineHeight: "1.6",
            background: "var(--muted)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          codeTagProps={{
            style: {
              textShadow: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
            className: "font-mono",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
