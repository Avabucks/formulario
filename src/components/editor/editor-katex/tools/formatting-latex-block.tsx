"use client";

import { Button } from "@/src/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
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
import { ChevronLeft, ChevronRight, Radical, SquareRadical } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useMemo, useRef, useState } from "react";

const BLOCK_MARKER = "$$";

const FORMULAS = [
    { value: "coefficiente_binomiale", label: "Coefficiente binomiale", preview: String.raw`\binom{n}{k}`, snippet: String.raw`\binom{}{}`, offset: -3 },
    { value: "derivata", label: "Derivata", preview: String.raw`\frac{d}{dx} f(x)`, snippet: String.raw`\frac{d}{dx} f(x)`, offset: undefined },
    { value: "derivata_parziale", label: "Derivata parziale", preview: String.raw`\frac{\partial f}{\partial x}`, snippet: String.raw`\frac{\partial }{\partial }`, offset: -12 },
    { value: "esponenziale", label: "Esponenziale", preview: String.raw`e^{x}`, snippet: String.raw`e^{}`, offset: -1 },
    { value: "frazione", label: "Frazione", preview: String.raw`\frac{a}{b}`, snippet: String.raw`\frac{}{}`, offset: -3 },
    { value: "integrale", label: "Integrale", preview: String.raw`\int_{a}^{b} f(x)\,dx`, snippet: String.raw`\int_{}^{} \,d`, offset: -8 },
    { value: "limite", label: "Limite", preview: String.raw`\lim_{x \to \infty} f(x)`, snippet: String.raw`\lim_{ \to \infty}`, offset: -12 },
    { value: "logaritmo", label: "Logaritmo", preview: String.raw`\log_{b}(x)`, snippet: String.raw`\log_{}()`, offset: -3 },
    { value: "logaritmo_naturale", label: "Logaritmo naturale", preview: String.raw`\ln(x)`, snippet: String.raw`\ln()`, offset: -1 },
    { value: "matrice_2x2", label: "Matrice 2x2", preview: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`, snippet: String.raw`\begin{pmatrix}  &  \\  &  \end{pmatrix}`, offset: -24 },
    { value: "norma", label: "Norma", preview: String.raw`\|x\|`, snippet: String.raw`\|\|`, offset: -2 },
    { value: "overline", label: "Overline", preview: String.raw`\overline{x}`, snippet: String.raw`\overline{}`, offset: -1 },
    { value: "parte_intera_inferiore", label: "Parte intera inferiore", preview: String.raw`\lfloor x \rfloor`, snippet: String.raw`\lfloor  \rfloor`, offset: -8 },
    { value: "parte_intera_superiore", label: "Parte intera superiore", preview: String.raw`\lceil x \rceil`, snippet: String.raw`\lceil  \rceil`, offset: -7 },
    { value: "pedice", label: "Pedice", preview: String.raw`x_{i}`, snippet: String.raw`_{}`, offset: -3 },
    { value: "potenza", label: "Potenza", preview: String.raw`x^{n}`, snippet: String.raw`^{}`, offset: -3 },
    { value: "produttoria", label: "Produttoria", preview: String.raw`\prod_{i=1}^{n} x_i`, snippet: String.raw`\prod_{}^{} `, offset: -6 },
    { value: "radice_quadrata", label: "Radice quadrata", preview: String.raw`\sqrt{x}`, snippet: String.raw`\sqrt{}`, offset: -1 },
    { value: "sommatoria", label: "Sommatoria", preview: String.raw`\sum_{i=1}^{n} x_i`, snippet: String.raw`\sum_{}^{} `, offset: -6 },
    { value: "underline", label: "Underline", preview: String.raw`\underline{x}`, snippet: String.raw`\underline{}`, offset: -1 },
    { value: "versore", label: "Versore", preview: String.raw`\hat{u}`, snippet: String.raw`\hat{}`, offset: -1 },
    { value: "vettore", label: "Vettore", preview: String.raw`\vec{v}`, snippet: String.raw`\vec{}`, offset: -1 },
].sort((a, b) => a.label.localeCompare(b.label));

const GREEK_LETTERS = [
    { value: "alfa", label: "Alfa", snippet: String.raw`\alpha `, preview: String.raw`\alpha `, offset: undefined },
    { value: "beta", label: "Beta", snippet: String.raw`\beta `, preview: String.raw`\beta `, offset: undefined },
    { value: "gamma", label: "Gamma", snippet: String.raw`\gamma `, preview: String.raw`\gamma `, offset: undefined },
    { value: "gamma_maiuscola", label: "Gamma maiuscola", snippet: String.raw`\Gamma `, preview: String.raw`\Gamma `, offset: undefined },
    { value: "delta", label: "Delta", snippet: String.raw`\delta `, preview: String.raw`\delta `, offset: undefined },
    { value: "delta_maiuscola", label: "Delta maiuscola", snippet: String.raw`\Delta `, preview: String.raw`\Delta `, offset: undefined },
    { value: "epsilon", label: "Epsilon", snippet: String.raw`\varepsilon `, preview: String.raw`\varepsilon `, offset: undefined },
    { value: "zeta", label: "Zeta", snippet: String.raw`\zeta `, preview: String.raw`\zeta `, offset: undefined },
    { value: "eta", label: "Eta", snippet: String.raw`\eta `, preview: String.raw`\eta `, offset: undefined },
    { value: "teta", label: "Teta", snippet: String.raw`\theta `, preview: String.raw`\theta `, offset: undefined },
    { value: "teta_maiuscola", label: "Teta maiuscola", snippet: String.raw`\Theta `, preview: String.raw`\Theta `, offset: undefined },
    { value: "lambda", label: "Lambda", snippet: String.raw`\lambda `, preview: String.raw`\lambda `, offset: undefined },
    { value: "mu", label: "Mu", snippet: String.raw`\mu `, preview: String.raw`\mu `, offset: undefined },
    { value: "nu", label: "Nu", snippet: String.raw`\nu `, preview: String.raw`\nu `, offset: undefined },
    { value: "xi", label: "Xi", snippet: String.raw`\xi `, preview: String.raw`\xi `, offset: undefined },
    { value: "pi", label: "Pi greco", snippet: String.raw`\pi `, preview: String.raw`\pi `, offset: undefined },
    { value: "rho", label: "Rho", snippet: String.raw`\rho `, preview: String.raw`\rho `, offset: undefined },
    { value: "sigma", label: "Sigma", snippet: String.raw`\sigma `, preview: String.raw`\sigma `, offset: undefined },
    { value: "sigma_maiuscola", label: "Sigma maiuscola", snippet: String.raw`\Sigma `, preview: String.raw`\Sigma `, offset: undefined },
    { value: "tau", label: "Tau", snippet: String.raw`\tau `, preview: String.raw`\tau `, offset: undefined },
    { value: "phi", label: "Phi", snippet: String.raw`\varphi `, preview: String.raw`\varphi `, offset: undefined },
    { value: "phi_maiuscola", label: "Phi maiuscola", snippet: String.raw`\Phi `, preview: String.raw`\Phi `, offset: undefined },
    { value: "chi", label: "Chi", snippet: String.raw`\chi `, preview: String.raw`\chi `, offset: undefined },
    { value: "psi", label: "Psi", snippet: String.raw`\psi `, preview: String.raw`\psi `, offset: undefined },
    { value: "omega", label: "Omega", snippet: String.raw`\omega `, preview: String.raw`\omega `, offset: undefined },
    { value: "omega_maiuscola", label: "Omega maiuscola", snippet: String.raw`\Omega `, preview: String.raw`\Omega `, offset: undefined },
].sort((a, b) => a.label.localeCompare(b.label));

const LOGIC_SYMBOLS = [
    { value: "per_ogni", label: "Per ogni", snippet: String.raw`\forall `, preview: String.raw`\forall `, offset: undefined },
    { value: "esiste", label: "Esiste", snippet: String.raw`\exists `, preview: String.raw`\exists `, offset: undefined },
    { value: "non_esiste", label: "Non esiste", snippet: String.raw`\nexists `, preview: String.raw`\nexists `, offset: undefined },
    { value: "appartiene", label: "Appartiene", snippet: String.raw`\in `, preview: String.raw`\in `, offset: undefined },
    { value: "non_appartiene", label: "Non appartiene", snippet: String.raw`\notin `, preview: String.raw`\notin `, offset: undefined },
    { value: "sottoinsieme", label: "Sottoinsieme", snippet: String.raw`\subset `, preview: String.raw`\subset `, offset: undefined },
    { value: "sottoinsieme_uguale", label: "Sottoinsieme o uguale", snippet: String.raw`\subseteq `, preview: String.raw`\subseteq `, offset: undefined },
    { value: "unione", label: "Unione", snippet: String.raw`\cup `, preview: String.raw`\cup `, offset: undefined },
    { value: "intersezione", label: "Intersezione", snippet: String.raw`\cap `, preview: String.raw`\cap `, offset: undefined },
    { value: "insieme_vuoto", label: "Insieme vuoto", snippet: String.raw`\emptyset `, preview: String.raw`\emptyset `, offset: undefined },
    { value: "e_logico", label: "E logico", snippet: String.raw`\land `, preview: String.raw`\land `, offset: undefined },
    { value: "o_logico", label: "O logico", snippet: String.raw`\lor `, preview: String.raw`\lor `, offset: undefined },
    { value: "negazione", label: "Negazione", snippet: String.raw`\lnot `, preview: String.raw`\lnot `, offset: undefined },
    { value: "equivalenza_modulare", label: "Equivalenza modulare", snippet: String.raw` \equiv  \pmod{}`, preview: String.raw`a \equiv b \pmod{n}`, offset: -16 },
].sort((a, b) => a.label.localeCompare(b.label));

const RELATION_SYMBOLS = [
    { value: "diverso", label: "Diverso", snippet: String.raw`\neq `, preview: String.raw`\neq `, offset: undefined },
    { value: "minore_uguale", label: "Minore o uguale", snippet: String.raw`\leq `, preview: String.raw`\leq `, offset: undefined },
    { value: "maggiore_uguale", label: "Maggiore o uguale", snippet: String.raw`\geq `, preview: String.raw`\geq `, offset: undefined },
    { value: "molto_minore", label: "Molto minore", snippet: String.raw`\ll `, preview: String.raw`\ll `, offset: undefined },
    { value: "molto_maggiore", label: "Molto maggiore", snippet: String.raw`\gg `, preview: String.raw`\gg `, offset: undefined },
    { value: "circa_uguale", label: "Circa uguale", snippet: String.raw`\approx `, preview: String.raw`\approx `, offset: undefined },
    { value: "simile", label: "Simile", snippet: String.raw`\sim `, preview: String.raw`\sim `, offset: undefined },
    { value: "simile_uguale", label: "Simile o uguale", snippet: String.raw`\simeq `, preview: String.raw`\simeq `, offset: undefined },
    { value: "proporzionale", label: "Proporzionale", snippet: String.raw`\propto `, preview: String.raw`\propto `, offset: undefined },
    { value: "piu_meno", label: "Più o meno", snippet: String.raw`\pm `, preview: String.raw`\pm `, offset: undefined },
    { value: "prodotto_cartesiano", label: "Prodotto cartesiano", snippet: String.raw`\times `, preview: String.raw`\times `, offset: undefined },
    { value: "prodotto_scalare", label: "Prodotto scalare", snippet: String.raw`\cdot `, preview: String.raw`\cdot `, offset: undefined },
    { value: "infinito", label: "Infinito", snippet: String.raw`\infty `, preview: String.raw`\infty `, offset: undefined },
].sort((a, b) => a.label.localeCompare(b.label));

const ARROW_SYMBOLS = [
    { value: "freccia_destra", label: "Freccia destra", snippet: String.raw`\to `, preview: String.raw`\to `, offset: undefined },
    { value: "freccia_sinistra", label: "Freccia sinistra", snippet: String.raw`\leftarrow `, preview: String.raw`\leftarrow `, offset: undefined },
    { value: "freccia_doppia", label: "Freccia doppia", snippet: String.raw`\leftrightarrow `, preview: String.raw`\leftrightarrow `, offset: undefined },
    { value: "implica", label: "Implica", snippet: String.raw`\Rightarrow `, preview: String.raw`\Rightarrow `, offset: undefined },
    { value: "implica_sinistra", label: "Implica sinistra", snippet: String.raw`\Leftarrow `, preview: String.raw`\Leftarrow `, offset: undefined },
    { value: "se_e_solo_se", label: "Se e solo se", snippet: String.raw`\Leftrightarrow `, preview: String.raw`\Leftrightarrow `, offset: undefined },
    { value: "mappa_a", label: "Mappa a", snippet: String.raw`\mapsto `, preview: String.raw`\mapsto `, offset: undefined },
    { value: "freccia_su", label: "Freccia su", snippet: String.raw`\uparrow `, preview: String.raw`\uparrow `, offset: undefined },
    { value: "freccia_giu", label: "Freccia giù", snippet: String.raw`\downarrow `, preview: String.raw`\downarrow `, offset: undefined },
    { value: "freccia_diagonale", label: "Freccia diagonale", snippet: String.raw`\nearrow `, preview: String.raw`\nearrow `, offset: undefined },
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

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("formule");

    const renderLatex = (latex: string): { __html: string } => {
        return {
            __html: katex.renderToString(latex, {
                throwOnError: false,
            }),
        };
    };

    const renderedFormulas = useMemo(() =>
        FORMULAS.map(f => ({ ...f, rendered: renderLatex(f.preview) })), []);

    const renderedGreek = useMemo(() =>
        GREEK_LETTERS.map(s => ({ ...s, rendered: renderLatex(s.preview) })), []);

    const renderedLogic = useMemo(() =>
        LOGIC_SYMBOLS.map(s => ({ ...s, rendered: renderLatex(s.preview) })), []);

    const renderedRelations = useMemo(() =>
        RELATION_SYMBOLS.map(s => ({ ...s, rendered: renderLatex(s.preview) })), []);

    const renderedArrows = useMemo(() =>
        ARROW_SYMBOLS.map(s => ({ ...s, rendered: renderLatex(s.preview) })), []);

    const MAX_VISIBLE = 0;

    const tabs = [
        { id: "formule", label: "Formule", data: renderedFormulas },
        { id: "relazioni", label: "Relazioni e operatori", data: renderedRelations },
        { id: "logica", label: "Logica e insiemi", data: renderedLogic },
        { id: "frecce", label: "Frecce e implicazioni", data: renderedArrows },
        { id: "greche", label: "Lettere greche", data: renderedGreek },
    ];

    const activeData = useMemo(() => {
        const tab = tabs.find(t => t.id === activeTab);
        if (!tab) return [];
        const q = query.toLowerCase();
        return q
            ? tab.data.filter(f => f.label.toLowerCase().includes(q))
            : tab.data.slice(0, MAX_VISIBLE);
    }, [query, activeTab]);

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

    const tabsRef = useRef<HTMLDivElement>(null);

    const tabCounts = useMemo(() => {
        const q = query.toLowerCase();
        return Object.fromEntries(
            tabs.map(t => [
                t.id,
                q ? t.data.filter(f => f.label.toLowerCase().includes(q)).length : t.data.length
            ])
        );
    }, [query]);

    const scroll = (dir: "left" | "right") => {
        tabsRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
    };

    const setActiveTabAndScroll = (id: string) => {
        setActiveTab(id);
        setTimeout(() => {
            const activeBtn = tabsRef.current?.querySelector(`[data-tab="${id}"]`) as HTMLElement;
            activeBtn?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        }, 0);
    };

    const moveCursorToMiddle = (kind: 'single' | 'double' | 'block') => {
        setTimeout(() => {
            if (!editorRef.current) return;
            const sel = editorRef.current.getSelection();
            const pos = sel && (sel.startColumn !== sel.endColumn || sel.startLineNumber !== sel.endLineNumber)
                ? { lineNumber: sel.endLineNumber, column: sel.endColumn }
                : editorRef.current.getPosition();
            if (!pos) return;
            if (kind === 'block') {
                editorRef.current.setPosition({ lineNumber: pos.lineNumber - 1, column: 1 });
            } else {
                const offset = kind === 'double' ? -2 : -1;
                editorRef.current.setPosition({ lineNumber: pos.lineNumber, column: pos.column + offset });
            }
            editorRef.current.focus();
        }, 0);
    };

    const focusEditor = (offset?: number, prefixSize?: number) => {
        setTimeout(() => {
            if (!editorRef.current) return;
            const sel = editorRef.current.getSelection();
            const pos = sel && (sel.startColumn !== sel.endColumn || sel.startLineNumber !== sel.endLineNumber)
                ? { lineNumber: sel.endLineNumber, column: sel.endColumn }
                : editorRef.current.getPosition();
            if (!pos) return;
            const finalOffset = (offset ?? 0) - (prefixSize ?? 0);
            editorRef.current.setPosition({ lineNumber: pos.lineNumber, column: pos.column + finalOffset });
            editorRef.current.focus();
        }, 0);
    };

    const getFinalRange = (sel: Selection, onOpenLine: boolean, onCloseLine: boolean, openLine: number, closeLine: number) => {
        if (onOpenLine) return { startLineNumber: openLine + 1, startColumn: 1, endLineNumber: openLine + 1, endColumn: 1 };
        if (onCloseLine) return { startLineNumber: closeLine, startColumn: 1, endLineNumber: closeLine, endColumn: 1 };
        return sel;
    };

    const insertIntoBlock = (model: editor.ITextModel, sel: Selection, snippet: string, cursorOffset?: number) => {
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
        const finalRange = getFinalRange(sel, onOpenLine, onCloseLine, openLine, closeLine);

        model.pushEditOperations([], [{
            range: finalRange,
            text: (onOpenLine || onCloseLine) ? `${snippet}\n` : snippet,
        }], () => null);

        focusEditor(cursorOffset);
    };

    const insertInline = (model: editor.ITextModel, sel: Selection, snippet: string, kind: 'single' | 'double', cursorOffset?: number) => {
        model.pushEditOperations([], [{ range: sel, text: snippet }], () => null);
        if (snippet === "") moveCursorToMiddle(kind);
        else focusEditor(cursorOffset);
    };

    const insertNew = (model: editor.ITextModel, sel: Selection, snippet: string, kind: 'single' | 'double', cursorOffset?: number) => {
        const isEmpty = snippet === "";
        if (kind === 'single') {
            model.pushEditOperations([], [{
                range: { startLineNumber: sel.startLineNumber, startColumn: sel.startColumn, endLineNumber: sel.endLineNumber, endColumn: sel.endColumn },
                text: isEmpty ? `$$` : `$${snippet}$`,
            }], () => null);
            if (isEmpty) moveCursorToMiddle('single');
            else focusEditor(cursorOffset, 1);
        } else {
            const endLine = sel.endColumn === 1 && sel.endLineNumber > sel.startLineNumber ? sel.endLineNumber - 1 : sel.endLineNumber;
            const endCol = model.getLineContent(endLine).length + 1;
            model.pushEditOperations([], [{
                range: { startLineNumber: sel.startLineNumber, startColumn: 1, endLineNumber: endLine, endColumn: endCol },
                text: isEmpty ? `${BLOCK_MARKER}\n\n${BLOCK_MARKER}` : `${BLOCK_MARKER}\n${snippet}\n${BLOCK_MARKER}`,
            }], () => null);
            if (isEmpty) {
                moveCursorToMiddle('block');
            } else {
                setTimeout(() => {
                    if (!editorRef.current) return;
                    const snippetLines = snippet.split("\n").length;
                    const lastLineLen = snippet.split("\n").at(-1)!.length + 1;
                    editorRef.current.setPosition({
                        lineNumber: sel.startLineNumber + snippetLines,
                        column: cursorOffset === undefined ? lastLineLen : lastLineLen + cursorOffset,
                    });
                    editorRef.current.focus();
                }, 0);
            }
        }
    };

    const handleFormulaSelect = (snippet: string, cursorOffset?: number) => {
        setOpen(false);
        setQuery("");
        setActiveTab("formule");

        const model = editorRef.current?.getModel();
        const sel = editorRef.current?.getSelection();
        if (!model || !sel) return;

        if (activeKind === 'block') {
            insertIntoBlock(model, sel, snippet, cursorOffset);
        } else if (activeKind === 'single' || activeKind === 'double') {
            insertInline(model, sel, snippet, activeKind, cursorOffset);
        } else {
            insertNew(model, sel, snippet, pendingKind, cursorOffset);
        }
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
                    if (!v) {
                        setQuery("");
                        setActiveTab("formule");
                        setTimeout(() => editorRef.current?.focus(), 0);
                    }
                }}
            >
                <Command
                    shouldFilter={false}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && activeData.length === 0) {
                            e.preventDefault();
                            handleFormulaSelect("");
                        }
                        if (e.key === "Tab") {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentIndex = tabs.findIndex(t => t.id === activeTab);
                            const nextIndex = e.shiftKey
                                ? (currentIndex - 1 + tabs.length) % tabs.length
                                : (currentIndex + 1) % tabs.length;
                            setActiveTabAndScroll(tabs[nextIndex].id);
                        }
                    }}
                >
                    <CommandInput
                        placeholder="Cerca formula o simbolo..."
                        onValueChange={setQuery}
                    />

                    {/* Tab bar */}
                    <div className="tab-latex flex items-center">
                        <button
                            onClick={() => scroll("left")}
                            className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div
                            ref={tabsRef}
                            className="flex overflow-x-auto scrollbar-none flex-1"
                        >
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    data-tab={t.id}
                                    tabIndex={-1}
                                    onClick={() => setActiveTabAndScroll(t.id)}
                                    className={`px-3 py-1.5 text-sm whitespace-nowrap flex items-center gap-1.5 transition-colors
                                        ${activeTab === t.id
                                            ? "border-b-2 border-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {t.label}
                                    {query && (
                                        <span className={`text-xs rounded-full px-1.5 py-0.5 
                                            ${tabCounts[t.id] > 0
                                                ? "bg-primary/15 text-primary"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {tabCounts[t.id]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => scroll("right")}
                            className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <CommandList>
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-4 py-4 text-center">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        Nessun risultato trovato
                                    </p>
                                    <p className="text-xs text-muted-foreground/80">
                                        Prova a cercare una formula o un simbolo
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                    <span className="h-px w-8 bg-border" />{" "}
                                    oppure
                                    <span className="h-px w-8 bg-border" />
                                </div>
                                <Button
                                    onClick={() => handleFormulaSelect("")}
                                    variant="outline"
                                >
                                    {pendingKind === 'single' ? <Radical size={14} /> : <SquareRadical size={14} />}
                                    Inserisci vuota
                                </Button>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {activeData.map((f) => (
                                <CommandItem
                                    key={f.value}
                                    value={f.value}
                                    onSelect={() => handleFormulaSelect(f.snippet, f.offset)}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <span>{f.label}</span>
                                    <span
                                        className="text-sm opacity-80"
                                        dangerouslySetInnerHTML={f.rendered}
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