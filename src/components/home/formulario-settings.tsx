"use client"

import { CopyPlus, GlobeIcon, LockIcon, SaveAll, Settings, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Label } from "../ui/label";
import { Qr } from "../ui/qr";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type Formulario = {
    titolo: string
    descrizione: string
    nomeAutore: string
    anno: string
    visibilityPublic: boolean
    editable: boolean
}

export function FormularioSettings({ formularioId, allowKey = true }: Readonly<{ formularioId: string; allowKey?: boolean }>) {
    const router = useRouter();
    const [formulario, setFormulario] = useState<Formulario>();
    const [visibility, setVisibility] = useState(false);
    const [open, setOpen] = useState(false)

    const SHARE_URL = `${process.env.NEXT_PUBLIC_APP_URL}/formulario/${formularioId}`;

    async function fetchFormulario() {
        const response = await fetch(`/api/formulari/${formularioId}`);

        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error);
        }

        const data = await response.json();
        setFormulario(data);
        setVisibility(data.visibilityPublic);
    }

    useEffect(() => {
        fetchFormulario();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "i" && (e.metaKey || e.ctrlKey) && allowKey) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)

    }, [formularioId]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        formData.append("formularioId", formularioId);

        toast.promise(
            fetch("/api/formulari/update", {
                method: "PUT",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh();
                fetchFormulario();
            }),
            {
                loading: "Modifica in corso...",
                success: "Formulario modificato con successo!",
                error: "Errore durante la modifica del formulario.",
                position: "bottom-center",
            },
        );

    }

    async function handleTake() {

        toast.promise(
            fetch("/api/formulari/take", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formularioId: formularioId }),
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.push("/home");
            }),
            {
                loading: "Richiesta in corso...",
                success: "Formulario ottenuto con successo!",
                error: "Errore durante la richiesta del formulario.",
                position: "bottom-center",
            },
        );

    }

    async function handleDelete() {

        toast.promise(
            fetch("/api/formulari/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formularioId: formularioId }),
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.push("/home")
            }),
            {
                loading: "Eliminazione in corso...",
                success: "Formulario cancellato con successo!",
                error: "Errore durante la cancellazione del formulario.",
                position: "bottom-center",
            },
        );

    }

    return (
        <div className="flex gap-2 items-center">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Settings size={16} />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent className="pr-1.5">
                                <div className="flex items-center gap-2">
                                    Impostazioni formulario
                                    {allowKey && (
                                        <KbdGroup className="hidden md:flex">
                                            <Kbd>Ctrl</Kbd>
                                            <span>+</span>
                                            <Kbd>I</Kbd>
                                        </KbdGroup>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </SheetTrigger>
                {formulario && (
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>
                                <div className="flex gap-2 items-center">
                                    {formulario.titolo}
                                    <div className="text-muted-foreground">{formulario.visibilityPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
                                </div>
                            </SheetTitle>
                            <SheetDescription asChild>
                                <div className="flex items-center justify-between">
                                    <span>by {formulario.nomeAutore}</span>
                                    <span>Anno {formulario.anno}</span>
                                </div>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <span>{formulario.descrizione}</span>
                            </div>
                            <Accordion
                                type="multiple"
                                defaultValue={formulario.editable ? ["edit"] : ["qr"]}
                                className="max-w-lg"
                            >
                                {formulario.editable && (
                                    <AccordionItem value="edit">
                                        <AccordionTrigger>Modifica formulario</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex mb-3 pl-2">
                                                <div className="border-l pl-3"></div>
                                                <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
                                                    <FieldGroup>
                                                        <Field>
                                                            <Label htmlFor="titolo-1">Titolo del formulario</Label>
                                                            <Input id="titolo-1" name="titolo" defaultValue={formulario.titolo} />
                                                        </Field>
                                                        <Field>
                                                            <Label htmlFor="descrizione-1">Descrizione del formulario</Label>
                                                            <Textarea id="descrizione-1" name="descrizione" defaultValue={formulario.descrizione} />
                                                        </Field>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="visibilityPublic-1">Condividi con tutti (solo tu puoi modificare)</Label>
                                                            <Switch id="visibilityPublic-1" name="visibilityPublic" defaultChecked={formulario.visibilityPublic} />
                                                        </div>
                                                    </FieldGroup>
                                                    <Button type="submit">
                                                        <SaveAll size={16} /> Salva le modifiche
                                                    </Button>
                                                </form>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                {visibility && (
                                    <AccordionItem value="qr">
                                        <AccordionTrigger>Condividi formulario</AccordionTrigger>
                                        <AccordionContent>
                                            <Qr link={SHARE_URL} title={formulario.titolo} />
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                <AccordionItem value="export" disabled>
                                    <AccordionTrigger>
                                        <div className="flex flex-1 items-center justify-between">
                                            Esporta formulario
                                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-0.5">
                                                <span className="text-xs font-medium">
                                                    Coming soon
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex mb-3 pl-2">
                                            <div className="border-l pl-3"></div>
                                            <div>
                                                {/* // TODO */}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <SheetFooter>
                            {formulario.editable ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive"><Trash2 size={16} />Elimina formulario</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Elimina</DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription>
                                            Sei sicuro di voler eliminare "{formulario.titolo}"? Questa azione non è reversibile.
                                        </DialogDescription>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Chiudi</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button variant="destructive" onClick={handleDelete}>Elimina</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <DialogClose asChild>
                                    <Button onClick={handleTake}><CopyPlus size={16} />Aggiungi ai miei formulari</Button>
                                </DialogClose>
                            )}
                            <SheetClose asChild>
                                <Button variant="outline"><X size={16} />Chiudi</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                )}
            </Sheet>
        </div>
    )
}