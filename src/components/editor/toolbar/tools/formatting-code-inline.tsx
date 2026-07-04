"use client";

import { Button } from "@/src/components/ui/button";
import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import {
  getCodeInlineRegex,
  getIsActiveWord,
  handleWordToggle
} from "@/src/lib/editor/formatting-utils";
import { cn } from "@/src/lib/utils";
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

export function FormattingCodeInlineContext({
  isActive,
  editorRef,
  setUpdateTrigger,
}: Readonly<{
  isActive: boolean;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>;
}>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("text-foreground", isActive && "bg-muted")}
          onClick={() => {
            toggleCodeInline(editorRef);
            setUpdateTrigger((prev) => prev + 1);
          }}
        >
          <Terminal className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Codice inline</TooltipContent>
    </Tooltip>
  );
}
