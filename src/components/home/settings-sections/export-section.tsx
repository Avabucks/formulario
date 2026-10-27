"use client";

import { cn } from "@/src/lib/utils";
import { Download, FileCode, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Spinner } from "../../ui/spinner";
import { ExportCapitolo } from "./types";

type ExportFormat = "pdf" | "md";
type ExportScope = "all" | "custom";

const KATEX_CSS_URL =
  "https://cdn.jsdelivr.net/npm/katex@0.16.44/dist/katex.min.css";

export function ExportSection({
  formularioId,
  titolo,
}: Readonly<{ formularioId: string; titolo: string }>) {
  const [capitoli, setCapitoli] = useState<ExportCapitolo[]>();
  const [loadError, setLoadError] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [scope, setScope] = useState<ExportScope>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/formulari/${formularioId}/export`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{ capitoli: ExportCapitolo[] }>;
      })
      .then((result) => {
        if (ignore) return;
        setCapitoli(result.capitoli);
        setSelected(
          new Set(result.capitoli.flatMap((c) => c.argomenti.map((a) => a.id))),
        );
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      });

    return () => {
      ignore = true;
    };
  }, [formularioId]);

  if (loadError)
    return (
      <p className="text-sm text-muted-foreground">
        Non è stato possibile caricare gli argomenti del formulario.
      </p>
    );

  if (!capitoli)
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );

  const totalArgomenti = capitoli.reduce((n, c) => n + c.argomenti.length, 0);
  const selectedCount = scope === "all" ? totalArgomenti : selected.size;

  function toggleArgomento(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCapitolo(capitolo: ExportCapitolo, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const a of capitolo.argomenti) {
        if (checked) next.add(a.id);
        else next.delete(a.id);
      }
      return next;
    });
  }

  async function handleExport() {
    if (!capitoli) return;

    const filtered = capitoli
      .map((c) => ({
        ...c,
        argomenti: c.argomenti.filter(
          (a) => scope === "all" || selected.has(a.id),
        ),
      }))
      .filter((c) => c.argomenti.length > 0);

    const markdown = buildMarkdown(titolo, filtered);
    const fileName =
      slugify(titolo, { lower: true, strict: true }) || "formulario";

    setExporting(true);
    try {
      if (format === "md") downloadMarkdown(markdown, `${fileName}.md`);
      else await printPdf(markdown, titolo);
    } catch (error) {
      console.error("Errore esportazione:", error);
      toast.error("Errore durante l'esportazione del formulario.", {
        position: "bottom-center",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label>Formato</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormatOption
            active={format === "pdf"}
            icon={<FileText size={18} />}
            label="PDF"
            description="Documento pronto da stampare"
            onClick={() => setFormat("pdf")}
          />
          <FormatOption
            active={format === "md"}
            icon={<FileCode size={18} />}
            label="Markdown"
            description="File .md con il sorgente"
            onClick={() => setFormat("md")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Contenuto</Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="export-scope"
              className="accent-primary size-4"
              checked={scope === "all"}
              onChange={() => setScope("all")}
            />
            Tutti gli argomenti
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="export-scope"
              className="accent-primary size-4"
              checked={scope === "custom"}
              onChange={() => setScope("custom")}
            />
            Seleziona argomenti
          </label>
        </div>

        {scope === "custom" && (
          <div className="flex flex-col gap-1 rounded-md border p-3">
            {totalArgomenti === 0 && (
              <p className="text-sm text-muted-foreground">
                Nessun argomento da esportare.
              </p>
            )}
            {capitoli
              .filter((c) => c.argomenti.length > 0)
              .map((capitolo) => {
                const count = capitolo.argomenti.filter((a) =>
                  selected.has(a.id),
                ).length;
                return (
                  <div key={capitolo.id} className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer py-1">
                      <Checkbox
                        checked={count === capitolo.argomenti.length}
                        indeterminate={
                          count > 0 && count < capitolo.argomenti.length
                        }
                        onChange={(checked) =>
                          toggleCapitolo(capitolo, checked)
                        }
                      />
                      <span className="truncate">{capitolo.titolo}</span>
                    </label>
                    <div className="flex flex-col gap-1 pl-6">
                      {capitolo.argomenti.map((argomento) => (
                        <label
                          key={argomento.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer py-0.5"
                        >
                          <Checkbox
                            checked={selected.has(argomento.id)}
                            onChange={() => toggleArgomento(argomento.id)}
                          />
                          <span className="truncate">{argomento.titolo}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Button
        onClick={handleExport}
        disabled={exporting || selectedCount === 0}
      >
        {exporting ? <Spinner /> : <Download size={16} />}
        Esporta {selectedCount}{" "}
        {selectedCount === 1 ? "argomento" : "argomenti"}
      </Button>
    </div>
  );
}

function FormatOption({
  active,
  icon,
  label,
  description,
  onClick,
}: Readonly<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors",
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {icon}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  );
}

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: Readonly<{
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
}>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="accent-primary size-4 shrink-0"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

// Shift headings outside code blocks so argomenti nest under their capitolo
function shiftHeadings(markdown: string, by: number) {
  let inCodeBlock = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) inCodeBlock = !inCodeBlock;
      if (inCodeBlock) return line;
      return line.replace(
        /^(#{1,6})(\s)/,
        (_, hashes: string, space: string) =>
          "#".repeat(Math.min(6, hashes.length + by)) + space,
      );
    })
    .join("\n");
}

function buildMarkdown(titolo: string, capitoli: ExportCapitolo[]) {
  const parts = [`# ${titolo}`];
  for (const capitolo of capitoli) {
    parts.push(`## ${capitolo.titolo}`);
    for (const argomento of capitolo.argomenti)
      parts.push(shiftHeadings(argomento.content.trim(), 2));
  }
  return parts.join("\n\n") + "\n";
}

function downloadMarkdown(markdown: string, fileName: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// Same $$ normalization used by the editor preview
function normalizeMath(markdown: string) {
  return markdown.replaceAll(
    /(^[ \t]*)\$\$([\s\S]*?)\$\$/gm,
    (_, indent: string, math: string) => {
      const indentedMath = math
        .trim()
        .split("\n")
        .map((line) => indent + "    " + line)
        .join("\n");
      return `${indent}$$\n${indentedMath}\n${indent}$$`;
    },
  );
}

async function printPdf(markdown: string, titolo: string) {
  const [
    { createElement },
    { renderToStaticMarkup },
    { default: ReactMarkdown },
    { default: remarkMath },
    { default: remarkBreaks },
    { default: remarkGfm },
    { default: rehypeKatex },
    { default: mermaid },
  ] = await Promise.all([
    import("react"),
    import("react-dom/server"),
    import("react-markdown"),
    import("remark-math"),
    import("remark-breaks"),
    import("remark-gfm"),
    import("rehype-katex"),
    import("mermaid"),
  ]);

  const body = renderToStaticMarkup(
    createElement(ReactMarkdown, {
      remarkPlugins: [remarkMath, remarkBreaks, remarkGfm],
      rehypePlugins: [rehypeKatex],
      children: normalizeMath(markdown),
    }),
  );

  document.getElementById("formulario-export-frame")?.remove();
  const iframe = document.createElement("iframe");
  iframe.id = "formulario-export-frame";
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) throw new Error("Impossibile creare il documento");

  const title = doc.createElement("title");
  title.textContent = titolo;
  const style = doc.createElement("style");
  style.textContent = PRINT_CSS;
  const katexCss = doc.createElement("link");
  katexCss.rel = "stylesheet";
  katexCss.href = KATEX_CSS_URL;
  const cssLoaded = new Promise<void>((resolve) => {
    katexCss.onload = () => resolve();
    katexCss.onerror = () => resolve();
  });
  doc.head.append(title, style, katexCss);
  doc.body.innerHTML = body;

  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "strict",
  });
  for (const code of Array.from(
    doc.querySelectorAll("code.language-mermaid"),
  )) {
    const source = code.textContent ?? "";
    const pre = code.closest("pre") ?? code;
    try {
      if (!(await mermaid.parse(source, { suppressErrors: true }))) continue;
      const id = `mermaid-export-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(id, source);
      const wrapper = doc.createElement("div");
      wrapper.className = "mermaid";
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (error: any) {
      console.warn("Mermaid error:", error.message);
    }
  }

  await cssLoaded;
  await doc.fonts.ready;

  win.onafterprint = () => iframe.remove();
  win.focus();
  win.print();
}

const PRINT_CSS = `
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #111;
  background: #fff;
  margin: 0;
}
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.2em 0 0.5em; break-after: avoid; }
h1 { font-size: 24pt; margin-top: 0; }
h2 { font-size: 18pt; break-before: page; border-bottom: 1px solid #ddd; padding-bottom: 0.2em; }
h1 + h2 { break-before: auto; }
h3 { font-size: 15pt; }
h4 { font-size: 13pt; }
h5, h6 { font-size: 11pt; }
p { margin: 0.5em 0; }
a { color: #1a56db; }
img, svg { max-width: 100%; }
pre {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 9.5pt;
  break-inside: avoid;
}
code { font-family: ui-monospace, Menlo, Consolas, monospace; }
:not(pre) > code { background: #f2f2f2; padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.9em; }
blockquote { margin: 0.8em 0; padding: 0.2em 1em; border-left: 3px solid #ccc; color: #444; }
table { border-collapse: collapse; width: 100%; margin: 0.8em 0; break-inside: avoid; }
th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
th { background: #f5f5f5; }
hr { border: 0; border-top: 1px solid #ddd; margin: 1.2em 0; }
.katex-display { overflow: hidden; break-inside: avoid; }
.mermaid { display: flex; justify-content: center; margin: 1em 0; break-inside: avoid; }
`;
