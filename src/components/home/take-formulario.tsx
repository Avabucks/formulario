import { CopyPlus } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TakeFormulario({ formularioId }: Readonly<{ formularioId: string }>) {
    const router = useRouter();

    async function handleTake() {

        toast.promise(
            fetch("/api/formulari/take", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formularioId: formularioId }),
            }).then(async (res) => {
                console.log(res)
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

    return (
        <Button onClick={handleTake}><CopyPlus size={16} />Aggiungi ai miei formulari</Button>
    )
}