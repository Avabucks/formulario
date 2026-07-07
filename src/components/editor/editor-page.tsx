"use client";

import { useIsMobile } from "@/src/hooks/useIsMobile";
<<<<<<< HEAD
import { Monaco } from "@monaco-editor/react";
import {
  ArrowRightLeft,
  Eye,
  EyeClosed,
  PenOff,
  Redo2,
  Undo2,
  Download,
  FileJson,
  FileText,
  FileCode,
  Printer,
} from "lucide-react";
import type { Selection } from "monaco-editor";
import { useTheme } from "next-themes";
=======
import clsx from "clsx";
import { Columns2, Eye, Maximize2, Minimize2, PenLine, Redo2, Sparkles, Undo2 } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
import { useEffect, useRef, useState } from "react";
import { FormularioSettings } from "../home/formulario-settings";
import { TakeFormulario } from "../home/take-formulario";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { Kbd, KbdGroup, useIsMac } from "../ui/kbd";
import { Spinner } from "../ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
<<<<<<< HEAD
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Exporter } from "@/src/lib/export-utils";
import slugify from "slugify";
import { EditorInput } from "./editor-katex/editor-input";
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
import { AskAIButton } from "./editor-katex/tools/ask-ai";
=======
import { EditorAI } from "./chat/editor-ai";
import { EditorPreview } from "./preview/editor-preview";
import { FormattingCommand } from "./tools/formatting-command";
import { EditorInput, SyncStatus } from "./input/editor-input";
import { ShortcutsListener } from "./tools/shortcuts-listener";

const MIN_RESIZABLE_SIZE = 20;
const MAX_RESIZABLE_SIZE = 80;
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189

export function EditorPage({
  argomentoId,
  editable,
  formularioId,
}: Readonly<{ argomentoId: string; editable: boolean; formularioId: string }>) {
  const isMobile = useIsMobile();

  const [textAreaContent, setTextAreaContent] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [user, setUser] = useState<{
    display_name: string;
    foto_profilo: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [edited, setEdited] = useState<boolean>(false);
  const [switchView, setSwitchView] = useState<"preview" | "divided" | "edit">(
    "preview",
  );
  const [hasSetInitialView, setHasSetInitialView] = useState<boolean>(false);
  const [showAI, setShowAI] = useState<boolean>(false);
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [resizableSize, setResizableSize] = useState<number>(40);
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

<<<<<<< HEAD
  const ExportNoteButton = () => {
    const handleExportMarkdown = () => {
      const firstLine = textAreaContent?.split("\n")[0] ?? "";
      const rawTitle = firstLine.startsWith("#") ? firstLine.replace(/^#+\s*/, "") : "Senza titolo";
      const cleanFilename = slugify(rawTitle, { lower: true, strict: true }) || "nota";
      Exporter.markdown.exportNote({
        id: argomentoId,
        title: rawTitle,
        content: textAreaContent
      }, cleanFilename);
    };

    const handleExportJson = () => {
      const firstLine = textAreaContent?.split("\n")[0] ?? "";
      const rawTitle = firstLine.startsWith("#") ? firstLine.replace(/^#+\s*/, "") : "Senza titolo";
      const cleanFilename = slugify(rawTitle, { lower: true, strict: true }) || "nota";
      Exporter.json.exportNote({
        id: argomentoId,
        title: rawTitle,
        content: textAreaContent
      }, cleanFilename);
    };

    const handleExportLatex = () => {
      const firstLine = textAreaContent?.split("\n")[0] ?? "";
      const rawTitle = firstLine.startsWith("#") ? firstLine.replace(/^#+\s*/, "") : "Senza titolo";
      const cleanFilename = slugify(rawTitle, { lower: true, strict: true }) || "nota";
      Exporter.latex.exportNote({
        id: argomentoId,
        title: rawTitle,
        content: textAreaContent
      }, cleanFilename);
    };

    const handleExportPdf = () => {
      window.open(`/export/argomento/${argomentoId}`, "_blank");
    };

    return (
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Download size={16} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Esporta nota</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleExportPdf} className="flex gap-2 items-center cursor-pointer">
            <Printer className="h-4 w-4" />
            <span>Esporta come PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown} className="flex gap-2 items-center cursor-pointer">
            <FileText className="h-4 w-4" />
            <span>Esporta come Markdown (.md)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportLatex} className="flex gap-2 items-center cursor-pointer">
            <FileCode className="h-4 w-4" />
            <span>Esporta come LaTeX (.tex)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJson} className="flex gap-2 items-center cursor-pointer">
            <FileJson className="h-4 w-4" />
            <span>Esporta come JSON (.json)</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [monacoReady, setMonacoReady] = useState(false);
=======
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isMac = useIsMac();
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189

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
      setResizableSize(
        Math.max(
          MIN_RESIZABLE_SIZE,
          Math.min(MAX_RESIZABLE_SIZE, startSize + deltaPercent),
        ),
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newSize;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      newSize = Math.max(MIN_RESIZABLE_SIZE, resizableSize - 1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      newSize = Math.min(MAX_RESIZABLE_SIZE, resizableSize + 1);
    } else if (e.key === "Home") {
      newSize = MIN_RESIZABLE_SIZE;
    } else if (e.key === "End") {
      newSize = MAX_RESIZABLE_SIZE;
    } else {
      return;
    }
    e.preventDefault();
    setResizableSize(newSize);
  };

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
      setUser({
        display_name: data.display_name,
        foto_profilo: data.foto_profilo,
      });
      setLoading(false);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
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
    const handleViewShortcut = (e: KeyboardEvent): boolean => {
      if (e.key === "1" || e.code === "Digit1") {
        e.preventDefault();
        setSwitchView("edit");
        return true;
      }
      if ((e.key === "2" || e.code === "Digit2") && !isMobile) {
        e.preventDefault();
        setSwitchView("divided");
        return true;
      }
      if (e.key === "3" || e.code === "Digit3") {
        e.preventDefault();
        setSwitchView("preview");
        return true;
      }
      return false;
    };

    const handleFullscreenShortcut = (e: KeyboardEvent): boolean => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        return true;
      }
      if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true"
        );
        if (!isFocused && !isTyping) {
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
          return true;
        }
      }
      return false;
    };

    const handleHistoryShortcut = (e: KeyboardEvent): boolean => {
      const isZ = e.key.toLowerCase() === "z" || e.code === "KeyZ";
      const isY = e.key.toLowerCase() === "y" || e.code === "KeyY";
      const hasMeta = e.ctrlKey || e.metaKey;

      if (isZ && hasMeta && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return true;
      }
      if ((isY && hasMeta && !e.shiftKey) || (isZ && hasMeta && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
        return true;
      }
      return false;
    };

    const handleViewAndAiShortcut = (e: KeyboardEvent): boolean => {
      const isA = e.key.toLowerCase() === "a" || e.code === "KeyA";
      if (isA && e.altKey && editable) {
        e.preventDefault();
        setShowAI((prev) => !prev);
        return true;
      }
      if (e.altKey) {
        return handleViewShortcut(e);
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (handleFullscreenShortcut(e)) return;
      if (handleHistoryShortcut(e)) return;
      if (handleViewAndAiShortcut(e)) return;
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, editable, isMobile, isFullscreen, isFocused]);

  const titleComponent = () => {
    if (switchView === "preview" || !editable)
      return (
        <div className="hidden md:flex items-center gap-3 py-1 rounded-md bg-background/50">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.foto_profilo} alt={user?.display_name} />
            <AvatarFallback className="text-xs font-medium">
              {user?.display_name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-sm font-medium text-foreground truncate">
            {getMarkdownTitle(markdownContent)}
          </h1>
        </div>
      );
    return null;
  };

  const viewTabs = (
    <Tabs
      value={switchView}
      onValueChange={(val) => setSwitchView(val as "preview" | "divided" | "edit")}
      className="gap-0 select-none shrink-0"
    >
      <TabsList variant="line" className="h-7 md:h-8 p-0 bg-transparent gap-0">
        <TabsTrigger
          value="edit"
          className="gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 text-xs font-semibold cursor-pointer"
        >
          <PenLine size={13.5} />
          <span className="hidden sm:inline">Editor</span>
        </TabsTrigger>
        {!isMobile && (
          <TabsTrigger
            value="divided"
            className="gap-1.5 px-3 py-1 text-xs font-semibold cursor-pointer"
          >
            <Columns2 size={13.5} />
            <span className="hidden sm:inline">Dividi</span>
          </TabsTrigger>
        )}
        <TabsTrigger
          value="preview"
          className="gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 text-xs font-semibold cursor-pointer"
        >
          <Eye size={13.5} />
          <span className="hidden sm:inline">Anteprima</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
  const toolbar = (
    <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-14 md:min-h-15 items-center justify-between px-2.5 md:px-4 py-1.5 md:py-2 gap-2 md:gap-4 overflow-x-auto scrollbar-none select-none">
      {/* Left: History & Formatting Tray */}
      <div className="flex flex-1 items-center gap-1.5 md:gap-3 min-w-0">
        {/* History Capsule */}
        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={undoBtnRef}
                  variant="outline"
                  onClick={handleUndo}
                  onMouseDown={(e) => e.preventDefault()}
                  className="h-7 w-7 md:h-8 md:w-8 text-foreground flex items-center justify-center p-0 shrink-0"
                >
                  <Undo2 className="size-3.5 md:size-4" />
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
                  onClick={handleRedo}
                  onMouseDown={(e) => e.preventDefault()}
                  className="h-7 w-7 md:h-8 md:w-8 text-foreground flex items-center justify-center p-0 shrink-0"
                >
                  <Redo2 className="size-3.5 md:size-4" />
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

        <div className="h-6 w-px bg-border shrink-0 hidden sm:block" />

        <div className={clsx(switchView === "preview" && "hidden")}>
          <FormattingCommand _selection={selection} editorRef={editorRef} />
        </div>

        {titleComponent()}
      </div>

      {/* Right: View Selector & Settings */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {editable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showAI ? "default" : "outline"}
                  onClick={() => setShowAI(!showAI)}
                  className="h-7 md:h-8 gap-1 md:gap-1.5 px-2 md:px-2.5 text-[0.8rem] md:text-sm select-none cursor-pointer"
                >
                  <Sparkles className="size-3.5 md:size-4" />
                  <span className="hidden md:flex -mr-1.25">
                    Chiedi all&apos;
                  </span>{" "}
                  AI
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
        <div className="h-6 w-px bg-border hidden sm:block" />
        {viewTabs}
        <div className="h-6 w-px bg-border hidden sm:block" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                pressed={isFullscreen}
                onPressedChange={setIsFullscreen}
                className="h-7 w-7 md:h-8 md:w-8 text-foreground shrink-0 cursor-pointer p-0 flex items-center justify-center"
              >
                {isFullscreen ? (
                  <Minimize2 className="size-3.5 md:size-4" />
                ) : (
                  <Maximize2 className="size-3.5 md:size-4" />
                )}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="pr-1.5">
              <div className="flex items-center gap-2">
                {isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
                <KbdGroup>
                  <Kbd>F</Kbd>
                </KbdGroup>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
<<<<<<< HEAD
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

          <FormattingTable
            _selection={selection}
            editorRef={editorRef}
            isFocused={isFocused}
          />
          <FormattingDivider
            _selection={selection}
            editorRef={editorRef}
            isFocused={isFocused}
          />

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

          <FormattingLatex
            _selection={selection}
            editorRef={editorRef}
            isFocused={isFocused}
          />
        </div>

        <div className="flex items-center gap-3 px-3 h-full">
          <AskAIButton editorRef={editorRef} />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden border-l items-center px-3 gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSwitchView((prev) => !prev)}
        >
          <ArrowRightLeft size={16} />
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex border-l items-center px-3 gap-3">
        <Toggle
          variant="outline"
          pressed={switchView}
          onClick={() => setSwitchView((prev) => !prev)}
        >
          {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
        </Toggle>
      </div>

      <div className="flex border-l items-center px-3 gap-2">
        <ExportNoteButton />
=======
        <div className="h-6 w-px bg-border hidden sm:block" />
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
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
      editorRef={editorRef}
      setSelection={setSelection}
      setIsFocused={setIsFocused}
      undoBtnRef={undoBtnRef}
      redoBtnRef={redoBtnRef}
      editable={editable}
      saveLoading={saveLoading}
      setSaveLoading={setSaveLoading}
      saveError={saveError}
      setSaveError={setSaveError}
    />
  );

  const input = !loading && editor;

  const editorHeader = () => {
    if (editable) {
      return toolbar;
    }

    return (
      <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-14 md:min-h-15 items-center justify-between px-2.5 md:px-4 py-1.5 md:py-2 gap-2 md:gap-4 overflow-x-auto scrollbar-none select-none">
        {/* Left: TakeFormulario */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <TakeFormulario formularioId={formularioId} />
          <div className="h-6 w-px bg-border hidden sm:block" />
          {titleComponent()}
        </div>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Right: View Selector & Settings */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {viewTabs}
          <div className="h-6 w-px bg-border hidden sm:block" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  variant="outline"
                  pressed={isFullscreen}
                  onPressedChange={setIsFullscreen}
                  className="size-7 md:size-8 text-foreground shrink-0 cursor-pointer p-0"
                >
                  {isFullscreen ? <Minimize2 size={isMobile ? 14 : 15} /> : <Maximize2 size={isMobile ? 14 : 15} />}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2">
                  {isFullscreen ? "Esci da schermo intero" : "Schermo intero"}
                  <KbdGroup>
                    <Kbd>F</Kbd>
                  </KbdGroup>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <FormularioSettings formularioId={formularioId} />
        </div>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "flex flex-1 flex-col min-h-0 overflow-hidden",
        isFullscreen
          ? "fixed inset-0 z-50 bg-background w-screen h-screen rounded-none border-none"
          : "border rounded-lg"
      )}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
<<<<<<< HEAD
        <>
          {editable ? (
            toolbar
          ) : (
            <div className="flex w-full border-b min-h-15 justify-between items-center">
              <div className="flex flex-1 items-center gap-2 px-4 text-sm text-muted-foreground">
                <PenOff size={16} />
                <TakeFormulario formularioId={formularioId} />
                <span className="hidden md:flex">per modifcare</span>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden border-l items-center px-3 gap-3 h-full">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSwitchView((prev) => !prev)}
                >
                  <ArrowRightLeft size={16} />
                </Button>
              </div>

              {/* Desktop */}
              <div className="hidden md:flex border-l items-center px-3 gap-3 h-full">
                <Toggle
                  variant="outline"
                  pressed={switchView}
                  onClick={() => setSwitchView((prev) => !prev)}
                >
                  {switchView ? <Eye size={16} /> : <EyeClosed size={16} />}
                </Toggle>
              </div>

              <div className="flex border-l items-center px-3 gap-2 h-full">
                <ExportNoteButton />
                <FormularioSettings formularioId={formularioId} />
              </div>
            </div>
          )}
        </>
=======
        editorHeader()
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
      )}

      <div className="flex flex-1 min-h-0 w-full relative overflow-hidden">
        <EditorPanels
          switchView={switchView}
          isMobile={isMobile}
          resizableSize={resizableSize}
          handleMouseDown={handleMouseDown}
          handleSliderKeyDown={handleSliderKeyDown}
          input={input}
          preview={preview}
          editable={editable}
          loading={loading}
          saveError={saveError}
          saveLoading={saveLoading}
        />

        <EditorAISidebar
          editable={editable}
          isMobile={isMobile}
          isAiExpanded={isAiExpanded}
          showAI={showAI}
          editorRef={editorRef}
          setShowAI={setShowAI}
          setIsAiExpanded={setIsAiExpanded}
        />
      </div>

      <ShortcutsListener editorRef={editorRef} isFocused={isFocused} />
    </div>
  );
}

const getMarkdownTitle = (markdown: string): string => {
  const firstLine = markdown.split("\n", 1)[0]?.trim();
  return firstLine?.startsWith("#")
    ? firstLine.replace(/^#+\s*/, "")
    : "Senza Titolo";
};

interface EditorPanelsProps {
  switchView: string;
  isMobile: boolean;
  resizableSize: number;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleSliderKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  input: React.ReactNode;
  preview: React.ReactNode;
  editable: boolean;
  loading: boolean;
  saveError: boolean;
  saveLoading: boolean;
}

function EditorPanels({
  switchView,
  isMobile,
  resizableSize,
  handleMouseDown,
  handleSliderKeyDown,
  input,
  preview,
  editable,
  loading,
  saveError,
  saveLoading,
}: Readonly<EditorPanelsProps>) {
  return (
    <div className="flex-1 h-full flex relative min-w-0">
      {/* Left panel (Editor) */}
      <div
        className="h-full flex flex-col min-w-0"
        style={{
          display: switchView === "preview" ? "none" : "flex",
          width:
            !isMobile && switchView === "divided"
              ? `${resizableSize}%`
              : "100%",
        }}
      >
        {input}
      </div>

      {/* Divider */}
      {!isMobile && switchView === "divided" && (
        <div
          className="w-1 bg-border/50 hover:bg-muted-foreground/30 hover:w-1.5 transition-all cursor-col-resize h-full select-none outline-none focus-visible:bg-primary/50"
          onMouseDown={handleMouseDown}
          onKeyDown={handleSliderKeyDown}
          role="slider"
          aria-valuenow={resizableSize}
          aria-valuemin={MIN_RESIZABLE_SIZE}
          aria-valuemax={MAX_RESIZABLE_SIZE}
          tabIndex={0}
        />
      )}

      {/* Right panel (Preview) */}
      <div
        className="h-full flex flex-col min-w-0"
        style={{
          display:
            switchView === "preview" ||
            (!isMobile && switchView === "divided")
              ? "flex"
              : "none",
          width:
            !isMobile && switchView === "divided"
              ? `${100 - resizableSize}%`
              : "100%",
        }}
      >
        {preview}
      </div>

      {editable && !loading && (
        <SyncStatus error={saveError} loading={saveLoading} />
      )}
    </div>
  );
}

interface EditorAISidebarProps {
  editable: boolean;
  isMobile: boolean;
  isAiExpanded: boolean;
  showAI: boolean;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  setShowAI: (show: boolean) => void;
  setIsAiExpanded: (expanded: boolean) => void;
}

function EditorAISidebar({
  editable,
  isMobile,
  isAiExpanded,
  showAI,
  editorRef,
  setShowAI,
  setIsAiExpanded,
}: Readonly<EditorAISidebarProps>) {
  if (!editable) return null;

  return (
    <div
      className={clsx(
        "h-full border-l bg-background flex flex-col z-20 shrink-0 transition-all duration-300 shadow-lg",
        {
          "absolute inset-0 w-full": isMobile,
          "w-162.5": !isMobile && isAiExpanded,
          "w-87.5": !isMobile && !isAiExpanded,
          hidden: !showAI,
        }
      )}
    >
      <EditorAI
        editorRef={editorRef}
        onClose={() => setShowAI(false)}
        isExpanded={isAiExpanded}
        onToggleExpand={() => setIsAiExpanded(!isAiExpanded)}
      />
    </div>
  );
}
