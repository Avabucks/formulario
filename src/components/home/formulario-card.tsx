import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BookOpen, GlobeIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { FormularioSettings } from "./formulario-settings"

type Formulario = {
    id: string
    titolo: string
    nomeAutore?: string
    anno?: string
    descrizione?: string
    visibilityPublic?: boolean
}

export function FormularioCard({ formulario }: Readonly<{ formulario: Formulario }>) {

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <CardTitle>{formulario.titolo}</CardTitle>
                    <div className="text-muted-foreground">{formulario.visibilityPublic ? <GlobeIcon size={16} /> : <LockIcon size={16} />}</div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>by {formulario.nomeAutore}</span>
                    <span>Anno {formulario.anno}</span>
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