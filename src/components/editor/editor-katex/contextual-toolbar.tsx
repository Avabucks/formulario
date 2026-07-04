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
  Heading,
  Indent,
  Italic,
  List,
  ListOrdered,
  Outdent,
  Plus,
  Quote,
  Radical,
  SquareCode,
  SquareRadical,
  Terminal,
} from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useMemo, useState } from "react";
import { toggleBold } from "./tools/formatting-bold";
import { toggleQuote } from "./tools/formatting-quote";
import { toggleItalic } from "./tools/formatting-italic";
import { toggleCodeInline } from "./tools/formatting-code-inline";

interface ContextualToolbarProps {
  selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

type ActiveState =
  | { type: "latex"; data: NonNullable<ReturnType<typeof getIsActiveLatex>> }
  | { type: "code"; data: NonNullable<ReturnType<typeof getIsActiveCode>> }
  | { type: "header"; level: number }
  | { type: "list"; kind: "ordered" | "unordered" }
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

    // D. Check Lists
    const isUnordered = getIsActiveList(editorRef, getUnorderedListRegex);
    const isOrdered = getIsActiveList(editorRef, getOrderedListRegex);
    if (isUnordered || isOrdered) {
      return { type: "list", kind: isUnordered ? ("unordered" as const) : ("ordered" as const) };
    }

    // E. Check Word/Line Formats (Bold, Italic, Quote, Inline Code)
    const isBold = getIsActiveWord(editorRef, getBoldRegex);
    const isItalic = getIsActiveWord(editorRef, getItalicRegex);
    const isQuote = getIsActiveList(editorRef, getQuoteRegex);
    const isInlineCode = getIsActiveWord(editorRef, getCodeInlineRegex);

    if (isBold || isItalic || isQuote || isInlineCode) {
      return {
        type: "text",
        bold: isBold,
        italic: isItalic,
        quote: isQuote,
        inlineCode: isInlineCode,
      };
    }

    return null;
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

  // Select and change header level or toggle it off if already active
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
    <>
      {/* CASE 1: LATEX FORMULA */}
      {activeState.type === "latex" && (
        <>
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-1.5 cursor-pointer rounded-lg bg-background border border-border/80 text-xs text-muted-foreground hover:text-foreground shadow-xs hover:bg-muted/50 transition-colors px-3"
                  onClick={() => {
                    const event = new CustomEvent(
                      activeState.data.kind === "double"
                        ? "editor:open-latex-double"
                        : "editor:open-latex-single"
                    );
                    window.dispatchEvent(event);
                  }}
                >
                  <Radical size={14} className="text-foreground/80" />
                  <span>Aggiungi alla formula</span>
                  <Plus size={12} className="text-muted-foreground/60 ml-0.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aggiungi simbolo o formula KaTeX</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* CASE 2: CODE BLOCK */}
      {activeState.type === "code" && (
        <>
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/40 shadow-xs shrink-0">
            <div className="flex items-center text-muted-foreground gap-1.5 px-2 py-1 select-none">
              <SquareCode size={14} className="text-foreground/75" />
              <span className="text-[12px] font-medium text-muted-foreground font-sans">
                Blocco codice
              </span>
            </div>

            <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer rounded-md border border-transparent hover:border-border/40 hover:bg-muted/60 gap-1 transition-colors"
                >
                  <span className="font-semibold text-foreground capitalize">
                    {languages.find((l) => l.value === activeState.data.language)?.label || "Senza linguaggio"}
                  </span>
                  <ChevronDown size={12} className="text-muted-foreground/60 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-[300px] overflow-y-auto">
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
                  {activeState.data.language === null && <Check size={14} className="text-primary shrink-0" />}
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
                    {activeState.data.language === lang.value && <Check size={14} className="text-primary shrink-0" />}
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
          </div>
        </>
      )}

      {/* CASE 3: HEADER BLOCK */}
      {activeState.type === "header" && (
        <>
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/40 shadow-xs shrink-0">
            <div className="flex items-center text-muted-foreground gap-1.5 px-2 py-1 select-none">
              <Heading size={14} className="text-foreground/75" />
              <span className="text-[12px] font-medium text-muted-foreground font-sans">
                Intestazione
              </span>
            </div>

            <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer rounded-md border border-transparent hover:border-border/40 hover:bg-muted/60 gap-1 transition-colors"
                >
                  <span className="font-semibold text-foreground">H{activeState.level}</span>
                  <ChevronDown size={12} className="text-muted-foreground/60 ml-0.5" />
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
                    {activeState.level === l && <Check size={14} className="text-primary shrink-0" />}
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
          </div>
        </>
      )}

      {/* CASE 4: WORD FORMATTING (BOLD, ITALIC, INLINE CODE) */}
      {activeState.type === "text" && (
        <>
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/40 shadow-xs shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer border border-transparent transition-colors",
                      activeState.bold && "bg-muted text-foreground border-border/60"
                    )}
                    onClick={() => {
                      toggleBold(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Bold size={13} />
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
                      "size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer border border-transparent transition-colors",
                      activeState.italic && "bg-muted text-foreground border-border/60"
                    )}
                    onClick={() => {
                      toggleItalic(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Italic size={13} />
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
                      "size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer border border-transparent transition-colors",
                      activeState.quote && "bg-muted text-foreground border-border/60"
                    )}
                    onClick={() => {
                      toggleQuote(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Quote size={13} />
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
                      "size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer border border-transparent transition-colors",
                      activeState.inlineCode && "bg-muted text-foreground border-border/60"
                    )}
                    onClick={() => {
                      toggleCodeInline(editorRef);
                      setUpdateTrigger((prev) => prev + 1);
                    }}
                  >
                    <Terminal size={13} />
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
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg border border-border/40 shadow-xs shrink-0">
            <div className="flex items-center text-muted-foreground gap-1.5 px-2 py-1 select-none">
              {activeState.kind === "unordered" ? (
                <List size={14} className="text-foreground/75" />
              ) : (
                <ListOrdered size={14} className="text-foreground/75" />
              )}
              <span className="text-[12px] font-medium text-muted-foreground font-sans">
                {activeState.kind === "unordered" ? "Elenco puntato" : "Elenco numerato"}
              </span>
            </div>

            <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                    onClick={outdentList}
                  >
                    <Outdent size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Riduci rientro (Sposta a sinistra)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                    onClick={indentList}
                  >
                    <Indent size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Aumenta rientro (Sposta a destra)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </>
  );
}
