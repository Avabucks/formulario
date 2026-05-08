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
import { Separator } from "@/src/components/ui/separator";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import {
    getCodeInlineRegex,
    getIsActiveCode,
    getIsActiveLatex,
    getIsActiveWord
} from "@/src/lib/editor/formatting-utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ChevronLeft, ChevronRight, Radical, SquareRadical } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import formulasData from "@/src/data/formulas.json";

type SnippetController = {
    insert: (snippet: string) => void;
};

const BLOCK_MARKER = "$$";

const FORMULA_FIRST_USE_KEY = "formula_first_use_shown";

export function FormattingLatex({
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

    const inlineState = getIsActiveLatex(editorRef);

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("formule");

    const renderLatex = (latex: string): { __html: string } => {
        return {
            __html: katex.renderToString(latex, {
                throwOnError: false,
            }),
        };
    };

    const MAX_VISIBLE = 0;

    const tabs = useMemo(() =>
        formulasData.sections.map(section => ({
            id: section.id,
            label: section.label,
            data: [...section.items]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(f => ({ ...f, rendered: renderLatex(f.preview) })),
        })), []);

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
    }, [query, tabs]);

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
            const activeBtn = tabsRef.current?.querySelector(`[data-tab="${id}"]`);
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

        if (!localStorage.getItem(FORMULA_FIRST_USE_KEY)) {
            const toastId = toast(
                <span className="leading-6 flex flex-col md:flex-row gap-2 md:text-nowrap md:flex-nowrap">
                    <span>
                        Usa <Kbd>Tab</Kbd> per spostarti tra i campi della formula
                        e <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd> per tornare indietro.
                    </span>
                    <button
                        className="text-xs text-muted-foreground underline text-left w-fit cursor-pointer"
                        onClick={() => {
                            localStorage.setItem(FORMULA_FIRST_USE_KEY, "true");
                            toast.dismiss(toastId);
                        }}
                    >
                        Non mostrare più
                    </button>
                </span>,
                {
                    position: "bottom-center",
                    duration: 5000,
                    classNames: {
                        toast: "md:!min-w-fit md:!left-1/2 md:!-translate-x-1/2",
                    },
                }
            );
        }
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyG" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                openCommand('single')
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyH" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                openCommand('double')
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if ((getIsActiveCode(editorRef) || getIsActiveWord(editorRef, getCodeInlineRegex)) && isFocused) return null;

    return (
        <>
            {/* Toggle $ — nascosto se block o double attivi */}
            {(!isFocused || (activeKind !== 'block' && activeKind !== 'double')) && (
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
                                {activeKind == 'single' && isFocused && (
                                    <span>Aggiungi alla formula</span>
                                )}
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
            {(!isFocused || activeKind !== 'single') && (
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
                                {activeKind == 'double' && isFocused && (
                                    <span>Aggiungi alla formula</span>
                                )}
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
            <Separator orientation="vertical" />
        </>
    );
}