import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb"
import { ChevronRight } from "lucide-react";

type Formulario = {
    id: number
    titolo: string
}

type Capitolo = {
    id: number
    titolo: string
    argomentiCount?: number
}

type Argomento = {
    id: number
    titolo: string
}

export function BreadcrumbLogic({ formulario, capitolo, argomento }: Readonly<{ formulario?: Formulario; capitolo?: Capitolo; argomento?: Argomento }>) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {formulario && !capitolo && !argomento && (
                    <>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{formulario.titolo}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
                {formulario && capitolo && !argomento && (
                    <>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/home/${formulario.id}`}>{formulario.titolo}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{capitolo.titolo}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
                {formulario && capitolo && argomento && (
                    <>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/home/${formulario.id}`}>{formulario.titolo}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/home/${formulario.id}/${capitolo.id}`}>{capitolo.titolo}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{argomento.titolo}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
