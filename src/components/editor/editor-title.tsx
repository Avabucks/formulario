"use client"
import { TypographyH4 } from "@/src/components/ui/typography"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FormularioSettings } from "../home/formulario-settings"

type Argomento = {
    id: string
    titolo: string
    formularioId: string
    visibilityPublic: boolean
    editable: boolean
}

export function EditorTitle({ argomento }: Readonly<{ argomento: Argomento }>) {

    return (
        <div className="flex flex-col gap-4 flex-1 h-full mb-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <TypographyH4 className="truncate min-w-0 flex-1">{argomento.titolo}</TypographyH4>
                </div>
                <FormularioSettings formularioId={argomento.formularioId} />
            </div>
        </div>
    )
}