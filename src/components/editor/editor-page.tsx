"use client";

import { useIsMobile } from '@/src/hooks/useIsMobile';
import { Monaco } from '@monaco-editor/react';
import { ArrowRightLeft, Eye, EyeClosed, PenOff, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormularioSettings } from "../home/formulario-settings";
import { Button } from "../ui/button";
import { Kbd, KbdGroup } from "../ui/kbd";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Separator } from '../ui/separator';
import { Toggle } from "../ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { FormattingBold } from './editor-katex/tools/formatting-bold';
import { FormattingDivider } from './editor-katex/tools/formatting-divider';
import { FormattingItalic } from './editor-katex/tools/formatting-italic';
import { FormattingOrderedList } from './editor-katex/tools/formatting-ordered';
import { FormattingQuote } from './editor-katex/tools/formatting-quote';
import { FormattingUnorderedList } from './editor-katex/tools/formatting-unordered';

type Argomento = {
    id: string;
    content: string;
    editable: boolean;
}

export function EditorPage({ argomento, formularioId }: Readonly<{ argomento: Argomento, formularioId: string }>) {
    const isMobile = useIsMobile();

    const [textAreaContent, setTextAreaContent] = useState(argomento.content);
    const [markdownContent, setMarkdownContent] = useState(argomento.content);
    const [edited, setEdited] = useState<boolean>(false);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);
    const [isFocused, setIsFocused] = useState(false);

    const editorRef = useRef<any>(null);
    const undoBtnRef = useRef<HTMLButtonElement>(null);
    const redoBtnRef = useRef<HTMLButtonElement>(null);

    // FIXME: tasti undo e redo non devono essere enabled all'inizio
    // TODO: tasti bold, ...

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        editorRef.current = editor;

        editor.onDidFocusEditorWidget(() => {
            setIsFocused(true);
        });

        editor.onDidBlurEditorWidget(() => {
            setIsFocused(false);
        });

        const updateButtons = () => {
            const model = editor.getModel();

            if (model) {
                if (undoBtnRef.current) undoBtnRef.current.disabled = !model.canUndo();
                if (redoBtnRef.current) redoBtnRef.current.disabled = !model.canRedo();
            }
        };

        editor.onDidChangeModelContent(() => {
            updateButtons();
        });

        updateButtons();
        if (undoBtnRef.current) undoBtnRef.current.disabled = true;
        if (redoBtnRef.current) redoBtnRef.current.disabled = true;
    }

    const handleUndo = () => {
        editorRef.current?.trigger('source', 'undo', null);
    };

    const handleRedo = () => {
        editorRef.current?.trigger('source', 'redo', null);
    };

    useEffect(() => {
        if (edited) {
            return;
        }
        setMarkdownContent(textAreaContent)
    }, [edited]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleUndo();
            }
            if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
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
                                ref={undoBtnRef}
                                variant="outline"
                                size="icon"
                                onClick={handleUndo}
                                onMouseDown={(e) => e.preventDefault()}
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
                                ref={redoBtnRef}
                                variant="outline"
                                size="icon"
                                onClick={handleRedo}
                                onMouseDown={(e) => e.preventDefault()}
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

            <div className="flex flex-1 items-center gap-2 px-2">
                <FormattingBold
                    editorRef={editorRef}
                    isFocused={isFocused}
                />
                <FormattingItalic
                    editorRef={editorRef}
                    isFocused={isFocused}
                />
                <FormattingQuote
                    editorRef={editorRef}
                    isFocused={isFocused}
                />

                <Separator orientation="vertical" />

                <FormattingOrderedList
                    editorRef={editorRef}
                    isFocused={isFocused}
                />
                <FormattingUnorderedList
                    editorRef={editorRef}
                    isFocused={isFocused}
                />

                <Separator orientation="vertical" />

                <FormattingDivider
                    editorRef={editorRef}
                    isFocused={isFocused}
                />
            </div>

            {/* Mobile */}
            <div className="flex md:hidden border-l items-center px-3 gap-2">
                <Button variant="outline" size="icon" onClick={() => setSwitchView((prev) => !prev)}>
                    <ArrowRightLeft size={16} />
                </Button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex border-l items-center px-3 gap-2">
                <Toggle variant="outline" pressed={switchView} onClick={() => setSwitchView((prev) => !prev)}>
                    {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
                </Toggle>
            </div>

            <div className="flex border-l items-center px-3 gap-2">
                <FormularioSettings formularioId={formularioId} />
            </div>

        </div>
    );
    const preview = <EditorPreview markdownContent={markdownContent} />;
    const input = argomento.editable && (
        <EditorInput
            argomentoId={argomento.id}
            textAreaContent={textAreaContent}
            setTextAreaContent={setTextAreaContent}
            edited={edited}
            setEdited={setEdited}
            handleEditorDidMount={handleEditorDidMount}
        />
    );

    return (
        <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
            {argomento.editable ?
                toolbar
                : (
                    <div className="flex w-full border-b min-h-15 justify-between items-center">
                        <div className="flex items-center gap-1.5 px-4 text-sm text-muted-foreground">
                            <PenOff size={16} />
                            <span>"Aggiuni ai tuoi formulari" per poter modifcare</span>
                        </div>
                        <div className="flex border-l items-center px-3 gap-2 h-full">
                            <FormularioSettings formularioId={formularioId} />
                        </div>
                    </div>
                )}

            {isMobile ? (
                <div className="md:hidden flex-1 min-h-0 overflow-auto">
                    <div className={switchView ? "block h-full" : "hidden"}>
                        {input}
                    </div>
                    <div className={switchView ? "hidden" : "block h-full"}>
                        {preview}
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
}

// TODOs:
// -- [ ] 6 HEADERS
// -- [x] BOLD
// -- [x] ITALIC
// -- [x] ORDERED LIST
// -- [x] UNORDERED LIST
// -- [x] QUOTE
// -- [x] DIVIDER
// -- [ ] TABLE
// -- [ ] CODE
// -- [ ] MERMAID
// -- [ ] INLINE MATH
// -- [ ] BLOCK MATH