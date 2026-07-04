"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getIsActiveList,
  getOrderedListRegex,
  handleListToggle,
} from "@/src/lib/editor/formatting-utils";
import { ListOrdered } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleOrderedList = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveList(editorRef, getOrderedListRegex);
  handleListToggle(
    editorRef,
    isActive,
    getOrderedListRegex,
    (line, index) => `${index + 1}. ${line}`,
    (line) => line.replace(/^\d+\.\s/, ""),
  );
};

export function FormattingOrderedList({
  editorRef,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    toggleOrderedList(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

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
