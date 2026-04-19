"use client"

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
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Kbd, KbdGroup } from "../ui/kbd"

type Capitolo = {
    id: string;
    titolo: string;
    formularioId: string;
    sortOrder: number;
    editable: boolean;
};

export function ArgomentoAdd({ capitolo }: Readonly<{ capitolo: Capitolo }>) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "A" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
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
        formData.append("capitoloId", capitolo.id);

        toast.promise(
            fetch("/api/argomenti/create", {
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
                success: "Argomento creato con successo!",
                error: "Errore durante la creazione dell'argomento.",
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
                                <div className="hidden md:flex">Aggiungi argomento</div>
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Aggiungi capitolo
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
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
                        <DialogTitle>Aggiungi nuovo capitolo</DialogTitle>
                        <DialogDescription>
                            <span>Crea un nuovo capitolo in {capitolo.titolo}.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <Field>
                        <Label htmlFor="titolo-1">Titolo del nuovo capitolo</Label>
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
    )
}