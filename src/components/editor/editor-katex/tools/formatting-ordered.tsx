"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getIsActiveList,
  getOrderedListRegex,
  handleListToggle
} from "@/src/lib/editor/formatting-utils";
import { ListOrdered } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

export function FormattingOrderedList({
  editorRef,
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  onSelect?: () => void;
}>) {
  const isActive = getIsActiveList(editorRef, getOrderedListRegex);

  const handleToggle = () => {
    handleListToggle(
      editorRef,
      isActive,
      getOrderedListRegex,
      (line, index) => `${index + 1}. ${line}`,
      (line) => line.replace(/^\d+\.\s/, ""),
    );
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isDigit7 = e.browserEvent.key === "7" || e.code === "Digit7";
      if ((e.ctrlKey || e.metaKey) && isDigit7 && isFocused) {
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
      <ListOrdered size={14} />
      <span>Elenco ordinato</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>7</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
