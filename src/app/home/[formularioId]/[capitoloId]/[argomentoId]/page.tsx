import { ArgomentiView } from "@/src/components/argomenti/argomenti-view";
import { BreadcrumbLogic } from "@/src/components/navigation/breadcrumb-logic";
import { Header } from "@/src/components/navigation/header";
import { getListArgomenti, getListCapitoli, getListFormulari } from "@/src/lib/formulari"

export default async function Argomento({
    params,
}: Readonly<{
    params: Promise<{ formularioId: string; capitoloId: string; argomentoId: string }>
}>) {
    const { formularioId } = await params
    const formulari = await getListFormulari("all")
    const formulario = formulari.find((f) => f.id === formularioId)
    const { capitoloId } = await params
    const capitoli = await getListCapitoli(formulario || null)
    const capitolo = capitoli.capitoli.find((c) => c.id === capitoloId)
    const { argomentoId } = await params
    const argomenti = await getListArgomenti(capitolo || null, formulario || null)
    const argomento = argomenti.argomenti.find((a) => a.id === argomentoId)

    return (
        <div className="flex flex-col gap-4 w-full px-2 md:px-6 flex-1">
            <Header />
            <BreadcrumbLogic formulario={formulario} capitolo={capitolo} argomento={argomento} />
            <ArgomentiView formulario={formulario} argomento={argomento} />
        </div>
    )
}