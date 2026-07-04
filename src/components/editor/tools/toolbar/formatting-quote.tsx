"use client";

import { Button } from "@/src/components/ui/button";
import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  getIsActiveList,
  getQuoteRegex,
  handleListToggle,
} from "@/src/lib/editor/formatting-utils";
import { cn } from "@/src/lib/utils";
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
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
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

export function FormattingQuoteContext({
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
            toggleQuote(editorRef);
            setUpdateTrigger((prev) => prev + 1);
          }}
        >
          <Quote className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Citazione</TooltipContent>
    </Tooltip>
  );
}
