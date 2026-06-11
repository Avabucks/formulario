import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { pool } from "@/src/lib/db";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import { markdownComponents } from "@/src/components/editor/editor-katex/markdown-components";

// -- adjust remarkPlugins / rehypePlugins to your setup --
const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex];

type ArgomentoDetail = {
  beautiful_id: string;
  content: string;
  sort_order: number;
  capitolo_titolo: string | null;
  capitolo_id: string;
  formulario_titolo: string;
  formulario_id: string;
  prev_id: string | null;
  next_id: string | null;
};

async function getArgomento(id: string): Promise<ArgomentoDetail | null> {
  const result = await pool.query<ArgomentoDetail>(
    `
    SELECT
      a.beautiful_id,
      a.content,
      a.sort_order,
      c.titolo AS capitolo_titolo,
      c.beautiful_id AS capitolo_id,
      f.titolo AS formulario_titolo,
      f.beautiful_id AS formulario_id,
      LAG(a.beautiful_id)  OVER (PARTITION BY a.capitolo ORDER BY a.sort_order) AS prev_id,
      LEAD(a.beautiful_id) OVER (PARTITION BY a.capitolo ORDER BY a.sort_order) AS next_id
    FROM argomenti a
    JOIN capitoli c ON a.capitolo = c.beautiful_id
    JOIN formulari f ON c.formulario = f.beautiful_id
    WHERE a.beautiful_id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

// Minimal preprocessing: unwrap escaped newlines if stored as \n literals
function processContent(raw: string): string {
  return raw.replace(/\\n/g, "\n");
}

export default async function ArgomentoPage({ params }: { params: Promise<{ id: string }> }) {
  const arg = await getArgomento((await params).id);
  if (!arg) notFound();

  const processedContent = processContent(arg.content);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/argomenti" className="hover:text-indigo-600 transition-colors">
          Argomenti
        </Link>
        <span>/</span>
        <Link href={`/formulari/${arg.formulario_id}`} className="hover:text-indigo-600 transition-colors">
          {arg.formulario_titolo}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{arg.capitolo_titolo ?? "Capitolo"}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">
          {arg.capitolo_titolo ?? "Capitolo senza titolo"} · #{arg.sort_order}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{arg.formulario_titolo}</h1>
      </header>

      {/* Markdown content */}
        {processedContent.trim() ? (
                <div
                  className="editor p-9 leading-loose relative"
                >
                  <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={markdownComponents}
                  >
                    {processedContent}
                  </ReactMarkdown>
                </div>
        ) : (
          <p className="text-gray-400 italic">Questo argomento è ancora vuoto.</p>
        )}

      {/* Prev / Next navigation */}
      <div className="flex justify-between mt-16 pt-6 border-t border-gray-100 text-sm">
        {arg.prev_id ? (
          <Link
            href={`/argomenti/${arg.prev_id}`}
            className="text-indigo-600 hover:underline flex items-center gap-1"
          >
            ← Precedente
          </Link>
        ) : <span />}
        {arg.next_id ? (
          <Link
            href={`/argomenti/${arg.next_id}`}
            className="text-indigo-600 hover:underline flex items-center gap-1"
          >
            Successivo →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}