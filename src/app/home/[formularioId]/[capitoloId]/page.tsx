import { CapitoliList } from "@/src/components/capitoli/CapitoliList"
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { getListCapitoli, getListFormulari } from "@/src/lib/formulari"

export default async function Capitolo({
    params,
}: Readonly<{
    params: Promise<{ formularioId: string; capitoloId: string; }>
}>) {
    const { formularioId } = await params
    const formulari = await getListFormulari("all")
    const formulario = formulari.find((f) => f.id === formularioId)
    const { capitoloId } = await params
    const capitoli = await getListCapitoli(formulario || null)
    const capitolo = capitoli.capitoli.find((c) => c.id === capitoloId)

    return (
        <div className="flex flex-col gap-4 w-full px-2 md:px-6">
            <Header />
            <BreadcrumbLogic formulario={formulario} capitolo={capitolo} />
            <CapitoliList formulario={formulario} capitolo={capitolo} />
        </div>
    )
}