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
import {
    getIsActiveBlock,
    getIsActiveLatexInline,
    handleBlockToggle,
    handleLatexInlineToggle,
} from "@/src/lib/editor/formatting-utils";
import { Pi, X } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";

const BLOCK_MARKER = "$$";
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
].sort((a, b) => a.label.localeCompare(b.label));

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

    const blockState = getIsActiveBlock(editorRef, BLOCK_MARKER, BLOCK_MARKER);
    const inlineState = getIsActiveLatexInline(editorRef);

    // Quale modalità è attiva (block ha priorità se il cursore è dentro un blocco $$)
    const activeKind: 'block' | 'single' | 'double' | null =
        blockState !== null ? 'block'
            : inlineState?.kind === 'double' ? 'double'
                : inlineState?.kind === 'single' ? 'single'
                    : null;

    // Quando è attivo uno dei due, apre il command per inserire formula
    const handleFormulaSelect = (snippet: string) => {
        setOpen(false);
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;
        const sel = editorRef.current.getSelection();
        if (!sel) return;

        if (activeKind === 'block') {
            // Inserisce alla posizione del cursore dentro il blocco
            const totalLines = model.getLineCount();
            let openLine = -1;
            for (let l = sel.startLineNumber; l >= 1; l--) {
                const c = model.getLineContent(l).trim();
                if (c === BLOCK_MARKER) { openLine = l; break; }
            }
            let closeLine = -1;
            for (let l = sel.endLineNumber; l <= totalLines; l++) {
                if (model.getLineContent(l).trim() === BLOCK_MARKER) { closeLine = l; break; }
            }
            if (openLine === -1 || closeLine === -1) return;

            const onOpenLine = sel.startLineNumber === openLine;
            const onCloseLine = sel.startLineNumber === closeLine;
            const insertLine = onOpenLine ? openLine + 1 : onCloseLine ? closeLine : sel.startLineNumber;
            const insertCol = onOpenLine || onCloseLine ? 1 : sel.startColumn;

            model.pushEditOperations([], [{
                range: { startLineNumber: insertLine, startColumn: insertCol, endLineNumber: insertLine, endColumn: insertCol },
                text: (onOpenLine || onCloseLine) ? `${snippet}\n` : snippet,
            }], () => null);
        } else if (activeKind === 'single' || activeKind === 'double') {
            // Inserisce il snippet alla posizione del cursore dentro l'inline
            model.pushEditOperations([], [{
                range: { startLineNumber: sel.startLineNumber, startColumn: sel.startColumn, endLineNumber: sel.startLineNumber, endColumn: sel.startColumn },
                text: snippet,
            }], () => null);
        } else {
            // Nessuno attivo: crea blocco $$ con lo snippet
            const endLine =
                sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber
                    ? sel.endLineNumber - 1
                    : sel.endLineNumber;
            const endCol = model.getLineContent(endLine).length + 1;
            model.pushEditOperations([], [{
                range: { startLineNumber: sel.startLineNumber, startColumn: 1, endLineNumber: endLine, endColumn: endCol },
                text: `${BLOCK_MARKER}\n${snippet}\n${BLOCK_MARKER}`,
            }], () => null);
        }

        setTimeout(() => editorRef.current?.focus(), 0);
    };

    const handleRemove = () => {
        setOpen(false);
        if (activeKind === 'block') {
            handleBlockToggle(editorRef, blockState, BLOCK_MARKER, BLOCK_MARKER);
        } else {
            handleLatexInlineToggle(editorRef, inlineState, '$');
        }
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

    // Quando uno è attivo mostra solo il toggle attivo + command
    // Quando nessuno è attivo mostra entrambi i toggle ($  e $$)
    return (
        <>
            {/* Toggle $  — inline singolo, nascosto se block o double sono attivi */}
            {activeKind !== 'block' && activeKind !== 'double' && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                variant="outline"
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Formula inline $"
                                pressed={activeKind === 'single' && isFocused}
                                disabled={!isFocused}
                                onClick={() =>
                                    activeKind === 'single'
                                        ? setOpen(true)
                                        : handleLatexInlineToggle(editorRef, null, '$')
                                }
                            >
                                <Pi size={16} />
                                <span className="text-xs font-mono leading-none">$</span>
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Formula inline
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd><span>+</span><Kbd>Shift</Kbd><span>+</span><Kbd>D</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Toggle $$ — inline doppio o blocco, nascosto se single è attivo */}
            {activeKind !== 'single' && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                variant="outline"
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Formula blocco $$"
                                pressed={(activeKind === 'block' || activeKind === 'double') && isFocused}
                                disabled={!isFocused}
                                onClick={() => setOpen(true)}
                            >
                                <Pi size={16} />
                                <span className="text-xs font-mono leading-none">$$</span>
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Formula blocco
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd><span>+</span><Kbd>Shift</Kbd><span>+</span><Kbd>M</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Command dialog condiviso per la scelta formula */}
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
            >
                <Command>
                    <CommandInput placeholder="Cerca formula..." />
                    <CommandList>
                        <CommandEmpty>Nessun risultato.</CommandEmpty>
                        <CommandGroup heading={activeKind !== null ? "Inserisci formula" : "Formule predefinite"}>
                            {FORMULAS.map((f) => (
                                <CommandItem
                                    key={f.value}
                                    value={f.value}
                                    onSelect={() => handleFormulaSelect(f.snippet)}
                                >
                                    <span>{f.label}</span>
                                    <span className="ml-auto font-mono text-xs opacity-50 truncate max-w-20">{f.snippet}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {activeKind !== null && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={handleRemove} className="text-destructive">
                                        <X size={14} />
                                        <span>Rimuovi formula</span>
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