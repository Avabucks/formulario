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
import { getIsActiveBlock, handleBlockToggle } from "@/src/lib/formatting-utils";
import { Code, X } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";

const OPEN_MARKER = "```";
const CLOSE_MARKER = "```";

const LANGUAGES = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "xml", label: "XML" },
    { value: "dockerfile", label: "Dockerfile" },
];

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
    const blockState = getIsActiveBlock(editorRef, OPEN_MARKER, CLOSE_MARKER);
    const isActive = blockState !== null;

    const handleSelect = (language: string | null) => {
        setOpen(false);
        if (isActive) {
            handleBlockToggle(editorRef, blockState, OPEN_MARKER, CLOSE_MARKER, language);
        } else {
            const openWithLang = language ? `${OPEN_MARKER}${language}` : OPEN_MARKER;
            handleBlockToggle(editorRef, null, openWithLang, CLOSE_MARKER);
        }
    };

    const handleRemove = () => {
        setOpen(false);
        handleBlockToggle(editorRef, blockState, OPEN_MARKER, CLOSE_MARKER);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K" && isFocused) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            variant="outline"
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Blocco codice"
                            pressed={isActive && isFocused}
                            disabled={!isFocused}
                            className="gap-1.5"
                            onClick={() => setOpen((v) => !v)}
                        >
                            <Code size={16} />
                            {isActive && isFocused && blockState.language && (
                                <span className="text-xs font-mono">{blockState.language}</span>
                            )}
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Blocco codice
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
                                <span>+</span>
                                <Kbd>K</Kbd>
                            </KbdGroup>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput placeholder="Cerca linguaggio..." />
                    <CommandList>
                        <CommandEmpty>Nessun risultato.</CommandEmpty>
                        <CommandGroup heading="Linguaggi">
                            {LANGUAGES.map((lang) => (
                                <CommandItem
                                    key={lang.value}
                                    value={lang.value}
                                    onSelect={() => handleSelect(lang.value)}
                                    className="font-mono text-sm"
                                >
                                    {lang.label}
                                    {blockState?.language === lang.value && (
                                        <span className="ml-auto text-xs opacity-60">attivo</span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
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
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}