"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { markdownComponents } from "@/src/components/editor/editor-katex/markdown-components";
import "katex/dist/katex.min.css";

const remarkPlugins = [remarkMath, remarkBreaks, remarkGfm];
const rehypePlugins = [rehypeKatex];

interface PrintableFormularioProps {
  formulario: {
    id: string;
    titolo: string;
    descrizione?: string;
    nomeAutore?: string;
  };
  chapters: {
    id: string;
    title: string;
    notes: {
      id: string;
      title: string;
      content: string;
    }[];
  }[];
}

export function PrintableFormulario({ formulario, chapters }: PrintableFormularioProps) {
  // Avvia la stampa automaticamente al caricamento
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1200); // Un po' più di tempo per compilare tutte le formule di tutto il formulario
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (window.opener || window.history.length > 1) {
      window.close();
      window.history.back();
    } else {
      window.location.href = `/formulario/${formulario.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Barra di controllo - Hidden on print */}
      <header className="no-print sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold leading-none text-muted-foreground">Esportazione Formulario</h1>
            <p className="text-base font-bold truncate max-w-[200px] md:max-w-md">{formulario.titolo}</p>
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

      {/* Pagine di stampa */}
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 md:py-12 md:px-8 print:p-0 print:bg-white print:text-black">
        <div className="w-full max-w-[850px] flex flex-col gap-8 print:gap-0">
          
          {/* PAGINA 1: COPERTINA */}
          <article className="w-full bg-background border border-border print:border-none p-12 sm:p-16 md:p-24 shadow-lg print:shadow-none flex flex-col justify-between print:w-full print:max-w-none print:min-h-[297mm] print:p-0 print:mb-[40mm]">
            <div className="my-auto py-12 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full print:border print:border-neutral-400 print:text-neutral-700">
                Formulario Completo
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mt-6 mb-4 text-foreground print:text-black">
                {formulario.titolo}
              </h1>
              {formulario.descrizione && (
                <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed print:text-neutral-600">
                  {formulario.descrizione}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground print:border-neutral-300 print:text-neutral-500">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <p className="font-semibold text-foreground print:text-neutral-800">Autore</p>
                <p>{formulario.nomeAutore || "FormulaBase User"}</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-semibold text-foreground print:text-neutral-800">Data Esportazione</p>
                <p>{new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </article>

          {/* PAGINA 2: INDICE (Solo se ci sono capitoli) */}
          {chapters.length > 0 && (
            <article className="page-break-before w-full bg-background border border-border print:border-none p-8 sm:p-12 md:p-16 shadow-lg print:shadow-none print:w-full print:max-w-none print:min-h-[297mm] print:p-0 print:mb-[20mm]">
              <h2 className="text-2xl font-bold border-b border-border/80 pb-4 mb-8 print:border-neutral-300 print:text-black">
                Indice dei Contenuti
              </h2>
              <nav className="flex flex-col gap-6">
                {chapters.map((chapter, cIndex) => (
                  <div key={chapter.id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end border-b border-dashed border-border/40 pb-1">
                      <span className="font-bold text-base text-foreground print:text-black">
                        {cIndex + 1}. {chapter.title}
                      </span>
                    </div>
                    <ul className="pl-6 flex flex-col gap-1.5">
                      {chapter.notes.map((note) => (
                        <li key={note.id} className="text-sm text-muted-foreground flex justify-between items-center print:text-neutral-600">
                          <span>{note.title}</span>
                        </li>
                      ))}
                      {chapter.notes.length === 0 && (
                        <li className="text-xs italic text-muted-foreground/60">Nessuna nota</li>
                      )}
                    </ul>
                  </div>
                ))}
              </nav>
            </article>
          )}

          {/* PAGINE DI CONTENUTO */}
          {chapters.map((chapter, cIndex) => (
            <div key={chapter.id} className="contents">
              <article className="page-break-before w-full bg-background border border-border print:border-none p-8 sm:p-12 md:p-16 shadow-lg print:shadow-none print:w-full print:max-w-none print:min-h-[297mm] print:p-0 print:mb-[20mm]">
                
                {/* Intestazione Capitolo */}
                <div className="border-b-2 border-primary/20 pb-4 mb-8 print:border-neutral-400">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                    Capitolo {cIndex + 1}
                  </span>
                  <h2 className="text-3xl font-extrabold text-foreground mt-1 print:text-black">
                    {chapter.title}
                  </h2>
                </div>

                {/* Note del capitolo */}
                <div className="flex flex-col gap-12">
                  {chapter.notes.map((note) => {
                    const processedContent = note.content.replaceAll(
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
                      <section key={note.id} className="page-break-inside flex flex-col gap-4 border-b border-border/40 pb-8 last:border-b-0 print:border-neutral-200">
                        <h3 className="text-xl font-bold text-foreground print:text-black border-l-4 border-primary pl-3 print:border-neutral-800">
                          {note.title}
                        </h3>
                        
                        <div className="editor leading-relaxed text-[16px] print:text-[12pt] print:leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={remarkPlugins}
                            rehypePlugins={rehypePlugins}
                            components={markdownComponents}
                          >
                            {processedContent}
                          </ReactMarkdown>
                        </div>
                      </section>
                    );
                  })}

                  {chapter.notes.length === 0 && (
                    <p className="text-sm italic text-muted-foreground text-center py-8">
                      Nessuna nota in questo capitolo.
                    </p>
                  )}
                </div>
              </article>
            </div>
          ))}

        </div>
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
          
          /* Forza interruzione di pagina */
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 10mm !important;
          }
          
          /* Evita interruzioni di pagina a metà delle singole note se possibile */
          .page-break-inside {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
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
