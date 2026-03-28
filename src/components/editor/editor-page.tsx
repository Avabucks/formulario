"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";

export function EditorPage({ content }: Readonly<{ content: string }>) {
    const [value, setValue] = useState(content);
    const [switchView, setSwitchView] = useState<boolean>(false);

    return (
        <div className="flex flex-1 flex-col border rounded-lg">
            <EditorToolbar setSwitchView={setSwitchView} />
            <div className="hidden md:flex flex-1">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize="50%">
                        <EditorInput value={value} onChange={setValue} />
                    </ResizablePanel>
                    <ResizableHandle className="focus-visible:ring-0" withHandle />
                    <ResizablePanel defaultSize="50%">
                        <EditorPreview value={value} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
            <div className="md:hidden flex-1">
                {switchView ? <EditorInput value={value} onChange={setValue} /> : <EditorPreview value={value} />}
            </div>
        </div>
    );
}