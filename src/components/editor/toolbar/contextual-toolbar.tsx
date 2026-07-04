"use client";

/* eslint-disable react-hooks/refs */

import { TooltipProvider } from "@/src/components/ui/tooltip";
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
} from "@/src/lib/editor/formatting-utils";
import { ChevronRight, Type } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useMemo, useState } from "react";
import { FormattingLatexContext } from "./tools/formatting-latex";
import { FormattingCodeBlockContext } from "./tools/formatting-code-block";
import { FormattingHeadersContext } from "./tools/formatting-headers";
import { FormattingBoldContext } from "./tools/formatting-bold";
import { FormattingItalicContext } from "./tools/formatting-italic";
import { FormattingQuoteContext } from "./tools/formatting-quote";
import { FormattingCodeInlineContext } from "./tools/formatting-code-inline";
import { FormattingListContext } from "./tools/formatting-unordered";

interface ContextualToolbarProps {
  selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

type ActiveState =
  | { type: "latex"; data: NonNullable<ReturnType<typeof getIsActiveLatex>> }
  | { type: "code"; data: NonNullable<ReturnType<typeof getIsActiveCode>> }
  | { type: "header"; level: number }
  | {
      type: "list";
      kind: "ordered" | "unordered";
      bold: boolean;
      italic: boolean;
      quote: boolean;
      inlineCode: boolean;
    }
  | {
      type: "text";
      bold: boolean;
      italic: boolean;
      quote: boolean;
      inlineCode: boolean;
    };

export function ContextualToolbar({
  selection,
  editorRef,
}: Readonly<ContextualToolbarProps>) {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 1. Detect active formatting using existing logic
  const activeState = useMemo<ActiveState | null>(() => {
    void updateTrigger;
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
    if (getIsActiveList(editorRef, getH1Regex))
      return { type: "header", level: 1 };
    if (getIsActiveList(editorRef, getH2Regex))
      return { type: "header", level: 2 };
    if (getIsActiveList(editorRef, getH3Regex))
      return { type: "header", level: 3 };
    if (getIsActiveList(editorRef, getH4Regex))
      return { type: "header", level: 4 };
    if (getIsActiveList(editorRef, getH5Regex))
      return { type: "header", level: 5 };
    if (getIsActiveList(editorRef, getH6Regex))
      return { type: "header", level: 6 };

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

  if (!activeState) return null;

  return (
    <div className="hidden md:flex items-center overflow-x-auto overflow-y-hidden max-w-full min-w-0">
      {/* CASE 1: LATEX FORMULA */}
      {activeState.type === "latex" && (
        <FormattingLatexContext activeData={activeState.data} />
      )}

      {/* CASE 2: CODE BLOCK */}
      {activeState.type === "code" && (
        <FormattingCodeBlockContext
          activeData={activeState.data}
          editorRef={editorRef}
          setUpdateTrigger={setUpdateTrigger}
        />
      )}

      {/* CASE 3: HEADER BLOCK */}
      {activeState.type === "header" && (
        <FormattingHeadersContext
          activeLevel={activeState.level}
          editorRef={editorRef}
          setUpdateTrigger={setUpdateTrigger}
        />
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
              <FormattingBoldContext
                isActive={activeState.bold}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingItalicContext
                isActive={activeState.italic}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingQuoteContext
                isActive={activeState.quote}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingCodeInlineContext
                isActive={activeState.inlineCode}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
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
              <FormattingBoldContext
                isActive={activeState.bold}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingItalicContext
                isActive={activeState.italic}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingQuoteContext
                isActive={activeState.quote}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
              <FormattingCodeInlineContext
                isActive={activeState.inlineCode}
                editorRef={editorRef}
                setUpdateTrigger={setUpdateTrigger}
              />
            </TooltipProvider>
          </div>

          {/* List second */}
          <TooltipProvider>
            <FormattingListContext
              kind={activeState.kind}
              editorRef={editorRef}
              setUpdateTrigger={setUpdateTrigger}
            />
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
