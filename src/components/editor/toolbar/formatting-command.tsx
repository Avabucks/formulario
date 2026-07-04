"use client";

import { Button } from "@/src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/src/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { ChevronRight, SquareTerminal, Radical, SquareRadical, Table } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

import { FormattingBold } from "../toolbar/tools/formatting-bold";
import { FormattingCodeBlock } from "../toolbar/tools/formatting-code-block";
import { FormattingCodeInline } from "../toolbar/tools/formatting-code-inline";
import { FormattingDivider } from "../toolbar/tools/formatting-divider";
import { FormattingHeaders } from "../toolbar/tools/formatting-headers";
import { FormattingItalic } from "../toolbar/tools/formatting-italic";
import { FormattingOrderedList } from "../toolbar/tools/formatting-ordered";
import { FormattingQuote } from "../toolbar/tools/formatting-quote";
import { FormattingUnorderedList } from "../toolbar/tools/formatting-unordered";
import { FormattingLatex } from "../toolbar/tools/formatting-latex";
import { FormattingTable } from "../toolbar/tools/formatting-table";
import { useEffect, useState, useRef } from "react";
import { ContextualToolbar } from "../toolbar/contextual-toolbar";

export function FormattingCommand({
  _selection,
  editorRef,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}>) {
  const [activeDialog, setActiveDialog] = useState<boolean>(false);
  const shouldPreventCloseFocus = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isSpace = e.browserEvent.key === " " || e.browserEvent.code === "Space";
      if ((e.ctrlKey || e.metaKey) && isSpace) {
        e.preventDefault();
        e.stopPropagation();
        setActiveDialog(!activeDialog);
      }
    });
    return () => disposable.dispose();
  }, [editorRef, activeDialog]);

  const handleSelect = () => {
    setActiveDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-4 min-w-0 select-none max-w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="text-foreground gap-1"
                onClick={() => setActiveDialog(!activeDialog)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Apri tavolozza comandi"
              >
                <ChevronRight className="size-4 text-primary" />
                <span>Esegui</span>
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

        <ContextualToolbar
          selection={_selection}
          editorRef={editorRef}
        />
      </div>

      <Dialog
        open={activeDialog}
        onOpenChange={setActiveDialog}
      >
        <DialogContent
          className="rounded-xl! top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 max-w-[calc(100%-2rem)] sm:max-w-sm"
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            if (shouldPreventCloseFocus.current) {
              e.preventDefault();
              shouldPreventCloseFocus.current = false;
            }
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Tavolozza comandi</DialogTitle>
            <DialogDescription>Cerca un comando di formattazione o inserimento</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Cerca un comando..." />
            <CommandList>
              <CommandEmpty>Nessun risultato.</CommandEmpty>

              {/* Categoria Testo */}
              <CommandGroup heading="Formattazione Testo">
                <FormattingBold
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
                <FormattingItalic
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
                <FormattingQuote
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
              </CommandGroup>

              {/* Categoria Intestazioni */}
              <CommandGroup heading="Intestazioni">
                <FormattingHeaders
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
              </CommandGroup>

              {/* Categoria Elenchi */}
              <CommandGroup heading="Elenchi">
                <FormattingUnorderedList
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
                <FormattingOrderedList
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
              </CommandGroup>

              {/* Categoria Inserisci */}
              <CommandGroup heading="Inserisci">
                <FormattingDivider
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
                <CommandItem
                  onSelect={() => {
                    shouldPreventCloseFocus.current = true;
                    handleSelect();
                    window.dispatchEvent(new CustomEvent("editor:open-table"));
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Table size={14} />
                  <span>Tabella</span>
                  <CommandShortcut className="ml-auto">
                    <KbdGroup>
                      <Kbd>Alt</Kbd>
                      <span>+</span>
                      <Kbd>T</Kbd>
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>

              {/* Categoria Codice */}
              <CommandGroup heading="Codice">
                <FormattingCodeInline
                  _selection={_selection}
                  editorRef={editorRef}
                  onSelect={handleSelect}
                />
                <CommandItem
                  onSelect={() => {
                    shouldPreventCloseFocus.current = true;
                    handleSelect();
                    window.dispatchEvent(new CustomEvent("editor:open-code-block"));
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <SquareTerminal size={14} />
                  <span>Codice in blocco</span>
                  <CommandShortcut className="ml-auto">
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>U</Kbd>
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>

              {/* Categoria Formule LaTeX */}
              <CommandGroup heading="Formule LaTeX">
                <CommandItem
                  onSelect={() => {
                    shouldPreventCloseFocus.current = true;
                    handleSelect();
                    window.dispatchEvent(new CustomEvent("editor:open-latex-single"));
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Radical size={14} />
                  <span>Formula inline</span>
                  <CommandShortcut className="ml-auto">
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>G</Kbd>
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    shouldPreventCloseFocus.current = true;
                    handleSelect();
                    window.dispatchEvent(new CustomEvent("editor:open-latex-double"));
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <SquareRadical size={14} />
                  <span>Formula in blocco</span>
                  <CommandShortcut className="ml-auto">
                    <KbdGroup>
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>H</Kbd>
                    </KbdGroup>
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <FormattingCodeBlock editorRef={editorRef} />
      <FormattingLatex editorRef={editorRef} onlyDialog />
      <FormattingTable editorRef={editorRef} onlyDialog />
    </>
  );
}


