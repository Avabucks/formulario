"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getIsActiveWord,
  getItalicRegex,
  handleWordToggle
} from "@/src/lib/editor/formatting-utils";
import { Italic } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleItalic = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveWord(editorRef, getItalicRegex);
  handleWordToggle(
    editorRef,
    isActive,
    getItalicRegex,
    (text) => `_${text}$0_`,
    (match) => match[1],
    (matchIndex, match) => matchIndex + match[1].length,
  );
};

export function FormattingItalic({
  editorRef,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    toggleItalic(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Italic size={14} />
      <span>Corsivo</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>I</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
