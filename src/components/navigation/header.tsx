"use client"

import { Book, Bookmark, ChevronRight, Pi, Search, TableOfContents } from "lucide-react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import { Button } from "@/src/components/ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/src/components/ui/command"
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
    LogOutIcon,
} from "lucide-react"
import { findFormularioByTitle, findCapitoloByTitle, findArgomentoByTitle } from "@/src/lib/formulari";
import { Spinner } from "../ui/spinner";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd"

type Formulario = {
    id: string
    titolo: string
}

type Capitolo = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
}

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    capitoloId: string
    capitoloTitolo?: string
}

export function Header() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    const [formulari, setFormulari] = useState<Formulario[]>([]);
    const [capitoli, setCapitoli] = useState<Capitolo[]>([]);
    const [argomenti, setArgomenti] = useState<Argomento[]>([]);

    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setName(localStorage.getItem("name"));
        setPhotoURL(localStorage.getItem("photoURL"));

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        localStorage.removeItem("photoURL");

        router.refresh();
        router.push("/");
    };

    useEffect(() => {
        setLoading(true)

        const timeout = setTimeout(() => {
            if (search.length > 0) {
                Promise.all([
                    findFormularioByTitle(search),
                    findCapitoloByTitle(search),
                    findArgomentoByTitle(search),
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
        <div className="flex flex-row justify-between items-center py-3">
            <Link href="/">
                <Button variant="ghost" size="icon">
                    <Pi />
                </Button>
            </Link>
            <div className="flex items-center gap-2">
                {(name && photoURL) && (
                    <>
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
                                                    <CommandItem value={`f-${String(f.id)}`} key={f.id} onSelect={() => router.push(`/home/${f.id}`)}>
                                                        <Book />
                                                        <span>{f.titolo}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                        {capitoli.length > 0 && (
                                            <CommandGroup heading="Capitoli">
                                                {capitoli.map((c) => (
                                                    <CommandItem value={`c-${String(c.id)}`} key={c.id} onSelect={() => router.push(`/home/${c.formularioId}/${c.id}`)}>
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
                                                    <CommandItem value={`a-${String(a.id)}`} key={a.id} onSelect={() => router.push(`/home/${a.formularioId}/${a.capitoloId}/${a.id}`)}>
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
                        <div className="h-6 border-l"></div>
                    </>
                )}
                <ModeToggle />
                <div className="h-6 border-l"></div>
                {photoURL === null ? (
                    <Link href="/login">
                        <Button variant="default" className="w-fit">
                            Accedi
                        </Button>
                    </Link>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={photoURL} alt="foto profilo" />
                                    <AvatarFallback>{name?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{name}</DropdownMenuLabel>
                            <Link href="/home">
                                <DropdownMenuItem>
                                    <Book />
                                    Visualizza Formulari
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                <LogOutIcon />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}