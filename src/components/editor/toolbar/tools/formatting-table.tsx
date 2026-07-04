"use client";

import { Button } from "@/src/components/ui/button";
import { CommandDialog } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Toggle } from "@/src/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Minus,
  Plus,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useState } from "react";

type TableAlignment = "default" | "left" | "center" | "right";

export function FormattingTable({
  editorRef,
  isFocused = false,
  onlyDialog = false,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused?: boolean;
  onlyDialog?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const [align, setAlign] = useState<TableAlignment>("default");

  const buildTable = (
    rows: number,
    cols: number,
    withHeader: boolean,
    alignment: TableAlignment
  ) => {
    let t = 1;

    const headerRow =
      "| " +
      Array.from({ length: cols }, () => `\${${t++}}`).join(" | ") +
      " |";

    let alignCell = "---";
    if (alignment === "left") alignCell = ":---";
    else if (alignment === "center") alignCell = ":---:";
    else if (alignment === "right") alignCell = "---:";

    const separator = "| " + new Array(cols).fill(alignCell).join(" | ") + " |";
    const bodyRows = Array.from(
      { length: rows },
      (_, ri) =>
        "| " +
        Array.from({ length: cols }, (_, ci) => `\${${t++}}`).join(" | ") +
        " |",
    );

    const lines = withHeader ? [headerRow, separator, ...bodyRows] : bodyRows;

    return lines.join("\n") + `\n\n$${t}`;
  };

  const insertTable = (
    targetRows: number,
    targetCols: number,
    useHeader: boolean,
    targetAlign: TableAlignment
  ) => {
    const editor = editorRef.current;
    if (!editor) return;

    const controller = editor.getContribution("snippetController2") as {
      insert: (text: string) => void;
    } | null;
    if (!controller) return;

    const position = editor.getPosition();
    const lineNumber = position?.lineNumber ?? 1;
    const column = position?.column ?? 1;
    const currentLine = editor.getModel()?.getLineContent(lineNumber) ?? "";
    const isEmptyLine = currentLine.trim() === "";
    const isAtLineStart = column === 1;

    const table = buildTable(targetRows, targetCols, useHeader, targetAlign);
    const prefix = isAtLineStart && isEmptyLine ? "" : "\n\n";
    controller.insert(`${prefix}${table}`);
    setOpen(false);
    setTimeout(() => editor.focus(), 0);
  };

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };
    window.addEventListener("editor:open-table", handleOpen);
    return () => {
      window.removeEventListener("editor:open-table", handleOpen);
    };
  }, []);

  const dialog = (
    <CommandDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(() => editorRef.current?.focus(), 0);
      }}
      className="max-w-[280px]"
    >
      <div
        className="flex flex-col gap-4 p-4 outline-hidden"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            insertTable(rows, cols, withHeader, align);
          }
        }}
      >
        <p className="text-sm font-semibold">Inserisci tabella</p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3 items-center">
          <Label className="text-xs text-muted-foreground">Righe</Label>
          <NumberStepper value={rows} onChange={setRows} min={1} max={20} />

          <Label className="text-xs text-muted-foreground">Colonne</Label>
          <NumberStepper value={cols} onChange={setCols} min={1} max={10} />

          <Label className="text-xs text-muted-foreground">Allineamento</Label>
          <div className="flex items-center gap-1 justify-end">
            {[
              { value: "default", label: "Default", icon: AlignJustify },
              { value: "left", label: "Sinistra", icon: AlignLeft },
              { value: "center", label: "Centro", icon: AlignCenter },
              { value: "right", label: "Destra", icon: AlignRight },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = align === item.value;
              return (
                <TooltipProvider key={item.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        size="sm"
                        variant="outline"
                        pressed={isSelected}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setAlign(item.value as TableAlignment)}
                        className={`h-7 w-7 p-0 ${
                          isSelected ? "bg-muted text-foreground" : ""
                        }`}
                      >
                        <Icon size={12} />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">{item.label}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label
            htmlFor="with-header"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Intestazione
          </Label>
          <Switch
            id="with-header"
            checked={withHeader}
            onCheckedChange={setWithHeader}
          />
        </div>

        <Button
          size="sm"
          onClick={() => insertTable(rows, cols, withHeader, align)}
          className="w-full"
        >
          Inserisci
        </Button>
      </div>
    </CommandDialog>
  );

  if (onlyDialog) {
    return dialog;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              variant="outline"
              onMouseDown={(e) => e.preventDefault()}
              aria-label="Tabella"
              pressed={open}
              disabled={!isFocused}
              onClick={() => setOpen((v) => !v)}
            >
              <Table size={16} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className="pr-1.5">
            <div className="flex items-center gap-2">
              Tabella
              <KbdGroup className="hidden md:flex">
                <Kbd>Alt</Kbd>
                <span>+</span>
                <Kbd>T</Kbd>
              </KbdGroup>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {dialog}
    </>
  );
}

function NumberStepper({
  value,
  onChange,
  min,
  max,
}: Readonly<{
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}>) {
  return (
    <div className="flex items-center gap-1 justify-end">
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
