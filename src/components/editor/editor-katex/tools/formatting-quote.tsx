"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getIsActiveList,
  getQuoteRegex,
  handleListToggle
} from "@/src/lib/editor/formatting-utils";
import { Quote } from "lucide-react";
import type { editor, Selection } from "monaco-editor";

export const toggleQuote = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => {
  const isActive = getIsActiveList(editorRef, getQuoteRegex);
  handleListToggle(
    editorRef,
    isActive,
    getQuoteRegex,
    (line) => `> ${line}`,
    (line) => line.replace(/^>\s/, ""),
  );
};

export function FormattingQuote({
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
    toggleQuote(editorRef);
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Quote size={14} />
      <span>Citazione</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>Q</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}
