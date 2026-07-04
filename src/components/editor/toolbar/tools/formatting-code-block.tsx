"use client";

import { Button } from "@/src/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import languages from "@/src/data/languages.json";
import {
  getIsActiveCode,
  handleBlockToggle
} from "@/src/lib/editor/formatting-utils";
import { Code, X, Check, ChevronDown, ChevronRight, SquareCode } from "lucide-react";
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
    globalThis.addEventListener("editor:open-code-block", handleOpen);
    return () => {
      globalThis.removeEventListener("editor:open-code-block", handleOpen);
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

export function FormattingCodeBlockContext({
  activeData,
  editorRef,
  setUpdateTrigger,
}: Readonly<{
  activeData: NonNullable<ReturnType<typeof getIsActiveCode>>;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>;
}>) {
  return (
    <>
      <div className="flex items-center text-muted-foreground gap-1.5 pl-0 pr-0 py-1 select-none">
        <SquareCode className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium font-sans">
          Blocco codice
        </span>
        <ChevronRight className="size-4 text-muted-foreground/30 mx-0.5 shrink-0" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="text-foreground"
          >
            <span className="font-semibold capitalize">
              {languages.find((l) => l.value === activeData.language)?.label || "Senza linguaggio"}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 max-h-75 overflow-y-auto">
          <DropdownMenuItem
            className="cursor-pointer text-xs"
            onClick={() => {
              handleBlockToggle(
                editorRef,
                activeData,
                "```",
                "```",
                null
              );
              setUpdateTrigger((prev) => prev + 1);
              setTimeout(() => editorRef.current?.focus(), 50);
            }}
          >
            <div className="flex items-center w-full justify-between">
              <span>Senza linguaggio</span>
              {activeData.language === null && <Check className="size-4 text-primary shrink-0" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.value}
              className="cursor-pointer text-xs"
              onClick={() => {
                handleBlockToggle(
                  editorRef,
                  activeData,
                  "```",
                  "```",
                  lang.value
                );
                setUpdateTrigger((prev) => prev + 1);
                setTimeout(() => editorRef.current?.focus(), 50);
              }}
            >
              <div className="flex items-center w-full justify-between">
                <span>{lang.label}</span>
                {activeData.language === lang.value && <Check className="size-4 text-primary shrink-0" />}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer text-xs"
            onClick={() => {
              handleBlockToggle(
                editorRef,
                activeData,
                "```",
                "```"
              );
              setUpdateTrigger((prev) => prev + 1);
              setTimeout(() => editorRef.current?.focus(), 50);
            }}
          >
            Rimuovi Blocco Codice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}





