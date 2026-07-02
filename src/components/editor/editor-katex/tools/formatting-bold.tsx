"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getBoldRegex,
  getIsActiveWord,
  handleWordToggle
} from "@/src/lib/editor/formatting-utils";
import { Bold } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleBold = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveWord(editorRef, getBoldRegex);
  handleWordToggle(
    editorRef,
    isActive,
    getBoldRegex,
    (text) => `**${text}$0**`,
    (match) => match[1],
    (matchIndex, match) => matchIndex + match[1].length,
  );
};

export function FormattingBold({
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
    toggleBold(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Bold size={14} />
      <span>Grassetto</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>B</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
