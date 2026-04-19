"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getIsActiveList, handleListToggle } from "@/src/lib/formatting-utils";
import { ListOrdered } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect } from "react";

const getOrderedListRegex = () => /^\d+\.\s/;

export function FormattingOrderedList({
    editorRef,
    isFocused,
}: Readonly<{
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActiveList(editorRef, getOrderedListRegex);

    const handleToggle = () =>
        handleListToggle(
            editorRef,
            getIsActiveList(editorRef, getOrderedListRegex),
            getOrderedListRegex,
            (line, index) => `${index + 1}. ${line}`,
            (line) => line.replace(/^\d+\.\s/, ""),
        );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Digit7" && (e.ctrlKey || e.metaKey) && e.shiftKey && isFocused) {
                e.preventDefault();
                handleToggle();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Ordered List"
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <ListOrdered size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Ordered List
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Shift</Kbd>
                            <span>+</span>
                            <Kbd>7</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}