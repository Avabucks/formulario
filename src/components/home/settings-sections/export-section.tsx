"use client";

import { useState } from "react";
import { Download, FileCode, FileJson, FileText, Printer, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Exporter, ExportFormularioData } from "@/src/lib/export-utils";
import slugify from "slugify";
import { toast } from "sonner";

interface ExportSectionProps {
  formularioId: string;
  formularioTitle: string;
}

export function ExportSection({ formularioId, formularioTitle }: ExportSectionProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const fetchExportData = async (): Promise<ExportFormularioData | null> => {
    try {
      const response = await fetch(`/api/formulari/${formularioId}/export`);
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei dati per l'esportazione.");
      }
      return await response.json();
    } catch (error: any) {
      console.error(error.message);
      toast.error("Impossibile caricare i dati del formulario per l'esportazione.", {
        position: "bottom-center",
      });
      return null;
    }
  };

  const handleExportMarkdown = async () => {
    setExportingFormat("markdown");
    const data = await fetchExportData();
    if (data) {
      const cleanFilename = slugify(data.title, { lower: true, strict: true }) || "formulario";
      Exporter.markdown.exportFormulario(data, cleanFilename);
      toast.success("Formulario esportato come Markdown con successo!", {
        position: "bottom-center",
      });
    }
    setExportingFormat(null);
  };

  const handleExportJson = async () => {
    setExportingFormat("json");
    const data = await fetchExportData();
    if (data) {
      const cleanFilename = slugify(data.title, { lower: true, strict: true }) || "formulario";
      Exporter.json.exportFormulario(data, cleanFilename);
      toast.success("Formulario esportato come JSON con successo!", {
        position: "bottom-center",
      });
    }
    setExportingFormat(null);
  };

  const handleExportLatex = async () => {
    setExportingFormat("latex");
    const data = await fetchExportData();
    if (data) {
      const cleanFilename = slugify(data.title, { lower: true, strict: true }) || "formulario";
      Exporter.latex.exportFormulario(data, cleanFilename);
      toast.success("Formulario esportato come LaTeX con successo!", {
        position: "bottom-center",
      });
    }
    setExportingFormat(null);
  };

  const handleExportPdf = () => {
    window.open(`/export/formulario/${formularioId}`, "_blank");
    toast.success("Apertura dell'area di stampa PDF in corso...", {
      position: "bottom-center",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">Esporta Formulario</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Scarica i contenuti di questo formulario (&quot;{formularioTitle}&quot;) nel formato che preferisci.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Export Card */}
        <div className="flex flex-col justify-between p-5 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg shrink-0">
              <Printer className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-foreground text-sm">Documento PDF (.pdf)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ottimo per la stampa o l&apos;uso offline. Genera un layout premium con formule LaTeX renderizzate e indice dei contenuti.
              </p>
            </div>
          </div>
          <Button onClick={handleExportPdf} variant="outline" className="w-full text-xs font-semibold h-9 mt-2">
            <Printer className="mr-2 h-3.5 w-3.5" /> Esporta in PDF / Stampa
          </Button>
        </div>

        {/* Markdown Export Card */}
        <div className="flex flex-col justify-between p-5 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-foreground text-sm">Markdown (.md)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Perfetto per importare in Obsidian, Notion o altri editor markdown. Preserva interamente la sintassi LaTeX originale.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportMarkdown}
            variant="outline"
            disabled={exportingFormat !== null}
            className="w-full text-xs font-semibold h-9 mt-2"
          >
            {exportingFormat === "markdown" ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Scarica Markdown
          </Button>
        </div>

        {/* LaTeX Raw Export Card */}
        <div className="flex flex-col justify-between p-5 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
              <FileCode className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-foreground text-sm">Sorgente LaTeX (.tex)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esporta la struttura del formulario pronta per essere compilata in locale con Overleaf o motori LaTeX nativi.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportLatex}
            variant="outline"
            disabled={exportingFormat !== null}
            className="w-full text-xs font-semibold h-9 mt-2"
          >
            {exportingFormat === "latex" ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Scarica LaTeX (.tex)
          </Button>
        </div>

        {/* JSON Backup Export Card */}
        <div className="flex flex-col justify-between p-5 border border-border rounded-xl bg-card hover:bg-accent/10 transition-colors gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
              <FileJson className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-foreground text-sm">Backup JSON (.json)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Salva tutti i capitoli e le note strutturati in formato JSON grezzo. Ottimo per backup locali ripristinabili.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportJson}
            variant="outline"
            disabled={exportingFormat !== null}
            className="w-full text-xs font-semibold h-9 mt-2"
          >
            {exportingFormat === "json" ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Scarica JSON (.json)
          </Button>
        </div>
      </div>
    </div>
  );
}
