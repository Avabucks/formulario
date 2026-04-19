"use client";

import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Spinner } from "@/src/components/ui/spinner";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { editor } from "monaco-editor";
import { toast } from "sonner";

export function GeminiButton({
    editorRef,
}: Readonly<{
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}>) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Errore durante la generazione", {
                    description: data.error ?? `Errore ${res.status}`,
                });
                return;
            }

            setResult(data.text);
        } catch (error) {
            toast.error("Errore di rete", {
                description: "Impossibile contattare il server. Riprova più tardi.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        if (!result || !editorRef.current) return;
        const editor = editorRef.current;
        const model = editor.getModel();
        if (!model) return;

        const sel = editor.getSelection();
        const range = sel ?? {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
        };

        model.pushEditOperations(
            [],
            [{ range, text: result }],
            () => null,
        );
        editor.focus();
        toast.success("Contenuto inserito nell'editor");
        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
        setPrompt("");
        setResult(null);
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles size={16} />
                    Genera con AI
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Genera con AI</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <Textarea
                        placeholder="Descrivi cosa vuoi generare..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                        }}
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="self-end"
                    >
                        {loading ? <Spinner /> : <Sparkles size={16} />}
                        {loading ? "Generazione..." : "Genera"}
                    </Button>

                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Spinner />
                        </div>
                    )}

                    {result && !loading && (
                        <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {result}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Annulla
                    </Button>
                    <Button onClick={handleAccept} disabled={!result || loading}>
                        <Sparkles size={16} />
                        Accetta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}