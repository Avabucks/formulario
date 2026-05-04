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
    getIsActiveLatexInline
} from "@/src/lib/editor/formatting-utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ChevronLeft, ChevronRight, Radical, SquareRadical } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useMemo, useRef, useState } from "react";

type SnippetController = {
    insert: (snippet: string) => void;
};

const BLOCK_MARKER = "$$";

const FORMULAS = [
    { value: "coefficiente_binomiale", label: "Coefficiente binomiale", preview: String.raw`\binom{n}{k}`, snippet: String.raw`\binom{$1}{$2}` },
    { value: "derivata", label: "Derivata", preview: String.raw`\frac{d}{dx} f(x)`, snippet: String.raw`\frac{d}{d$1} $2` },
    { value: "derivata_parziale", label: "Derivata parziale", preview: String.raw`\frac{\partial f}{\partial x}`, snippet: String.raw`\frac{\partial $1}{\partial $2}` },
    { value: "esponenziale", label: "Esponenziale", preview: String.raw`e^{x}`, snippet: String.raw`e^{$1}` },
    { value: "frazione", label: "Frazione", preview: String.raw`\frac{a}{b}`, snippet: String.raw`\frac{$1}{$2}` },
    { value: "integrale", label: "Integrale", preview: String.raw`\int_{a}^{b} f(x)\,dx`, snippet: String.raw`\int_{$1}^{$2} $3\,d$4` },
    { value: "integrale_doppio", label: "Integrale doppio", preview: String.raw`\iint_{D} f(x,y)\,dx\,dy`, snippet: String.raw`\iint_{$1} $2\,d$3\,d$4` },
    { value: "integrale_triplo", label: "Integrale triplo", preview: String.raw`\iiint_{V} f(x,y,z)\,dx\,dy\,dz`, snippet: String.raw`\iiint_{$1} $2\,d$3\,d$4\,d$5` },
    { value: "limite", label: "Limite", preview: String.raw`\lim_{x \to \infty} f(x)`, snippet: String.raw`\lim_{$1 \to \infty}$2` },
    { value: "logaritmo", label: "Logaritmo", preview: String.raw`\log_{b}(x)`, snippet: String.raw`\log_{$1}($2)` },
    { value: "logaritmo_naturale", label: "Logaritmo naturale", preview: String.raw`\ln(x)`, snippet: String.raw`\ln($1)` },
    { value: "matrice_2x2", label: "Matrice 2x2", preview: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`, snippet: String.raw`\begin{pmatrix} $1 & $2 \\\ $3 & $4 \end{pmatrix}` },
    { value: "norma", label: "Norma", preview: String.raw`\|x\|`, snippet: String.raw`\|$1\|` },
    { value: "overline", label: "Overline", preview: String.raw`\overline{x}`, snippet: String.raw`\overline{$1}` },
    { value: "parte_intera_inferiore", label: "Parte intera inferiore", preview: String.raw`\lfloor x \rfloor`, snippet: String.raw`\lfloor $1 \rfloor` },
    { value: "parte_intera_superiore", label: "Parte intera superiore", preview: String.raw`\lceil x \rceil`, snippet: String.raw`\lceil $1 \rceil` },
    { value: "pedice", label: "Pedice", preview: String.raw`x_{i}`, snippet: String.raw`$1_{$2}` },
    { value: "potenza", label: "Potenza", preview: String.raw`x^{n}`, snippet: String.raw`$1^{$2}` },
    { value: "produttoria", label: "Produttoria", preview: String.raw`\prod_{i=1}^{n} x_i`, snippet: String.raw`\prod_{$1}^{$2} $3` },
    { value: "radice_quadrata", label: "Radice quadrata", preview: String.raw`\sqrt{x}`, snippet: String.raw`\sqrt{$1}` },
    { value: "sommatoria", label: "Sommatoria", preview: String.raw`\sum_{i=1}^{n} x_i`, snippet: String.raw`\sum_{$1}^{$2} $3` },
    { value: "underline", label: "Underline", preview: String.raw`\underline{x}`, snippet: String.raw`\underline{$1}` },
    { value: "versore", label: "Versore", preview: String.raw`\hat{u}`, snippet: String.raw`\hat{$1}` },
    { value: "vettore", label: "Vettore", preview: String.raw`\vec{v}`, snippet: String.raw`\vec{$1}` },
].sort((a, b) => a.label.localeCompare(b.label));

const GREEK_LETTERS = [
    { value: "alfa", label: "Alfa", snippet: String.raw`\alpha $1`, preview: String.raw`\alpha ` },
    { value: "beta", label: "Beta", snippet: String.raw`\beta $1`, preview: String.raw`\beta ` },
    { value: "gamma", label: "Gamma", snippet: String.raw`\gamma $1`, preview: String.raw`\gamma ` },
    { value: "gamma_maiuscola", label: "Gamma maiuscola", snippet: String.raw`\Gamma $1`, preview: String.raw`\Gamma ` },
    { value: "delta", label: "Delta", snippet: String.raw`\delta $1`, preview: String.raw`\delta ` },
    { value: "delta_maiuscola", label: "Delta maiuscola", snippet: String.raw`\Delta $1`, preview: String.raw`\Delta ` },
    { value: "epsilon", label: "Epsilon", snippet: String.raw`\varepsilon $1`, preview: String.raw`\varepsilon ` },
    { value: "zeta", label: "Zeta", snippet: String.raw`\zeta $1`, preview: String.raw`\zeta ` },
    { value: "eta", label: "Eta", snippet: String.raw`\eta $1`, preview: String.raw`\eta ` },
    { value: "teta", label: "Teta", snippet: String.raw`\theta $1`, preview: String.raw`\theta ` },
    { value: "teta_maiuscola", label: "Teta maiuscola", snippet: String.raw`\Theta $1`, preview: String.raw`\Theta ` },
    { value: "lambda", label: "Lambda", snippet: String.raw`\lambda $1`, preview: String.raw`\lambda ` },
    { value: "mu", label: "Mu", snippet: String.raw`\mu $1`, preview: String.raw`\mu ` },
    { value: "nu", label: "Nu", snippet: String.raw`\nu $1`, preview: String.raw`\nu ` },
    { value: "xi", label: "Xi", snippet: String.raw`\xi $1`, preview: String.raw`\xi ` },
    { value: "pi", label: "Pi greco", snippet: String.raw`\pi $1`, preview: String.raw`\pi ` },
    { value: "rho", label: "Rho", snippet: String.raw`\rho $1`, preview: String.raw`\rho ` },
    { value: "sigma", label: "Sigma", snippet: String.raw`\sigma $1`, preview: String.raw`\sigma ` },
    { value: "sigma_maiuscola", label: "Sigma maiuscola", snippet: String.raw`\Sigma $1`, preview: String.raw`\Sigma ` },
    { value: "tau", label: "Tau", snippet: String.raw`\tau $1`, preview: String.raw`\tau ` },
    { value: "phi", label: "Phi", snippet: String.raw`\varphi $1`, preview: String.raw`\varphi ` },
    { value: "phi_maiuscola", label: "Phi maiuscola", snippet: String.raw`\Phi $1`, preview: String.raw`\Phi ` },
    { value: "chi", label: "Chi", snippet: String.raw`\chi $1`, preview: String.raw`\chi ` },
    { value: "psi", label: "Psi", snippet: String.raw`\psi $1`, preview: String.raw`\psi ` },
    { value: "omega", label: "Omega", snippet: String.raw`\omega $1`, preview: String.raw`\omega ` },
    { value: "omega_maiuscola", label: "Omega maiuscola", snippet: String.raw`\Omega $1`, preview: String.raw`\Omega ` },
].sort((a, b) => a.label.localeCompare(b.label));

const LOGIC_SYMBOLS = [
    { value: "per_ogni", label: "Per ogni", snippet: String.raw`\forall $1`, preview: String.raw`\forall ` },
    { value: "esiste", label: "Esiste", snippet: String.raw`\exists $1`, preview: String.raw`\exists ` },
    { value: "non_esiste", label: "Non esiste", snippet: String.raw`\nexists $1`, preview: String.raw`\nexists ` },
    { value: "appartiene", label: "Appartiene", snippet: String.raw`\in $1`, preview: String.raw`\in ` },
    { value: "non_appartiene", label: "Non appartiene", snippet: String.raw`\notin $1`, preview: String.raw`\notin ` },
    { value: "sottoinsieme", label: "Sottoinsieme", snippet: String.raw`\subset $1`, preview: String.raw`\subset ` },
    { value: "sottoinsieme_uguale", label: "Sottoinsieme o uguale", snippet: String.raw`\subseteq $1`, preview: String.raw`\subseteq ` },
    { value: "unione", label: "Unione", snippet: String.raw`\cup $1`, preview: String.raw`\cup ` },
    { value: "intersezione", label: "Intersezione", snippet: String.raw`\cap $1`, preview: String.raw`\cap ` },
    { value: "insieme_vuoto", label: "Insieme vuoto", snippet: String.raw`\emptyset $1`, preview: String.raw`\emptyset ` },
    { value: "e_logico", label: "E logico", snippet: String.raw`\land $1`, preview: String.raw`\land ` },
    { value: "o_logico", label: "O logico", snippet: String.raw`\lor $1`, preview: String.raw`\lor ` },
    { value: "negazione", label: "Negazione", snippet: String.raw`\lnot $1`, preview: String.raw`\lnot ` },
    { value: "equivalenza_modulare", label: "Equivalenza modulare", snippet: String.raw` \equiv  \pmod{}`, preview: String.raw`a \equiv b \pmod{n}`, offset: -16 },
    { value: "naturali", label: "Numeri naturali", snippet: String.raw`\mathbb{N} $1`, preview: String.raw`\mathbb{N}` },
    { value: "interi", label: "Numeri interi", snippet: String.raw`\mathbb{Z} $1`, preview: String.raw`\mathbb{Z}` },
    { value: "razionali", label: "Numeri razionali", snippet: String.raw`\mathbb{Q} $1`, preview: String.raw`\mathbb{Q}` },
    { value: "reali", label: "Numeri reali", snippet: String.raw`\mathbb{R} $1`, preview: String.raw`\mathbb{R}` },
    { value: "complessi", label: "Numeri complessi", snippet: String.raw`\mathbb{C} $1`, preview: String.raw`\mathbb{C}` },
    { value: "irrazionali", label: "Numeri irrazionali", snippet: String.raw`\mathbb{R}\setminus\mathbb{Q} $1`, preview: String.raw`\mathbb{R}\setminus\mathbb{Q}` },
].sort((a, b) => a.label.localeCompare(b.label));

const RELATION_SYMBOLS = [
    { value: "diverso", label: "Diverso", snippet: String.raw`\neq $1`, preview: String.raw`\neq ` },
    { value: "minore_uguale", label: "Minore o uguale", snippet: String.raw`\leq $1`, preview: String.raw`\leq ` },
    { value: "maggiore_uguale", label: "Maggiore o uguale", snippet: String.raw`\geq $1`, preview: String.raw`\geq ` },
    { value: "molto_minore", label: "Molto minore", snippet: String.raw`\ll $1`, preview: String.raw`\ll ` },
    { value: "molto_maggiore", label: "Molto maggiore", snippet: String.raw`\gg $1`, preview: String.raw`\gg ` },
    { value: "circa_uguale", label: "Circa uguale", snippet: String.raw`\approx $1`, preview: String.raw`\approx ` },
    { value: "simile", label: "Simile", snippet: String.raw`\sim $1`, preview: String.raw`\sim ` },
    { value: "simile_uguale", label: "Simile o uguale", snippet: String.raw`\simeq $1`, preview: String.raw`\simeq ` },
    { value: "proporzionale", label: "Proporzionale", snippet: String.raw`\propto $1`, preview: String.raw`\propto ` },
    { value: "piu_meno", label: "Più o meno", snippet: String.raw`\pm $1`, preview: String.raw`\pm ` },
    { value: "prodotto_cartesiano", label: "Prodotto cartesiano", snippet: String.raw`\times $1`, preview: String.raw`\times ` },
    { value: "prodotto_scalare", label: "Prodotto scalare", snippet: String.raw`\cdot $1`, preview: String.raw`\cdot ` },
    { value: "infinito", label: "Infinito", snippet: String.raw`\infty $1`, preview: String.raw`\infty ` },
].sort((a, b) => a.label.localeCompare(b.label));

const ARROW_SYMBOLS = [
    { value: "freccia_destra", label: "Freccia destra", snippet: String.raw`\to $1`, preview: String.raw`\to ` },
    { value: "freccia_sinistra", label: "Freccia sinistra", snippet: String.raw`\leftarrow $1`, preview: String.raw`\leftarrow ` },
    { value: "freccia_doppia", label: "Freccia doppia", snippet: String.raw`\leftrightarrow $1`, preview: String.raw`\leftrightarrow ` },
    { value: "implica", label: "Implica", snippet: String.raw`\Rightarrow $1`, preview: String.raw`\Rightarrow ` },
    { value: "implica_sinistra", label: "Implica sinistra", snippet: String.raw`\Leftarrow $1`, preview: String.raw`\Leftarrow ` },
    { value: "se_e_solo_se", label: "Se e solo se", snippet: String.raw`\Leftrightarrow $1`, preview: String.raw`\Leftrightarrow ` },
    { value: "mappa_a", label: "Mappa a", snippet: String.raw`\mapsto $1`, preview: String.raw`\mapsto ` },
    { value: "freccia_su", label: "Freccia su", snippet: String.raw`\uparrow $1`, preview: String.raw`\uparrow ` },
    { value: "freccia_giu", label: "Freccia giù", snippet: String.raw`\downarrow $1`, preview: String.raw`\downarrow ` },
    { value: "freccia_diagonale", label: "Freccia diagonale", snippet: String.raw`\nearrow $1`, preview: String.raw`\nearrow ` },
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

    useEffect(() => {
        if (!query) return;

        const firstTabWithResults = tabs.find(t => tabCounts[t.id] > 0);

        if (firstTabWithResults) {
            setActiveTabAndScroll(firstTabWithResults.id);
        }
    }, [query, tabCounts]);

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

    const insertIntoBlock = (model: editor.ITextModel, sel: Selection, snippet: string) => {
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

        const controller = editorRef.current?.getContribution('snippetController2') as SnippetController | undefined;
        const text = (onOpenLine || onCloseLine) ? `${snippet}$0\n` : `${snippet}$0`
        controller?.insert(text);
        setTimeout(() => {
            editorRef.current?.focus();
        }, 0);
    };

    const insertInline = (snippet: string) => {
        const controller = editorRef.current?.getContribution('snippetController2') as SnippetController | undefined;
        controller?.insert(`${snippet}$0`);
        setTimeout(() => {
            editorRef.current?.focus();
        }, 0);
    };

    const insertNew = (snippet: string, kind: 'single' | 'double') => {
        const isEmpty = snippet === "";
        const controller = editorRef.current?.getContribution('snippetController2') as SnippetController | undefined;

        if (kind === 'single') {
            const text = isEmpty
                ? '$$0$'
                : `$${snippet}$0$`;
            controller?.insert(text);
            setTimeout(() => {
                editorRef.current?.focus();
            }, 0);
        } else {
            const text = isEmpty
                ? `${BLOCK_MARKER}\n$0\n${BLOCK_MARKER}`
                : `${BLOCK_MARKER}\n${snippet}$0\n${BLOCK_MARKER}`;
            controller?.insert(text);
            setTimeout(() => {
                editorRef.current?.focus();
            }, 0);
        }
    };

    const handleFormulaSelect = (snippet: string) => {
        setOpen(false);
        setQuery("");
        setActiveTab("formule");

        const model = editorRef.current?.getModel();
        const sel = editorRef.current?.getSelection();
        if (!model || !sel) return;

        if (activeKind === 'block') {
            insertIntoBlock(model, sel, snippet);
        } else if (activeKind === 'single' || activeKind === 'double') {
            insertInline(snippet);
        } else {
            insertNew(snippet, pendingKind);
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
                                    onSelect={() => handleFormulaSelect(f.snippet)}
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