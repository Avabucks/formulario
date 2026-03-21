import { GlobeIcon, Info, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


type Formulario = {
    titolo: string
    descrizione: string
    nomeAutore: string
    anno: string
    visibilityPublic: boolean
}

export function FormularioInfo({ formularioId }: Readonly<{ formularioId: string }>) {
    const [formulario, setFormulario] = useState<Formulario>();

    async function fetchFormulario() {
        const response = await fetch(`/api/formulari/${formularioId}`);

        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error);
        }

        const data = await response.json();
        setFormulario(data);
    }

    useEffect(() => {
        fetchFormulario();
    }, [formularioId]);

    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Info size={16} />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Informazioni del formulario
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle asChild>
                        <div className="flex gap-2 items-center">
                            {formulario?.titolo}
                            <div className="text-muted-foreground">{formulario?.visibilityPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
                        </div>
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>by {formulario?.nomeAutore}</span>
                            <span>Anno {formulario?.anno}</span>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <p>{formulario?.descrizione}</p>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Chiudi</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}