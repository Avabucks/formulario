"use client";

import { Button } from "@/src/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

import { FormattingBold } from "./tools/formatting-bold";
import { FormattingDivider } from "./tools/formatting-divider";
import { FormattingHeaders } from "./tools/formatting-headers";
import { FormattingItalic } from "./tools/formatting-italic";
import { FormattingOrderedList } from "./tools/formatting-ordered";
import { FormattingQuote } from "./tools/formatting-quote";
import { FormattingUnorderedList } from "./tools/formatting-unordered";
import { ChevronRight } from "lucide-react";

export function FormattingCommand({
  _selection,
  editorRef,
  isFocused,
  open,
  onOpenChange,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isSpace = e.browserEvent.key === " " || e.browserEvent.code === "Space";
      if ((e.ctrlKey || e.metaKey) && isSpace && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(!open);
      }
    });
    return () => disposable.dispose();
  }, [isFocused, editorRef, open, onOpenChange]);

  const handleSelect = () => {
    onOpenChange(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(!open)}
              disabled={!isFocused}
              onMouseDown={(e) => e.preventDefault()}
              aria-label="Apri tavolozza comandi"
            >
              <ChevronRight size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="pr-1.5">
            <div className="flex items-center gap-2">
              Comandi
              <KbdGroup className="hidden md:flex">
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>Space</Kbd>
              </KbdGroup>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <Command>
          <CommandInput placeholder="Cerca un comando..." />
          <CommandList>
            <CommandEmpty>Nessun risultato.</CommandEmpty>

            {/* Categoria Testo */}
            <CommandGroup heading="Formattazione Testo">
              <FormattingBold
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
              <FormattingItalic
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
              <FormattingQuote
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
            </CommandGroup>

            {/* Categoria Intestazioni */}
            <CommandGroup heading="Intestazioni">
              <FormattingHeaders
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
            </CommandGroup>

            {/* Categoria Elenchi */}
            <CommandGroup heading="Elenchi">
              <FormattingUnorderedList
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
              <FormattingOrderedList
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
            </CommandGroup>

            {/* Categoria Inserisci */}
            <CommandGroup heading="Inserisci">
              <FormattingDivider
                _selection={_selection}
                editorRef={editorRef}
                isFocused={isFocused}
                onSelect={handleSelect}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
