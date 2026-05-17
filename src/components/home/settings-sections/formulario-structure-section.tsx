"use client"

import { cn } from "@/src/lib/utils";
import { AlertCircle, BookOpen, ChevronDown, ChevronRight, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "../../ui/spinner";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";

type StructureArgomento = {
    id: string
    titolo: string
    empty: boolean
    sortOrder: number
}

type StructureCapitolo = {
    id: string
    titolo: string
    sortOrder: number
    argomenti: StructureArgomento[]
}

type FormularioStructure = {
    capitoli: StructureCapitolo[]
    stats: {
        capitoliCount: number
        argomentiCount: number
        emptyCapitoliCount: number
        emptyArgomentiCount: number
        untitledArgomentiCount: number
    }
}

export function FormularioStructureSection({ formularioId }: Readonly<{ formularioId: string }>) {
    const router = useRouter();
    const [structure, setStructure] = useState<FormularioStructure>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [query, setQuery] = useState("");
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let ignore = false;

        async function fetchStructure() {
            setLoading(true);
            setError(undefined);

            try {
                const response = await fetch(`/api/formulari/${formularioId}/structure`);

                if (!response.ok) {
                    const { error: responseError } = await response.json();
                    throw new Error(responseError);
                }

                const data = await response.json();
                if (ignore) return;

                setStructure(data);
                setExpanded(
                    Object.fromEntries(
                        data.capitoli.map((capitolo: StructureCapitolo) => [capitolo.id, true])
                    )
                );
            } catch (err) {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : "Errore durante il caricamento della struttura.");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        fetchStructure();

        return () => {
            ignore = true;
        };
    }, [formularioId]);

    const filteredCapitoli = useMemo(() => {
        if (!structure) return [];

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

    if (loading) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-60 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <AlertCircle size={20} />
                <p>{error}</p>
            </div>
        );
    }

    if (!structure) return null;

    return (
        <div className="flex flex-col gap-5">
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

            {filteredCapitoli.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Nessun risultato nella struttura.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredCapitoli.map((capitolo) => {
                        const isExpanded = expanded[capitolo.id] ?? true;

                        return (
                            <div key={capitolo.id} className="rounded-md border">
                                <button
                                    type="button"
                                    onClick={() => setExpanded((prev) => ({ ...prev, [capitolo.id]: !isExpanded }))}
                                    className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm hover:bg-muted/50"
                                >
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    <BookOpen size={16} className="text-muted-foreground" />
                                    <span className="min-w-0 flex-1 truncate font-medium">{capitolo.titolo}</span>
                                    <Badge variant={capitolo.argomenti.length === 0 ? "outline" : "secondary"}>
                                        {capitolo.argomenti.length}
                                    </Badge>
                                </button>

                                {isExpanded && (
                                    <div className="border-t px-3 py-2">
                                        {capitolo.argomenti.length === 0 ? (
                                            <div className="py-2 pl-7 text-sm text-muted-foreground">Nessun argomento</div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {capitolo.argomenti.map((argomento) => (
                                                    <button
                                                        key={argomento.id}
                                                        type="button"
                                                        onClick={() => router.push(`/editor/${argomento.id}`)}
                                                        className="flex h-9 items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted/50"
                                                    >
                                                        <FileText size={15} className="text-muted-foreground" />
                                                        <span className="min-w-0 flex-1 truncate">{argomento.titolo}</span>
                                                        {argomento.empty && <Badge variant="outline">Vuoto</Badge>}
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
