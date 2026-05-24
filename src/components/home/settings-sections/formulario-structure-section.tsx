"use client"

import { cn } from "@/src/lib/utils";
import { Bookmark, ChevronDown, ChevronRight, FileText, GripVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { FormularioStructure, StructureCapitolo } from "./types";

export function FormularioStructureSection(
    { editable, structure, onStructureChange }:
        Readonly<{
            editable: boolean;
            structure: FormularioStructure;
            onStructureChange: (structure: FormularioStructure) => void;
        }>
) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [draggedArgomentoId, setDraggedArgomentoId] = useState<string>();
    const [dropTarget, setDropTarget] = useState<{ capitoloId: string; index: number }>();
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        Object.fromEntries(structure.capitoli.map((capitolo) => [capitolo.id, true]))
    );

    const filteredCapitoli = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return structure.capitoli;

        return structure.capitoli
            .map((capitolo) => {
                const capitoloMatches = capitolo.titolo.toLowerCase().includes(normalizedQuery);
                const argomenti = capitolo.argomenti.filter((argomento) =>
                    argomento.titolo.toLowerCase().includes(normalizedQuery)
                );

                return capitoloMatches ? capitolo : { ...capitolo, argomenti };
            })
            .filter((capitolo) => capitolo.titolo.toLowerCase().includes(normalizedQuery) || capitolo.argomenti.length > 0);
    }, [query, structure]);

    const isFiltering = query.trim().length > 0;
    const canDrag = editable && !isFiltering;

    function handleDrop(capitoloId: string, index: number) {
        if (!draggedArgomentoId || !canDrag) return;

        const nextStructure = moveArgomento(structure, draggedArgomentoId, capitoloId, index);
        if (nextStructure === structure) {
            setDraggedArgomentoId(undefined);
            setDropTarget(undefined);
            return;
        }

        const previousStructure = structure;
        onStructureChange(nextStructure);
        setDraggedArgomentoId(undefined);
        setDropTarget(undefined);

        const formData = new FormData();
        formData.append("argomentoId", draggedArgomentoId);
        formData.append("capitoloId", capitoloId);
        formData.append("index", String(index));

        const reorderRequest = fetch("/api/argomenti/reorder", {
                method: "POST",
                body: formData,
            }).then(async (response) => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text);
                }
            }).catch((error) => {
                onStructureChange(previousStructure);
                throw error;
            });

        toast.promise(
            reorderRequest,
            {
                loading: "Spostamento in corso...",
                success: "Argomento spostato.",
                error: "Errore durante lo spostamento dell'argomento.",
                position: "bottom-center",
            },
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <StructureStat label="Capitoli" value={structure.stats.capitoliCount} />
                <StructureStat label="Argomenti" value={structure.stats.argomentiCount} />
                <StructureStat label="Capitoli vuoti" value={structure.stats.emptyCapitoliCount} muted />
                <StructureStat label="Argomenti vuoti" value={structure.stats.emptyArgomentiCount} muted />
                <StructureStat label="Senza titolo" value={structure.stats.untitledArgomentiCount} muted />
            </div>

            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cerca capitoli o argomenti..."
                    className="pl-9"
                />
            </div>

            {editable && isFiltering && (
                <p className="text-xs text-muted-foreground">
                    Rimuovi la ricerca per riordinare gli argomenti.
                </p>
            )}

            {filteredCapitoli.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Nessun risultato nella struttura.
                </div>
            ) : (
                <div className="flex min-w-0 flex-col gap-2">
                    {filteredCapitoli.map((capitolo) => {
                        const isExpanded = expanded[capitolo.id] ?? true;

                        return (
                            <div key={capitolo.id} className="min-w-0 overflow-hidden rounded-md border">
                                <button
                                    type="button"
                                    onClick={() => setExpanded((prev) => ({ ...prev, [capitolo.id]: !isExpanded }))}
                                    className="flex h-11 w-full min-w-0 items-center gap-2 overflow-hidden px-3 text-left text-sm hover:bg-muted/50"
                                >
                                    {isExpanded ? <ChevronDown size={16} className="shrink-0" /> : <ChevronRight size={16} className="shrink-0" />}
                                    <Bookmark size={16} className="shrink-0 text-muted-foreground" />
                                    <span className="block w-0 min-w-0 flex-1 truncate font-medium">{capitolo.titolo}</span>
                                    <Badge variant={capitolo.argomenti.length === 0 ? "outline" : "secondary"} className="shrink-0">
                                        {capitolo.argomenti.length}
                                    </Badge>
                                </button>

                                {isExpanded && (
                                    <div
                                        className={cn(
                                            "min-w-0 border-t px-3 py-2",
                                            canDrag && dropTarget?.capitoloId === capitolo.id && dropTarget.index === capitolo.argomenti.length && "bg-muted/40"
                                        )}
                                        onDragOver={(event) => {
                                            if (!canDrag) return;
                                            event.preventDefault();
                                            setDropTarget({ capitoloId: capitolo.id, index: capitolo.argomenti.length });
                                        }}
                                        onDrop={() => handleDrop(capitolo.id, capitolo.argomenti.length)}
                                    >
                                        {capitolo.argomenti.length === 0 ? (
                                            <div className="py-2 pl-7 text-sm text-muted-foreground">Nessun argomento</div>
                                        ) : (
                                            <div className="flex min-w-0 flex-col gap-1">
                                                {capitolo.argomenti.map((argomento, index) => (
                                                    <button
                                                        key={argomento.id}
                                                        type="button"
                                                        draggable={canDrag}
                                                        onDragStart={(event) => {
                                                            if (!canDrag) return;
                                                            event.dataTransfer.effectAllowed = "move";
                                                            event.dataTransfer.setData("text/plain", argomento.id);
                                                            setDraggedArgomentoId(argomento.id);
                                                        }}
                                                        onDragEnd={() => {
                                                            setDraggedArgomentoId(undefined);
                                                            setDropTarget(undefined);
                                                        }}
                                                        onDragOver={(event) => {
                                                            if (!canDrag) return;
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            setDropTarget({ capitoloId: capitolo.id, index });
                                                        }}
                                                        onDrop={(event) => {
                                                            event.stopPropagation();
                                                            handleDrop(capitolo.id, index);
                                                        }}
                                                        onClick={() => router.push(`/editor/${argomento.id}`)}
                                                        className={cn(
                                                            "flex h-9 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm hover:bg-muted/50",
                                                            canDrag && "cursor-grab active:cursor-grabbing",
                                                            draggedArgomentoId === argomento.id && "opacity-50",
                                                            dropTarget?.capitoloId === capitolo.id && dropTarget.index === index && draggedArgomentoId !== argomento.id && "bg-accent"
                                                        )}
                                                    >
                                                        {editable && <GripVertical size={14} className="shrink-0 text-muted-foreground" />}
                                                        <FileText size={15} className="shrink-0 text-muted-foreground" />
                                                        <span className="block w-0 min-w-0 flex-1 truncate">{argomento.titolo}</span>
                                                        {argomento.empty && <Badge variant="outline" className="shrink-0">Vuoto</Badge>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function moveArgomento(structure: FormularioStructure, argomentoId: string, targetCapitoloId: string, targetIndex: number) {
    const sourceCapitolo = structure.capitoli.find((capitolo) =>
        capitolo.argomenti.some((argomento) => argomento.id === argomentoId)
    );
    const targetCapitolo = structure.capitoli.find((capitolo) => capitolo.id === targetCapitoloId);

    if (!sourceCapitolo || !targetCapitolo) return structure;

    const movedArgomento = sourceCapitolo.argomenti.find((argomento) => argomento.id === argomentoId);
    if (!movedArgomento) return structure;

    const isSameCapitolo = sourceCapitolo.id === targetCapitoloId;
    const sourceIndex = sourceCapitolo.argomenti.findIndex((argomento) => argomento.id === argomentoId);
    const normalizedTargetIndex = isSameCapitolo && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;

    if (isSameCapitolo && sourceIndex === normalizedTargetIndex) return structure;

    const capitoli = structure.capitoli.map((capitolo): StructureCapitolo => {
        if (capitolo.id !== sourceCapitolo.id && capitolo.id !== targetCapitoloId) return capitolo;

        const argomenti = capitolo.argomenti.filter((argomento) => argomento.id !== argomentoId);

        if (capitolo.id === targetCapitoloId) {
            const boundedIndex = Math.max(0, Math.min(normalizedTargetIndex, argomenti.length));
            argomenti.splice(boundedIndex, 0, movedArgomento);
        }

        return {
            ...capitolo,
            argomenti: argomenti.map((argomento, index) => ({ ...argomento, sortOrder: index + 1 })),
        };
    });

    const argomenti = capitoli.flatMap((capitolo) => capitolo.argomenti);

    return {
        capitoli,
        stats: {
            ...structure.stats,
            emptyCapitoliCount: capitoli.filter((capitolo) => capitolo.argomenti.length === 0).length,
            emptyArgomentiCount: argomenti.filter((argomento) => argomento.empty).length,
            untitledArgomentiCount: argomenti.filter((argomento) => argomento.titolo === "Senza titolo").length,
        },
    };
}

function StructureStat({ label, value, muted }: Readonly<{ label: string; value: number; muted?: boolean }>) {
    return (
        <div className="rounded-md border px-3 py-2">
            <div className={cn("text-lg font-semibold leading-none", muted && value === 0 && "text-muted-foreground")}>
                {value}
            </div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
        </div>
    );
}
