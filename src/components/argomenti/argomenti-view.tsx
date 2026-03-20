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
import { Check, CloudAlert, CloudCheck, Copy, Edit, Eye, GlobeIcon, Info, LockIcon, Share } from "lucide-react"
import { changeVisibilityFormulario, getArgomentoFromId, saveContent } from "@/src/lib/formulari"
import EditorPreview from "@/src/components/editor/editor-preview"
import EditorEdit from "@/src/components/editor/editor-edit"
import { redirect } from "next/navigation"
import { Qr } from "../ui/qr"
import { Field, FieldGroup } from "../ui/field"
import { Switch } from "../ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Spinner } from "../ui/spinner"

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
    content: string
}

export function ArgomentiView({ formulario, argomento }: Readonly<{ formulario?: Formulario, argomento?: Argomento }>) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(0)
    const [copied, setCopied] = useState(false)
    const [argomentoFull, setArgomentoFull] = useState<Argomento>()
    const [editable, setEditable] = useState(false)
    const [sharable, setSharable] = useState(false)
    const [content, setContent] = useState("")

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
            if (data.result && data.success) {
                setArgomentoFull(data.result)
                setContent(data.result.content)
                setEditable(data.editable)
                setSharable(formulario?.visibilityPublic ?? false)
                setLoading(false)
            } else {
                redirect("/home");
            }
        })
    }, [])

    useEffect(() => {
        if (!editable) return;
        
        setSaving(0);

        const timeout = setTimeout(async () => {
            try {
                await saveContent(content, argomento?.id);
                setSaving(1);
            } catch (e: any) {
                toast.error(e?.message || "Errore durante il salvataggio.", { position: "bottom-center" });
                setSaving(2)
            }
        }, 2000)

        return () => clearTimeout(timeout)
    }, [content])

    const renderLoadingSkeleton = () => (
        <div className="flex flex-col gap-2 w-full h-full flex-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-full w-full" />
        </div>
    );

    if (!argomento) {
        location.href = "/home"
        return null
    }

    const renderArgomento = () => (
        (argomentoFull && (
            <div className="flex flex-col gap-4 w-full h-full flex-1">
                <Tabs defaultValue={content == "" ? "edit" : "preview"} className="flex-1">
                    <TabsList className="w-full">
                        <TabsTrigger value="preview" disabled={content == ""}>
                            <Eye />
                            Anteprima
                        </TabsTrigger>
                        <TabsTrigger value="edit" disabled={!editable}>
                            <Edit />
                            Modifica
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="flex-1">
                        <EditorPreview content={content} />
                    </TabsContent>
                    {editable && (
                        <TabsContent value="edit">
                            <EditorEdit content={content} setContent={setContent} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        ))
    )

    return (
        <div className="flex flex-col gap-4 flex-1 h-full mb-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <TypographyH4 className="truncate min-w-0 flex-1">{argomento.titolo}</TypographyH4>
                    <div className="scale-130 opacity-70">
                        {editable && (
                            <>
                                {(() => {
                                    switch (saving) {
                                        case 0:
                                            return <Spinner />;
                                        case 1:
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CloudCheck size={16} />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="pr-1.5">
                                                            Sincronizzato correttamente
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        case 2:
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CloudAlert size={16} />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="pr-1.5">
                                                            Errore durante il salvataggio
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                            </>
                        )}
                    </div>
                </div>
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