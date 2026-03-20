import { CapitoliList } from "@/src/components/capitoli/CapitoliList"
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { getListFormulari } from "@/src/lib/formulari"

export default async function Formulario({
    params,
}: Readonly<{
    params: Promise<{ formularioId: string; }>
}>) {
    const { formularioId } = await params
    const formulari = await getListFormulari("all")
    const formulario = formulari.find((f) => f.id === formularioId)

    return (
        <div className="flex flex-col gap-4 w-full px-2 md:px-6">
            <Header />
            <BreadcrumbLogic formulario={formulario} />
            <CapitoliList formulario={formulario} />
        </div>
    )
}