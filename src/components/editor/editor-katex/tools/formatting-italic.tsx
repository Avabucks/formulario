"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getIsActive, handleFormattingToggle } from "@/src/lib/formatting-utils";
import { Italic } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

const getItalicRegex = () => /_(.+?)_/g;

export function FormattingItalic({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActive(editorRef, getItalicRegex);

    const handleToggle = () =>
        handleFormattingToggle(
            editorRef,
            getIsActive(editorRef, getItalicRegex),
            getItalicRegex,
            (text) => `_${text}_`,
            (match) => match[1],
            (trimStart, text) => trimStart + text.length + 1,
            (matchIndex, match) => matchIndex + match[1].length,
        );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "I" && (e.ctrlKey || e.metaKey) && e.shiftKey && isFocused) {
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
                        aria-label="Corsivo"
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <Italic size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Corsivo
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Shift</Kbd>
                            <span>+</span>
                            <Kbd>I</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}