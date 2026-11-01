export type Categoria = {
  id: number;
  nome: string;
  colore: string;
  /** Only returned by GET /api/categorie */
  formulariCount?: number;
};

export const CATEGORIA_NOME_MAX = 30;

/** Preset palette (Tailwind 500 shades: readable on light and dark backgrounds) */
export const CATEGORIA_COLORI = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
] as const;

export function isValidColore(colore: unknown): colore is string {
  return typeof colore === "string" && /^#[0-9a-f]{6}$/i.test(colore);
}

/** Picks the next palette color, so new categories don't all look the same */
export function nextColore(count: number): string {
  return CATEGORIA_COLORI[count % CATEGORIA_COLORI.length];
}
