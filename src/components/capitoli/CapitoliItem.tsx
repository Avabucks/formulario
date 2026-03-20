"use client"

import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/src/components/ui/item"
import { Bookmark, TableOfContents, ChevronRightIcon, EllipsisVertical, Trash2, ArrowUp, ArrowDown, PenLine, X, Check } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import { Input } from "../ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { deleteItem, moveItem, renameItem } from "@/src/lib/formulari"

type Props = {
    id: string
    titolo: string
    type: number // 0 = capitolo, 1 = argomento
    argomentiCount?: number
    sortOrder: number
    editable: boolean
    tot: number
    onOpen: () => void
    setRefresh: React.Dispatch<React.SetStateAction<number>>
}

export function CapitoliItem({ id, titolo, type, argomentiCount, sortOrder, editable, tot, onOpen, setRefresh }: Readonly<Props>) {
    const [isEditing, setIsEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    async function handleRename(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const label = type === 0 ? "capitolo" : "argomento" as "capitolo" | "argomento";

        toast.promise(
            renameItem(id, label, formData),
            {
                loading: "Modifica in corso...",
                success: `${label.charAt(0).toUpperCase() + label.slice(1)} rinominato con successo!`,
                error: (err) => err?.message || `Errore durante la modifica del ${label}.`,
                position: "bottom-center",
            },
        );
        setIsEditing(false);
        setRefresh((n: number) => n + 1)
    }

    async function handleDelete() {
        const label = type === 0 ? "capitolo" : "argomento" as "capitolo" | "argomento";
        toast.promise(
            deleteItem(id, label),
            {
                loading: "Eliminazione in corso...",
                success: `${label.charAt(0).toUpperCase() + label.slice(1)} eliminato con successo!`,
                error: (err) => err?.message || `Errore durante l'eliminazione del ${label}.`,
                position: "bottom-center",
            },
        );
        setRefresh((n: number) => n + 1)
    }

    async function handleMove(direction: "up" | "down") {
        const label = type === 0 ? "capitolo" : "argomento" as "capitolo" | "argomento";
        toast.promise(
            moveItem(id, label, direction),
            {
                loading: "Spostamento in corso...",
                success: `${label.charAt(0).toUpperCase() + label.slice(1)} spostato con successo!`,
                error: (err) => err?.message || `Errore durante lo spostamento del ${label}.`,
                position: "bottom-center",
            },
        );
        setRefresh((n: number) => n + 1)
    }

    const content = (
        <>
            <ItemMedia>
                {type === 0 ? <Bookmark size={16} /> : <TableOfContents size={16} />}
            </ItemMedia>
            <ItemContent>
                {isEditing ? (
                    <Field>
                        <Input id="titolo-1" name="titolo" defaultValue={titolo} />
                    </Field>
                ) : (
                    <ItemTitle>{titolo}</ItemTitle>
                )}
                {argomentiCount !== undefined && !isEditing && (
                    <div className="text-xs text-muted-foreground">{argomentiCount} {argomentiCount == 1 ? "argomento" : "argomenti"}</div>
                )}
            </ItemContent>
        </>
    )

    return (
        <Item className={`${!isEditing && "hover:bg-muted/50 cursor-pointer"}`} variant="outline" size="sm">
            <form className="flex w-full gap-2" onSubmit={handleRename}>
                {isEditing ? (
                    <>{content}</>
                ) : (
                    <Link href="/" onClick={(e: any) => { e.preventDefault(); onOpen() }} className="flex w-full gap-2 items-center">
                        {content}
                    </Link>
                )}
                {editable && !isEditing && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {sortOrder > 1 && (
                                    <DropdownMenuItem onSelect={() => handleMove("up")}>
                                        <ArrowUp />
                                        Sposta Su
                                    </DropdownMenuItem>
                                )}
                                {sortOrder < tot && (
                                    <DropdownMenuItem onSelect={() => handleMove("down")}>
                                        <ArrowDown />
                                        Sposta Giu
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onSelect={(e) => {
                                    setIsEditing(true);
                                }}>
                                    <PenLine />
                                    Rinomina
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                                    Sei sicuro di voler eliminare "{titolo}"? Questa azione non è reversibile.
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
                {!editable && (
                    <ItemActions>
                        <ChevronRightIcon size={16} />
                    </ItemActions>
                )}
                {editable && isEditing && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                            <X />
                        </Button>
                        <Button variant="default" size="icon" type="submit">
                            <Check />
                        </Button>
                    </div>
                )}
            </form>
        </Item>
    )
}