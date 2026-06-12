import Link from "next/link";
import { pool } from "@/src/lib/db";

type ArgomentoRow = {
  beautiful_id: string;
  capitolo_titolo: string | null;
  formulario_titolo: string;
  formulario_id: string;
  sort_order: number;
  content_preview: string;
};

async function getArgomenti(): Promise<ArgomentoRow[]> {
  const result = await pool.query<ArgomentoRow>(`
    SELECT
      a.beautiful_id,
      c.titolo AS capitolo_titolo,
      f.titolo AS formulario_titolo,
      f.beautiful_id AS formulario_id,
      a.sort_order,
      LEFT(a.content, 120) AS content_preview
    FROM argomenti a
    JOIN capitoli c ON a.capitolo = c.beautiful_id
    JOIN formulari f ON c.formulario = f.beautiful_id
    ORDER BY f.data_creazione DESC
  `);
  return result.rows;
}

export default async function ArgomentiPage() {
  const argomenti = await getArgomenti();

  // Group by formulario
  const grouped = argomenti.reduce<Record<string, { formulario_titolo: string; items: ArgomentoRow[] }>>(
    (acc, row) => {
      if (!acc[row.formulario_id]) {
        acc[row.formulario_id] = { formulario_titolo: row.formulario_titolo, items: [] };
      }
      acc[row.formulario_id].items.push(row);
      return acc;
    },
    {}
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Argomenti</h1>
      <p className="text-gray-500 mb-10 text-sm">
        {argomenti.length} argomenti in {Object.keys(grouped).length} formulari
      </p>

      <div className="space-y-10">
        {Object.entries(grouped).map(([formId, { formulario_titolo, items }]) => (
          <section key={formId}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-4">
              {formulario_titolo}
            </h2>
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {items.map((arg) => (
                <li key={arg.beautiful_id}>
                  <Link
                    href={`/editor/${arg.beautiful_id}`}
                    className="flex flex-col gap-1 px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xs text-gray-400">
                      {arg.capitolo_titolo ?? "Capitolo senza titolo"} · #{arg.sort_order}
                    </span>
                    <span className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                      {arg.content_preview
                        ? arg.content_preview.replace(/[#*`_~>\[\]]/g, "").trim()
                        : <span className="italic text-gray-400">Vuoto</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {argomenti.length === 0 && (
        <p className="text-center text-gray-400 mt-24">Nessun argomento trovato.</p>
      )}
    </main>
  );
}