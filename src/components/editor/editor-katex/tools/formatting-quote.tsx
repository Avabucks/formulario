"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getIsActiveList, handleListToggle } from "@/src/lib/formatting-utils";
import { Quote } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect } from "react";

const getQuoteRegex = () => /^>\s/;

export function FormattingQuote({
    editorRef,
    isFocused,
}: Readonly<{
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActiveList(editorRef, getQuoteRegex);

    const handleToggle = () =>
        handleListToggle(
            editorRef,
            getIsActiveList(editorRef, getQuoteRegex),
            getQuoteRegex,
            (line) => `> ${line}`,
            (line) => line.replace(/^>\s/, ""),
        );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Q" && (e.ctrlKey || e.metaKey) && e.shiftKey && isFocused) {
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
                        aria-label="Quote"
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <Quote size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Quote
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Shift</Kbd>
                            <span>+</span>
                            <Kbd>Q</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}