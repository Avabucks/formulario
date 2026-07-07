"use client";

import { CopyPlus } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TakeFormulario({
  formularioId,
}: Readonly<{ formularioId: string }>) {
  const router = useRouter();

  async function handleTake() {
    toast.promise(
      fetch("/api/formulari/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formularioId: formularioId }),
      }).then(async (res) => {
        console.log(res);
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
    <Button
      onClick={handleTake}
      className="h-7 md:h-8 px-2 md:px-2.5 text-[0.8rem] md:text-sm gap-1 md:gap-1.5"
    >
      <CopyPlus className="size-3.5 md:size-4" />
      <span className="hidden sm:inline">Aggiungi ai miei formulari</span>
      <span className="inline sm:hidden">Aggiungi</span>
    </Button>
  );
}
