import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BookOpen, Calendar, Eye, GlobeIcon, LinkIcon, LockIcon, UserRound } from "lucide-react"
import Link from "next/link"
import { FormularioSettings } from "./formulario-settings"
import { Separator } from "../ui/separator"

type Formulario = {
    id: string
    titolo: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibility: 0 | 1 | 2
    views: number
}

export function FormularioCard({ formulario }: Readonly<{ formulario: Formulario }>) {

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <CardTitle>{formulario.titolo}</CardTitle>
                    <div className="text-muted-foreground">
                        <VisibilityIcon visibility={formulario.visibility} />
                    </div>
                </div>
                <div className="flex h-5 gap-4 text-sm text-muted-foreground min-w-0">
                    <span className="flex flex-1 gap-1 items-center min-w-0 overflow-hidden">
                        <UserRound size={16} className="shrink-0" />
                        <span className="truncate">{formulario.nomeAutore}</span>
                    </span>
                    <Separator orientation="vertical" className="shrink-0" />
                    <span className="flex gap-1 items-center shrink-0">
                        <Calendar size={16} />
                        <span>{formulario.anno}</span>
                    </span>
                    {formulario.visibility === 2 && (
                        <>
                            <Separator orientation="vertical" className="shrink-0" />
                            <span className="flex gap-1 items-center shrink-0">
                                <Eye size={16} />
                                <span>{formulario.views}</span>
                            </span>
                        </>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p>{formulario.descrizione}</p>
            </CardContent>
            <CardFooter>
                <div className="flex flex-1 items-center gap-2">
                    <Link href={`/formulario/${formulario.id}`} className="flex-1 w-full">
                        <Button variant="outline" className="w-full">
                            <BookOpen size={16} />
                            Apri il formulario
                        </Button>
                    </Link>
                    <FormularioSettings formularioId={formulario.id} allowKey={false} />
                </div>
            </CardFooter>
        </Card>
    )
}

const VisibilityIcon = ({ visibility }: { visibility: 0 | 1 | 2 }) => {
    if (visibility === 0) return <LockIcon size={16} />
    if (visibility === 1) return <LinkIcon size={16} />
    return <GlobeIcon size={16} />
}