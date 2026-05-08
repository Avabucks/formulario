"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { checkActiveLatexOrCode, getIsActiveList, getOrderedListRegex, handleListToggle } from "@/src/lib/editor/formatting-utils";
import { ListOrdered } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingOrderedList({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const isActive = getIsActiveList(editorRef, getOrderedListRegex);

    const handleToggle = () =>
        handleListToggle(
            editorRef,
            isActive,
            getOrderedListRegex,
            (line, index) => `${index + 1}. ${line}`,
            (line) => line.replace(/^\d+\.\s/, ""),
        );

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.code === "Digit7" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if (checkActiveLatexOrCode(editorRef) && isFocused) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Lista ordinata"
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <ListOrdered size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Lista ordinata
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Shift</Kbd>
                            <span>+</span>
                            <Kbd>7</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}