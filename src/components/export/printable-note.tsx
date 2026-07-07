"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import "katex/dist/katex.min.css";
import { markdownComponents } from "../editor/preview/markdown-components";

const remarkPlugins = [remarkMath, remarkBreaks, remarkGfm];
const rehypePlugins = [rehypeKatex];

interface PrintableNoteProps {
  title: string;
  content: string;
  formularioId: string;
}

export function PrintableNote({ title, content, formularioId }: PrintableNoteProps) {
  // Avvia la stampa automaticamente al caricamento
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000); // Diamo 1 secondo a KaTeX per completare il rendering grafico
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (window.opener || window.history.length > 1) {
      window.close();
      // Se non si chiude (es. non aperta come pop-up), torna indietro
      window.history.back();
    } else {
      window.location.href = `/formulario/${formularioId}`;
    }
  };

  // Rimuove eventuali titoli ripetuti in testa se coincidono col titolo della pagina
  const processedContent = content.replaceAll(
    /(^[ \t]*)\$\$([\s\S]*?)\$\$/gm,
    (_, indent, math) => {
      const cleaned = math.trim();
      const indentedMath = cleaned
        .split("\n")
        .map((line: string) => indent + "    " + line)
        .join("\n");
      return `${indent}$$\n${indentedMath}\n${indent}$$`;
    }
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Barra di controllo - Hidden on print */}
      <header className="no-print sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold leading-none text-muted-foreground">Esportazione Nota</h1>
            <p className="text-base font-bold truncate max-w-[200px] md:max-w-md">{title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline">
            Seleziona &quot;Salva come PDF&quot; nella finestra di stampa
          </span>
          <Button onClick={handlePrint} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Printer className="h-4 w-4" />
            Stampa / PDF
          </Button>
        </div>
      </header>

      {/* Pagina di stampa */}
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 md:py-12 md:px-8 print:p-0 print:bg-white print:text-black">
        <article 
          className="w-full max-w-[800px] bg-background border border-border print:border-none p-8 sm:p-12 md:p-16 shadow-lg print:shadow-none overflow-hidden print:w-full print:max-w-none print:p-0"
          style={{ minHeight: "297mm" }}
        >
          {/* Intestazione del documento */}
          <div className="border-b border-border/80 pb-6 mb-8 print:border-neutral-300">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground print:text-black print:text-4xl">
              {title}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-4 print:text-neutral-500">
              <span>FormulaBase Export</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          {/* Contenuto Markdown con LaTeX */}
          <div className="editor leading-relaxed text-[16px] print:text-[12pt] print:leading-relaxed">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={markdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      {/* Regole CSS per la Stampa */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-family: var(--font-geist-sans), sans-serif;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
          @page {
            margin: 20mm;
            size: A4;
          }
          .editor pre, .editor code {
            background-color: #f5f5f5 !important;
            color: #d15a00 !important;
            border-color: #e5e5e5 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .editor blockquote {
            background-color: #f9f9f9 !important;
            border-left-color: #1a1a1a !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
