"use client";

import { Button } from "@/src/components/ui/button";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Label } from "@/src/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Switch } from "@/src/components/ui/switch";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { checkActiveLatexOrCode, getCodeInlineRegex, getIsActiveLatex, getIsActiveWord } from "@/src/lib/editor/formatting-utils";
import { Minus, Plus, Table } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useState } from "react";

export function FormattingTable({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [withHeader, setWithHeader] = useState(true);

    const buildTable = (rows: number, cols: number, withHeader: boolean) => {
        // tabstop globale che sale
        let t = 1;

        const headerRow = '| ' + Array.from({ length: cols }, () => `\${${t++}}`).join(' | ') + ' |';
        const separator = '| ' + new Array(cols).fill('---').join(' | ') + ' |';
        const bodyRows = Array.from({ length: rows }, (_, ri) =>
            '| ' + Array.from({ length: cols }, (_, ci) => `\${${t++}}`).join(' | ') + ' |'
        );

        const lines = withHeader
            ? [headerRow, separator, ...bodyRows]
            : bodyRows;

        return lines.join('\n') + `\n\n$${t}`;
    };

    const handleInsert = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const controller = editor.getContribution('snippetController2') as any;
        if (!controller) return;

        const position = editor.getPosition();
        const lineNumber = position?.lineNumber ?? 1;
        const column = position?.column ?? 1;
        const currentLine = editor.getModel()?.getLineContent(lineNumber) ?? '';
        const isEmptyLine = currentLine.trim() === '';
        const isAtLineStart = column === 1;

        const table = buildTable(rows, cols, withHeader);
        const prefix = (isAtLineStart && isEmptyLine) ? '' : '\n\n';
        controller.insert(`${prefix}${table}`);
        setOpen(false);
        setTimeout(() => editor.focus(), 0);
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const disposable = editor.onKeyDown((e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.browserEvent.key === ";" && isFocused) {
                e.preventDefault();
                e.stopPropagation();
                if (!open) setOpen(true);
            }
        });
        return () => disposable.dispose();
    }, [isFocused, editorRef.current]);

    if ((checkActiveLatexOrCode(editorRef) || getIsActiveLatex(editorRef) || getIsActiveWord(editorRef, getCodeInlineRegex)) && isFocused) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Toggle
                                variant="outline"
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label="Tabella"
                                pressed={open}
                                disabled={!isFocused}
                            >
                                <Table size={16} />
                            </Toggle>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="pr-1.5">
                        <div className="flex items-center gap-2">
                            Tabella
                            <KbdGroup className="hidden md:flex">
                                <Kbd>Ctrl</Kbd>
                                <span>+</span>
                                <Kbd>Shift</Kbd>
                                <span>+</span>
                                <Kbd>;</Kbd>
                            </KbdGroup>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <PopoverContent
                className="w-52"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-semibold">Inserisci tabella</p>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 items-center">
                        <Label className="text-xs text-muted-foreground">Righe</Label>
                        <NumberStepper value={rows} onChange={setRows} min={1} max={20} />
                        <Label className="text-xs text-muted-foreground">Colonne</Label>
                        <NumberStepper value={cols} onChange={setCols} min={1} max={10} />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="with-header" className="text-xs text-muted-foreground cursor-pointer">
                            Intestazione
                        </Label>
                        <span onMouseDown={(e) => e.preventDefault()}>
                            <Switch
                                id="with-header"
                                checked={withHeader}
                                onCheckedChange={setWithHeader}
                            />
                        </span>
                    </div>

                    <Button size="sm" onClick={handleInsert}>
                        Inserisci
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function NumberStepper({ value, onChange, min, max }: Readonly<{ value: number; onChange: (v: number) => void; min: number; max: number }>) {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(Math.max(min, value - 1))}
            >
                <Minus size={12} />
            </Button>
            <span className="w-6 text-center text-sm tabular-nums">{value}</span>
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(Math.min(max, value + 1))}
            >
                <Plus size={12} />
            </Button>
        </div>
    );
}