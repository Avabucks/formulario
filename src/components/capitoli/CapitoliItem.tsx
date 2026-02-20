import {
    Item,
    ItemActions,
    ItemContent,
    ItemMedia,
    ItemTitle,
} from "@/src/components/ui/item"
import { Bookmark, TableOfContents, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

type Props = {
    id: number
    titolo: string
    type: number // 0 = capitolo, 1 = argomento
    argomentiCount?: number
    onOpen: () => void
}

export function CapitoliItem({ id, titolo, type, argomentiCount, onOpen }: Readonly<Props>) {
    return (
        <Item variant="outline" size="sm" asChild>
            <Link href="/" onClick={(e) => { e.preventDefault(); onOpen() }}>
                <ItemMedia>
                    {type === 0 ? <Bookmark size={16} /> : <TableOfContents size={16} />}
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{titolo}</ItemTitle>
                    {argomentiCount !== undefined && (
                        <div className="text-xs text-muted-foreground">{argomentiCount} {argomentiCount == 1 ? "argomento" : "argomenti"}</div>
                    )}
                </ItemContent>
                <ItemActions>
                    <ChevronRightIcon size={16} />
                </ItemActions>
            </Link>
        </Item>
    )
}