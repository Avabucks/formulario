"use client";

import { cn } from "@/src/lib/utils";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  ChevronsDownUp,
  Ellipsis,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  PanelLeftClose,
  PenLine,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  StructureArgomento,
  StructureCapitolo,
} from "../home/settings-sections/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import {
  closeTabs,
  findArgomento,
  getExpanded,
  handleWorkspaceClick,
  navigateWorkspace,
  prefetchArgomento,
  saveExpanded,
  Structure,
  useStructure,
} from "./workspace-store";

type PendingDelete =
  | { kind: "capitolo"; capitolo: StructureCapitolo }
  | { kind: "argomento"; argomento: StructureArgomento };

function findCapitoloId(
  structure: Structure | undefined,
  argomentoId?: string,
) {
  if (!argomentoId) return undefined;
  return findArgomento(structure, argomentoId)?.capitolo.id;
}

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(await res.text());
  return res;
}

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields))
    formData.append(key, value);
  return formData;
}

export function WorkspaceExplorer({
  formularioId,
  argomentoId,
  activeTitle,
  editable,
  onOpen,
  onClose,
  onNavigate,
}: Readonly<{
  formularioId: string;
  argomentoId?: string;
  activeTitle?: string;
  editable: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate?: () => void;
}>) {
  const { structure, error, reload } = useStructure(formularioId);
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    getExpanded(formularioId),
  );
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [creatingCapitolo, setCreatingCapitolo] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [revealedFor, setRevealedFor] = useState<string>();
  const treeRef = useRef<HTMLDivElement>(null);

  const activeCapitoloId = findCapitoloId(structure, argomentoId);

  // Reveal the active argomento once, like VS Code's "auto reveal"
  if (activeCapitoloId && argomentoId && revealedFor !== argomentoId) {
    setRevealedFor(argomentoId);
    if (!expanded.has(activeCapitoloId))
      setExpanded(new Set(expanded).add(activeCapitoloId));
  }

  useEffect(() => {
    saveExpanded(formularioId, expanded);
  }, [formularioId, expanded]);

  useEffect(() => {
    if (!activeCapitoloId) return;
    requestAnimationFrame(() => {
      treeRef.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ block: "nearest" });
    });
  }, [activeCapitoloId]);

  const filtered = useMemo(() => {
    if (!structure) return [];
    const q = query.trim().toLowerCase();
    if (!q) return structure.capitoli;
    return structure.capitoli
      .map((c) => ({
        ...c,
        argomenti: c.titolo.toLowerCase().includes(q)
          ? c.argomenti
          : c.argomenti.filter((a) => a.titolo.toLowerCase().includes(q)),
      }))
      .filter((c) => c.argomenti.length > 0);
  }, [structure, query]);

  const searching = query.trim() !== "";

  function toggle(id: string, open?: boolean) {
    setExpanded((prev) => {
      const next = new Set(prev);
      const shouldOpen = open ?? !next.has(id);
      if (shouldOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function leaveDeleted(argomentoIds: string[]) {
    const nextId = closeTabs(formularioId, argomentoIds, argomentoId);
    if (argomentoId && argomentoIds.includes(argomentoId))
      navigateWorkspace(formularioId, nextId);
  }

  /* ---------- Mutations ---------- */

  function createCapitolo(titolo: string) {
    setCreatingCapitolo(false);
    toast.promise(
      request("/api/capitoli/create", {
        method: "POST",
        body: form({ titolo, formularioId }),
      }).then(() => reload()),
      {
        loading: "Creazione in corso...",
        success: "Capitolo creato con successo!",
        error: "Errore durante la creazione del capitolo.",
        position: "bottom-center",
      },
    );
  }

  function createArgomento(capitolo: StructureCapitolo) {
    toggle(capitolo.id, true);
    toast.promise(
      request("/api/argomenti/create", {
        method: "POST",
        body: JSON.stringify({ capitoloId: capitolo.id }),
      }).then(async (res) => {
        const { beautifulId } = await res.json();
        await reload();
        onNavigate?.();
        navigateWorkspace(formularioId, beautifulId);
      }),
      {
        loading: "Creazione in corso...",
        success: "Argomento creato con successo!",
        error: "Errore durante la creazione dell'argomento.",
        position: "bottom-center",
      },
    );
  }

  function renameCapitolo(capitolo: StructureCapitolo, titolo: string) {
    setRenaming(null);
    if (titolo === capitolo.titolo) return;
    toast.promise(
      request("/api/capitoli/update", {
        method: "PUT",
        body: form({ titolo, capitoloId: capitolo.id }),
      }).then(() => reload()),
      {
        loading: "Modifica in corso...",
        success: "Capitolo rinominato con successo!",
        error: "Errore durante la modifica del capitolo.",
        position: "bottom-center",
      },
    );
  }

  function move(
    kind: "capitolo" | "argomento",
    id: string,
    direction: "up" | "down",
  ) {
    const url =
      kind === "capitolo" ? "/api/capitoli/move" : "/api/argomenti/move";
    toast.promise(
      request(url, {
        method: "POST",
        body: form({ [`${kind}Id`]: id, direction }),
      }).then(() => reload()),
      {
        loading: "Spostamento in corso...",
        success: "Spostato con successo!",
        error: "Errore durante lo spostamento.",
        position: "bottom-center",
      },
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);

    const isCapitolo = target.kind === "capitolo";
    const removed = isCapitolo
      ? target.capitolo.argomenti.map((a) => a.id)
      : [target.argomento.id];

    toast.promise(
      request(isCapitolo ? "/api/capitoli/delete" : "/api/argomenti/delete", {
        method: "DELETE",
        body: isCapitolo
          ? form({ capitoloId: target.capitolo.id })
          : form({ argomentoId: target.argomento.id }),
      }).then(async () => {
        leaveDeleted(removed);
        await reload();
      }),
      {
        loading: "Eliminazione in corso...",
        success: isCapitolo
          ? "Capitolo eliminato con successo!"
          : "Argomento eliminato con successo!",
        error: "Errore durante l'eliminazione.",
        position: "bottom-center",
      },
    );
  }

  /* ---------- Keyboard ---------- */

  // "Aggiungi nuovo": argomento in the active capitolo, otherwise a capitolo
  useEffect(() => {
    if (!editable) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isA = e.key.toLowerCase() === "a" || e.code === "KeyA";
      if (!isA || !e.shiftKey || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      e.stopPropagation();
      const capitolo = structure?.capitoli.find(
        (c) => c.id === activeCapitoloId,
      );
      if (capitolo) createArgomento(capitolo);
      else {
        onOpen();
        setQuery("");
        setCreatingCapitolo(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  });

  // Arrow-key navigation across visible tree rows
  function handleTreeKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      treeRef.current?.querySelectorAll<HTMLElement>("[data-tree-item]") ?? [],
    );
    const current = document.activeElement as HTMLElement | null;
    const index = current ? items.indexOf(current) : -1;
    if (index === -1) return;

    const capitoloId = current?.dataset.capitolo;
    const isFolder = current?.dataset.treeItem === "folder";

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        items[Math.min(items.length - 1, index + 1)]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        items[Math.max(0, index - 1)]?.focus();
        break;
      case "Home":
        e.preventDefault();
        items[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        items.at(-1)?.focus();
        break;
      case "F2":
        if (isFolder && capitoloId && editable) {
          e.preventDefault();
          setRenaming(capitoloId);
        }
        break;
      case "ArrowRight":
        if (isFolder && capitoloId) {
          e.preventDefault();
          if (expanded.has(capitoloId)) items[index + 1]?.focus();
          else toggle(capitoloId, true);
        }
        break;
      case "ArrowLeft":
        if (!capitoloId) break;
        e.preventDefault();
        if (isFolder) toggle(capitoloId, false);
        else
          items
            .find(
              (el) =>
                el.dataset.treeItem === "folder" &&
                el.dataset.capitolo === capitoloId,
            )
            ?.focus();
        break;
    }
  }

  /* ---------- Render ---------- */

  const rowMenu = (
    key: string,
    items: React.ReactNode,
    extra?: React.ReactNode,
  ) =>
    editable && (
      <div
        className={cn(
          "flex shrink-0 items-center opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100",
          menuFor === key && "opacity-100",
        )}
      >
        {extra}
        <DropdownMenu
          open={menuFor === key}
          onOpenChange={(open) => setMenuFor(open ? key : null)}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              tabIndex={-1}
              className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Ellipsis size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            {items}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

  const renderArgomento = (
    capitolo: StructureCapitolo,
    argomento: StructureArgomento,
    index: number,
  ) => {
    const active = argomento.id === argomentoId;
    const label = active && activeTitle ? activeTitle : argomento.titolo;
    const key = `a-${argomento.id}`;

    return (
      <div
        key={argomento.id}
        role="treeitem"
        aria-selected={active}
        onContextMenu={(e) => {
          if (!editable) return;
          e.preventDefault();
          setMenuFor(key);
        }}
        className={cn(
          "group/row flex min-w-0 items-center gap-0.5 rounded-sm pr-1 transition-colors",
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <a
          href={`/editor/${argomento.id}`}
          data-tree-item="file"
          data-capitolo={capitolo.id}
          data-active={active}
          aria-current={active ? "page" : undefined}
          onPointerEnter={() => prefetchArgomento(argomento.id)}
          onClick={(e) => {
            handleWorkspaceClick(e, formularioId, argomento.id);
            onNavigate?.();
          }}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm py-1 pl-4 text-[0.8rem] outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <FileText
            size={13}
            className={cn("shrink-0", active ? "text-primary" : "opacity-70")}
          />
          <span
            className={cn(
              "truncate",
              active && "font-medium",
              argomento.empty && !active && "italic opacity-70",
            )}
          >
            {label}
          </span>
        </a>
        {rowMenu(
          key,
          <>
            {index > 0 && (
              <DropdownMenuItem
                onSelect={() => move("argomento", argomento.id, "up")}
              >
                <ArrowUp /> Sposta su
              </DropdownMenuItem>
            )}
            {index < capitolo.argomenti.length - 1 && (
              <DropdownMenuItem
                onSelect={() => move("argomento", argomento.id, "down")}
              >
                <ArrowDown /> Sposta giù
              </DropdownMenuItem>
            )}
            {capitolo.argomenti.length > 1 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                setPendingDelete({ kind: "argomento", argomento: argomento })
              }
            >
              <Trash2 /> Elimina
            </DropdownMenuItem>
          </>,
        )}
      </div>
    );
  };

  const renderCapitolo = (capitolo: StructureCapitolo, index: number) => {
    const open = searching || expanded.has(capitolo.id);
    const containsActive = capitolo.id === activeCapitoloId;
    const key = `c-${capitolo.id}`;
    const total = structure?.capitoli.length ?? 0;

    return (
      <div key={capitolo.id} role="group" className="flex min-w-0 flex-col">
        {renaming === capitolo.id ? (
          <InlineInput
            icon={<FolderOpen size={14} className="shrink-0 text-primary/80" />}
            defaultValue={capitolo.titolo}
            onSubmit={(titolo) => renameCapitolo(capitolo, titolo)}
            onCancel={() => setRenaming(null)}
          />
        ) : (
          <div
            role="treeitem"
            aria-selected={false}
            aria-expanded={open}
            onContextMenu={(e) => {
              if (!editable) return;
              e.preventDefault();
              setMenuFor(key);
            }}
            className="group/row flex min-w-0 items-center gap-0.5 rounded-sm pr-1 transition-colors hover:bg-accent/60"
          >
            <button
              type="button"
              data-tree-item="folder"
              data-capitolo={capitolo.id}
              onClick={() => toggle(capitolo.id)}
              onDoubleClick={() => editable && setRenaming(capitolo.id)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1 rounded-sm py-1 pl-1 text-left text-[0.8rem] outline-none focus-visible:ring-1 focus-visible:ring-ring",
                containsActive && !open
                  ? "font-medium text-foreground"
                  : "text-foreground/90",
              )}
            >
              <ChevronRight
                size={14}
                className={cn(
                  "shrink-0 text-muted-foreground transition-transform duration-150",
                  open && "rotate-90",
                )}
              />
              {open ? (
                <FolderOpen size={14} className="shrink-0 text-primary/80" />
              ) : (
                <Folder size={14} className="shrink-0 text-primary/80" />
              )}
              <span className="truncate">{capitolo.titolo}</span>
            </button>
            {rowMenu(
              key,
              <>
                <DropdownMenuItem onSelect={() => createArgomento(capitolo)}>
                  <FilePlus /> Nuovo argomento
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRenaming(capitolo.id)}>
                  <PenLine /> Rinomina
                </DropdownMenuItem>
                {index > 0 && (
                  <DropdownMenuItem
                    onSelect={() => move("capitolo", capitolo.id, "up")}
                  >
                    <ArrowUp /> Sposta su
                  </DropdownMenuItem>
                )}
                {index < total - 1 && (
                  <DropdownMenuItem
                    onSelect={() => move("capitolo", capitolo.id, "down")}
                  >
                    <ArrowDown /> Sposta giù
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() =>
                    setPendingDelete({ kind: "capitolo", capitolo: capitolo })
                  }
                >
                  <Trash2 /> Elimina
                </DropdownMenuItem>
              </>,
              <button
                type="button"
                tabIndex={-1}
                title="Nuovo argomento"
                onClick={() => createArgomento(capitolo)}
                className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <FilePlus size={13} />
              </button>,
            )}
          </div>
        )}

        {open && (
          <div className="ml-[0.7rem] flex min-w-0 flex-col gap-px border-l border-border/60 pl-1">
            {capitolo.argomenti.length === 0 && (
              <p className="py-1 pl-5 text-xs italic text-muted-foreground">
                Vuoto
              </p>
            )}
            {capitolo.argomenti.map((argomento, i) =>
              renderArgomento(capitolo, argomento, i),
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTree = () => {
    if (error)
      return (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          Impossibile caricare la struttura.
        </p>
      );

    if (!structure)
      return (
        <div className="flex flex-col gap-1.5 px-1 py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      );

    return (
      <>
        {filtered.length === 0 && !creatingCapitolo && (
          <div className="flex flex-col items-start gap-2 px-2 py-2">
            <p className="text-xs text-muted-foreground">
              {searching ? "Nessun risultato." : "Nessun capitolo."}
            </p>
            {editable && !searching && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatingCapitolo(true)}
              >
                <FolderPlus size={14} /> Nuovo capitolo
              </Button>
            )}
          </div>
        )}
        {filtered.map(renderCapitolo)}
        {creatingCapitolo && (
          <InlineInput
            icon={<Folder size={14} className="shrink-0 text-primary/80" />}
            placeholder="Titolo del capitolo"
            onSubmit={createCapitolo}
            onCancel={() => setCreatingCapitolo(false)}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col bg-background select-none">
      <div className="flex min-h-14 md:min-h-15 shrink-0 items-center gap-2 border-b px-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7 md:size-8 shrink-0"
          title="Torna alla home"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="size-3.5 md:size-4" />
          </Link>
        </Button>
        {structure ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarImage
                src={structure.photoURL ?? undefined}
                alt={structure.nomeAutore}
              />
              <AvatarFallback className="text-[0.65rem] font-medium">
                {structure.nomeAutore.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className="truncate text-sm font-semibold"
              title={structure.titolo}
            >
              {structure.titolo}
            </span>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="size-6 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-2 py-2">
        <div className="relative min-w-0 flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
              if (e.key === "ArrowDown") {
                e.preventDefault();
                treeRef.current
                  ?.querySelector<HTMLElement>("[data-tree-item]")
                  ?.focus();
              }
            }}
            placeholder="Cerca argomento"
            className="h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-7 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring dark:bg-input/30"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {editable && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            title="Nuovo capitolo"
            onClick={() => {
              setQuery("");
              setCreatingCapitolo(true);
            }}
          >
            <FolderPlus size={14} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          title="Comprimi tutto"
          onClick={() => setExpanded(new Set())}
        >
          <ChevronsDownUp size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          title="Chiudi explorer (Alt+E)"
          onClick={onClose}
        >
          <PanelLeftClose size={14} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t">
        <div
          ref={treeRef}
          role="tree"
          className="flex min-w-0 flex-col gap-px p-1.5"
          onKeyDown={handleTreeKeyDown}
        >
          {renderTree()}
        </div>
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {pendingDelete?.kind === "capitolo"
              ? `Sei sicuro di voler eliminare "${pendingDelete.capitolo.titolo}" e tutti i suoi argomenti? Questa azione non è reversibile.`
              : `Sei sicuro di voler eliminare "${pendingDelete?.argomento.titolo}"? Questa azione non è reversibile.`}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Chiudi</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InlineInput({
  icon,
  defaultValue = "",
  placeholder,
  onSubmit,
  onCancel,
}: Readonly<{
  icon: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}>) {
  const done = useRef(false);

  const finish = (value: string | null) => {
    if (done.current) return;
    done.current = true;
    if (value === null) onCancel();
    else onSubmit(value.trim());
  };

  return (
    <div className="flex min-w-0 items-center gap-1 py-0.5 pl-5 pr-1">
      {icon}
      <input
        autoFocus
        defaultValue={defaultValue}
        placeholder={placeholder}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") finish(e.currentTarget.value);
          if (e.key === "Escape") finish(null);
        }}
        onBlur={(e) => {
          const value = e.currentTarget.value.trim();
          finish(value === "" && !defaultValue ? null : value);
        }}
        className="h-6 min-w-0 flex-1 rounded-sm border border-ring bg-background px-1.5 text-[0.8rem] outline-none"
      />
    </div>
  );
}
