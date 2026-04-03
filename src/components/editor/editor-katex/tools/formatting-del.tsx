"use client";

import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Strikethrough } from "lucide-react";
import { useMemo } from "react";

interface SelectionInfo {
    start: number;
    end: number;
    text: string;
}

const getDelRegex = () => /~~(.+?)~~/g;

export function FormattingDel({
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
        const regex = getDelRegex();
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
            const regex = getDelRegex();
            let match;
            while ((match = regex.exec(markdownContent)) !== null) {
                if (trimStart >= match.index && trimEnd <= match.index + match[0].length) {
                    const newContent =
                        markdownContent.slice(0, match.index) +
                        match[1] +
                        markdownContent.slice(match.index + match[0].length);
                    // Cursor at logical position minus the 2 "~~" removed on the left
                    const cursorPos = Math.max(match.index, trimStart - 2);
                    onApply(newContent, cursorPos);
                    return;
                }
            }
        } else {
            if (selection.text === "") return;
            const newContent =
                markdownContent.slice(0, trimStart) +
                `~~${trimmedText}~~` +
                markdownContent.slice(trimEnd);
            // Cursor right after closing "~~"
            const cursorPos = trimStart + trimmedText.length + 4; // 4 = "~~" + "~~"
            onApply(newContent, cursorPos);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        pressed={enableToolbar ? isActive : false}
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Strikethrough"
                        disabled={!enableToolbar}
                    >
                        <Strikethrough size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Strike Through
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}