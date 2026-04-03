"use client";

import { useEffect, useRef, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { EditorInput } from "./editor-katex/editor-input";
import { EditorPreview } from "./editor-katex/editor-preview";
import { EditorToolbar } from "./editor-katex/editor-toolbar";

type Argomento = {
    id: string;
    content: string;
    editable: boolean;
}

interface Selection {
    start: number;
    end: number;
    text: string;
}

interface Snapshot {
    value: string;
    cursor: number;
}

export function EditorPage({ argomento }: Readonly<{ argomento: Argomento }>) {
    const [value, setValue] = useState(argomento.content);
    const [switchView, setSwitchView] = useState<boolean>(false);
    const [enableToolbar, setEnableToolbar] = useState<boolean>(false);
    const [resizableSize, setResizableSize] = useState<number>(50);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [history, setHistory] = useState<Snapshot[]>([]);
    const [future, setFuture] = useState<Snapshot[]>([]);

    const pendingCursorRef = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const committedValueRef = useRef(value);
    const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Frozen copy of the last non-null selection — toolbar tools read this
    // so they still have a valid position even after the textarea loses focus.
    const lastSelectionRef = useRef<Selection | null>(null);

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const sel = { start, end, text: value.slice(start, end) };
        setSelection(sel);
        lastSelectionRef.current = sel;
    };

    const handleApply = (newContent: string, cursorPos?: number) => {
        const cursor = textareaRef.current?.selectionStart ?? lastSelectionRef.current?.start ?? 0;
        setHistory((prev) => {
            if (prev.at(-1)?.value === value) return prev;
            return [...prev, { value, cursor }];
        });
        setFuture([]);
        setValue(newContent);
        committedValueRef.current = newContent;
        if (historyDebounceRef.current) {
            clearTimeout(historyDebounceRef.current);
            historyDebounceRef.current = null;
        }
        pendingCursorRef.current = cursorPos ?? cursor;
    };

    // Restore focus + cursor after every apply.
    useEffect(() => {
        if (pendingCursorRef.current === null) return;
        const pos = pendingCursorRef.current;
        pendingCursorRef.current = null;
        const ta = textareaRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(pos, pos);
    }, [value]);

    const handleWrite = (newContent: string) => {
        setFuture([]);
        setValue(newContent);

        if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = setTimeout(() => {
            const snapshot = committedValueRef.current;
            const cursor = textareaRef.current?.selectionStart ?? 0;
            setHistory((prev) => {
                if (prev.at(-1)?.value === snapshot) return prev;
                return [...prev, { value: snapshot, cursor }];
            });
            committedValueRef.current = newContent;
        }, 800);
    };

    const handleUndo = () => {
        const prev = history.at(-1);
        if (!prev) return;
        const cursor = textareaRef.current?.selectionStart ?? 0;
        setHistory((h) => h.slice(0, -1));
        setFuture((f) => [{ value, cursor }, ...f]);
        setValue(prev.value);
        committedValueRef.current = prev.value;
        pendingCursorRef.current = prev.cursor;
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        const cursor = textareaRef.current?.selectionStart ?? 0;
        setFuture((f) => f.slice(1));
        setHistory((h) => [...h, { value, cursor }]);
        setValue(next.value);
        committedValueRef.current = next.value;
        pendingCursorRef.current = next.cursor;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleUndo();
            }
            if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleRedo();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleUndo, handleRedo]);

    const toolbar = (
        <EditorToolbar
            switchView={switchView}
            setSwitchView={setSwitchView}
            editable={argomento.editable}
            markdownContent={value}
            selection={lastSelectionRef.current}
            onApply={handleApply}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            enableToolbar={enableToolbar}
        />
    );

    const preview = <EditorPreview value={value} />;
    const input = argomento.editable && (
        <EditorInput
            argomentoId={argomento.id}
            value={value}
            setValue={handleWrite}
            onSelect={handleSelect}
            setEnableToolbar={setEnableToolbar}
            textareaRef={textareaRef}
        />
    );

    return (
        <div className="flex flex-1 flex-col min-h-0 border rounded-lg overflow-hidden">
            {argomento.editable && toolbar}

            {/* Desktop */}
            <div className="hidden md:flex flex-1 min-h-0">
                <ResizablePanelGroup
                    onLayoutChanged={(sizes) => { if (sizes.input) setResizableSize(sizes.input) }}
                    orientation="horizontal"
                >
                    {(argomento.editable && !switchView) && (
                        <>
                            <ResizablePanel id="input" collapsedSize={resizableSize} minSize="20%" defaultSize="50%">{input}</ResizablePanel>
                            <ResizableHandle className="focus-visible:ring-0" withHandle />
                        </>
                    )}
                    <ResizablePanel id="preview" collapsedSize={100 - resizableSize} minSize="20%" defaultSize="50%">{preview}</ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex-1 min-h-0 overflow-auto">
                {switchView ? input : preview}
            </div>
        </div>
    );
}