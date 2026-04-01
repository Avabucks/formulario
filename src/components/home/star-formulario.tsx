"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function StarFormulario({ formularioId, isStarred }: Readonly<{ formularioId: string; isStarred: boolean }>) {
    const router = useRouter();

    async function handleStar() {

        const formData = new FormData();
        formData.append("formularioId", formularioId);

        toast.promise(
            fetch("/api/formulari/star", {
                method: "PUT",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh();
            }),
            {
                loading: isStarred ? "Rimozione dai preferiti..." : "Aggiunta ai preferiti...",
                success: isStarred ? "Formulario rimosso dai preferiti!" : "Formulario aggiunto ai preferiti!",
                error: isStarred ? "Errore durante la rimozione dai preferiti." : "Errore durante l'aggiunta ai preferiti.",
                position: "bottom-center",
            },
        );
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleStar}>
            <Star size={16} className={isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />
        </Button>
    );
}