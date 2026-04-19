"use client";

import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Spinner } from "@/src/components/ui/spinner";
import { Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { editor } from "monaco-editor";
import { toast } from "sonner";
import { ScrollArea } from "@/src/components/ui/scroll-area";

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
                toast.error(data.error ?? `${res.status}`, { position: "bottom-center" });
                return;
            }

            setResult(data.text);
        } catch (error: any) {
            console.error(error.message)
            toast.error("Impossibile contattare il server. Riprova più tardi.", { position: "bottom-center" });
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
        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (v) { setOpen(true); } else { handleClose(); } }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles size={16} />
                    Genera con AI
                </Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles size={18} className="text-primary" />
                        Genera con AI
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Descrivi cosa vuoi generare
                        </span>
                        <div className="relative">
                            <Textarea
                                placeholder="Es: Scrivi una descrizione dettagliata di..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={loading}
                                className="text-sm leading-relaxed pr-12 max-h-40 overflow-y-auto"
                                style={{ scrollbarWidth: 'none' }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                                }}
                            />
                            <Button
                                size="icon"
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim()}
                                className="absolute bottom-2 right-2 size-8"
                            >
                                {loading ? <Spinner /> : <Sparkles size={14} />}
                            </Button>
                        </div>
                        <span className="text-xs text-muted-foreground self-end">
                            Premi Ctrl+Enter per generare
                        </span>
                    </div>

                    {loading && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed bg-muted/30">
                            <Spinner />
                            <p className="text-sm text-muted-foreground">
                                L'AI sta elaborando la risposta...
                            </p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="flex flex-col gap-2 over">
                            <span className="text-sm font-medium text-muted-foreground">
                                Anteprima risposta
                            </span>
                            <ScrollArea className="relative rounded-xl border bg-muted/20 shadow-inner max-h-72">
                                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    <div className="absolute top-2 right-2">
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            AI
                                        </span>
                                    </div>
                                    {result}
                                </div>
                            </ScrollArea>
                        </div>
                    )}                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={handleClose} className="gap-2">
                        <X size={16} />
                        Annulla
                    </Button>
                    <Button onClick={handleAccept} disabled={!result || loading} className="gap-2">
                        <Check size={16} />
                        Accetta e inserisci
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}