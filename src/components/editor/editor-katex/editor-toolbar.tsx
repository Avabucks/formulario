"use client";

import { ArrowRightLeft, Eye, EyeClosed } from "lucide-react";
import { Button } from "../../ui/button";
import { Toggle } from "../../ui/toggle";
import { FormattingBold } from "./tools/formatting-bold";
import { useEffect } from "react";

interface Selection {
    start: number;
    end: number;
    text: string;
}

export function EditorToolbar({
    switchView,
    setSwitchView,
    editable,
    selection,
    textAreaContent,
    onApply,
}: Readonly<{
    switchView: boolean,
    setSwitchView: (value: boolean | ((prev: boolean) => boolean)) => void,
    editable: boolean,
    selection: Selection | null,
    textAreaContent: string,
    onApply: (newContent: string, cursorPos?: number) => void,
}>) {

    return (
        <div className="flex w-full border-b min-h-15">
            <div className="flex flex-1 items-center p-3">
                <FormattingBold
                    textAreaContent={textAreaContent}
                    selection={selection}
                    onApply={onApply}
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
    )
}