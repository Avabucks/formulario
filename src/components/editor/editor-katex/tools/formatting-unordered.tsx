"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getIsActiveList,
  getUnorderedListRegex,
  handleListToggle
} from "@/src/lib/editor/formatting-utils";
import { List } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingUnorderedList({
  editorRef,
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  onSelect?: () => void;
}>) {
  const isActive = getIsActiveList(editorRef, getUnorderedListRegex);

  const handleToggle = () => {
    handleListToggle(
      editorRef,
      isActive,
      getUnorderedListRegex,
      (line) => `- ${line}`,
      (line) => line.replace(/^-\s/, ""),
    );
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isDigit8 = e.browserEvent.key === "8" || e.code === "Digit8";
      if ((e.ctrlKey || e.metaKey) && isDigit8 && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }
    });
    return () => disposable.dispose();
  }, [isFocused, editorRef]);

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
