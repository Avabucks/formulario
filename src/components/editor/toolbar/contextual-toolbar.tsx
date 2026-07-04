"use client";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import languages from "@/src/data/languages.json";
import {
  getBoldRegex,
  getCodeInlineRegex,
  getH1Regex,
  getH2Regex,
  getH3Regex,
  getH4Regex,
  getH5Regex,
  getH6Regex,
  getIsActiveCode,
  getIsActiveLatex,
  getIsActiveList,
  getIsActiveWord,
  getItalicRegex,
  getOrderedListRegex,
  getQuoteRegex,
  getUnorderedListRegex,
  handleBlockToggle,
  handleListToggle,
} from "@/src/lib/editor/formatting-utils";
import { cn } from "@/src/lib/utils";
import {
  Bold,
  Check,
  ChevronDown,
  ChevronRight,
  Heading,
  Indent,
  Italic,
  List,
  ListOrdered,
  Outdent,
  PenTool,
  Quote,
  Radical,
  SquareCode,
  Terminal,
  Type
} from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useMemo, useState } from "react";
import { toggleBold } from "./tools/formatting-bold";
import { toggleCodeInline } from "./tools/formatting-code-inline";
import { toggleItalic } from "./tools/formatting-italic";
import { toggleQuote } from "./tools/formatting-quote";

interface ContextualToolbarProps {
  selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

type ActiveState =
  | { type: "latex"; data: NonNullable<ReturnType<typeof getIsActiveLatex>> }
  | { type: "code"; data: NonNullable<ReturnType<typeof getIsActiveCode>> }
  | { type: "header"; level: number }
  | { type: "list"; kind: "ordered" | "unordered"; bold: boolean; italic: boolean; quote: boolean; inlineCode: boolean }
  | { type: "text"; bold: boolean; italic: boolean; quote: boolean; inlineCode: boolean };

export function ContextualToolbar({
  selection,
  editorRef,
}: Readonly<ContextualToolbarProps>) {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 1. Detect active formatting using existing logic
  const activeState = useMemo<ActiveState | null>(() => {
    if (!selection || !editorRef.current) return null;

    // A. Check LaTeX
    const latexMatch = getIsActiveLatex(editorRef);
    if (latexMatch) {
      return { type: "latex", data: latexMatch };
    }

    // B. Check Code Block
    const codeBlock = getIsActiveCode(editorRef);
    if (codeBlock) {
      return { type: "code", data: codeBlock };
    }

    // C. Check Headers
    if (getIsActiveList(editorRef, getH1Regex)) return { type: "header", level: 1 };
    if (getIsActiveList(editorRef, getH2Regex)) return { type: "header", level: 2 };
    if (getIsActiveList(editorRef, getH3Regex)) return { type: "header", level: 3 };
    if (getIsActiveList(editorRef, getH4Regex)) return { type: "header", level: 4 };
    if (getIsActiveList(editorRef, getH5Regex)) return { type: "header", level: 5 };
    if (getIsActiveList(editorRef, getH6Regex)) return { type: "header", level: 6 };

    // Common text styles (Bold, Italic, Quote, Inline Code) to be used as default and inside lists
    const isBold = getIsActiveWord(editorRef, getBoldRegex);
    const isItalic = getIsActiveWord(editorRef, getItalicRegex);
    const isQuote = getIsActiveList(editorRef, getQuoteRegex);
    const isInlineCode = getIsActiveWord(editorRef, getCodeInlineRegex);

    // D. Check Lists
    const isUnordered = getIsActiveList(editorRef, getUnorderedListRegex);
    const isOrdered = getIsActiveList(editorRef, getOrderedListRegex);
    if (isUnordered || isOrdered) {
      return {
        type: "list",
        kind: isUnordered ? ("unordered" as const) : ("ordered" as const),
        bold: isBold,
        italic: isItalic,
        quote: isQuote,
        inlineCode: isInlineCode,
      };
    }

    // E. Default Text styles context
    return {
      type: "text",
      bold: isBold,
      italic: isItalic,
      quote: isQuote,
      inlineCode: isInlineCode,
    };
  }, [selection, editorRef, updateTrigger]);

  // Indent list items in selection by 2 spaces
  const indentList = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const selection = editor.getSelection();
    if (!selection) return;

    const edits = [];
    for (let l = selection.startLineNumber; l <= selection.endLineNumber; l++) {
      edits.push({
        range: {
          startLineNumber: l,
          startColumn: 1,
          endLineNumber: l,
          endColumn: 1,
        },
        text: "  ",
      });
    }

    model.pushEditOperations([], edits, () => null);
    setUpdateTrigger((prev) => prev + 1);
    editor.focus();
  };

  // Outdent list items in selection (remove up to 2 spaces)
  const outdentList = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const selection = editor.getSelection();
    if (!selection) return;

    const edits = [];
    for (let l = selection.startLineNumber; l <= selection.endLineNumber; l++) {
      const content = model.getLineContent(l);
      let spacesToRemove = 0;
      if (content.startsWith("  ")) {
        spacesToRemove = 2;
      } else if (content.startsWith(" ")) {
        spacesToRemove = 1;
      } else if (content.startsWith("\t")) {
        spacesToRemove = 1;
      }

      if (spacesToRemove > 0) {
        edits.push({
          range: {
            startLineNumber: l,
            startColumn: 1,
            endLineNumber: l,
            endColumn: spacesToRemove + 1,
          },
          text: "",
        });
      }
    }

    model.pushEditOperations([], edits, () => null);
    setUpdateTrigger((prev) => prev + 1);
    editor.focus();
  };

  // Select and change header level or toggle off if already active
  const handleHeaderSelect = (level: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    const selection = editor.getSelection();
    if (!selection) return;

    const currentRegex = [getH1Regex, getH2Regex, getH3Regex, getH4Regex, getH5Regex, getH6Regex][level - 1];
    const isCurrentLevelActive = getIsActiveList(editorRef, currentRegex);
    const prefix = "#".repeat(level);

    handleListToggle(
      editorRef,
      isCurrentLevelActive,
      currentRegex,
      (line) => `${prefix} ${line.replace(/^#{1,6}\s/, "")}`,
      (line) => line.replace(new RegExp(String.raw`^${prefix}\s`), "")
    );
    setUpdateTrigger((prev) => prev + 1);
    setTimeout(() => editor.focus(), 50);
  };

  if (!activeState) return null;

  return (
    <div className="hidden md:flex items-center overflow-x-auto overflow-y-hidden max-w-full min-w-0">
      {/* CASE 1: LATEX FORMULA */}
      {activeState.type === "latex" && (
        <>
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            <Radical className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium font-sans capitalize">
              Formula {activeState.data.kind === "double" ? "blocco" : "inline"}
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="text-foreground gap-1.5 overf"
                  onClick={() => {
                    const event = new CustomEvent(
                      activeState.data.kind === "double"
                        ? "editor:open-latex-double"
                        : "editor:open-latex-single"
                    );
                    globalThis.dispatchEvent(event);
                  }}
                >
                  <PenTool className="size-4 text-primary" />
                  <span>Componi formula</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Componi la formula (inserisci simboli, frazioni o funzioni KaTeX)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* CASE 2: CODE BLOCK */}
      {activeState.type === "code" && (
        <>
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            <SquareCode className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium font-sans">
              Blocco codice
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="text-foreground"
              >
                <span className="font-semibold capitalize">
                  {languages.find((l) => l.value === activeState.data.language)?.label || "Senza linguaggio"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-75 overflow-y-auto">
              <DropdownMenuItem
                className="cursor-pointer text-xs"
                onClick={() => {
                  handleBlockToggle(
                    editorRef,
                    activeState.data,
                    "```",
                    "```",
                    null
                  );
                  setUpdateTrigger((prev) => prev + 1);
                  setTimeout(() => editorRef.current?.focus(), 50);
                }}
              >
                <div className="flex items-center w-full justify-between">
                  <span>Senza linguaggio</span>
                  {activeState.data.language === null && <Check className="size-4 text-primary shrink-0" />}
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    handleBlockToggle(
                      editorRef,
                      activeState.data,
                      "```",
                      "```",
                      lang.value
                    );
                    setUpdateTrigger((prev) => prev + 1);
                    setTimeout(() => editorRef.current?.focus(), 50);
                  }}
                >
                  <div className="flex items-center w-full justify-between">
                    <span>{lang.label}</span>
                    {activeState.data.language === lang.value && <Check className="size-4 text-primary shrink-0" />}
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer text-xs"
                onClick={() => {
                  handleBlockToggle(
                    editorRef,
                    activeState.data,
                    "```",
                    "```"
                  );
                  setUpdateTrigger((prev) => prev + 1);
                  setTimeout(() => editorRef.current?.focus(), 50);
                }}
              >
                Rimuovi Blocco Codice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* CASE 3: HEADER BLOCK */}
      {activeState.type === "header" && (
        <>
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            <Heading className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium font-sans">
              Intestazione
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="text-foreground"
              >
                <span className="font-semibold">H{activeState.level}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <DropdownMenuItem
                  key={l}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    handleHeaderSelect(l);
                  }}
                >
                  <div className="flex items-center w-full justify-between">
                    <span>Titolo {l} (H{l})</span>
                    {activeState.level === l && <Check className="size-4 text-primary shrink-0" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-xs text-destructive focus:bg-destructive/10"
                onClick={() => {
                  if (activeState.level) {
                    handleHeaderSelect(activeState.level);
                  }
                }}
              >
                Rimuovi Intestazione
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* CASE 4: WORD FORMATTING (BOLD, ITALIC, INLINE CODE) */}
      {activeState.type === "text" && (
        <>
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            <Type className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium font-sans">
              Stile
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.bold && "bg-muted"
                    )}
                    onClick={() => {
                      toggleBold(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Bold className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grassetto</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.italic && "bg-muted"
                    )}
                    onClick={() => {
                      toggleItalic(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Italic className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Corsivo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.quote && "bg-muted"
                    )}
                    onClick={() => {
                      toggleQuote(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Quote className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Citazione</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.inlineCode && "bg-muted"
                    )}
                    onClick={() => {
                      toggleCodeInline(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Terminal className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Codice inline</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}

      {/* CASE 5: LISTS (ORDERED OR UNORDERED) */}
      {activeState.type === "list" && (
        <>
          {/* Style first */}
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            <Type className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium font-sans">
              Stile
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.bold && "bg-muted"
                    )}
                    onClick={() => {
                      toggleBold(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Bold className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grassetto</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.italic && "bg-muted"
                    )}
                    onClick={() => {
                      toggleItalic(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Italic className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Corsivo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.quote && "bg-muted"
                    )}
                    onClick={() => {
                      toggleQuote(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Quote className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Citazione</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-foreground",
                      activeState.inlineCode && "bg-muted"
                    )}
                    onClick={() => {
                      toggleCodeInline(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Terminal className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Codice inline</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* List second */}
          <div className="h-5 w-px bg-border mx-2.5 shrink-0" />
          <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
            {activeState.kind === "unordered" ? (
              <List className="size-4 text-muted-foreground" />
            ) : (
              <ListOrdered className="size-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground font-medium font-sans">
              {activeState.kind === "unordered" ? "Elenco non ordinato" : "Elenco ordinato"}
            </span>
            <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground"
                    onClick={outdentList}
                  >
                    <Outdent className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Riduci rientro (Sposta a sinistra)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground"
                    onClick={indentList}
                  >
                    <Indent className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Aumenta rientro (Sposta a destra)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
}
