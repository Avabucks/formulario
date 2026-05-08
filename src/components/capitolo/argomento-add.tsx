"use client"

import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
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

    const hasSubmitted = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "A" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                if (hasSubmitted.current) return;
                hasSubmitted.current = true;
                handleSubmit();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    async function handleSubmit() {

        toast.promise(
            fetch("/api/argomenti/create", {
                method: "POST",
                body: JSON.stringify({ capitoloId: capitolo.id }),
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.push(`/editor/` + (await res.json()).beautifulId)
            }),
            {
                loading: "Creazione in corso...",
                success: "Argomento creato con successo!",
                error: "Errore durante la creazione dell'argomento.",
                position: "bottom-center",
            },
        );

    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="default" onClick={handleSubmit}>
                        <Plus size={16} />
                        <div className="hidden md:flex">Aggiungi argomento</div>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Aggiungi argomento
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
    )
}