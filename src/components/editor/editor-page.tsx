"use client";

import { useIsMobile } from '@/src/hooks/useIsMobile';
import { Editor, Monaco } from '@monaco-editor/react';
import { ArrowRightLeft, Eye, EyeClosed, PenOff, Redo2, Undo2 } from "lucide-react";
import type { Selection } from "monaco-editor";
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
import { FormattingHeaders } from './editor-katex/tools/formatting-headers';
import { FormattingItalic } from './editor-katex/tools/formatting-italic';
import { FormattingOrderedList } from './editor-katex/tools/formatting-ordered';
import { FormattingQuote } from './editor-katex/tools/formatting-quote';
import { FormattingUnorderedList } from './editor-katex/tools/formatting-unordered';
import { Spinner } from '../ui/spinner';
import { GeminiButton } from './editor-katex/tools/gemini-ai';
import { useTheme } from 'next-themes';
import { TakeFormulario } from '../home/take-formulario';
import { FormattingCodeBlock } from './editor-katex/tools/formatting-code-block';
import { FormattingLatexBlock } from './editor-katex/tools/formatting-latex-block';
import { FormattingCodeInline } from './editor-katex/tools/formatting-code-inline';

export function EditorPage({ argomentoId, editable, formularioId }: Readonly<{ argomentoId: string, editable: boolean, formularioId: string }>) {
    const isMobile = useIsMobile();
    const { resolvedTheme } = useTheme();

    const [textAreaContent, setTextAreaContent] = useState<string>("");
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [edited, setEdited] = useState<boolean>(false);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);
    const [isFocused, setIsFocused] = useState(false);
    const [selection, setSelection] = useState<Selection | null>(null);

    const editorRef = useRef<any>(null);
    const undoBtnRef = useRef<HTMLButtonElement>(null);
    const redoBtnRef = useRef<HTMLButtonElement>(null);

    const updateSelection = (editor: any) => {
        const sel = editor.getSelection();
        if (!sel) return;
        setSelection(sel);
    };

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        editorRef.current = editor;

        editor.onDidChangeCursorSelection(() => updateSelection(editor));
        editor.onDidChangeCursorPosition(() => updateSelection(editor));

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

    const fetchContent = async () => {
        try {
            const response = await fetch(`/api/argomenti/${argomentoId}`);
            if (!response.ok) throw new Error("Errore nel caricamento");

            const data = await response.json();
            setTextAreaContent(data.content);
            setMarkdownContent(data.content);
        } catch (error: any) {
            console.error(error.message);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchContent();
    }, [])

    useEffect(() => {
        if (isMobile) { setSwitchView(false) }
        else if (!editable) setSwitchView(true)
    }, [isMobile])

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
        <div className="flex w-full border-b min-h-15 overflow-x-auto">
            <div className="flex gap-3 border-r items-center px-3">
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
                                Annulla
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
                                Ripristina
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

            <div className="flex flex-1 items-center">
                <div className="flex flex-1 items-center gap-3 h-full px-3">
                    <FormattingHeaders
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />
                    <FormattingBold
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />
                    <FormattingItalic
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />
                    <FormattingQuote
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />

                    <Separator orientation="vertical" />

                    <FormattingOrderedList
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />
                    <FormattingUnorderedList
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />

                    <Separator orientation="vertical" />

                    <FormattingDivider
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />

                    <Separator orientation="vertical" />

                    <FormattingCodeInline
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />
                    <FormattingCodeBlock
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />

                    <Separator orientation="vertical" />

                    <FormattingLatexBlock
                        _selection={selection}
                        editorRef={editorRef}
                        isFocused={isFocused}
                    />

                </div>

                <div className="flex items-center border-l gap-3 px-3 h-full">
                    <GeminiButton
                        editorRef={editorRef}
                    />
                </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden border-l items-center px-3 gap-3">
                <Button variant="outline" size="icon" onClick={() => setSwitchView((prev) => !prev)}>
                    <ArrowRightLeft size={16} />
                </Button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex border-l items-center px-3 gap-3">
                <Toggle variant="outline" pressed={switchView} onClick={() => setSwitchView((prev) => !prev)}>
                    {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
                </Toggle>
            </div>

            <div className="flex border-l items-center px-3 gap-3">
                <FormularioSettings formularioId={formularioId} />
            </div>

        </div>
    );
    const preview = loading
        ? <div className="flex h-full items-center justify-center"><Spinner /></div>
        : <EditorPreview markdownContent={markdownContent ?? ""} />;
    const editor = editable
        ? <EditorInput
            argomentoId={argomentoId}
            textAreaContent={textAreaContent ?? ""}
            setTextAreaContent={setTextAreaContent}
            edited={edited}
            setEdited={setEdited}
            handleEditorDidMount={handleEditorDidMount}
        />
        : <Editor
            defaultLanguage="markdown"
            theme={resolvedTheme === "dark" ? "vs-dark" : "vs-light"}
            defaultValue={textAreaContent}
            options={{
                readOnly: true,
                links: false,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on",
                quickSuggestions: false,
            }}
            loading={<Spinner />}
        />
    const input = loading
        ? <div className="flex h-full items-center justify-center"><Spinner /></div>
        : editor

    return (
        <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
            {editable ?
                toolbar
                : (
                    <div className="flex w-full border-b min-h-15 justify-between items-center">
                        <div className="flex flex-1 items-center gap-2 px-4 text-sm text-muted-foreground">
                            <PenOff size={16} />
                            <TakeFormulario formularioId={formularioId} />
                            <span className="hidden md:flex">per modifcare</span>
                        </div>

                        {/* Mobile */}
                        <div className="flex md:hidden border-l items-center px-3 gap-3 h-full">
                            <Button variant="outline" size="icon" onClick={() => setSwitchView((prev) => !prev)}>
                                <ArrowRightLeft size={16} />
                            </Button>
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:flex border-l items-center px-3 gap-3 h-full">
                            <Toggle variant="outline" pressed={switchView} onClick={() => setSwitchView((prev) => !prev)}>
                                {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
                            </Toggle>
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
                        {(!switchView) && (
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