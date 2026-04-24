"use client"

import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/src/components/ui/dialog"
import { Code, FileText, FolderOpen, Lock, QrCode, Search, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import ForumlarioAdd from "./formulario-add"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const STORAGE_KEY = "new-account-popup-closed"

function FormulaPattern() {
    return (
        <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern
                    id="formula-pattern"
                    x="0"
                    y="0"
                    width="240"
                    height="120"
                    patternUnits="userSpaceOnUse"
                >

                    {/* formule con rotazioni, dimensioni e opacità variabili */}
                    <text x="12" y="28" fill="currentColor" opacity="0.09" fontSize="13" fontFamily="Georgia,serif" fontStyle="italic" transform="rotate(-6,12,28)">∫f(x)dx</text>
                    <text x="130" y="18" fill="currentColor" opacity="0.06" fontSize="10" fontFamily="Georgia,serif">E = mc²</text>
                    <text x="170" y="50" fill="currentColor" opacity="0.07" fontSize="18" fontFamily="Georgia,serif" transform="rotate(8,170,50)">∑</text>
                    <text x="50" y="55" fill="currentColor" opacity="0.05" fontSize="9" fontFamily="Georgia,serif" fontStyle="italic" transform="rotate(-3,50,55)">ΔG = ΔH − TΔS</text>
                    <text x="140" y="72" fill="currentColor" opacity="0.08" fontSize="11" fontFamily="Georgia,serif">PV = nRT</text>
                    <text x="8" y="85" fill="currentColor" opacity="0.05" fontSize="12" fontFamily="Georgia,serif" fontStyle="italic" transform="rotate(4,8,85)">∇ × B = μ₀J</text>
                    <text x="180" y="95" fill="currentColor" opacity="0.06" fontSize="9" fontFamily="Georgia,serif">λ = h/p</text>
                    <text x="100" y="112" fill="currentColor" opacity="0.05" fontSize="8" fontFamily="Georgia,serif" fontStyle="italic">F = G·m₁m₂/r²</text>
                    <text x="190" y="115" fill="currentColor" opacity="0.07" fontSize="15" fontFamily="Georgia,serif">π</text>
                    <text x="22" y="118" fill="currentColor" opacity="0.04" fontSize="10" fontFamily="Georgia,serif">Schrödinger</text>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#formula-pattern)" />
        </svg>
    )
}

const features = [
    { icon: Sparkles, text: "Genera con AI" },
    { icon: Search, text: "Ricerca intelligente" },
    { icon: FolderOpen, text: "Organizza in capitoli" },
    { icon: Code, text: "Editor LaTeX" },
    { icon: QrCode, text: "Condividi via QR" },
    { icon: Lock, text: "Pubblico o privato" },
]

export function NewAccountPopup() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const alreadyClosed = sessionStorage.getItem(STORAGE_KEY)
        if (!alreadyClosed) {
            setOpen(true)
        }
    }, [])

    const handleClose = () => {
        sessionStorage.setItem(STORAGE_KEY, "true")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-lg overflow-hidden p-0"
            >
                <VisuallyHidden>
                    <DialogTitle>Sticky Footer</DialogTitle>
                </VisuallyHidden>
                <div className="relative bg-primary/5 px-6 pt-6 pb-4 overflow-hidden">
                    <FormulaPattern />

                    <div className="relative z-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <FileText className="h-7 w-7" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl font-semibold text-foreground">
                            Crea il tuo primo formulario
                        </h2>
                    </div>
                </div>

                <div className="px-6 pt-4">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        Raccogli le tue formule in un unico posto. Dalla fisica alla chimica, tutto organizzato e sempre a portata di mano.
                    </p>
                </div>

                <div className="px-6 pb-4 pt-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {features.map((feature) => (
                            <div
                                key={feature.text}
                                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                            >
                                <feature.icon className="h-3.5 w-3.5" />
                                {feature.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-end pb-5 w-full px-5 gap-2">
                    <DialogClose asChild>
                        <Button variant="ghost" onClick={handleClose} className="order-2 md:order-1">
                            Forse più tardi
                        </Button>
                    </DialogClose>
                    <div className="flex flex-col order-1 md:order-2">
                        <ForumlarioAdd allowKey={false} showLabel={true} />
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}