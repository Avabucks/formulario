"use client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/src/components/ui/item"
import { ArrowDown, ArrowUp, Bookmark, Check, ChevronRightIcon, EllipsisVertical, PenLine, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Field } from "../ui/field"
import { Input } from "../ui/input"

type Capitolo = {
    id: string;
    titolo: string;
    capitoliCount: number;
    argomentiCount: number;
    sortOrder: number;
    editable: boolean;
};

export function CapitoloItem({ capitolo }: Readonly<{ capitolo: Capitolo }>) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    async function handleRename(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("capitoloId", capitolo.id);

        toast.promise(
            fetch("/api/capitoli/update", {
                method: "PUT",
                body: formData,
            }).then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                router.refresh()
            }),
            {
                loading: "Modifica in corso...",
                success: "Capitolo rinominato con successo!",
                error: "Errore durante la modifica del capitolo.",
                position: "bottom-center",
            },
        );

        setIsEditing(false);
    }

    async function handleDelete() {
        const formData = new FormData();
        formData.append("capitoloId", capitolo.id);

        toast.promise(
            fetch("/api/capitoli/delete", {
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
                success: "Capitolo eliminato con successo!",
                error: "Errore durante l'eliminazione del capitolo.",
                position: "bottom-center",
            },
        );
    }

    async function handleMove(direction: "up" | "down") {
        const formData = new FormData();
        formData.append("capitoloId", capitolo.id);
        formData.append("direction", direction);

        toast.promise(
            fetch("/api/capitoli/move", {
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
                success: "Capitolo spostato con successo!",
                error: "Errore durante lo spostamento del capitolo.",
                position: "bottom-center",
            },
        );
    }

    const content = (
        <>
            <ItemMedia>
                <Bookmark size={16} />
            </ItemMedia>
            <ItemContent>
                {isEditing ? (
                    <Field>
                        <Input id="titolo-1" name="titolo" defaultValue={capitolo.titolo} />
                    </Field>
                ) : (
                    <ItemTitle>
                        <span className="group-hover:underline">
                            {capitolo.titolo}
                        </span>
                    </ItemTitle>
                )}
                {capitolo.argomentiCount !== undefined && !isEditing && (
                    <div className="text-xs text-muted-foreground">{capitolo.argomentiCount} {capitolo.argomentiCount == 1 ? "argomento" : "argomenti"}</div>
                )}
            </ItemContent>
        </>
    )

    return (
        <Item className={`${!isEditing && "hover:bg-muted/50 cursor-pointer"}`} variant="outline" size="sm">
            <form className="flex w-full gap-2 items-center group" onSubmit={handleRename}>
                {isEditing ? (
                    <>{content}</>
                ) : (
                    <Link href={`/capitolo/${capitolo.id}`} onClick={(e: any) => { e.preventDefault(); router.push(`/capitolo/${capitolo.id}`) }} className="flex w-full gap-2 items-center">
                        {content}
                    </Link>
                )}
                {capitolo.editable && !isEditing && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {capitolo.sortOrder > 1 && (
                                    <DropdownMenuItem onSelect={() => handleMove("up")}>
                                        <ArrowUp />
                                        Sposta Su
                                    </DropdownMenuItem>
                                )}
                                {capitolo.sortOrder < capitolo.capitoliCount && (
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
                                    Sei sicuro di voler eliminare "{capitolo.titolo}" e tutti i suoi argomenti? Questa azione non è reversibile.
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
                {!capitolo.editable && (
                    <ItemActions>
                        <ChevronRightIcon size={16} />
                    </ItemActions>
                )}
                {capitolo.editable && isEditing && (
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