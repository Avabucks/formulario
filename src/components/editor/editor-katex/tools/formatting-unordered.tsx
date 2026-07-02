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
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
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
