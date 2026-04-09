"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Bold } from "lucide-react";
import { useEffect, useMemo } from "react";

interface Selection {
    start: number;
    end: number;
    text: string;
}

const getBoldRegex = () => /\*\*(.+?)\*\*/g;

export function FormattingBold({
    selection,
    textAreaContent,
    onApply,
}: Readonly<{
    selection: Selection | null,
    textAreaContent: string,
    onApply: (newContent: string, cursorPos?: number) => void,
}>) {
    const isActive = useMemo(() => {
        if (!selection) return false;
        const { start, end } = selection;
        const regex = getBoldRegex();
        let match;
        while ((match = regex.exec(textAreaContent)) !== null) {
            if (start >= match.index && end <= match.index + match[0].length) return true;
        }
        return false;
    }, [selection, textAreaContent]);

    const handleToggle = () => {
        if (!selection) return;

        const { start, end } = selection;
        const raw = textAreaContent.slice(start, end);
        const trimmedText = raw.trim();
        const leadingSpaces = raw.length - raw.trimStart().length;
        const trimStart = start + leadingSpaces;
        const trimEnd = trimStart + trimmedText.length;

        if (isActive) {
            const regex = getBoldRegex();
            let match;
            while ((match = regex.exec(textAreaContent)) !== null) {
                if (trimStart >= match.index && trimEnd <= match.index + match[0].length) {
                    const newContent =
                        textAreaContent.slice(0, match.index) +
                        match[1] +
                        textAreaContent.slice(match.index + match[0].length);
                    const cursorPos = match.index + match[1].length;
                    onApply(newContent, cursorPos);
                    return;
                }
            }
        } else {
            if (selection.text === "") return;
            const newContent =
                textAreaContent.slice(0, trimStart) +
                `**${trimmedText}**` +
                textAreaContent.slice(trimEnd);
            const cursorPos = trimStart + trimmedText.length + 2;
            onApply(newContent, cursorPos);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.ctrlKey || e.metaKey) && selection) {
                e.preventDefault();
                handleToggle();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selection, textAreaContent, isActive]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Bold"
                        disabled={selection === null}
                        pressed={isActive}
                    >
                        <Bold size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Bold
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>B</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
