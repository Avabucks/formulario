"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { checkActiveLatexOrCode, getCodeInlineRegex, getIsActiveLatex, getIsActiveWord, getItalicRegex, handleWordToggle } from "@/src/lib/editor/formatting-utils";
import { Italic } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingItalic({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActiveWord(editorRef, getItalicRegex);

    const handleToggle = () =>
        handleWordToggle(
            editorRef,
            isActive,
            getItalicRegex,
            (text) => `_${text}$0_`,
            (match) => match[1],
            (matchIndex, match) => matchIndex + match[1].length,
        );

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyI" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if ((checkActiveLatexOrCode(editorRef) || getIsActiveLatex(editorRef) || getIsActiveWord(editorRef, getCodeInlineRegex)) && isFocused) return null;

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
                            <Kbd>I</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}