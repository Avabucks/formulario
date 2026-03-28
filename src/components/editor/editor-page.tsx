"use client";

import { useState } from "react";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";
import { ArrowRight } from "lucide-react";

export function EditorPage({ content }: Readonly<{ content: string }>) {
    const [value, setValue] = useState(content);

    return (
        <div className="flex flex-1 flex-col border rounded-lg">
            <EditorToolbar />
            <div className="flex flex-1 items-center">
                <EditorInput value={value} onChange={setValue} />
                <ArrowRight size={16} />
                <EditorPreview value={value} />
            </div>
        </div>
    );
}