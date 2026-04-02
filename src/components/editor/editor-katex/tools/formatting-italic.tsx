"use client";

import { Toggle } from "@/src/components/ui/toggle";
import { Italic } from "lucide-react";
import { useMemo } from "react";

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
    textareaRef,
}: Readonly<{
    markdownContent: string;
    selection: SelectionInfo | null;
    onApply: (newContent: string) => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>
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
        const trimmedText = markdownContent.slice(start, end).trim();
        const trimStart = start + markdownContent.slice(start, end).length - markdownContent.slice(start, end).trimStart().length;
        const trimEnd = trimStart + trimmedText.length;

        if (isActive) {
            const match = isItalicMatch(markdownContent, trimStart, trimEnd);
            if (match) {
                onApply(markdownContent.slice(0, match.index) + match[1] + markdownContent.slice(match.index + match[0].length));
                textareaRef?.current?.focus();
                setTimeout(() => textareaRef?.current?.setSelectionRange(trimStart, trimStart), 0);
            }
        } else {
            if (selection.text == "") return
            onApply(markdownContent.slice(0, trimStart) + `_${trimmedText}_` + markdownContent.slice(trimEnd));
            textareaRef?.current?.focus();
            setTimeout(() => textareaRef?.current?.setSelectionRange(trimStart, trimStart), 0);
        }
    };

    return (
        <Toggle
            variant="outline"
            pressed={isActive}
            onPressedChange={handleToggle}
            aria-label="Italic"
            disabled={!selection}
        >
            <Italic size={16} />
        </Toggle>
    );
}