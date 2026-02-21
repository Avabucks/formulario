import { getListFormulari } from "@/src/lib/formulari"
import { FormularioCard } from "@/src/components/formulario/FormularioCard"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/src/components/ui/empty"
import { BookOpen } from "lucide-react"
import FormularioTitle from "./FormularioTitle"

export async function FormularioList() {
    const formulari = await getListFormulari("user")

    const renderEmpty = () => (
        <Empty className="border border-dashed">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Nessun formulario</EmptyTitle>
                <EmptyDescription>
                    Non ci sono formulari da mostrare.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )

    return (
        <>
            <FormularioTitle />
            {formulari.length === 0 ? (
                renderEmpty()
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                    {formulari.map((f) => (
                        <FormularioCard formulario={f} key={f.id} />
                    ))}
                </div>
            )}
        </>
    )
}