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
import kbs from "@/src/data/kbs.json";

const sections = kbs.sections;

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
                        {sections.map((section, sectionIndex) => {
                            const sortedShortcuts = [...section.shortcuts].sort((a, b) =>
                                a.keys.at(-1)!.localeCompare(b.keys.at(-1)!)
                            );

                            return (
                                <React.Fragment key={section.title}>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">
                                            {section.title}
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            {sortedShortcuts.map((shortcut) => (
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
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}