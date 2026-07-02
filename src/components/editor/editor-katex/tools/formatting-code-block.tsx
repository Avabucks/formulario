"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command";
import languages from "@/src/data/languages.json";
import {
  getIsActiveCode,
  handleBlockToggle
} from "@/src/lib/editor/formatting-utils";
import { Code, X } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useState } from "react";

const OPEN_MARKER = "```";
const CLOSE_MARKER = "```";

const LANGUAGES = languages.toSorted((a, b) => a.label.localeCompare(b.label));

export function FormattingCodeBlock({
  editorRef,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}>) {
  const [open, setOpen] = useState(false);
  const [blockState, setBlockState] = useState<{ language: string | null } | null>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("editor:open-code-block", handleOpen);
    return () => {
      window.removeEventListener("editor:open-code-block", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setBlockState(getIsActiveCode(editorRef));
    }
  }, [open, editorRef]);

  const isActive = blockState !== null;

  const handleSelect = (language: string | null) => {
    setOpen(false);
    if (isActive) {
      handleBlockToggle(
        editorRef,
        blockState,
        OPEN_MARKER,
        CLOSE_MARKER,
        language,
      );
    } else {
      const openWithLang = language ? `${OPEN_MARKER}${language}` : OPEN_MARKER;
      handleBlockToggle(editorRef, null, openWithLang, CLOSE_MARKER);
    }
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const handleRemove = () => {
    setOpen(false);
    handleBlockToggle(editorRef, blockState, OPEN_MARKER, CLOSE_MARKER);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(() => editorRef.current?.focus(), 0);
      }}
    >
      <Command>
        <CommandInput placeholder="Cerca linguaggio..." />
        <CommandList>
          <CommandEmpty>Nessun risultato.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={() => handleSelect(null)}>
              <Code size={14} />
              <span>Senza linguaggio</span>
            </CommandItem>
            {isActive && (
              <CommandItem
                onSelect={handleRemove}
                className="text-destructive"
              >
                <X size={14} />
                <span>Rimuovi blocco</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            {LANGUAGES.map((lang) => (
              <CommandItem
                key={lang.value}
                value={lang.value}
                onSelect={() => handleSelect(lang.value)}
                className="text-sm"
              >
                {blockState?.language === lang.value && (
                  <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                )}
                {lang.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}





