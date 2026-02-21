"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/src/components/ui/skeleton"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { toast } from "sonner"
import { TypographyH4 } from "@/src/components/ui/typography"
import { Check, Copy, Edit, Eye, GlobeIcon, Info, LockIcon, Share } from "lucide-react"
import { changeVisibilityFormulario, getArgomentoFromId } from "@/src/lib/formulari"
import Editor from "@/src/components/editor"
import { redirect } from "next/navigation"
import { Qr } from "../ui/qr"
import { Field, FieldGroup } from "../ui/field"
import { Switch } from "../ui/switch"

type Formulario = {
    id: string
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    formularioTitolo?: string
    capitoloId: string
    capitoloTitolo?: string
}

export function ArgomentiView({ formulario, argomento }: Readonly<{ formulario?: Formulario, argomento?: Argomento }>) {
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [argomentoFull, setArgomentoFull] = useState<Argomento>()
    const [editable, setEditable] = useState(false)
    const [sharable, setSharable] = useState(false)

    const currentUrl = globalThis.window === undefined ? "" : globalThis.location.href

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        toast.success("Link copiato con successo.", { position: "bottom-center" })
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSwitchVisibility = (checked: boolean) => {
        toast.promise(
            changeVisibilityFormulario(checked),
            {
                loading: checked ? "Pubblicazione in corso..." : "Rimozione dalla pubblicazione in corso...",
                success: () => {
                    setSharable(checked)
                    return checked ? "Formulario pubblicato con successo!" : "Formulario rimosso dalla pubblicazione!"
                },
                error: (err) => err?.message || checked
                    ? "Errore durante la pubblicazione del formulario."
                    : "Errore durante la rimozione della pubblicazione.",
                position: "bottom-center",
            },
        );
    }

    useEffect(() => {
        getArgomentoFromId(formulario!, argomento?.id ?? "").then((data) => {
            if (data.success) {
                setArgomentoFull(data.result)
                setEditable(data.editable)
                setSharable(formulario?.visibilityPublic ?? false)
                setLoading(false)
            } else {
                redirect("/home");
            }
        })
    }, [])

    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );

    if (!argomento) {
        location.href = "/home"
        return null
    }

    const renderArgomento = () => (
        (argomentoFull && (
            <div className="flex flex-col gap-4 w-full">
                <Tabs defaultValue="preview">
                    <TabsList className="w-full">
                        <TabsTrigger value="preview">
                            <Eye />
                            Anteprima
                        </TabsTrigger>
                        <TabsTrigger value="edit" disabled={!editable}>
                            <Edit />
                            Modifica
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview">
                        <Editor />
                    </TabsContent>
                    {editable && (
                        <TabsContent value="edit">
                            <p>Edit</p>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        ))
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                <TypographyH4 className="truncate min-w-0 flex-1">{argomento.titolo}</TypographyH4>
                <div className="flex gap-2 items-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Info size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle asChild>
                                    <div className="flex gap-2 items-center">
                                        {formulario?.titolo}
                                        <div className="text-muted-foreground">{sharable ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Share size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Condividi</DialogTitle>
                            </DialogHeader>
                            {editable && (
                                <FieldGroup>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="visibilityPublic-1">Condividi con tutti (solo tu puoi modificare)</Label>
                                        <Switch id="visibilityPublic-1" name="visibilityPublic" defaultChecked={sharable} onCheckedChange={handleSwitchVisibility} />
                                    </div>
                                </FieldGroup>
                            )}
                            {sharable && (
                                <div className="flex flex-col items-center gap-4">
                                    <Qr text={currentUrl} />
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="link" className="sr-only">
                                                Link
                                            </Label>
                                            <Input
                                                id="link"
                                                defaultValue={currentUrl}
                                                readOnly
                                            />
                                        </div>
                                        <Button variant="outline" size="icon" onClick={handleCopy}>
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Chiudi</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {loading ? renderLoadingSkeleton() : renderArgomento()}
        </div>
    )
}