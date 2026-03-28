"use client";

import { useState } from "react";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";

export function EditorPage({ content }: Readonly<{ content: string }>) {
    const [value, setValue] = useState(content);

    return (
        <div className="flex flex-1 flex-col border rounded-lg">
            <EditorToolbar />
            <div className="flex flex-1">
                <EditorInput value={value} onChange={setValue} />
                <EditorPreview value={value} />
            </div>
        </div>
    );
}