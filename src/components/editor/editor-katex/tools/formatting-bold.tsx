"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Bold } from "lucide-react";
import { useEffect, useMemo } from "react";

interface SelectionInfo {
    start: number;
    end: number;
    text: string;
}

const getBoldRegex = () => /\*\*(.+?)\*\*/g;

export function FormattingBold({
    markdownContent,
    selection,
    onApply,
    enableToolbar,
}: Readonly<{
    markdownContent: string;
    selection: SelectionInfo | null;
    onApply: (newContent: string, cursorPos?: number) => void;
    enableToolbar: boolean;
}>) {
    const isActive = useMemo(() => {
        if (!selection) return false;
        const { start, end } = selection;
        const regex = getBoldRegex();
        let match;
        while ((match = regex.exec(markdownContent)) !== null) {
            if (start >= match.index && end <= match.index + match[0].length) return true;
        }
        return false;
    }, [selection, markdownContent]);

    const handleToggle = () => {
        if (!selection) return;

        const { start, end } = selection;
        const raw = markdownContent.slice(start, end);
        const trimmedText = raw.trim();
        const leadingSpaces = raw.length - raw.trimStart().length;
        const trimStart = start + leadingSpaces;
        const trimEnd = trimStart + trimmedText.length;

        if (isActive) {
            // Remove bold markers — find the enclosing match and strip **…**
            const regex = getBoldRegex();
            let match;
            while ((match = regex.exec(markdownContent)) !== null) {
                if (trimStart >= match.index && trimEnd <= match.index + match[0].length) {
                    const newContent =
                        markdownContent.slice(0, match.index) +
                        match[1] +
                        markdownContent.slice(match.index + match[0].length);

                    // Cursor lands at the same logical position minus the two
                    // removed "**" on the left (2 chars).
                    const cursorPos = trimStart - 2;
                    onApply(newContent, Math.max(match.index, cursorPos));
                    return;
                }
            }
        } else {
            if (selection.text === "") return;
            const newContent =
                markdownContent.slice(0, trimStart) +
                `**${trimmedText}**` +
                markdownContent.slice(trimEnd);

            // Place cursor right after the closing "**"
            const cursorPos = trimStart + trimmedText.length + 4;
            onApply(newContent, cursorPos);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.ctrlKey || e.metaKey) && enableToolbar) {
                e.preventDefault();
                handleToggle();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selection, markdownContent, isActive, enableToolbar]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        pressed={enableToolbar ? isActive : false}
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Bold"
                        disabled={!enableToolbar}
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
