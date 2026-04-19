"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/src/components/ui/dialog";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const sections = [
    {
        title: "Applicazione",
        shortcuts: [
            { label: "Cerca nei tuoi formulari", keys: ["Ctrl", "K"] },
            { label: "Impostazioni formulario", keys: ["Ctrl", "Shift", "I"] },
            { label: "Aggiungi nuovo", keys: ["Ctrl", "Shift", "A"] },
        ],
    },
    {
        title: "Formattazione",
        shortcuts: [
            { label: "Grassetto", keys: ["Ctrl", "B"] },
            { label: "Corsivo", keys: ["Ctrl", "Shift", "I"] },
            { label: "Citazione", keys: ["Ctrl", "Shift", "Q"] },
            { label: "Lista ordinata", keys: ["Ctrl", "Shift", "7"] },
            { label: "Lista non ordinata", keys: ["Ctrl", "Shift", "8"] },
            { label: "Divisore", keys: ["Ctrl", "Shift", "D"] },
            { label: "Heading 1", keys: ["Ctrl", "Alt", "1"] },
            { label: "Heading 2", keys: ["Ctrl", "Alt", "2"] },
            { label: "Heading 3", keys: ["Ctrl", "Alt", "3"] },
            { label: "Heading 4", keys: ["Ctrl", "Alt", "4"] },
            { label: "Heading 5", keys: ["Ctrl", "Alt", "5"] },
            { label: "Heading 6", keys: ["Ctrl", "Alt", "6"] },
        ],
    },
    {
        title: "Editor",
        shortcuts: [
            { label: "Salva", keys: ["Ctrl", "S"] },
            { label: "Annulla", keys: ["Ctrl", "Z"] },
            { label: "Ripristina", keys: ["Ctrl", "Y"] },
            { label: "Taglia", keys: ["Ctrl", "X"] },
            { label: "Copia", keys: ["Ctrl", "C"] },
            { label: "Seleziona tutto", keys: ["Ctrl", "A"] },
            { label: "Seleziona la prossima occorrenza", keys: ["Ctrl", "D"] },
            { label: "Inserisci cursore", keys: ["Alt", "Click"] },
            { label: "Sposta riga su", keys: ["Alt", "↑"] },
            { label: "Sposta riga giù", keys: ["Alt", "↓"] },
            { label: "Duplica riga", keys: ["Shift", "Alt", "↓"] },
            { label: "Elimina riga", keys: ["Ctrl", "Shift", "K"] },
            { label: "Vai all'inizio", keys: ["Ctrl", "Home"] },
            { label: "Vai alla fine", keys: ["Ctrl", "End"] },
            { label: "Commenta riga", keys: ["Ctrl", "/"] },
        ],
    },
];

export function KbShortcuts({
    setOpen,
    open,
}: Readonly<{
    setOpen: (value: boolean) => void,
    open: boolean,
}>) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="md:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Scorciatoie da tastiera</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] mt-2">
                    <div className="flex flex-col md:flex-row gap-6">
                        {sections.map((section, sectionIndex) => (
                            <React.Fragment key={section.title}>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-3">
                                        {section.title}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {section.shortcuts.map((shortcut) => (
                                            <div
                                                key={shortcut.label}
                                                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                                            >
                                                <span className="text-sm">{shortcut.label}</span>
                                                <KbdGroup>
                                                    {shortcut.keys.map((key, i) => (
                                                        <React.Fragment key={i}>
                                                            {i > 0 && <span className="text-muted-foreground">+</span>}
                                                            <Kbd>{key}</Kbd>
                                                        </React.Fragment>
                                                    ))}
                                                </KbdGroup>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {sectionIndex < sections.length - 1 && (
                                    <>
                                        <div className="hidden md:block w-px bg-border self-stretch min-h-[1em]"></div>
                                        <Separator orientation="horizontal" className="block md:hidden" />
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}