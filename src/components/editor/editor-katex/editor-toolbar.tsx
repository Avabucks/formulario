"use client";

import { ArrowRightLeft, Eye, EyeClosed, Redo2, Undo2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Toggle } from "../../ui/toggle";
import { FormattingBold } from "./tools/formatting-bold";
import { FormattingDel } from "./tools/formatting-del";
import { FormattingItalic } from "./tools/formatting-italic";
import { FormattingBlockquote } from "./tools/formatting-blockquote";
import { FormattingHr } from "./tools/formatting-hr";

interface Selection {
    start: number;
    end: number;
    text: string;
}

export function EditorToolbar({
    switchView,
    setSwitchView,
    editable,
    markdownContent,
    selection,
    onApply,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    enableToolbar,
}: Readonly<{
    switchView: boolean;
    setSwitchView: (value: boolean | ((prev: boolean) => boolean)) => void;
    editable: boolean;
    markdownContent: string;
    selection: Selection | null;
    onApply: (newContent: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    enableToolbar: boolean;
}>) {

    return (
        <div className="flex w-full border-b min-h-15">
            <div className="flex flex-1 items-center p-3 gap-2 overflow-x-auto">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onUndo}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!canUndo}
                >
                    <Undo2 size={16} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRedo}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!canRedo}
                >
                    <Redo2 size={16} />
                </Button>
                <Separator orientation="vertical" />
                <FormattingBold
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    enableToolbar={enableToolbar}
                />
                <FormattingItalic
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    enableToolbar={enableToolbar}
                />
                <FormattingDel
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    enableToolbar={enableToolbar}
                />
                <Separator orientation="vertical" />
                <FormattingBlockquote
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    enableToolbar={enableToolbar}
                />
                <FormattingHr
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    enableToolbar={enableToolbar}
                />
            </div>
            {editable && (
                <>
                    {/* Desktop */}
                    <div className="flex md:hidden border-l items-center px-3">
                        <Button variant="outline" size="icon" onClick={() => setSwitchView((prev) => !prev)}>
                            <ArrowRightLeft size={16} />
                        </Button>
                    </div>

                    {/* Mobile */}
                    <div className="hidden md:flex border-l items-center px-3">
                        <Toggle variant="outline" pressed={switchView} onClick={() => setSwitchView((prev) => !prev)}>
                            {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
                        </Toggle>
                    </div>
                </>
            )}
        </div>
    );
}