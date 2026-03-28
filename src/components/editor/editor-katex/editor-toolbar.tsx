"use client";

import { ArrowRightLeft } from "lucide-react";
import { Button } from "../../ui/button";

export function EditorToolbar({
    setSwitchView,
}: Readonly<{
    setSwitchView: (value: boolean | ((prev: boolean) => boolean)) => void;
}>) {
    return (
        <div className="flex w-full border-b min-h-15">
            <div className="flex flex-1 items-center p-3">

            </div>
            <div className="flex md:hidden border-l items-center px-3">
                <Button variant="outline" size="icon" onClick={() => setSwitchView((prev) => !prev)}>
                    <ArrowRightLeft />
                </Button>
            </div>
        </div>
    )
}