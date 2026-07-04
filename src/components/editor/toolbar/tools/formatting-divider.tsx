"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Minus } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

type SnippetController = {
  insert: (snippet: string) => void;
};

export const toggleDivider = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const editor = editorRef.current;
  if (!editor) return false;

  const controller = editor.getContribution("snippetController2") as unknown as
    | SnippetController
    | undefined;
  if (!controller) return false;

  const position = editor.getPosition();
  const lineNumber = position?.lineNumber ?? 1;
  const column = position?.column ?? 1;

  const isAtLineStart = column === 1;
  const currentLine = editor.getModel()?.getLineContent(lineNumber) ?? "";
  const isEmptyLine = currentLine.trim() === "";

  const text = isAtLineStart && isEmptyLine ? `\n---\n\n$1` : `\n\n---\n\n$1`;
  controller.insert(text);
  setTimeout(() => editor.focus(), 0);
  return true;
};

export function FormattingDivider({
  editorRef,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    toggleDivider(editorRef);
    onSelect?.();
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Minus size={14} />
      <span>Linea divisoria</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>9</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
