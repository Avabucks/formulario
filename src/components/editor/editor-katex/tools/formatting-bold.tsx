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
import { useEffect } from "react";

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
  const isActive = getIsActiveWord(editorRef, getBoldRegex);

  const handleToggle = () => {
    handleWordToggle(
      editorRef,
      isActive,
      getBoldRegex,
      (text) => `**${text}$0**`,
      (match) => match[1],
      (matchIndex, match) => matchIndex + match[1].length,
    );
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      const isKeyB = e.browserEvent.key.toLowerCase() === "b" || e.code === "KeyB";
      if ((e.ctrlKey || e.metaKey) && isKeyB && isFocused) {
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
