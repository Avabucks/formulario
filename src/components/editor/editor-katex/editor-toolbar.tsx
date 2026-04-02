"use client";

import { ArrowRightLeft, Eye, EyeClosed } from "lucide-react";
import { Button } from "../../ui/button";
import { Toggle } from "../../ui/toggle";
import { FormattingBold } from "./tools/formatting-bold";
import { FormattingItalic } from "./tools/formatting-italic";
import { FormattingDel } from "./tools/formatting-del";

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
    textareaRef,
}: Readonly<{
    switchView: boolean;
    setSwitchView: (value: boolean | ((prev: boolean) => boolean)) => void;
    editable: boolean;
    markdownContent: string;
    selection: Selection | null;
    onApply: (newContent: string) => void;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}>) {
    return (
        <div className="flex w-full border-b min-h-15">
            <div className="flex flex-1 items-center p-3 gap-2">
                {/* TODO: non deve modifcare quando non c'è selection */}
                <FormattingBold
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    textareaRef={textareaRef}
                />
                <FormattingItalic
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    textareaRef={textareaRef}
                />
                <FormattingDel
                    markdownContent={markdownContent}
                    selection={selection}
                    onApply={onApply}
                    textareaRef={textareaRef}
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