"use client"
import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { TypographyH4 } from "@/src/components/ui/typography"
import { Check, Copy, Share } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { FormularioInfo } from "../home/formulario-info"
import { FieldGroup } from "../ui/field"
import { Qr } from "../ui/qr"
import { Switch } from "../ui/switch"

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    visibilityPublic: boolean
    editable: boolean
}

export function EditorTitle({ argomento }: Readonly<{ argomento: Argomento }>) {
    const router = useRouter();
    const [copied, setCopied] = useState(false)
    const [visibility, setVisibility] = useState(argomento.visibilityPublic);

    const currentUrl = globalThis.window === undefined ? "" : globalThis.location.href

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        toast.success("Link copiato con successo.", { position: "bottom-center" })
        setTimeout(() => setCopied(false), 2000)
    }


    const handleSwitchVisibility = async (checked: boolean) => {

        toast.promise(
            fetch(`/api/formulari/${argomento.formularioId}/visibility`, {
                method: "PUT",
                body: JSON.stringify({ visibilityPublic: checked }),
                headers: { "Content-Type": "application/json" },
            }).then(async (res) => {
                if (!res.ok) {
                    const { error } = await res.json();
                    throw new Error(error);
                }
                setVisibility(checked);
                router.refresh();
            }),
            {
                loading: checked ? "Pubblicazione in corso..." : "Rimozione dalla pubblicazione in corso...",
                success: checked ? "Formulario pubblicato!" : "Formulario rimosso dalla pubblicazione!",
                error: (err) => err?.message || "Errore durante l'operazione.",
                position: "bottom-center",
            },
        );
    };

    return (
        <div className="flex flex-col gap-4 flex-1 h-full mb-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <TypographyH4 className="truncate min-w-0 flex-1">{argomento.titolo}</TypographyH4>
                </div>
                <div className="flex gap-2 items-center">
                    <FormularioInfo formularioId={argomento.formularioId} />
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
                            {argomento.editable && (
                                <FieldGroup>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="visibilityPublic-1">Condividi con tutti (solo tu puoi modificare)</Label>
                                        <Switch id="visibilityPublic-1" name="visibilityPublic" defaultChecked={visibility} onCheckedChange={handleSwitchVisibility} />
                                    </div>
                                </FieldGroup>
                            )}
                            {visibility && (
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
        </div>
    )
}