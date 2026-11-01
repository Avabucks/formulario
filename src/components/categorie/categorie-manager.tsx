"use client";

import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  CATEGORIA_COLORI,
  CATEGORIA_NOME_MAX,
  Categoria,
} from "@/src/lib/categorie";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCategoria,
  deleteCategoria,
  fetchCategorie,
  sortCategorie,
  updateCategoria,
} from "./api";
import { CategoriaTag } from "./categoria-tag";
import { ColorPicker } from "./color-picker";

const toastError = (error: unknown) =>
  toast.error((error as Error).message, { position: "bottom-center" });

/** Settings section: create, rename, recolor and delete the user's categories */
export function CategorieManager() {
  const [categorie, setCategorie] = useState<Categoria[]>();
  const [nome, setNome] = useState("");
  const [colore, setColore] = useState<string>(CATEGORIA_COLORI[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchCategorie()
      .then((list) => {
        if (ignore) return;
        setCategorie(list);
      })
      .catch((error) => {
        if (ignore) return;
        setCategorie([]);
        toastError(error);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = nome.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const categoria = await createCategoria(trimmed, colore);
      const list = sortCategorie([...(categorie ?? []), categoria]);
      setCategorie(list);
      setNome("");
      setColore(CATEGORIA_COLORI[0]);
    } catch (error) {
      toastError(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(categoria: Categoria) {
    const previous = categorie;
    setCategorie((list) =>
      sortCategorie(
        (list ?? []).map((c) => (c.id === categoria.id ? categoria : c)),
      ),
    );
    try {
      await updateCategoria(categoria);
    } catch (error) {
      setCategorie(previous);
      toastError(error);
    }
  }

  async function handleDelete(categoria: Categoria) {
    const previous = categorie;
    setCategorie((list) => (list ?? []).filter((c) => c.id !== categoria.id));
    try {
      await deleteCategoria(categoria.id);
      toast.success(`Categoria "${categoria.nome}" eliminata`, {
        position: "bottom-center",
      });
    } catch (error) {
      setCategorie(previous);
      toastError(error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-lg border p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Nome della nuova categoria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={CATEGORIA_NOME_MAX}
            aria-label="Nome categoria"
          />
          <Button type="submit" disabled={!nome.trim() || saving}>
            <Plus className="size-4" /> Crea categoria
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ColorPicker value={colore} onChange={setColore} />
          {nome.trim() && <CategoriaTag nome={nome.trim()} colore={colore} />}
        </div>
      </form>

      {categorie === undefined && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {categorie?.length === 0 && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>Nessuna categoria</EmptyTitle>
            <EmptyDescription>
              Crea una categoria e assegnala ai tuoi formulari dalle loro
              impostazioni.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {categorie && categorie.length > 0 && (
        <ul className="flex flex-col gap-2">
          {categorie.map((c) => (
            <CategoriaRow
              key={c.id}
              categoria={c}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoriaRow({
  categoria,
  onUpdate,
  onDelete,
}: Readonly<{
  categoria: Categoria;
  onUpdate: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}>) {
  const [nome, setNome] = useState(categoria.nome);
  const [colore, setColore] = useState(categoria.colore);

  // Keep the inputs in sync when the server rejects a change and rolls back
  const [synced, setSynced] = useState(categoria);
  if (synced !== categoria) {
    setSynced(categoria);
    setNome(categoria.nome);
    setColore(categoria.colore);
  }

  function commitNome() {
    const trimmed = nome.trim();
    if (!trimmed) {
      setNome(categoria.nome);
      return;
    }
    if (trimmed !== categoria.nome) onUpdate({ ...categoria, nome: trimmed });
  }

  function commitColore(open: boolean) {
    if (!open && colore !== categoria.colore)
      onUpdate({ ...categoria, colore });
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border p-2 pl-3">
      <Popover onOpenChange={commitColore}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Cambia colore"
            className="size-5 shrink-0 rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: colore }}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto">
          <ColorPicker value={colore} onChange={setColore} />
        </PopoverContent>
      </Popover>

      <Input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onBlur={commitNome}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setNome(categoria.nome);
            e.currentTarget.blur();
          }
        }}
        maxLength={CATEGORIA_NOME_MAX}
        aria-label="Nome categoria"
        className="h-8 flex-1 border-transparent bg-transparent shadow-none hover:border-input focus-visible:border-input dark:bg-transparent"
      />

      <CategoriaTag
        nome={nome.trim() || categoria.nome}
        colore={colore}
        className="hidden max-w-40 sm:inline-flex"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Elimina ${categoria.nome}`}
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(categoria)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
