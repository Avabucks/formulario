"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { LockIcon, GlobeIcon, BookOpen, Trash2, Edit } from "lucide-react"
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
import { Field, FieldGroup } from "../ui/field"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Formulario = {
    id: string
    titolo: string
    autore?: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

export function FormularioCard({ formulario }: Readonly<{ formulario: Formulario }>) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    async function handleDelete() {

        toast.promise(
            fetch("/api/formulari/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formularioId: formulario.id }),
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh()
            }),
            {
                loading: "Eliminazione in corso...",
                success: "Formulario cancellato con successo!",
                error: "Errore durante la cancellazione del formulario.",
                position: "bottom-center",
            },
        );

    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        formData.append("formularioId", formulario.id);

        toast.promise(
            fetch("/api/formulari/update", {
                method: "PUT",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh()
            }),
            {
                loading: "Modifica in corso...",
                success: "Formulario modificato con successo!",
                error: "Errore durante la modifica del formulario.",
                position: "bottom-center",
            },
        );

        setOpen(false)

    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <CardTitle>{formulario.titolo}</CardTitle>
                    <div className="text-muted-foreground">{formulario.visibilityPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>by {formulario.nomeAutore}</span>
                    <span>Anno {formulario.anno}</span>
                </div>
            </CardHeader>
            <CardContent>
                <p>{formulario.descrizione}</p>
            </CardContent>
            <CardFooter>
                <div className="flex flex-1 items-center gap-2">
                    <Link href={`/home/${formulario.id}`} className="flex-1 w-full">
                        <Button variant="outline" className="w-full">
                            <BookOpen size={16} />
                            Apri il formulario
                        </Button>
                    </Link>
                    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Edit size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Modifica il formulario</DialogTitle>
                                </DialogHeader>
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
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Chiudi</Button>
                                    </DialogClose>
                                    <Button type="submit">Salva</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size="icon"><Trash2 size={16} /></Button>
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
                </div>
            </CardFooter>
        </Card>
    )
}