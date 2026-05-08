"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Separator } from "@/src/components/ui/separator";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { checkActiveLatexOrCode, getCodeInlineRegex, getIsActiveLatex, getIsActiveWord } from "@/src/lib/editor/formatting-utils";
import { Minus } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingDivider({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const handleToggle = () => {
        const editor = editorRef.current;
        if (!editor) return false;

        const controller = editor.getContribution('snippetController2') as any;
        if (!controller) return false;

        const position = editor.getPosition();
        const lineNumber = position?.lineNumber ?? 1;
        const column = position?.column ?? 1;

        const isAtLineStart = column === 1;
        const currentLine = editor.getModel()?.getLineContent(lineNumber) ?? '';
        const isEmptyLine = currentLine.trim() === '';

        const text = (isAtLineStart && isEmptyLine) ? `\n---\n\n$1` : `\n\n---\n\n$1`;
        controller.insert(text);
        setTimeout(() => editor.focus(), 0);
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "Digit9" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if ((checkActiveLatexOrCode(editorRef) || getIsActiveLatex(editorRef) || getIsActiveWord(editorRef, getCodeInlineRegex)) && isFocused) return null;

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant="outline"
                            onPressedChange={handleToggle}
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Divisore"
                            pressed={false}
                            disabled={!isFocused}
                        >
                            <Minus size={16} />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Divisore
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
                                <span>+</span>
                                <Kbd>9</Kbd>
                            </KbdGroup>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" />
        </>
    );
}