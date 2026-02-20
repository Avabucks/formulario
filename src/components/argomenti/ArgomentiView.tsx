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
import { getArgomentoFromId } from "@/src/lib/formulari"
import Editor from "@/src/components/editor"
import { redirect } from "next/navigation"

type Formulario = {
    id: number
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

type Argomento = {
    id: number
    titolo: string
    formula?: string
}

export function ArgomentiView({ formulario, argomento }: Readonly<{ formulario?: Formulario, argomento?: Argomento }>) {
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [argomentoFull, setArgomentoFull] = useState<Argomento>()
    const [editable, setEditable] = useState(false)

    const currentUrl = globalThis.window === undefined ? "" : globalThis.location.href

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        toast.success("Link copiato con successo.", { position: "bottom-center" })
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        getArgomentoFromId(formulario!, argomento?.id ?? 0).then((data) => {
            if (data.success) {
                setArgomentoFull(data.result)
                setEditable(data.editable)
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
                    <Dialog>
                        {formulario?.visibilityPublic ? (
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Share size={16} />
                                </Button>
                            </DialogTrigger>
                        ) : (
                            <Button variant="outline" size="icon" onClick={() => toast.warning("Puoi copiare il link solo se il formulario è pubblico.", { position: "bottom-center" })}>
                                <Share size={16} />
                            </Button>
                        )}
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Condividi</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center gap-2">
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