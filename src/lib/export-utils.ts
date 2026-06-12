/**
 * Utility di esportazione modulare per FormulaBase.
 * Supporta l'esportazione client-side di note e formulari in formato Markdown,
 * e fornisce helper per altri formati (es. JSON, HTML, LaTeX).
 */

export interface ExportNoteData {
  id: string;
  title: string;
  content: string;
}

export interface ExportFormularioData {
  id: string;
  title: string;
  description?: string;
  author?: string;
  chapters: {
    id: string;
    title: string;
    notes: ExportNoteData[];
  }[];
}

/**
 * Avvia il download di un file nel browser.
 */
export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Converte una singola nota in formato Markdown pulito.
 */
export function noteToMarkdown(note: ExportNoteData): string {
  // Se la nota non inizia già con il titolo principale, lo aggiungiamo
  let content = note.content;
  if (!content.trim().startsWith("#")) {
    content = `# ${note.title}\n\n${content}`;
  }
  return content;
}

/**
 * Converte un intero formulario in formato Markdown, concatenando capitoli e note
 * e aggiungendo un indice automatico dei contenuti.
 */
export function formularioToMarkdown(data: ExportFormularioData): string {
  let md = "";
  md += `# ${data.title}\n\n`;
  if (data.author) {
    md += `**Autore:** ${data.author}\n`;
  }
  if (data.description) {
    md += `**Descrizione:** ${data.description}\n`;
  }
  md += `\n---\n\n`;

  // Indice dei Contenuti
  md += `## Indice dei Contenuti\n\n`;
  data.chapters.forEach((chapter, cIndex) => {
    md += `${cIndex + 1}. **${chapter.title}**\n`;
    chapter.notes.forEach((note, nIndex) => {
      // Estraiamo il titolo pulito per l'indice
      md += `   - ${note.title}\n`;
    });
  });
  md += `\n---\n\n`;

  // Sezioni dei capitoli e delle note
  data.chapters.forEach((chapter, cIndex) => {
    md += `## ${cIndex + 1}. ${chapter.title}\n\n`;
    
    if (chapter.notes.length === 0) {
      md += "*Nessuna nota in questo capitolo.*\n\n";
    } else {
      chapter.notes.forEach((note) => {
        let noteContent = note.content;
        // Se inizia con un titolo principale (#), lo trasformiamo in titolo secondario/terziario (###)
        // per non rompere la gerarchia del documento esportato (## Capitolo)
        noteContent = noteContent.replace(/^(#+)\s+(.+)$/gm, (match, hashes, title) => {
          return `${hashes}# ${title}`;
        });
        
        md += `${noteContent}\n\n---\n\n`;
      });
    }
  });

  return md;
}

/**
 * Converte il contenuto in formato JSON strutturato (ottimo per backup).
 */
export function noteToJson(note: ExportNoteData): string {
  return JSON.stringify(note, null, 2);
}

export function formularioToJson(data: ExportFormularioData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Converte il contenuto in formato LaTeX raw (futura estensione).
 */
export function noteToRawLatex(note: ExportNoteData): string {
  // Versione base: avvolge il markdown in un ambiente documentale latex minimale.
  // Può essere arricchito con un vero parser markdown-to-latex in futuro.
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{hyperref}

\\title{${note.title}}
\\author{FormulaBase}
\\date{\\today}

\\begin{document}

\\maketitle

${note.content}

\\end{document}`;
}

export function formularioToRawLatex(data: ExportFormularioData): string {
  let tex = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{hyperref}

\\title{${data.title}}
${data.author ? `\\author{${data.author}}` : `\\author{FormulaBase}`}
\\date{\\today}

\\begin{document}

\\maketitle

${data.description ? `\\begin{abstract}\n${data.description}\n\\end{abstract}\n\n` : ""}
\\tableofcontents
\\newpage
`;

  data.chapters.forEach((chapter) => {
    tex += `\\section{${chapter.title}}\n\n`;
    chapter.notes.forEach((note) => {
      tex += `\\subsection{${note.title}}\n\n`;
      tex += `${note.content}\n\n`;
    });
  });

  tex += `\\end{document}`;
  return tex;
}

/**
 * Oggetto esportatore principale (Strategy Pattern)
 */
export const Exporter = {
  markdown: {
    exportNote: (note: ExportNoteData, filename: string) => {
      const content = noteToMarkdown(note);
      downloadFile(content, `${filename}.md`, "text/markdown;charset=utf-8;");
    },
    exportFormulario: (data: ExportFormularioData, filename: string) => {
      const content = formularioToMarkdown(data);
      downloadFile(content, `${filename}.md`, "text/markdown;charset=utf-8;");
    }
  },
  json: {
    exportNote: (note: ExportNoteData, filename: string) => {
      const content = noteToJson(note);
      downloadFile(content, `${filename}.json`, "application/json;charset=utf-8;");
    },
    exportFormulario: (data: ExportFormularioData, filename: string) => {
      const content = formularioToJson(data);
      downloadFile(content, `${filename}.json`, "application/json;charset=utf-8;");
    }
  },
  latex: {
    exportNote: (note: ExportNoteData, filename: string) => {
      const content = noteToRawLatex(note);
      downloadFile(content, `${filename}.tex`, "text/x-tex;charset=utf-8;");
    },
    exportFormulario: (data: ExportFormularioData, filename: string) => {
      const content = formularioToRawLatex(data);
      downloadFile(content, `${filename}.tex`, "text/x-tex;charset=utf-8;");
    }
  }
};
