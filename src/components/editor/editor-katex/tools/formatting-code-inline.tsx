"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getCodeInlineRegex,
  getIsActiveWord,
  handleWordToggle
} from "@/src/lib/editor/formatting-utils";
import { Terminal } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleCodeInline = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveWord(editorRef, getCodeInlineRegex);
  handleWordToggle(
    editorRef,
    isActive,
    getCodeInlineRegex,
    (text) => `\`${text}$0\``,
    (match) => match[1],
    (matchIndex, match) => matchIndex + match[1].length,
  );
};

export function FormattingCodeInline({
  editorRef,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const handleToggle = () => {
    toggleCodeInline(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Terminal size={14} />
      <span>Codice inline</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>J</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
