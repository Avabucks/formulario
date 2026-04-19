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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function ForumlarioAdd({ allowKey = true }: Readonly<{ allowKey?: boolean }>) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "A" && (e.metaKey || e.ctrlKey) && e.shiftKey && allowKey) {
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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <Plus size={16} />
                                <div className="hidden md:flex">Aggiungi formulario</div>
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Aggiungi formulario
                            {allowKey && (
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd>
                                    <span>+</span>
                                    <Kbd>Shift</Kbd>
                                    <span>+</span>
                                    <Kbd>A</Kbd>
                                </KbdGroup>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-md">
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Aggiungi un formulario</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="titolo-1">Titolo del formulario</Label>
                            <Input id="titolo-1" name="titolo" placeholder="Titolo del formulario" maxLength={30} required />
                        </Field>
                        <Field>
                            <Label htmlFor="descrizione-1">Descrizione del formulario</Label>
                            <Textarea id="descrizione-1" name="descrizione" placeholder="Descrivi il formulario" required />
                        </Field>
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