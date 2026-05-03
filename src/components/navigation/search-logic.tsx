"use client"
import { Button } from "@/src/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Book, Bookmark, ChevronRight, Clock, Search, TableOfContents, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

const STORAGE_KEY = "search-history"
const MAX_HISTORY = 8

type Formulario = { id: string; titolo: string }
type Capitolo = { id: string; titolo: string; formularioId: string; formularioTitolo?: string; sortOrder: number }
type Argomento = { id: string; titolo: string; formularioId: string; formularioTitolo?: string; capitoloId: string; capitoloTitolo?: string; sortOrder: number; content: string }

function loadHistory(): string[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    } catch {
        return []
    }
}

function saveToHistory(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const prev = loadHistory().filter((t) => t !== trimmed)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed, ...prev].slice(0, MAX_HISTORY)))
}

function removeFromHistory(term: string) {
    const updated = loadHistory().filter((t) => t !== term)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function SearchLogic() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [formulari, setFormulari] = useState<Formulario[]>([])
    const [capitoli, setCapitoli] = useState<Capitolo[]>([])
    const [argomenti, setArgomenti] = useState<Argomento[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<string[]>([])

    useEffect(() => {
        if (open) setHistory(loadHistory())
    }, [open])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        setLoading(true)
        const timeout = setTimeout(() => {
            if (search.length > 0) {
                Promise.all([
                    fetch(`/api/formulari/search?titolo=${encodeURIComponent(search)}`).then(r => r.json()),
                    fetch(`/api/capitoli/search?titolo=${encodeURIComponent(search)}`).then(r => r.json()),
                    fetch(`/api/argomenti/search?titolo=${encodeURIComponent(search)}`).then(r => r.json()),
                ]).then(([formulari, capitoli, argomenti]) => {
                    setFormulari(formulari || [])
                    setCapitoli(capitoli || [])
                    setArgomenti(argomenti || [])
                    setLoading(false)
                })
            } else {
                setFormulari([])
                setCapitoli([])
                setArgomenti([])
                setLoading(false)
            }
        }, 500)
        return () => clearTimeout(timeout)
    }, [search])

    const handleOpenChange = useCallback((val: boolean) => {
        if (!val && search.trim().length > 0) {
            saveToHistory(search)
            setHistory(loadHistory())
        }
        if (!val) setSearch("")
        setOpen(val)
    }, [search])

    const handleNavigate = useCallback((path: string) => {
        if (search.trim()) {
            saveToHistory(search)
            setHistory(loadHistory())
        }
        setOpen(false)
        setSearch("")
        router.push(path)
    }, [search, router])

    const handleRemoveHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation()
        removeFromHistory(term)
        setHistory(loadHistory())
    }

    const showHistory = search.length === 0 && history.length > 0
    const hasResults = formulari.length > 0 || capitoli.length > 0 || argomenti.length > 0

    return (
        <div className="flex flex-col gap-4">
            <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
                <Search />
                <span className="hidden md:flex">Cerca nei tuoi formulari</span>
                <KbdGroup className="hidden md:flex">
                    <Kbd>Ctrl</Kbd>
                    <span>+</span>
                    <Kbd>K</Kbd>
                </KbdGroup>
            </Button>
            <CommandDialog open={open} onOpenChange={handleOpenChange}>
                <Command shouldFilter={false}>
                    <div className="relative">
                        <CommandInput
                            placeholder={loading ? "Ricerca in corso..." : "Inserisci un termine di ricerca"}
                            value={search}
                            onValueChange={setSearch}
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner />
                            </div>
                        )}
                    </div>
                    <CommandList>
                        {/* Cronologia — visibile solo quando il campo è vuoto */}
                        {showHistory && (
                            <CommandGroup heading="Ricerche recenti">
                                {history.map((term) => (
                                    <CommandItem
                                        key={term}
                                        value={`history-${term}`}
                                        onSelect={() => setSearch(term)}
                                        className="flex items-center justify-between group [&_svg.lucide-check]:hidden"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{term}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemoveHistory(e, term)}
                                            aria-label={`Rimuovi "${term}" dalla cronologia`}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Empty state — solo se c'è testo ma nessun risultato */}
                        {!showHistory && !hasResults && (
                            <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
                        )}

                        {formulari.length > 0 && search.length > 0 && (
                            <CommandGroup heading="Formulari">
                                {formulari.map((f) => (
                                    <CommandItem value={`f-${f.id}`} key={f.id} onSelect={() => handleNavigate(`/formulario/${f.id}`)}>
                                        <Book />
                                        <span>{f.titolo}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {capitoli.length > 0 && search.length > 0 && (
                            <CommandGroup heading="Capitoli">
                                {capitoli.map((c) => (
                                    <CommandItem value={`c-${c.id}`} key={c.id} onSelect={() => handleNavigate(`/capitolo/${c.id}`)}>
                                        <Bookmark />
                                        <div className="flex flex-col justify-center w-full">
                                            <span>{c.titolo}</span>
                                            <span className="text-xs text-muted-foreground text-nowrap">{c.formularioTitolo}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {argomenti.length > 0 && search.length > 0 && (
                            <CommandGroup heading="Argomenti">
                                {argomenti.map((a) => (
                                    <CommandItem value={`a-${a.id}`} key={a.id} onSelect={() => handleNavigate(`/editor/${a.id}`)}>
                                        <TableOfContents />
                                        <div className="flex flex-col justify-center w-full">
                                            <span>{a.titolo}</span>
                                            <div className="inline-flex items-center">
                                                <span className="text-xs text-muted-foreground text-nowrap">{a.formularioTitolo}</span>
                                                <ChevronRight className="opacity-70 mt-0.5" />
                                                <span className="text-xs text-muted-foreground text-nowrap">{a.capitoloTitolo}</span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    )
}