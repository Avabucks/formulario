"use client";

import { Button } from "@/src/components/ui/button";
import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import {
  getIsActiveList,
  getUnorderedListRegex,
  handleListToggle
} from "@/src/lib/editor/formatting-utils";
import { List, ListOrdered, Outdent, Indent, ChevronRight } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleUnorderedList = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveList(editorRef, getUnorderedListRegex);
  handleListToggle(
    editorRef,
    isActive,
    getUnorderedListRegex,
    (line) => `- ${line}`,
    (line) => line.replace(/^-\s/, ""),
  );
};

export function FormattingUnorderedList({
  editorRef,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    toggleUnorderedList(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <List size={14} />
      <span>Elenco puntato</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>8</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}

export function FormattingListContext({
  kind,
  editorRef,
  setUpdateTrigger,
}: Readonly<{
  kind: "ordered" | "unordered";
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>;
}>) {
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

  return (
    <>
      <div className="h-5 w-px bg-border mx-2.5 shrink-0" />
      <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
        {kind === "unordered" ? (
          <List className="size-4 text-muted-foreground" />
        ) : (
          <ListOrdered className="size-4 text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground font-medium font-sans">
          {kind === "unordered" ? "Elenco non ordinato" : "Elenco ordinato"}
        </span>
        <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
      </div>

      <div className="flex items-center gap-1">
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
      </div>
    </>
  );
}
