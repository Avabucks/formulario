import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/src/components/ui/item"
import { Bookmark, TableOfContents, ChevronRightIcon, EllipsisVertical, Trash2, ArrowUp, ArrowDown } from "lucide-react"
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

type Props = {
    id: string
    titolo: string
    type: number // 0 = capitolo, 1 = argomento
    argomentiCount?: number
    isEditing: boolean
    onOpen: () => void
}

export function CapitoliItem({ id, titolo, type, argomentiCount, isEditing, onOpen }: Readonly<Props>) {
    const Wrapper = isEditing ? "div" : Link as any;

    return (
        <Item variant="outline" size="sm" asChild>
            <Wrapper {...(!isEditing && { href: "/", onClick: (e: any) => { e.preventDefault(); onOpen() } })}>
                <ItemMedia>
                    {type === 0 ? <Bookmark size={16} /> : <TableOfContents size={16} />}
                </ItemMedia>
                <ItemContent>
                    {isEditing ? (
                        <Field>
                            <Input id={id} defaultValue={titolo} />
                        </Field>
                    ) : (
                        <ItemTitle>{titolo}</ItemTitle>
                    )}
                    {argomentiCount !== undefined && !isEditing && (
                        <div className="text-xs text-muted-foreground">{argomentiCount} {argomentiCount == 1 ? "argomento" : "argomenti"}</div>
                    )}
                </ItemContent>
                {isEditing ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <EllipsisVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <ArrowUp />
                                Sposta Su
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ArrowDown />
                                Sposta Giu
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                                <Trash2 />
                                Elimina
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                ) : (
                    <ItemActions>
                        <ChevronRightIcon size={16} />
                    </ItemActions>
                )}
            </Wrapper>
        </Item>
    )
}