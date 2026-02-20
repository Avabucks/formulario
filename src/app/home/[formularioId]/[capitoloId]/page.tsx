import { CapitoliList } from "@/src/components/capitoli/CapitoliList"
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { getListCapitoli, getListFormulari } from "@/src/lib/formulari"

export default async function Capitolo({
    params,
}: Readonly<{
    params: Promise<{ formularioId: number; capitoloId: number; }>
}>) {
    const { formularioId } = await params
    const formulari = await getListFormulari("all")
    const formulario = formulari.result.find((f) => f.id === Number(formularioId))
    const { capitoloId } = await params
    const capitoli = await getListCapitoli(formulario || null)
    const capitolo = capitoli.result.find((c) => c.id === Number(capitoloId))

    return (
        <div className="flex flex-col gap-4 w-full px-2 md:px-6">
            <Header />
            <BreadcrumbLogic formulario={formulario} capitolo={capitolo} />
            <CapitoliList formulario={formulario} capitolo={capitolo} />
        </div>
    )
}