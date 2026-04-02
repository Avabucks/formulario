"use client";

import { Toggle } from "@/src/components/ui/toggle";
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
    textareaRef,
}: Readonly<{
    markdownContent: string;
    selection: SelectionInfo | null;
    onApply: (newContent: string) => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>
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
        const trimmedText = markdownContent.slice(start, end).trim();
        const trimStart = start + markdownContent.slice(start, end).length - markdownContent.slice(start, end).trimStart().length;
        const trimEnd = trimStart + trimmedText.length;

        if (isActive) {
            const regex = getBoldRegex();
            let match;
            while ((match = regex.exec(markdownContent)) !== null) {
                if (trimStart >= match.index && trimEnd <= match.index + match[0].length) {
                    onApply(markdownContent.slice(0, match.index) + match[1] + markdownContent.slice(match.index + match[0].length));
                    textareaRef?.current?.focus();
                    setTimeout(() => textareaRef?.current?.setSelectionRange(trimStart, trimStart), 0);
                    return;
                }
            }
        } else {
            if (selection.text == "") return
            onApply(markdownContent.slice(0, trimStart) + `**${trimmedText}**` + markdownContent.slice(trimEnd));
            textareaRef?.current?.focus();
            setTimeout(() => textareaRef?.current?.setSelectionRange(trimStart, trimStart), 0);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleToggle();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selection, markdownContent, isActive]);

    return (
        <Toggle
            variant="outline"
            pressed={isActive}
            onPressedChange={handleToggle}
            aria-label="Bold"
            disabled={!selection}
        >
            <Bold size={16} />
        </Toggle>
    );
}