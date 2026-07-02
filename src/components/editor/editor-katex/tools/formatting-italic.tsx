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
import { useEffect } from "react";

export function FormattingItalic({
  editorRef,
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  onSelect?: () => void;
}>) {
  const isActive = getIsActiveWord(editorRef, getItalicRegex);

  const handleToggle = () => {
    handleWordToggle(
      editorRef,
      isActive,
      getItalicRegex,
      (text) => `_${text}$0_`,
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
      const isKeyI = e.browserEvent.key.toLowerCase() === "i" || e.code === "KeyI";
      if ((e.ctrlKey || e.metaKey) && isKeyI && isFocused) {
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
