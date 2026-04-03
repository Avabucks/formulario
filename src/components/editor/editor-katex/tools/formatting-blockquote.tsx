"use client";

import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Quote } from "lucide-react";
import { useMemo } from "react";

interface SelectionInfo {
    start: number;
    end: number;
    text: string;
}

const lineStart = (content: string, pos: number) => {
    const idx = content.lastIndexOf("\n", pos - 1);
    return idx === -1 ? 0 : idx + 1;
};

const lineEnd = (content: string, pos: number) => {
    const idx = content.indexOf("\n", pos);
    return idx === -1 ? content.length : idx;
};

export function FormattingBlockquote({
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
        const start = lineStart(markdownContent, selection.start);
        const end = lineEnd(markdownContent, selection.end);
        const lines = markdownContent.slice(start, end).split("\n");
        // At least one non-empty line must exist, and ALL non-empty lines must start with "> "
        const nonEmpty = lines.filter((line) => line.trim() !== "");
        return nonEmpty.length > 0 && nonEmpty.every((line) => line.startsWith("> "));
    }, [selection, markdownContent]);

    const handleToggle = () => {
        if (!selection) return;

        const start = lineStart(markdownContent, selection.start);
        const end = lineEnd(markdownContent, selection.end);
        const lines = markdownContent.slice(start, end).split("\n");

        let newBlock: string;
        let cursorDelta: number;

        if (isActive) {
            newBlock = lines
                .map((line) => (line.startsWith("> ") ? line.slice(2) : line))
                .join("\n");
            cursorDelta = -2;
        } else {
            newBlock = lines
                .map((line) => (line === "" ? line : `> ${line}`))
                .join("\n");
            cursorDelta = 2;
        }

        const newContent =
            markdownContent.slice(0, start) +
            newBlock +
            markdownContent.slice(end);

        const cursorPos = Math.max(0, selection.end + cursorDelta);
        onApply(newContent, cursorPos);
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
                        aria-label="Blockquote"
                        disabled={!enableToolbar}
                    >
                        <Quote size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Blockquote</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}