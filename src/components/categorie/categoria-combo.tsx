"use client";

import { Button } from "@/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Spinner } from "@/src/components/ui/spinner";
import { CATEGORIA_NOME_MAX, Categoria, nextColore } from "@/src/lib/categorie";
import { cn } from "@/src/lib/utils";
import { ChevronsUpDown, Plus, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCategoria, fetchCategorie } from "./api";
import { CategoriaTag } from "./categoria-tag";

/** Popover with search, "none", the user's categories and on-the-fly creation; the trigger is the child */
export function CategoriaPicker({
  categorie,
  onCategorieChange,
  value,
  onChange,
  align = "start",
  matchTriggerWidth = false,
  children,
}: Readonly<{
  categorie: Categoria[] | undefined;
  onCategorieChange: (categorie: Categoria[]) => void;
  value: number | null;
  onChange: (categoriaId: number | null) => void;
  align?: "start" | "center" | "end";
  matchTriggerWidth?: boolean;
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const nome = query.trim().slice(0, CATEGORIA_NOME_MAX);
  const canCreate =
    nome.length > 0 &&
    !categorie?.some((c) => c.nome.toLowerCase() === nome.toLowerCase());
  const newColore = nextColore(categorie?.length ?? 0);

  function select(categoriaId: number | null) {
    onChange(categoriaId);
    setOpen(false);
    setQuery("");
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const categoria = await createCategoria(nome, newColore);
      onCategorieChange([...(categorie ?? []), categoria]);
      select(categoria.id);
    } catch (error) {
      toast.error((error as Error).message, { position: "bottom-center" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-64 p-0",
          matchTriggerWidth && "w-(--radix-popover-trigger-width) min-w-60",
        )}
        align={align}
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput
            placeholder="Cerca o crea una categoria..."
            value={query}
            onValueChange={setQuery}
            maxLength={CATEGORIA_NOME_MAX}
          />
          <CommandList>
            <CommandEmpty>Nessuna categoria trovata.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__nessuna__"
                keywords={["nessuna"]}
                data-checked={value === null}
                onSelect={() => select(null)}
              >
                <span className="text-muted-foreground">Nessuna categoria</span>
              </CommandItem>
              {categorie?.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.id}`}
                  keywords={[c.nome]}
                  data-checked={c.id === value}
                  onSelect={() => select(c.id)}
                >
                  <CategoriaTag nome={c.nome} colore={c.colore} />
                </CommandItem>
              ))}
            </CommandGroup>
            {canCreate && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="__crea__"
                    forceMount
                    disabled={creating}
                    onSelect={handleCreate}
                  >
                    {creating ? <Spinner /> : <Plus />}
                    <span className="truncate">
                      Crea{" "}
                      <CategoriaTag
                        nome={nome}
                        colore={newColore}
                        className="align-middle"
                      />
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="__gestisci__"
                forceMount
                onSelect={() => router.push("/settings/categories")}
              >
                <Settings2 />
                Gestisci categorie
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Form field: loads the user's categories and shows the picker behind a combobox button */
export function CategoriaCombo({
  id,
  value,
  onChange,
}: Readonly<{
  id?: string;
  value: number | null;
  onChange: (categoriaId: number | null) => void;
}>) {
  const [categorie, setCategorie] = useState<Categoria[]>();

  useEffect(() => {
    let ignore = false;
    fetchCategorie()
      .then((list) => !ignore && setCategorie(list))
      .catch(() => !ignore && setCategorie([]));
    return () => {
      ignore = true;
    };
  }, []);

  const selected = categorie?.find((c) => c.id === value);

  return (
    <CategoriaPicker
      categorie={categorie}
      onCategorieChange={setCategorie}
      value={value}
      onChange={onChange}
      matchTriggerWidth
    >
      <Button
        id={id}
        type="button"
        variant="outline"
        role="combobox"
        className="w-full justify-between font-normal"
      >
        {selected ? (
          <CategoriaTag nome={selected.nome} colore={selected.colore} />
        ) : (
          <span className="text-muted-foreground">
            {categorie ? "Nessuna categoria" : "Caricamento..."}
          </span>
        )}
        <ChevronsUpDown className="size-4 opacity-50" />
      </Button>
    </CategoriaPicker>
  );
}
