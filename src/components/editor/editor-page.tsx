"use client";

import { useRef, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";

type Argomento = {
    id: string;
    content: string;
    editable: boolean;
}

interface Selection {
    start: number;
    end: number;
    text: string;
}

export function EditorPage({ argomento }: Readonly<{ argomento: Argomento }>) {
    const [textAreaContent, setTextAreaContent] = useState(argomento.content);
    const [edited, setEdited] = useState<boolean>(false);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [selection, setSelection] = useState<Selection | null>(null);

    const handleApply = (newContent: string, cursorPos?: number) => {
        setEdited(true)
        setTextAreaContent(newContent);
        if (cursorPos !== undefined && textAreaRef.current) {
            requestAnimationFrame(() => {
                const ta = textAreaRef.current!;
                ta.focus();
                ta.setSelectionRange(cursorPos, cursorPos);
            });
        }
    };

    const toolbar = (
        <EditorToolbar
            switchView={switchView}
            setSwitchView={setSwitchView}
            editable={argomento.editable}
            selection={selection}
            textAreaContent={textAreaContent}
            onApply={handleApply}
        />
    );
    const preview = <EditorPreview textAreaContent={textAreaContent} />;
    const input = argomento.editable && (
        <EditorInput
            textAreaRef={textAreaRef}
            argomentoId={argomento.id}
            textAreaContent={textAreaContent}
            setTextAreaContent={setTextAreaContent}
            setSelection={setSelection}
            edited={edited}
            setEdited={setEdited}
        />
    );

    return (
        <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
            {argomento.editable && toolbar}

            {/* Desktop */}
            <div className="hidden md:flex flex-1 min-h-0">
                <ResizablePanelGroup
                    onLayoutChanged={(sizes) => { if (sizes.input) setResizableSize(sizes.input) }}
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