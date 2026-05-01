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
import { Pi, X } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";

const OPEN_MARKER = "$$";
const CLOSE_MARKER = "$$";

const FORMULAS = [
    { value: "fraction", label: "Frazione", snippet: "\\frac{a}{b}" },
    { value: "sum", label: "Sommatoria", snippet: "\\sum_{i=1}^{n} x_i" },
    { value: "integral", label: "Integrale", snippet: "\\int_{a}^{b} f(x)\\,dx" },
    { value: "limit", label: "Limite", snippet: "\\lim_{x \\to \\infty} f(x)" },
    { value: "sqrt", label: "Radice quadrata", snippet: "\\sqrt{x}" },
    { value: "matrix", label: "Matrice 2×2", snippet: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
    { value: "derivative", label: "Derivata", snippet: "\\frac{d}{dx} f(x)" },
    { value: "partial", label: "Derivata parziale", snippet: "\\frac{\\partial f}{\\partial x}" },
    { value: "binomial", label: "Coefficiente binom.", snippet: "\\binom{n}{k}" },
    { value: "norm", label: "Norma", snippet: "\\|x\\|" },
    { value: "arrow", label: "Freccia", snippet: "a \\rightarrow b" },
    { value: "equiv", label: "Equivalenza", snippet: "a \\equiv b \\pmod{n}" },
];

export function FormattingLatexBlock({
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

    const handleSelect = (snippet: string) => {
        setOpen(false);
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;
        const sel = editorRef.current.getSelection();
        if (!sel) return;

        if (isActive) {
            const totalLines = model.getLineCount();
            let openLine = -1;
            for (let l = sel.startLineNumber; l >= 1; l--) {
                if (model.getLineContent(l).trim() === OPEN_MARKER) { openLine = l; break; }
            }
            let closeLine = -1;
            for (let l = sel.endLineNumber; l <= totalLines; l++) {
                if (model.getLineContent(l).trim() === CLOSE_MARKER) { closeLine = l; break; }
            }
            if (openLine === -1 || closeLine === -1) return;

            const onOpenLine = sel.startLineNumber === openLine;
            const onCloseLine = sel.startLineNumber === closeLine;
            const insertLine = onOpenLine ? openLine + 1 : onCloseLine ? closeLine : sel.startLineNumber;
            const insertCol = onOpenLine || onCloseLine ? 1 : sel.startColumn;

            model.pushEditOperations([], [{
                range: {
                    startLineNumber: insertLine,
                    startColumn: insertCol,
                    endLineNumber: insertLine,
                    endColumn: insertCol,
                },
                text: onOpenLine || onCloseLine ? `${snippet}\n` : snippet,
            }], () => null);
        } else {
            const endLine =
                sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber
                    ? sel.endLineNumber - 1
                    : sel.endLineNumber;
            const endCol = model.getLineContent(endLine).length + 1;

            model.pushEditOperations([], [{
                range: {
                    startLineNumber: sel.startLineNumber,
                    startColumn: 1,
                    endLineNumber: endLine,
                    endColumn: endCol,
                },
                text: `${OPEN_MARKER}\n${snippet}\n${CLOSE_MARKER}`,
            }], () => null);
        }

        editorRef.current.focus();
    };

    const handleRemove = () => {
        setOpen(false);
        handleBlockToggle(editorRef, blockState, OPEN_MARKER, CLOSE_MARKER);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M" && isFocused) {
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
                            aria-label="Formula LaTeX"
                            pressed={isActive && isFocused}
                            disabled={!isFocused}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <Pi size={16} />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Formula LaTeX
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
                                <span>+</span>
                                <Kbd>M</Kbd>
                            </KbdGroup>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput placeholder="Cerca formula..." />
                    <CommandList>
                        <CommandEmpty>Nessun risultato.</CommandEmpty>
                        <CommandGroup heading={isActive ? "Inserisci formula" : "Formule predefinite"}>
                            {FORMULAS.map((f) => (
                                <CommandItem
                                    key={f.value}
                                    value={f.value}
                                    onSelect={() => handleSelect(f.snippet)}
                                >
                                    <span>{f.label}</span>
                                    <span className="ml-auto font-mono text-xs opacity-50 truncate max-w-20">{f.snippet}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {isActive && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={handleRemove} className="text-destructive">
                                        <X size={14} />
                                        <span>Rimuovi blocco</span>
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}