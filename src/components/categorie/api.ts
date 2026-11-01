import { Categoria } from "@/src/lib/categorie";

async function request<T>(method: string, body?: unknown): Promise<T> {
  const res = await fetch("/api/categorie", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Errore del server");
  return data as T;
}

export const fetchCategorie = () => request<Categoria[]>("GET");

export const createCategoria = (nome: string, colore: string) =>
  request<Categoria>("POST", { nome, colore });

export const updateCategoria = (categoria: Categoria) =>
  request<Categoria>("PUT", categoria);

export const deleteCategoria = (id: number) =>
  request<{ success: true }>("DELETE", { id });

export const sortCategorie = (list: Categoria[]) =>
  [...list].sort((a, b) =>
    a.nome.localeCompare(b.nome, "it", { sensitivity: "base" }),
  );
