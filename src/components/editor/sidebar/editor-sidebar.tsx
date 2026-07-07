"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Field } from "@/src/components/ui/field";
import { Label } from "@/src/components/ui/label";
import { InlineLatex } from "@/src/components/editor/preview/inline-latex";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import clsx from "clsx";
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  FileText,
  PanelLeftClose,
  PenLine,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface ArgomentoNode {
  id: string;
  titolo: string;
  sortOrder: number;
}

interface CapitoloNode {
  id: string;
  titolo: string;
  sortOrder: number;
  argomenti: ArgomentoNode[];
}

interface EditorSidebarProps {
  tree: CapitoloNode[];
  argomentoId: string;
  editable: boolean;
  formularioId: string;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  onSelectArgomento: (argId: string) => void;
}

export function EditorSidebar({
  tree,
  argomentoId,
  editable,
  formularioId,
  showSidebar,
  setShowSidebar,
  onSelectArgomento,
}: Readonly<EditorSidebarProps>) {
  const router = useRouter();

  // Collapsed chapters state: key is chapter ID, value is boolean (true if collapsed)
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  // Editing state for renaming chapter
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");

  // Dialog states
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleteChapterTitle, setDeleteChapterTitle] = useState("");

  const [deleteArgomentoId, setDeleteArgomentoId] = useState<string | null>(null);
  const [deleteArgomentoTitle, setDeleteArgomentoTitle] = useState("");

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleCreateChapter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("formularioId", formularioId);

    toast.promise(
      fetch("/api/capitoli/create", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        setIsAddChapterOpen(false);
        router.refresh();
        if (data.argomentoId) {
          onSelectArgomento(data.argomentoId);
        }
      }),
      {
        loading: "Creazione capitolo in corso...",
        success: "Capitolo creato con successo!",
        error: "Errore durante la creazione del capitolo.",
        position: "bottom-center",
      }
    );
  };

  const handleRenameChapter = async (chapterId: string) => {
    const formData = new FormData();
    formData.append("capitoloId", chapterId);
    formData.append("titolo", editChapterTitle);

    toast.promise(
      fetch("/api/capitoli/update", {
        method: "PUT",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        setEditingChapterId(null);
        router.refresh();
      }),
      {
        loading: "Ridenominazione capitolo...",
        success: "Capitolo rinominato con successo!",
        error: "Errore durante la rinomina del capitolo.",
        position: "bottom-center",
      }
    );
  };

  const handleMoveChapter = async (chapterId: string, direction: "up" | "down") => {
    const formData = new FormData();
    formData.append("capitoloId", chapterId);
    formData.append("direction", direction);

    toast.promise(
      fetch("/api/capitoli/move", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        router.refresh();
      }),
      {
        loading: "Spostamento capitolo...",
        success: "Capitolo spostato con successo!",
        error: "Errore durante lo spostamento.",
        position: "bottom-center",
      }
    );
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;

    const formData = new FormData();
    formData.append("capitoloId", deleteChapterId);

    toast.promise(
      fetch("/api/capitoli/delete", {
        method: "DELETE",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        // Check if the current argomento was in the deleted chapter
        const deletedChapter = tree.find((c) => c.id === deleteChapterId);
        const isCurrentArgDeleted = deletedChapter?.argomenti.some(
          (a) => a.id === argomentoId
        );

        setDeleteChapterId(null);

        if (isCurrentArgDeleted) {
          const remainingArgs = tree
            .filter((c) => c.id !== deleteChapterId)
            .flatMap((c) => c.argomenti);
          if (remainingArgs.length > 0) {
            onSelectArgomento(remainingArgs[0].id);
          } else {
            router.push("/home");
          }
        } else {
          router.refresh();
        }
      }),
      {
        loading: "Eliminazione capitolo...",
        success: "Capitolo eliminato con successo!",
        error: "Errore durante l'eliminazione del capitolo.",
        position: "bottom-center",
      }
    );
  };

  const handleCreateArgomento = async (chapterId: string) => {
    toast.promise(
      fetch("/api/argomenti/create", {
        method: "POST",
        body: JSON.stringify({ capitoloId: chapterId }),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        onSelectArgomento(data.beautifulId);
      }),
      {
        loading: "Creazione argomento...",
        success: "Argomento creato con successo!",
        error: "Errore durante la creazione dell'argomento.",
        position: "bottom-center",
      }
    );
  };

  const handleMoveArgomento = async (argId: string, direction: "up" | "down") => {
    const formData = new FormData();
    formData.append("argomentoId", argId);
    formData.append("direction", direction);

    toast.promise(
      fetch("/api/argomenti/move", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        router.refresh();
      }),
      {
        loading: "Spostamento argomento...",
        success: "Argomento spostato con successo!",
        error: "Errore durante lo spostamento.",
        position: "bottom-center",
      }
    );
  };

  const handleDeleteArgomento = async () => {
    if (!deleteArgomentoId) return;

    const formData = new FormData();
    formData.append("argomentoId", deleteArgomentoId);

    toast.promise(
      fetch("/api/argomenti/delete", {
        method: "DELETE",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        setDeleteArgomentoId(null);

        if (deleteArgomentoId === argomentoId) {
          const remainingArgs = tree
            .flatMap((c) => c.argomenti)
            .filter((a) => a.id !== deleteArgomentoId);
          if (remainingArgs.length > 0) {
            onSelectArgomento(remainingArgs[0].id);
          } else {
            router.push("/home");
          }
        } else {
          router.refresh();
        }
      }),
      {
        loading: "Eliminazione argomento...",
        success: "Argomento eliminato con successo!",
        error: "Errore durante l'eliminazione dell'argomento.",
        position: "bottom-center",
      }
    );
  };

  return (
    <aside
      className={clsx(
        "h-full border-r bg-card/60 backdrop-blur-md flex flex-col z-20 shrink-0 transition-all duration-300",
        {
          "absolute inset-y-0 left-0 w-72 shadow-xl border-r bg-background": showSidebar && typeof window !== "undefined" && window.innerWidth < 768,
          "w-72": showSidebar && (typeof window === "undefined" || window.innerWidth >= 768),
          "w-0 border-r-0 overflow-hidden": !showSidebar,
        }
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 md:h-15 items-center justify-between px-4 border-b shrink-0 select-none">
        <span className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[180px]">
          Capitoli & Argomenti
        </span>
        <div className="flex items-center gap-1">
          {editable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setIsAddChapterOpen(true)}
            >
              <Plus size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
            onClick={() => setShowSidebar(false)}
          >
            <PanelLeftClose size={16} />
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation Tree */}
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-1">
          {tree.map((chapter) => {
            const isCollapsed = collapsedChapters[chapter.id] ?? false;
            const isEditing = editingChapterId === chapter.id;

            return (
              <div key={chapter.id} className="flex flex-col gap-0.5">
                {/* Chapter Row */}
                <div
                  className={clsx(
                    "group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors select-none text-sm font-medium",
                    isEditing ? "bg-muted/30" : "cursor-pointer"
                  )}
                  onClick={() => !isEditing && toggleChapter(chapter.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Expand/Collapse Chevron */}
                    <span className="text-muted-foreground shrink-0 hover:text-foreground">
                      {isCollapsed ? (
                        <ChevronRight size={15} />
                      ) : (
                        <ChevronDown size={15} />
                      )}
                    </span>
                    <Bookmark size={14} className="text-primary/70 shrink-0" />
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={editChapterTitle}
                          onChange={(e) => setEditChapterTitle(e.target.value)}
                          className="h-7 py-0.5 px-2 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameChapter(chapter.id);
                            if (e.key === "Escape") setEditingChapterId(null);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 shrink-0 cursor-pointer"
                          onClick={() => handleRenameChapter(chapter.id)}
                        >
                          <Check size={14} className="text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0 shrink-0 cursor-pointer"
                          onClick={() => setEditingChapterId(null)}
                        >
                          <X size={14} className="text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span className="truncate text-foreground/90">
                        {chapter.titolo || "Senza titolo"}
                      </span>
                    )}
                  </div>

                  {/* Chapter Actions Dropdown */}
                  {editable && !isEditing && (
                    <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md p-0 cursor-pointer"
                          >
                            <EllipsisVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleCreateArgomento(chapter.id)}>
                            <Plus size={14} className="mr-2" />
                            Nuovo Argomento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingChapterId(chapter.id);
                              setEditChapterTitle(chapter.titolo || "");
                            }}
                          >
                            <PenLine size={14} className="mr-2" />
                            Rinomina
                          </DropdownMenuItem>
                          {chapter.sortOrder > 1 && (
                            <DropdownMenuItem onSelect={() => handleMoveChapter(chapter.id, "up")}>
                              <ArrowUp size={14} className="mr-2" />
                              Sposta Su
                            </DropdownMenuItem>
                          )}
                          {chapter.sortOrder < tree.length && (
                            <DropdownMenuItem onSelect={() => handleMoveChapter(chapter.id, "down")}>
                              <ArrowDown size={14} className="mr-2" />
                              Sposta Giù
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              setDeleteChapterId(chapter.id);
                              setDeleteChapterTitle(chapter.titolo || "Senza titolo");
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {/* Chapter Topics (Argomenti) */}
                {!isCollapsed && (
                  <div className="flex flex-col pl-6 pr-1 gap-0.5 border-l border-muted/60 ml-3.5 mt-0.5 mb-1.5">
                    {chapter.argomenti.map((argomento) => {
                      const isActive = argomento.id === argomentoId;

                      return (
                        <div
                          key={argomento.id}
                          className={clsx(
                            "group flex items-center justify-between py-1 px-2.5 rounded-md text-xs transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none pl-2"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
                          )}
                        >
                          <div
                            onClick={() => onSelectArgomento(argomento.id)}
                            className="flex-1 truncate min-w-0 py-0.5 flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText size={13} className="shrink-0 opacity-80" />
                            <span className="truncate">
                              {argomento.titolo ? (
                                <InlineLatex>{argomento.titolo}</InlineLatex>
                              ) : (
                                "Senza titolo"
                              )}
                            </span>
                          </div>

                          {/* Argument Actions Dropdown */}
                          {editable && (
                            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-md p-0 cursor-pointer"
                                  >
                                    <EllipsisVertical size={13} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {argomento.sortOrder > 1 && (
                                    <DropdownMenuItem onSelect={() => handleMoveArgomento(argomento.id, "up")}>
                                      <ArrowUp size={14} className="mr-2" />
                                      Sposta Su
                                    </DropdownMenuItem>
                                  )}
                                  {argomento.sortOrder < chapter.argomenti.length && (
                                    <DropdownMenuItem onSelect={() => handleMoveArgomento(argomento.id, "down")}>
                                      <ArrowDown size={14} className="mr-2" />
                                      Sposta Giù
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => {
                                      setDeleteArgomentoId(argomento.id);
                                      setDeleteArgomentoTitle(argomento.titolo || "Senza titolo");
                                    }}
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {chapter.argomenti.length === 0 && (
                      <span className="text-[10px] text-muted-foreground/60 italic pl-6 py-1 select-none">
                        Nessun argomento
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Chapter Deletion Confirmation Dialog */}
      <Dialog open={deleteChapterId !== null} onOpenChange={(open) => !open && setDeleteChapterId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina Capitolo</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Sei sicuro di voler eliminare &quot;{deleteChapterTitle}&quot; e tutti i suoi argomenti? Questa azione non è reversibile.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Annulla</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteChapter} className="cursor-pointer">
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Argument Deletion Confirmation Dialog */}
      <Dialog open={deleteArgomentoId !== null} onOpenChange={(open) => !open && setDeleteArgomentoId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina Argomento</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Sei sicuro di voler eliminare &quot;{deleteArgomentoTitle}&quot;? Questa azione non è reversibile.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Annulla</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteArgomento} className="cursor-pointer">
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chapter Creation Dialog */}
      <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
        <DialogContent className="sm:max-w-md">
          <form className="flex flex-col gap-6" onSubmit={handleCreateChapter}>
            <DialogHeader>
              <DialogTitle>Aggiungi nuovo capitolo</DialogTitle>
              <DialogDescription>
                Crea un nuovo capitolo nel formulario.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <Label htmlFor="chapter-title">Titolo del capitolo</Label>
              <Input id="chapter-title" name="titolo" placeholder="es. Elettrostatica" required />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer">Chiudi</Button>
              </DialogClose>
              <Button type="submit" className="cursor-pointer">Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
