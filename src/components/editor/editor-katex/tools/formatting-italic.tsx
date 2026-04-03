"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Italic } from "lucide-react";
import { useEffect, useMemo } from "react";

interface SelectionInfo {
    start: number;
    end: number;
    text: string;
}

const ITALIC_UNDERSCORE = () => /_([\s\S]+?)_/g;
const ITALIC_ASTERISK = () => /(?<!\*)\*([^*]+?)\*(?!\*)/g;

export function FormattingItalic({
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
    const isItalicMatch = (content: string, start: number, end: number) => {
        for (const getRegex of [ITALIC_UNDERSCORE, ITALIC_ASTERISK]) {
            const regex = getRegex();
            let match;
            while ((match = regex.exec(content)) !== null) {
                if (start >= match.index && end <= match.index + match[0].length) return match;
            }
        }
        return null;
    };

    const isActive = useMemo(() => {
        if (!selection) return false;
        return isItalicMatch(markdownContent, selection.start, selection.end) !== null;
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
            const match = isItalicMatch(markdownContent, trimStart, trimEnd);
            if (match) {
                const newContent =
                    markdownContent.slice(0, match.index) +
                    match[1] +
                    markdownContent.slice(match.index + match[0].length);
                // Cursor at same logical position minus the 1 marker char removed on the left
                const cursorPos = Math.max(match.index, trimStart - 1);
                onApply(newContent, cursorPos);
            }
        } else {
            if (selection.text === "") return;
            const newContent =
                markdownContent.slice(0, trimStart) +
                `_${trimmedText}_` +
                markdownContent.slice(trimEnd);
            // Cursor right after closing "_"
            const cursorPos = trimStart + trimmedText.length + 2; // 2 = "_" + "_"
            onApply(newContent, cursorPos);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "i" && (e.ctrlKey || e.metaKey) && enableToolbar) {
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
                        aria-label="Italic"
                        disabled={!enableToolbar}
                    >
                        <Italic size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Italic
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>I</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
