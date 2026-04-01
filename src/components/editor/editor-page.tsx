"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";

type Argomento = {
    id: string;
    content: string;
    editable: boolean;
}

export function EditorPage({ argomento }: Readonly<{ argomento: Argomento }>) {
    const [value, setValue] = useState(argomento.content);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);

    const toolbar = <EditorToolbar switchView={switchView} setSwitchView={setSwitchView} editable={argomento.editable} />;
    const preview = <EditorPreview value={value} />;
    const input = argomento.editable && <EditorInput argomentoId={argomento.id} value={value} onChange={setValue} />;

    return (
        <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
            {argomento.editable && toolbar}

            {/* Desktop */}
            <div className="hidden md:flex flex-1 min-h-0">
                <ResizablePanelGroup
                    onLayoutChanged={(sizes) => {if (sizes.input) setResizableSize(sizes.input)}}
                    orientation="horizontal"
                >
                    {(argomento.editable && !switchView) && (
                        <>
                            <ResizablePanel id="input" collapsedSize={resizableSize} minSize="20%" defaultSize="50%">{input}</ResizablePanel>
                            <ResizableHandle className="focus-visible:ring-0" withHandle />
                        </>
                    )}
                    <ResizablePanel id="preview" collapsedSize={100 - resizableSize} minSize="20%" defaultSize="50%">{preview}</ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex-1 min-h-0 overflow-auto">
                {switchView ? input : preview}
            </div>
        </div>
    );
}