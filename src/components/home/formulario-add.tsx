"use client"
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Field, FieldGroup } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForumlarioAdd() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        toast.promise(
            fetch("/api/formulari/create", {
                method: "POST",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh()
            }),
            {
                loading: "Creazione in corso...",
                success: "Formulario creato con successo!",
                error: "Errore durante la creazione del formulario.",
                position: "bottom-center",
            },
        );

        setOpen(false)

    }

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus size={16} />
                    <div className="hidden md:flex">Aggiungi formulario</div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Aggiungi un formulario</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="titolo-1">Titolo del formulario</Label>
                            <Input id="titolo-1" name="titolo" placeholder="Titolo del formulario" required />
                        </Field>
                        <Field>
                            <Label htmlFor="descrizione-1">Descrizione del formulario</Label>
                            <Textarea id="descrizione-1" name="descrizione" placeholder="Descrivi il formulario" required />
                        </Field>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="visibilityPublic-1">Condividi con tutti (solo tu puoi modificare)</Label>
                            <Switch id="visibilityPublic-1" name="visibilityPublic" />
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
    )
}