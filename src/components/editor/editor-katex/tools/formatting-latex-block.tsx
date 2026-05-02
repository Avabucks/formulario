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
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import {
    getIsActiveBlock,
    getIsActiveLatexInline
} from "@/src/lib/editor/formatting-utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Radical, SquareRadical } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";

const BLOCK_MARKER = "$$";

const FORMULAS = [
    { value: "frazione", label: "Frazione", snippet: String.raw`\frac{a}{b}` },
    { value: "sommatoria", label: "Sommatoria", snippet: String.raw`\sum_{i=1}^{n} x_i` },
    { value: "integrale", label: "Integrale", snippet: String.raw`\int_{a}^{b} f(x)\,dx` },
    { value: "limite", label: "Limite", snippet: String.raw`\lim_{x \to \infty} f(x)` },
    { value: "radice_quadrata", label: "Radice quadrata", snippet: String.raw`\sqrt{x}` },
    { value: "matrice_2x2", label: "Matrice 2x2", snippet: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}` },
    { value: "derivata", label: "Derivata", snippet: String.raw`\frac{d}{dx} f(x)` },
    { value: "derivata_parziale", label: "Derivata parziale", snippet: String.raw`\frac{\partial f}{\partial x}` },
    { value: "coefficiente_binomiale", label: "Coefficiente binomiale", snippet: String.raw`\binom{n}{k}` },
    { value: "norma", label: "Norma", snippet: String.raw`\|x\|` },
    { value: "esponenziale", label: "Esponenziale", snippet: String.raw`e^{x}` },
    { value: "potenza", label: "Potenza", snippet: String.raw`^{n}` },
    { value: "pedice", label: "Pedice", snippet: String.raw`_{i}` },
    { value: "logaritmo", label: "Logaritmo", snippet: String.raw`\log_{b}(x)` },
    { value: "logaritmo_naturale", label: "Logaritmo naturale", snippet: String.raw`\ln(x)` },
    { value: "produttoria", label: "Produttoria", snippet: String.raw`\prod_{i=1}^{n} x_i` },
    { value: "parte_intera_inferiore", label: "Parte intera inferiore", snippet: String.raw`\lfloor x \rfloor` },
    { value: "parte_intera_superiore", label: "Parte intera superiore", snippet: String.raw`\lceil x \rceil` },
    { value: "vettore", label: "Vettore", snippet: String.raw`\vec{v}` },
    { value: "versore", label: "Versore", snippet: String.raw`\hat{u}` },
    { value: "overline", label: "Overline", snippet: String.raw`\overline{x}` },
    { value: "underline", label: "Underline", snippet: String.raw`\underline{x}` },
].sort((a, b) => a.label.localeCompare(b.label));

const GREEK_LETTERS = [
    { value: "alfa", label: "Alfa", snippet: String.raw`\alpha` },
    { value: "beta", label: "Beta", snippet: String.raw`\beta` },
    { value: "gamma", label: "Gamma", snippet: String.raw`\gamma` },
    { value: "gamma_maiuscola", label: "Gamma maiuscola", snippet: String.raw`\Gamma` },
    { value: "delta", label: "Delta", snippet: String.raw`\delta` },
    { value: "delta_maiuscola", label: "Delta maiuscola", snippet: String.raw`\Delta` },
    { value: "epsilon", label: "Epsilon", snippet: String.raw`\varepsilon` },
    { value: "zeta", label: "Zeta", snippet: String.raw`\zeta` },
    { value: "eta", label: "Eta", snippet: String.raw`\eta` },
    { value: "teta", label: "Teta", snippet: String.raw`\theta` },
    { value: "teta_maiuscola", label: "Teta maiuscola", snippet: String.raw`\Theta` },
    { value: "lambda", label: "Lambda", snippet: String.raw`\lambda` },
    { value: "mu", label: "Mu", snippet: String.raw`\mu` },
    { value: "nu", label: "Nu", snippet: String.raw`\nu` },
    { value: "xi", label: "Xi", snippet: String.raw`\xi` },
    { value: "pi", label: "Pi greco", snippet: String.raw`\pi` },
    { value: "rho", label: "Rho", snippet: String.raw`\rho` },
    { value: "sigma", label: "Sigma", snippet: String.raw`\sigma` },
    { value: "sigma_maiuscola", label: "Sigma maiuscola", snippet: String.raw`\Sigma` },
    { value: "tau", label: "Tau", snippet: String.raw`\tau` },
    { value: "phi", label: "Phi", snippet: String.raw`\varphi` },
    { value: "phi_maiuscola", label: "Phi maiuscola", snippet: String.raw`\Phi` },
    { value: "chi", label: "Chi", snippet: String.raw`\chi` },
    { value: "psi", label: "Psi", snippet: String.raw`\psi` },
    { value: "omega", label: "Omega", snippet: String.raw`\omega` },
    { value: "omega_maiuscola", label: "Omega maiuscola", snippet: String.raw`\Omega` },
].sort((a, b) => a.label.localeCompare(b.label));

const LOGIC_SYMBOLS = [
    { value: "per_ogni", label: "Per ogni", snippet: String.raw`\forall` },
    { value: "esiste", label: "Esiste", snippet: String.raw`\exists` },
    { value: "non_esiste", label: "Non esiste", snippet: String.raw`\nexists` },
    { value: "appartiene", label: "Appartiene", snippet: String.raw`\in` },
    { value: "non_appartiene", label: "Non appartiene", snippet: String.raw`\notin` },
    { value: "sottoinsieme", label: "Sottoinsieme", snippet: String.raw`\subset` },
    { value: "sottoinsieme_uguale", label: "Sottoinsieme o uguale", snippet: String.raw`\subseteq` },
    { value: "unione", label: "Unione", snippet: String.raw`\cup` },
    { value: "intersezione", label: "Intersezione", snippet: String.raw`\cap` },
    { value: "insieme_vuoto", label: "Insieme vuoto", snippet: String.raw`\emptyset` },
    { value: "e_logico", label: "E logico", snippet: String.raw`\land` },
    { value: "o_logico", label: "O logico", snippet: String.raw`\lor` },
    { value: "negazione", label: "Negazione", snippet: String.raw`\lnot` },
    { value: "equivalenza_modulare", label: "Equivalenza modulare", snippet: String.raw`a \equiv b \pmod{n}` },
].sort((a, b) => a.label.localeCompare(b.label));

const RELATION_SYMBOLS = [
    { value: "diverso", label: "Diverso", snippet: String.raw`\neq` },
    { value: "minore_uguale", label: "Minore o uguale", snippet: String.raw`\leq` },
    { value: "maggiore_uguale", label: "Maggiore o uguale", snippet: String.raw`\geq` },
    { value: "molto_minore", label: "Molto minore", snippet: String.raw`\ll` },
    { value: "molto_maggiore", label: "Molto maggiore", snippet: String.raw`\gg` },
    { value: "circa_uguale", label: "Circa uguale", snippet: String.raw`\approx` },
    { value: "simile", label: "Simile", snippet: String.raw`\sim` },
    { value: "simile_uguale", label: "Simile o uguale", snippet: String.raw`\simeq` },
    { value: "proporzionale", label: "Proporzionale", snippet: String.raw`\propto` },
    { value: "piu_meno", label: "Più o meno", snippet: String.raw`\pm` },
    { value: "prodotto_cartesiano", label: "Prodotto cartesiano", snippet: String.raw`\times` },
    { value: "prodotto_scalare", label: "Prodotto scalare", snippet: String.raw`\cdot` },
    { value: "infinito", label: "Infinito", snippet: String.raw`\infty` },
].sort((a, b) => a.label.localeCompare(b.label));

const ARROW_SYMBOLS = [
    { value: "freccia_destra", label: "Freccia destra", snippet: String.raw`\to` },
    { value: "freccia_sinistra", label: "Freccia sinistra", snippet: String.raw`\leftarrow` },
    { value: "freccia_doppia", label: "Freccia doppia", snippet: String.raw`\leftrightarrow` },
    { value: "implica", label: "Implica", snippet: String.raw`\Rightarrow` },
    { value: "implica_sinistra", label: "Implica sinistra", snippet: String.raw`\Leftarrow` },
    { value: "se_e_solo_se", label: "Se e solo se", snippet: String.raw`\Leftrightarrow` },
    { value: "mappa_a", label: "Mappa a", snippet: String.raw`\mapsto` },
    { value: "freccia_su", label: "Freccia su", snippet: String.raw`\uparrow` },
    { value: "freccia_giu", label: "Freccia giù", snippet: String.raw`\downarrow` },
    { value: "freccia_diagonale", label: "Freccia diagonale", snippet: String.raw`\nearrow` },
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
    const [pendingKind, setPendingKind] = useState<'single' | 'double'>('double');

    const blockState = getIsActiveBlock(editorRef, BLOCK_MARKER, BLOCK_MARKER, false);
    const inlineState = getIsActiveLatexInline(editorRef);

    const renderLatex = (latex: string): { __html: string } => {
        return {
            __html: katex.renderToString(latex, {
                throwOnError: false,
            }),
        };
    };

    function resolveActiveKind(): 'block' | 'single' | 'double' | null {
        if (blockState !== null) return 'block';
        if (inlineState?.kind === 'double') return 'double';
        if (inlineState?.kind === 'single') return 'single';
        return null;
    }
    const activeKind = resolveActiveKind();

    const openCommand = (kind: 'single' | 'double') => {
        setPendingKind(kind);
        setOpen(true);
    };

    const handleFormulaSelect = (snippet: string) => {
        setOpen(false);
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;
        const sel = editorRef.current.getSelection();
        if (!sel) return;

        if (activeKind === 'block') {
            const totalLines = model.getLineCount();
            let openLine = -1;
            for (let l = sel.startLineNumber; l >= 1; l--) {
                if (model.getLineContent(l).trim() === BLOCK_MARKER) { openLine = l; break; }
            }
            let closeLine = -1;
            for (let l = sel.endLineNumber; l <= totalLines; l++) {
                if (model.getLineContent(l).trim() === BLOCK_MARKER) { closeLine = l; break; }
            }

            if (openLine === -1 || closeLine === -1) return;

            const onOpenLine = sel.startLineNumber === openLine;
            const onCloseLine = sel.startLineNumber === closeLine;

            let finalRange;

            if (onOpenLine) {
                finalRange = {
                    startLineNumber: openLine + 1, startColumn: 1,
                    endLineNumber: openLine + 1, endColumn: 1
                };
            } else if (onCloseLine) {
                finalRange = {
                    startLineNumber: closeLine, startColumn: 1,
                    endLineNumber: closeLine, endColumn: 1
                };
            } else {
                finalRange = sel;
            }

            model.pushEditOperations([], [{
                range: finalRange,
                text: (onOpenLine || onCloseLine) ? `${snippet}\n` : snippet,
            }], () => null);

        } else if (activeKind === 'single' || activeKind === 'double') {
            model.pushEditOperations([], [{
                range: sel,
                text: snippet,
            }], () => null);
        } else if (pendingKind === 'single') {
            model.pushEditOperations([], [{
                range: {
                    startLineNumber: sel.startLineNumber,
                    startColumn: sel.startColumn,
                    endLineNumber: sel.endLineNumber,
                    endColumn: sel.endColumn
                },
                text: `$${snippet}$`,
            }], () => null);
        } else {
            const endLine = sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber
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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G" && isFocused) {
                e.preventDefault();
                openCommand('single')
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H" && isFocused) {
                e.preventDefault();
                openCommand('double')
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    return (
        <>
            {/* Toggle $ — nascosto se block o double attivi */}
            {activeKind !== 'block' && activeKind !== 'double' && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                variant="outline"
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Formula inline"
                                pressed={activeKind === 'single' && isFocused}
                                disabled={!isFocused}
                                onClick={() => openCommand('single')}
                            >
                                <Radical size={16} />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Formula inline
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd><span>+</span><Kbd>Shift</Kbd><span>+</span><Kbd>G</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {/* Toggle $$ — nascosto se single attivo */}
            {activeKind !== 'single' && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Toggle
                                variant="outline"
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Formula in blocco"
                                pressed={(activeKind === 'block' || activeKind === 'double') && isFocused}
                                disabled={!isFocused}
                                onClick={() => openCommand('double')}
                            >
                                <SquareRadical size={16} />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent className="pr-1.5">
                            <div className="flex items-center gap-2">
                                Formula in blocco
                                <KbdGroup className="hidden md:flex">
                                    <Kbd>Ctrl</Kbd><span>+</span><Kbd>Shift</Kbd><span>+</span><Kbd>H</Kbd>
                                </KbdGroup>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <CommandDialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setTimeout(() => editorRef.current?.focus(), 0);
                }}
            >
                <Command>
                    <CommandInput placeholder="Cerca formula o simbolo..." />
                    <CommandList>
                        <CommandEmpty>Nessun risultato.</CommandEmpty>

                        <CommandGroup heading="Formule">
                            {FORMULAS.map((f) => (
                                <CommandItem
                                    key={f.value}
                                    value={f.value}
                                    onSelect={() => handleFormulaSelect(f.snippet)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{f.label}</span>

                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={renderLatex(f.snippet)}
                                    />

                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Lettere greche">
                            {GREEK_LETTERS.map((s) => (
                                <CommandItem
                                    key={s.value}
                                    value={s.value}
                                    onSelect={() => handleFormulaSelect(s.snippet)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{s.label}</span>

                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={renderLatex(s.snippet)}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Logica e insiemi">
                            {LOGIC_SYMBOLS.map((s) => (
                                <CommandItem
                                    key={s.value}
                                    value={s.value}
                                    onSelect={() => handleFormulaSelect(s.snippet)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{s.label}</span>

                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={renderLatex(s.snippet)}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Relazioni e operatori">
                            {RELATION_SYMBOLS.map((s) => (
                                <CommandItem
                                    key={s.value}
                                    value={s.value}
                                    onSelect={() => handleFormulaSelect(s.snippet)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{s.label}</span>

                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={renderLatex(s.snippet)}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandSeparator />

                        <CommandGroup heading="Frecce e implicazioni">
                            {ARROW_SYMBOLS.map((s) => (
                                <CommandItem
                                    key={s.value}
                                    value={s.value}
                                    onSelect={() => handleFormulaSelect(s.snippet)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{s.label}</span>

                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={renderLatex(s.snippet)}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}