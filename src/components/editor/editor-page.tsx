"use client";

import { useIsMobile } from "@/src/hooks/useIsMobile";
import { Monaco } from "@monaco-editor/react";
import {
  ArrowRightLeft,
  Columns2,
  Eye,
  EyeClosed,
  PenLine,
  PenOff,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";
import type { Selection } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { FormularioSettings } from "../home/formulario-settings";
import { TakeFormulario } from "../home/take-formulario";
import { Button } from "../ui/button";
import { Kbd, KbdGroup, useIsMac } from "../ui/kbd";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { Toggle } from "../ui/toggle";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { EditorInput, SyncStatus } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { FormattingBold } from "./editor-katex/tools/formatting-bold";
import { FormattingCodeBlock } from "./editor-katex/tools/formatting-code-block";
import { FormattingCodeInline } from "./editor-katex/tools/formatting-code-inline";
import { FormattingDivider } from "./editor-katex/tools/formatting-divider";
import { FormattingHeaders } from "./editor-katex/tools/formatting-headers";
import { FormattingItalic } from "./editor-katex/tools/formatting-italic";
import { FormattingLatex } from "./editor-katex/tools/formatting-latex";
import { FormattingOrderedList } from "./editor-katex/tools/formatting-ordered";
import { FormattingQuote } from "./editor-katex/tools/formatting-quote";
import { FormattingTable } from "./editor-katex/tools/formatting-table";
import { FormattingUnorderedList } from "./editor-katex/tools/formatting-unordered";
import { EditorAI } from "./editor-katex/editor-ai";

const darkRules = [
  { token: "math.display", foreground: "4EC9B0" },
  { token: "math.inline", foreground: "4EC9B0" },
  { token: "math.content", foreground: "CE9178" },
  { token: "markdown.blockquote", foreground: "6A9955" },
  { token: "markdown.code.inline", foreground: "D7BA7D" },
  { token: "markdown.code.block", foreground: "D7BA7D" },
  { token: "strong", foreground: "C586C0" },
  { token: "markup.bold.italic", foreground: "E06C75" },
];

const lightRules = [
  { token: "math.display", foreground: "267F99" },
  { token: "math.inline", foreground: "267F99" },
  { token: "math.content", foreground: "A31515" },
  { token: "markdown.blockquote", foreground: "008000" },
  { token: "markdown.code.inline", foreground: "795E26" },
  { token: "markdown.code.block", foreground: "795E26" },
  { token: "strong", foreground: "7B2FBE" },
  { token: "markup.bold.italic", foreground: "C0392B" },
];

export function EditorPage({
  argomentoId,
  editable,
  formularioId,
}: Readonly<{ argomentoId: string; editable: boolean; formularioId: string }>) {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  const [textAreaContent, setTextAreaContent] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [edited, setEdited] = useState<boolean>(false);
  const [switchView, setSwitchView] = useState<"preview" | "divided" | "edit">("preview");
  const [hasSetInitialView, setHasSetInitialView] = useState<boolean>(false);
  const [showAI, setShowAI] = useState<boolean>(false);
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [resizableSize, setResizableSize] = useState<number>(40);
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [monacoReady, setMonacoReady] = useState(false);
  const isMac = useIsMac();

  const undoBtnRef = useRef<HTMLButtonElement>(null);
  const redoBtnRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startSize = resizableSize;
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      setResizableSize(Math.max(20, Math.min(80, startSize + deltaPercent)));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const updateSelection = (editor: any) => {
    const sel = editor.getSelection();
    if (!sel) return;
    setSelection(sel);
  };

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("markdown-math-theme", {
      base: resolvedTheme === "dark" ? "vs-dark" : "vs",
      inherit: true,
      rules: resolvedTheme === "dark" ? darkRules : lightRules,
      colors: {},
    });
    monaco.editor.setTheme("markdown-math-theme");

    setMonacoReady(true);

    monaco.languages.register({ id: "markdown-math" });

    monaco.languages.setMonarchTokensProvider("markdown-math", {
      tokenizer: {
        root: [
          [/\$\$/, { token: "math.display", next: "@mathDisplay" }],
          [/\$/, { token: "math.inline", next: "@mathInline" }],
          [/^#{1,6}\s.*$/, "keyword"],
          [/^\s*>.*$/, "markdown.blockquote"],
          [/\*\*[^*]+\*\*/, "strong"],
          [/^(`{3,}).*$/, { token: "markdown.code.block", next: "@codeBlock" }],
          [/`[^`]+`/, "markdown.code.inline"],
        ],
        mathDisplay: [
          [/[^$]+/, "math.content"],
          [/\$\$/, { token: "math.display", next: "@pop" }],
        ],
        mathInline: [
          [/[^$]+/, "math.content"],
          [/\$/, { token: "math.inline", next: "@pop" }],
        ],
        codeBlock: [
          [/^`{3,}$/, { token: "markdown.code.block", next: "@pop" }],
          [/.*$/, "markdown.code.block"],
        ],
      },
    });

    editor.onDidChangeCursorSelection(() => updateSelection(editor));
    editor.onDidChangeCursorPosition(() => updateSelection(editor));

    editor.onDidBlurEditorWidget(() => {
      setIsFocused(false);
    });

    editor.onDidFocusEditorWidget(() => {
      setIsFocused(true);
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
    editorRef.current?.trigger("source", "undo", null);
  };

  const handleRedo = () => {
    editorRef.current?.trigger("source", "redo", null);
  };

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/argomenti/${argomentoId}`);
      if (!response.ok) throw new Error("Errore nel caricamento");

      const data = await response.json();
      setTextAreaContent(data.content);
      setMarkdownContent(data.content);
      setLoading(false);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (edited) {
      return;
    }
    setMarkdownContent(textAreaContent);
  }, [edited]);

  useEffect(() => {
    if (!loading && !hasSetInitialView) {
      const content = textAreaContent ?? "";
      if (content.trim() === "") {
        setSwitchView(isMobile ? "edit" : "divided");
      }
      setHasSetInitialView(true);
    }
  }, [loading, isMobile, textAreaContent, hasSetInitialView]);

  useEffect(() => {
    if (isMobile && switchView === "divided") {
      setSwitchView("preview");
    }
  }, [isMobile, switchView]);

  useEffect(() => {
    if (!editable && showAI) {
      setShowAI(false);
    }
  }, [editable, showAI]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === "z" || e.code === "KeyZ";
      const isY = e.key.toLowerCase() === "y" || e.code === "KeyY";
      const isA = e.key.toLowerCase() === "a" || e.code === "KeyA";
      const isDigit1 = e.key === "1" || e.code === "Digit1";
      const isDigit2 = e.key === "2" || e.code === "Digit2";
      const isDigit3 = e.key === "3" || e.code === "Digit3";

      if (isZ && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (
        (isY && (e.ctrlKey || e.metaKey) && !e.shiftKey) ||
        (isZ && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
      }
      if (isA && e.altKey && editable) {
        e.preventDefault();
        setShowAI((prev) => !prev);
      }
      if (e.altKey) {
        if (isDigit1) {
          e.preventDefault();
          setSwitchView("edit");
        } else if (isDigit2 && !isMobile) {
          e.preventDefault();
          setSwitchView("divided");
        } else if (isDigit3) {
          e.preventDefault();
          setSwitchView("preview");
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, editable, isMobile]);

  useEffect(() => {
    if (!monacoRef.current) return;

    monacoRef.current.editor.defineTheme("markdown-math-theme", {
      base: resolvedTheme === "dark" ? "vs-dark" : "vs",
      inherit: true,
      rules: resolvedTheme === "dark" ? darkRules : lightRules,
      colors: {},
    });

    monacoRef.current.editor.setTheme("markdown-math-theme");
  }, [resolvedTheme, monacoReady]);

  const viewTabs = (
    <Tabs value={switchView} onValueChange={(val) => setSwitchView(val as any)} className="gap-0 select-none shrink-0">
      <TabsList variant="line" className="h-8 p-0 bg-transparent gap-0">
        <TabsTrigger value="edit" className="gap-1.5 px-3 py-1 text-xs font-semibold cursor-pointer">
          <PenLine size={13.5} />
          <span className="hidden sm:inline">Editor</span>
        </TabsTrigger>
        {!isMobile && (
          <TabsTrigger value="divided" className="gap-1.5 px-3 py-1 text-xs font-semibold cursor-pointer">
            <Columns2 size={13.5} />
            <span className="hidden sm:inline">Dividi</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="preview" className="gap-1.5 px-3 py-1 text-xs font-semibold cursor-pointer">
          <Eye size={13.5} />
          <span className="hidden sm:inline">Anteprima</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const toolbar = (
    <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-[60px] items-center justify-between px-4 py-2 gap-4 overflow-x-auto select-none">
      {/* Left: History & Formatting Tray */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {/* History Capsule */}
        <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/40 shadow-xs shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={undoBtnRef}
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
                  onMouseDown={(e) => e.preventDefault()}
                  className="size-7 rounded-mdtext-foreground"
                >
                  <Undo2 size={15} />
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
                  variant="ghost"
                  size="icon"
                  onClick={handleRedo}
                  onMouseDown={(e) => e.preventDefault()}
                  className="size-7 rounded-mdtext-foreground"
                >
                  <Redo2 size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2">
                  Ripristina
                  {isMac ? (
                    <KbdGroup className="hidden md:flex">
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>Z</Kbd>
                    </KbdGroup>
                  ) : (
                    <KbdGroup className="hidden md:flex">
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Y</Kbd>
                    </KbdGroup>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {switchView !== "preview" && !isMobile && (
          <>
            <div className="h-6 w-px bg-border mx-1 shrink-0" />

            {/* Formatting Tray */}
            <div className="flex items-center gap-1 p-0.5 overflow-x-auto scrollbar-none max-w-full">
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

              <div className="w-px h-4 bg-border mx-1 shrink-0" />

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

              <div className="w-px h-4 bg-border mx-1 shrink-0" />

              <FormattingDivider
                _selection={selection}
                editorRef={editorRef}
                isFocused={isFocused}
              />
              <FormattingTable
                _selection={selection}
                editorRef={editorRef}
                isFocused={isFocused}
              />

              <div className="w-px h-4 bg-border mx-1 shrink-0" />

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

              <div className="w-px h-4 bg-border mx-1 shrink-0" />

              <FormattingLatex
                _selection={selection}
                editorRef={editorRef}
                isFocused={isFocused}
              />
            </div>
          </>
        )}
      </div>

      {/* Right: View Selector & Settings */}
      <div className="flex items-center gap-3 shrink-0">
        {editable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showAI ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAI(!showAI)}
                  className="h-8 gap-1.5 select-none cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{"Chiedi all'AI"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2">
                  {"Chiedi all'AI"}
                  <KbdGroup>
                    <Kbd>Alt</Kbd>
                    <span>+</span>
                    <Kbd>A</Kbd>
                  </KbdGroup>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="h-6 w-[1px] bg-border" />
        {viewTabs}
        <div className="h-6 w-[1px] bg-border" />
        <FormularioSettings formularioId={formularioId} />
      </div>
    </div>
  );
  const preview = !loading && (
    <EditorPreview markdownContent={markdownContent ?? ""} />
  );
  const editor = (
    <EditorInput
      argomentoId={argomentoId}
      textAreaContent={textAreaContent ?? ""}
      setTextAreaContent={setTextAreaContent}
      edited={edited}
      setEdited={setEdited}
      handleEditorDidMount={handleEditorDidMount}
      editable={editable}
      saveLoading={saveLoading}
      setSaveLoading={setSaveLoading}
      saveError={saveError}
      setSaveError={setSaveError}
    />
  );

  const input = !loading && editor;

  return (
    <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {editable ? (
            toolbar
          ) : (
            <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-[60px] items-center justify-between px-4 py-2 gap-4 overflow-x-auto select-none">
              {/* Left: TakeFormulario */}
              <div className="flex items-center gap-3 shrink-0">
                <TakeFormulario formularioId={formularioId} />
              </div>

              {/* Center spacer */}
              <div className="flex-1" />

              {/* Right: View Selector & Settings */}
              <div className="flex items-center gap-3 shrink-0">
                {viewTabs}
                <div className="h-6 w-[1px] bg-border" />
                <FormularioSettings formularioId={formularioId} />
              </div>
            </div>
          )}
        </>
      )}


        <div className="flex flex-1 min-h-0 w-full relative overflow-hidden">
          {/* Main Area: Editor and/or Preview */}
          <div className="flex-1 h-full flex relative min-w-0">
            {/* Left panel (Editor) */}
            <div
              className="h-full flex flex-col min-w-0"
              style={{
                display: switchView === "preview" ? "none" : "flex",
                width: (!isMobile && switchView === "divided") ? `${resizableSize}%` : "100%",
              }}
            >
              {input}
            </div>

            {/* Divider */}
            {!isMobile && switchView === "divided" && (
              <div
                className="w-1 bg-border/50 hover:bg-muted-foreground/30 hover:w-1.5 transition-all cursor-col-resize h-full select-none"
                onMouseDown={handleMouseDown}
              />
            )}

            {/* Right panel (Preview) */}
            <div
              className="h-full flex flex-col min-w-0"
              style={{
                display: (switchView === "preview" || (!isMobile && switchView === "divided")) ? "flex" : "none",
                width: (!isMobile && switchView === "divided") ? `${100 - resizableSize}%` : "100%",
              }}
            >
              {preview}
            </div>

            {editable && !loading && (
              <SyncStatus error={saveError} loading={saveLoading} />
            )}
          </div>

          {/* AI Chat Sidebar */}
          {editable && (
            <div className={`h-full border-l bg-background flex flex-col z-20 shrink-0 transition-all duration-300 shadow-lg ${
              isMobile 
                ? "absolute inset-0 w-full" 
                : isAiExpanded 
                  ? "w-[650px]" 
                  : "w-[350px]"
            } ${showAI ? "" : "hidden"}`}>
              <EditorAI 
                editorRef={editorRef} 
                onClose={() => setShowAI(false)} 
                isExpanded={isAiExpanded}
                onToggleExpand={() => setIsAiExpanded(!isAiExpanded)}
              />
            </div>
          )}
        </div>
    </div>
  );
}
