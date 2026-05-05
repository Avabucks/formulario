"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/src/components/ui/item"
import { ArrowDown, ArrowUp, ChevronRightIcon, EllipsisVertical, Info, TableOfContents, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type Argomento = {
    id: string;
    titolo: string;
    argomentiCount: number;
    sortOrder: number;
    editable: boolean;
};

export function ArgomentoItem({ argomento }: Readonly<{ argomento: Argomento }>) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);

    async function handleDelete() {
        const formData = new FormData();
        formData.append("argomentoId", argomento.id);

        toast.promise(
            fetch("/api/argomenti/delete", {
                method: "DELETE",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh()
            }),
            {
                loading: "Eliminazione in corso...",
                success: "Argomento eliminato con successo!",
                error: "Errore durante l'eliminazione dell'argomento.",
                position: "bottom-center",
            },
        );
    }

    async function handleMove(direction: "up" | "down") {
        const formData = new FormData();
        formData.append("argomentoId", argomento.id);
        formData.append("direction", direction);

        toast.promise(
            fetch("/api/argomenti/move", {
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
                loading: "Spostamento in corso...",
                success: "Argomento spostato con successo!",
                error: "Errore durante lo spostamento dell'argomento.",
                position: "bottom-center",
            },
        );
    }

    const content = (
        <>
            <ItemMedia>
                <TableOfContents size={16} />
            </ItemMedia>
            <ItemContent className={`${!argomento.editable && "py-2"}`}>
                <ItemTitle>
                    <span className="group-hover:underline">
                        {argomento.titolo || <span>Senza titolo</span>}
                    </span>
                    {!argomento.titolo && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={14} className="text-muted-foreground cursor-default shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Per aggiungere un titolo, inizia la prima riga con <code>#</code></p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </ItemTitle>
            </ItemContent>
        </>
    )

    return (
        <Item className="hover:bg-muted/50 cursor-pointer" variant="outline" size="sm">
            <div className="flex w-full gap-2 items-center group">
                <Link href={`/editor/${argomento.id}`} onClick={(e: any) => { e.preventDefault(); router.push(`/editor/${argomento.id}`) }} className="flex w-full gap-2 items-center">
                    {content}
                </Link>
                {argomento.editable && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {argomento.sortOrder > 1 && (
                                    <DropdownMenuItem onSelect={() => handleMove("up")}>
                                        <ArrowUp />
                                        Sposta Su
                                    </DropdownMenuItem>
                                )}
                                {argomento.sortOrder < argomento.argomentiCount && (
                                    <DropdownMenuItem onSelect={() => handleMove("down")}>
                                        <ArrowDown />
                                        Sposta Giu
                                    </DropdownMenuItem>
                                )}
                                {argomento.sortOrder > 1 && argomento.sortOrder < argomento.argomentiCount && <DropdownMenuSeparator />}
                                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                                    <Trash2 />
                                    Elimina
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Elimina</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                    Sei sicuro di voler eliminare "{argomento.titolo || "Senza titolo"}"? Questa azione non è reversibile.
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
                    </>
                )}
                {!argomento.editable && (
                    <ItemActions>
                        <ChevronRightIcon size={16} />
                    </ItemActions>
                )}
            </div>
        </Item>
    )
}