"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Minus } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

type SnippetController = {
  insert: (snippet: string) => void;
};

export function FormattingDivider({
  editorRef,
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    const editor = editorRef.current;
    if (!editor) return false;

    const controller = editor.getContribution("snippetController2") as unknown as SnippetController | undefined;
    if (!controller) return false;

    const position = editor.getPosition();
    const lineNumber = position?.lineNumber ?? 1;
    const column = position?.column ?? 1;

    const isAtLineStart = column === 1;
    const currentLine = editor.getModel()?.getLineContent(lineNumber) ?? "";
    const isEmptyLine = currentLine.trim() === "";

    const text = isAtLineStart && isEmptyLine ? `\n---\n\n$1` : `\n\n---\n\n$1`;
    controller.insert(text);
    onSelect?.();
    setTimeout(() => editor.focus(), 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isDigit9 = e.browserEvent.key === "9" || e.code === "Digit9";
      if ((e.ctrlKey || e.metaKey) && isDigit9 && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }
    });
    return () => disposable.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, editorRef]);

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
