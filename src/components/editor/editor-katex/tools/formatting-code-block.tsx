"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
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
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getCodeInlineRegex, getIsActiveCode, getIsActiveLatex, getIsActiveWord, handleBlockToggle } from "@/src/lib/editor/formatting-utils";
import { Code, SquareTerminal, X } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";
import { Separator } from "@/src/components/ui/separator";
import languages from "@/src/data/languages.json";

const OPEN_MARKER = "```";
const CLOSE_MARKER = "```";

const LANGUAGES = languages.toSorted((a, b) => a.label.localeCompare(b.label));

export function FormattingCodeBlock({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const [open, setOpen] = useState(false);
    const blockState = getIsActiveCode(editorRef);
    const isActive = blockState !== null;

    const handleSelect = (language: string | null) => {
        setOpen(false);
        if (isActive) {
            handleBlockToggle(editorRef, blockState, OPEN_MARKER, CLOSE_MARKER, language);
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

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyU" && isFocused) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if ((getIsActiveLatex(editorRef) || getIsActiveWord(editorRef, getCodeInlineRegex) && !isActive) && isFocused) return null;

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant="outline"
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Codice in blocco"
                            pressed={isActive && isFocused}
                            disabled={!isFocused}
                            className="gap-1.5"
                            onClick={() => setOpen((v) => !v)}
                        >
                            <SquareTerminal size={16} />
                            {isActive && isFocused && blockState.language && (
                                <span>{blockState.language}</span>
                            )}
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Codice in blocco
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
                                <span>+</span>
                                <Kbd>U</Kbd>
                            </KbdGroup>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
                                <CommandItem onSelect={handleRemove} className="text-destructive">
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
            <Separator orientation="vertical" />
        </>
    );
}