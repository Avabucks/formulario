"use client";

import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Minus } from "lucide-react";
import { useMemo } from "react";

interface SelectionInfo {
    start: number;
    end: number;
    text: string;
}

const HR = "\n---\n";

const lineStart = (content: string, pos: number) => {
    const idx = content.lastIndexOf("\n", pos - 1);
    return idx === -1 ? 0 : idx + 1;
};

const lineEnd = (content: string, pos: number) => {
    const idx = content.indexOf("\n", pos);
    return idx === -1 ? content.length : idx;
};

/** True when the current line (expanded from cursor) is exactly "---" */
const isHrLine = (content: string, pos: number) => {
    const start = lineStart(content, pos);
    const end = lineEnd(content, pos);
    return content.slice(start, end).trim() === "---";
};

export function FormattingHr({
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
        return isHrLine(markdownContent, selection.start);
    }, [selection, markdownContent]);

    const handleToggle = () => {
        if (!selection) return;

        if (isActive) {
            // Remove the "---" line (and surrounding blank lines if present)
            const start = lineStart(markdownContent, selection.start);
            const end = lineEnd(markdownContent, selection.end);

            // Eat one leading \n and one trailing \n if they exist
            const from = start > 0 && markdownContent[start - 1] === "\n" ? start - 1 : start;
            const to = end < markdownContent.length && markdownContent[end] === "\n" ? end + 1 : end;

            const newContent = markdownContent.slice(0, from) + markdownContent.slice(to);
            onApply(newContent, Math.max(0, from));
        } else {
            // Insert \n\n---\n\n at the end of the current line
            const insertAt = lineEnd(markdownContent, selection.end);
            const newContent =
                markdownContent.slice(0, insertAt) +
                HR +
                markdownContent.slice(insertAt);

            // Cursor lands on the line after ---
            const cursorPos = insertAt + HR.length;
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
                        aria-label="Horizontal rule"
                        disabled={!enableToolbar}
                    >
                        <Minus size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Horizontal Rule</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}