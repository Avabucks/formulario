"use client";

import { ArrowRightLeft, Eye, EyeClosed, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Kbd, KbdGroup } from "../ui/kbd";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Toggle } from "../ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { FormattingBold } from "./editor-katex/tools/formatting-bold";

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

interface Snapshot {
    textAreaContent: string;
    cursor: number;
}

export function EditorPage({ argomento }: Readonly<{ argomento: Argomento }>) {
    const [textAreaContent, setTextAreaContent] = useState(argomento.content);
    const [markdownContent, setMarkdownContent] = useState(argomento.content);
    const [edited, setEdited] = useState<boolean>(false);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);
    const [history, setHistory] = useState<Snapshot[]>([]);
    const [future, setFuture] = useState<Snapshot[]>([]);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const isUndoRedoRef = useRef(false);
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

    const handleUndo = () => {
        const prev = history.at(-2);
        if (!prev) return;
        const cursor = textAreaRef.current?.selectionStart ?? 0;
        setHistory((h) => h.slice(0, -1));
        setFuture((f) => [{ textAreaContent, cursor }, ...f]);
        isUndoRedoRef.current = true;
        handleApply(prev.textAreaContent, prev.cursor);
        setSelection({ start: prev.cursor, end: prev.cursor, text: "" })
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory((h) => [...h, next]);
        setFuture((f) => f.slice(1));
        isUndoRedoRef.current = true;
        handleApply(next.textAreaContent, next.cursor);
        setSelection({ start: next.cursor, end: next.cursor, text: "" })
    };

    useEffect(() => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            const cursor = textAreaRef.current?.selectionStart ?? 0;
            setHistory((prev) => {
                if (prev.at(-1)?.textAreaContent === textAreaContent) return prev;
                return [...prev, { textAreaContent, cursor }];
            });
            setFuture([]);
        }, 500);

        return () => clearTimeout(timeout);
    }, [textAreaContent]);

    useEffect(() => {
        if (edited) {
            return;
        }
        setMarkdownContent(textAreaContent)
    }, [edited]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "z" && (e.ctrlKey || e.metaKey) && selection) {
                e.preventDefault();
                handleUndo();
            }
            if (e.key === "y" && (e.ctrlKey || e.metaKey) && selection) {
                e.preventDefault();
                handleRedo();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleUndo, handleRedo]);

    const toolbar = (
        <div className="flex w-full border-b min-h-15">
            <div className="flex gap-2 border-r items-center px-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleUndo}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={history.length < 2 || selection === null}
                            >
                                <Undo2 size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Undo
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd>
                                    <span>+</span>
                                    <Kbd>Z</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRedo}
                                onMouseDown={(e) => e.preventDefault()}
                                disabled={future.length <= 0 || selection === null}
                            >
                                <Redo2 size={16} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Redo
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd>
                                    <span>+</span>
                                    <Kbd>Y</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex flex-1 items-center p-3">
                <FormattingBold
                    textAreaContent={textAreaContent}
                    selection={selection}
                    onApply={handleApply}
                />
            </div>
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
        </div>
    );
    const preview = <EditorPreview markdownContent={markdownContent} />;
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