"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { checkActiveLatexOrCode, getBoldRegex, getCodeInlineRegex, getIsActiveLatex, getIsActiveWord, handleWordToggle } from "@/src/lib/editor/formatting-utils";
import { Bold } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingBold({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActiveWord(editorRef, getBoldRegex);

    const handleToggle = () =>
        handleWordToggle(
            editorRef,
            isActive,
            getBoldRegex,
            (text) => `**${text}$0**`,
            (match) => match[1],
            (matchIndex, match) => matchIndex + match[1].length,
        );

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyB" && isFocused) {
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
                        aria-label="Grassetto"
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <Bold size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Grassetto
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
