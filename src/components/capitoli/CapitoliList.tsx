"use client"

import { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { CapitoliItem } from "@/src/components/capitoli/CapitoliItem"
import { getListCapitoli, getListArgomenti, createCapitolo, createArgomento } from "@/src/lib/formulari"
import { BookmarkX, Edit, GlobeIcon, Info, LockIcon, Plus, TableOfContents } from "lucide-react"
import { Skeleton } from "@/src/components/ui/skeleton"
import { TypographyH2, TypographyH3 } from "@/src/components/ui/typography"
import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog"
import { Field } from "@/src/components/ui/field"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/src/components/ui/empty"
import { toast } from "sonner"
import { Kbd, KbdGroup } from "../ui/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"

type Formulario = {
    id: string
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

type Capitolo = {
    id: string
    titolo: string
    formularioId: string
    argomentiCount?: number
}

export function CapitoliList({ formulario, capitolo }: Readonly<{ formulario?: Formulario; capitolo?: Capitolo; }>) {
    const [capitoli, setCapitoli] = useState<Capitolo[]>([])
    const [argomenti, setArgomenti] = useState<Capitolo[]>([])
    const [loading, setLoading] = useState(true)
    const [editable, setEditable] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (formulario && !capitolo) {
            const segments = globalThis.location.pathname.split("/").filter(Boolean);
            if (segments.length >= 3) {
                router.push(`/home/${segments[1]}`);
            }
            getListCapitoli(formulario).then((data) => {
                if (data.success) {
                    setCapitoli(data.capitoli)
                    setEditable(data.editable)
                    setLoading(false)
                } else {
                    redirect("/home");
                }
            })
        } else if (formulario && capitolo) {
            getListArgomenti(capitolo, formulario).then((data) => {
                if (data.success) {
                    setArgomenti(data.argomenti)
                    setEditable(data.editable)
                    setLoading(false)
                } else {
                    redirect("/home");
                }
            })
        } else {
            redirect("/home");
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)

    }, [open])

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        toast.promise(
            formulario && !capitolo
                ? createCapitolo(formData, formulario)
                : createArgomento(formData, capitolo),
            {
                loading: "Creazione in corso...",
                success: `${formulario && !capitolo ? "Capitolo" : "Argomento"} creato con successo!`,
                error: (err) => err?.message || `Errore durante la creazione ${formulario && !capitolo ? "del capitolo" : "dell'argomento"}.`,
                position: "bottom-center",
            },
        );

        setOpen(false)
    }

    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-4 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11.5 w-full" />
            ))}
        </div>
    );

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {(formulario && !capitolo) ? <BookmarkX /> : <TableOfContents />}
                </EmptyMedia>
                <EmptyTitle>{(formulario && !capitolo) ? "Nessun Capitolo" : "Nessun Argomento"}</EmptyTitle>
                <EmptyDescription>
                    {(formulario && !capitolo) ? `Non ci sono capitoli da mostrare in "${formulario?.titolo}".` : `Non ci sono argomenti da mostrare in "${capitolo?.titolo}".`}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    const renderCapitoli = () => (
        <div className="flex flex-col gap-4 w-full">
            {(formulario && !capitolo) && capitoli.length > 0 && capitoli.map((c) => (
                <CapitoliItem key={c.id} {...c} type={0} onOpen={() => { router.push(`/home/${formulario?.id}/${c.id}`) }} />
            ))}
            {(formulario && capitolo) && argomenti.length > 0 && argomenti.map((a) => (
                <CapitoliItem key={a.id} {...a} type={1} onOpen={() => { router.push(`/home/${formulario?.id}/${capitolo?.id}/${a.id}`) }} />
            ))}
            {(((formulario && !capitolo) && capitoli.length == 0) || ((formulario && capitolo) && argomenti.length == 0)) && (
                renderEmpty()
            )}
        </div>
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                {(formulario && !capitolo) ? <TypographyH2 className="w-full">{formulario?.titolo}</TypographyH2> : <TypographyH3>{capitolo?.titolo}</TypographyH3>}
                <div className="flex gap-2 items-center">
                    <Dialog>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Info size={16} />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent className="pr-1.5">
                                    <div className="flex items-center gap-2">
                                        Informazioni del formulario
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle asChild>
                                    <div className="flex gap-2 items-center">
                                        {formulario?.titolo}
                                        <div className="text-muted-foreground">{formulario?.visibilityPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
                                    </div>
                                </DialogTitle>
                                <DialogDescription asChild>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>by {formulario?.nomeAutore}</span>
                                        <span>Anno {formulario?.anno}</span>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <p>{formulario?.descrizione}</p>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Chiudi</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {editable && (
                        <>
                            {(((formulario && !capitolo) && capitoli.length > 0) || ((formulario && capitolo) && argomenti.length > 0)) && (
                                <Button variant="outline" size="icon">
                                    <Edit size={16} />
                                </Button>
                            )}
                            <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button variant="default">
                                                    <Plus size={16} />
                                                    <div className="hidden md:flex">{(formulario && !capitolo) ? "Aggiungi capitolo" : "Aggiungi argomento"}</div>
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent className="pr-1.5">
                                            <div className="flex items-center gap-2">
                                                {(formulario && !capitolo) ? "Aggiungi capitolo" : "Aggiungi argomento"}
                                                <KbdGroup className="hidden md:flex">
                                                    <Kbd>Ctrl</Kbd>
                                                    <span>+</span>
                                                    <Kbd>A</Kbd>
                                                </KbdGroup>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <DialogContent className="sm:max-w-md">
                                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>{(formulario && !capitolo) ? "Aggiungi nuovo capitolo" : "Aggiungi nuovo argomento"}</DialogTitle>
                                            <DialogDescription>
                                                {(formulario && !capitolo) ? <span>Crea un nuovo capitolo in "{formulario?.titolo}"</span> : <span>Crea un nuovo argomento in "{capitolo?.titolo}"</span>}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Field>
                                            <Label htmlFor="titolo-1">{(formulario && !capitolo) ? "Titolo del nuovo capitolo" : "Titolo del nuovo argomento"}</Label>
                                            <Input id="titolo-1" name="titolo" />
                                        </Field>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Chiudi</Button>
                                            </DialogClose>
                                            <Button type="submit">Salva</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>
            {loading ? renderLoadingSkeleton() : renderCapitoli()}
        </div>
    )
}