"use client";

import { useIsMobile } from "@/src/hooks/useIsMobile";
import clsx from "clsx";
import {
  Columns2,
  Eye,
  PenLine,
  Redo2,
  Sparkles,
  Undo2
} from "lucide-react";
import type { Selection } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { FormularioSettings } from "../home/formulario-settings";
import { TakeFormulario } from "../home/take-formulario";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Kbd, KbdGroup, useIsMac } from "../ui/kbd";
import { Spinner } from "../ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { EditorAI } from "./editor-katex/editor-ai";
import { EditorInput, SyncStatus } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { FormattingCommand } from "./editor-katex/formatting-command";
import { ShortcutsListener } from "./editor-katex/shortcuts-listener";

const MIN_RESIZABLE_SIZE = 20;
const MAX_RESIZABLE_SIZE = 80;

export function EditorPage({
  argomentoId,
  editable,
  formularioId,
}: Readonly<{ argomentoId: string; editable: boolean; formularioId: string }>) {
  const isMobile = useIsMobile();

  const [textAreaContent, setTextAreaContent] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [user, setUser] = useState<{ display_name: string; foto_profilo: string } | null>(null);
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
      setResizableSize(Math.max(MIN_RESIZABLE_SIZE, Math.min(MAX_RESIZABLE_SIZE, startSize + deltaPercent)));
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
      setUser({ display_name: data.display_name, foto_profilo: data.foto_profilo });
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
    const handleViewShortcut = (e: KeyboardEvent) => {
      if (e.key === "1" || e.code === "Digit1") {
        e.preventDefault();
        setSwitchView("edit");
      } else if ((e.key === "2" || e.code === "Digit2") && !isMobile) {
        e.preventDefault();
        setSwitchView("divided");
      } else if (e.key === "3" || e.code === "Digit3") {
        e.preventDefault();
        setSwitchView("preview");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === "z" || e.code === "KeyZ";
      const isY = e.key.toLowerCase() === "y" || e.code === "KeyY";
      const isA = e.key.toLowerCase() === "a" || e.code === "KeyA";
      const hasMeta = e.ctrlKey || e.metaKey;

      if (isZ && hasMeta && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((isY && hasMeta && !e.shiftKey) || (isZ && hasMeta && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (isA && e.altKey && editable) {
        e.preventDefault();
        setShowAI((prev) => !prev);
        return;
      }
      if (e.altKey) {
        handleViewShortcut(e);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, editable, isMobile]);

  const titleComponent = () => {
    if (switchView === "preview" || !editable) return (
      <div className="hidden md:flex items-center gap-3 py-1 rounded-md bg-background/50">
        <Avatar className="h-7 w-7">
          <AvatarImage src={user?.foto_profilo} alt={user?.display_name} />
          <AvatarFallback className="text-xs font-medium">
            {user?.display_name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-sm font-medium text-foreground truncate">
          {(() => {
            const firstLine = markdownContent.split("\n", 1)[0]?.trim();

            return firstLine?.startsWith("#")
              ? firstLine.replace(/^#+\s*/, "")
              : "Senza Titolo";
          })()}
        </h1>
      </div>
    )
    return null;
  }

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
    <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-15 items-center justify-between px-4 py-2 gap-4 overflow-x-auto select-none">
      {/* Left: History & Formatting Tray */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {/* History Capsule */}
        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={undoBtnRef}
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  onMouseDown={(e) => e.preventDefault()}
                  className="text-foreground"
                >
                  <Undo2 className="size-4" />
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
                  className="text-foreground"
                >
                  <Redo2 className="size-4" />
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

        <div className="h-6 w-px bg-border shrink-0" />



        {switchView !== "preview" && (
          <FormattingCommand
            _selection={selection}
            editorRef={editorRef}
          />
        )}

        {titleComponent()}

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
                  <span className="hidden md:flex -mr-1.25">Chiedi all&apos;</span> AI
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
        <div className="h-6 w-px bg-border" />
        {viewTabs}
        <div className="h-6 w-px bg-border" />
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
      <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-15 items-center justify-between px-4 py-2 gap-4 overflow-x-auto select-none">
        {/* Left: TakeFormulario */}
        <div className="flex items-center gap-3 shrink-0">
          <TakeFormulario formularioId={formularioId} />
          <div className="h-6 w-px bg-border" />
          {titleComponent()}
        </div>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Right: View Selector & Settings */}
        <div className="flex items-center gap-3 shrink-0">
          {viewTabs}
          <div className="h-6 w-px bg-border" />
          <FormularioSettings formularioId={formularioId} />
        </div>

      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        editorHeader()
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
        )}
      </div>

      <ShortcutsListener
        editorRef={editorRef}
        isFocused={isFocused}
      />
    </div>
  );
}

