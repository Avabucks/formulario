"use client"

import slides from "@/public/tutorial/slides.json"
import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/src/components/ui/dialog"
import { cn } from "@/src/lib/utils"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ArrowLeft, ArrowRight, FileVideo } from "lucide-react"
import { useState } from "react"
import ForumlarioAdd from "./formulario-add"

const STORAGE_KEY = "new-account-popup-closed"

export function NewAccountPopup({
    setOpen,
    open,
}: Readonly<{
    setOpen: (value: boolean) => void,
    open: boolean,
}>) {

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "true")
        setOpen(false)
    }

    const [current, setCurrent] = useState(0)
    const isLast = current === slides.length - 1

    const goTo = (n: number) => setCurrent(Math.max(0, Math.min(slides.length - 1, n)))

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-2xl overflow-hidden p-0"
            >
                <VisuallyHidden>
                    <DialogTitle>Scopri le funzionalità</DialogTitle>
                </VisuallyHidden>

                {/* Slider area */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {slides.map((slide, i) => (
                            <div key={i} className="min-w-full flex flex-col">

                                {/* Video / placeholder */}
                                <div className="relative bg-muted aspect-video flex items-center justify-center border-b border-border">
                                    {slide.video ? (
                                        <video
                                            src={slide.video}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <FileVideo className="h-8 w-8 opacity-30" />
                                            <span className="text-xs opacity-40">video in arrivo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text */}
                                <div className="px-6 pt-5 pb-2">
                                    <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1.5">
                                        {slide.label}
                                    </p>
                                    <h2 className="text-base font-semibold text-foreground mb-2 leading-snug">
                                        {slide.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {slide.description}
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border gap-3">

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-200 bg-muted-foreground/30",
                                    i === current ? "w-5 bg-foreground" : "w-1.5"
                                )}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2">
                        {current === 0 ? (
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm" onClick={handleClose}>
                                    Salta
                                </Button>
                            </DialogClose>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => goTo(current - 1)}>
                                <ArrowLeft />
                                <span className="hidden md:flex">Indietro</span>
                            </Button>
                        )}

                        {isLast ? (
                            <div className="flex flex-col">
                                <ForumlarioAdd allowKey={false} showLabel={true} />
                            </div>
                        ) : (
                            <Button size="sm" onClick={() => goTo(current + 1)}>
                                Avanti
                                <ArrowRight />
                            </Button>
                        )}
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}