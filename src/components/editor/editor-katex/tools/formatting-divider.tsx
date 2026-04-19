"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
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
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const sel = editorRef.current.getSelection();
        if (!sel) return;

        const lineNumber = sel.positionLineNumber;
        const lineContent = model.getLineContent(lineNumber);
        const lineLength = lineContent.length;

        model.pushEditOperations(
            [],
            [{
                range: {
                    startLineNumber: lineNumber,
                    startColumn: lineLength + 1,
                    endLineNumber: lineNumber,
                    endColumn: lineLength + 1,
                },
                text: `\n---\n`,
            }],
            () => null,
        );

        const cursorPos = model.getPositionAt(
            model.getOffsetAt({ lineNumber, column: lineLength + 1 }) + 5,
        );
        editorRef.current.setSelection({
            startLineNumber: cursorPos.lineNumber,
            startColumn: cursorPos.column,
            endLineNumber: cursorPos.lineNumber,
            endColumn: cursorPos.column,
        });
        editorRef.current.focus();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "D" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                handleToggle();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        onPressedChange={handleToggle}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Divider"
                        pressed={false}
                        disabled={!isFocused}
                    >
                        <Minus size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        Divider
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Shift</Kbd>
                            <span>+</span>
                            <Kbd>D</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}