"use client";

import { ArrowRightLeft, Eye, EyeClosed } from "lucide-react";
import { Button } from "../../ui/button";
import { Toggle } from "../../ui/toggle";

export function EditorToolbar({
    switchView,
    setSwitchView,
    editable
}: Readonly<{
    switchView: boolean;
    setSwitchView: (value: boolean | ((prev: boolean) => boolean)) => void;
    editable: boolean;
}>) {
    return (
        <div className="flex w-full border-b min-h-15">
            <div className="flex flex-1 items-center p-3">

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