"use client"
import { Button } from "@/src/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Book, Bookmark, ChevronRight, Search, TableOfContents } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

type Formulario = {
    id: string
    titolo: string
}

type Capitolo = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    sortOrder: number
}

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    capitoloId: string
    capitoloTitolo?: string
    sortOrder: number
    content: string
}

export function SearchLogic() {

    const router = useRouter();
    const [open, setOpen] = useState(false);

    const [formulari, setFormulari] = useState<Formulario[]>([]);
    const [capitoli, setCapitoli] = useState<Capitolo[]>([]);
    const [argomenti, setArgomenti] = useState<Argomento[]>([]);

    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, []);

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
                setFormulari([]);
                setCapitoli([]);
                setArgomenti([]);
                setLoading(false)
            }
        }, 1000)

        return () => clearTimeout(timeout)
    }, [search])


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
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command shouldFilter={false}>
                    <div className="relative">
                        <CommandInput
                            placeholder={loading ? "Ricerca in corso..." : "Inserisci un termine di ricerca"}
                            onValueChange={setSearch}
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner />
                            </div>
                        )}
                    </div>
                    <CommandList>
                        {formulari.length > 0 && (
                            <CommandGroup heading="Formulari">
                                {formulari.map((f) => (
                                    <CommandItem value={`f-${String(f.id)}`} key={f.id} onSelect={() => router.push(`/formulario/${f.id}`)}>
                                        <Book />
                                        <span>{f.titolo}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {capitoli.length > 0 && (
                            <CommandGroup heading="Capitoli">
                                {capitoli.map((c) => (
                                    <CommandItem value={`c-${String(c.id)}`} key={c.id} onSelect={() => router.push(`/capitolo/${c.id}`)}>
                                        <Bookmark />
                                        <div className="flex flex-col justify-center w-full">
                                            <span>{c.titolo}</span>
                                            <span className="text-xs text-muted-foreground">{c.formularioTitolo}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {argomenti.length > 0 && (
                            <CommandGroup heading="Argomenti">
                                {argomenti.map((a) => (
                                    <CommandItem value={`a-${String(a.id)}`} key={a.id} onSelect={() => router.push(`/editor/${a.id}`)}>
                                        <TableOfContents />
                                        <div className="flex flex-col justify-center w-full">
                                            <span>{a.titolo}</span>
                                            <div className="inline-flex items-center">
                                                <span className="text-xs text-muted-foreground">{a.formularioTitolo}</span>
                                                <ChevronRight className="opacity-70 mt-1" />
                                                <span className="text-xs text-muted-foreground">{a.capitoloTitolo}</span>
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