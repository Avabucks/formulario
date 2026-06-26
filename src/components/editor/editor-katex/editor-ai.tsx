"use client";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Spinner } from "@/src/components/ui/spinner";
import { Textarea } from "@/src/components/ui/textarea";
import { loadAnalytics } from "@/src/lib/firebase";
import { DiffEditor } from "@monaco-editor/react";
import { logEvent } from "firebase/analytics";
import { Check, Sparkles, X, ArrowUp, Trash2, User, Bot, Maximize2, Minimize2, GitCompare } from "lucide-react";
import type { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const loadingMessages = [
  "Elaborazione in corso...",
  "Generando formule LaTeX...",
  "Ottimizzando il contenuto...",
];

type Message = {
  id: string;
  sender: "user" | "ai";
  text?: string;
  status?: "loading" | "error" | "success";
  originalContent?: string;
  suggestedContent?: string;
  applied?: boolean;
  discarded?: boolean;
};

export function EditorAI({
  editorRef,
  onClose,
  isExpanded = false,
  onToggleExpand,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}>) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Ciao! Sono il tuo assistente per la scrittura dei formulari. Chiedimi pure di aggiungere formule LaTeX, organizzare sezioni o formattare il testo. Ti mostrerò le modifiche nel diff editor e potrai applicarle direttamente.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);

    const userMessageId = Math.random().toString();
    const aiMessageId = Math.random().toString();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: "user", text: userPrompt },
      { id: aiMessageId, sender: "ai", status: "loading" },
    ]);

    const currentContext = editorRef.current?.getValue() ?? "";

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          context: currentContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                ...msg,
                status: "error",
                text: data.error ?? "Si è verificato un errore durante l'elaborazione.",
              }
              : msg
          )
        );
        return;
      }

      (globalThis as unknown as { umami?: any }).umami?.track("generated_ai");
      try {
        const analytics = await loadAnalytics();
        if (analytics) {
          logEvent(analytics, "generated_ai");
        }
      } catch (error) {
        console.error("Errore tracciamento:", error);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
              ...msg,
              status: "success",
              originalContent: currentContext,
              suggestedContent: data.text,
            }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
              ...msg,
              status: "error",
              text: "Errore di rete. Controlla la tua connessione.",
            }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (msgId: string, suggestedContent: string) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const range = {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: model.getLineCount(),
      endColumn: model.getLineMaxColumn(model.getLineCount()),
    };

    model.pushEditOperations([], [{ range, text: suggestedContent }], () => null);
    editor.focus();

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, applied: true } : msg
      )
    );
    toast.success("Modifiche inserite con successo!");
  };

  const handleDiscard = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, discarded: true } : msg
      )
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Chat resettata. Chiedimi pure qualsiasi cosa per modificare il testo.",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border text-sm">

      {/* Header (Shadcn style - strict monochrome) */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Chiudi chat"
            >
              <X size={15} />
            </Button>
          )}
          {onToggleExpand && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleExpand}
              className="size-7 text-muted-foreground hover:text-foreground hidden md:flex"
              title={isExpanded ? "Riduci larghezza chat" : "Allarga larghezza chat"}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          )}
          <Sparkles size={14} className="text-foreground/80" />
          <span className="font-semibold text-foreground">Genera con l'AI</span>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Svuota chat"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      {/* Messages area (Shadcn style - borderless minimalist list) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 items-start">

            {/* Avatar / Icon */}
            <div className={`size-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold select-none border ${
              msg.sender === "user" 
                ? "bg-muted border-border text-muted-foreground" 
                : "bg-primary border-primary text-primary-foreground"
            }`}>
              {msg.sender === "user" ? (
                <User size={13.5} className="text-muted-foreground" />
              ) : (
                <Bot size={13.5} />
              )}
            </div>

            {/* Content box */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">

              {/* Message Header */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-foreground">
                  {msg.sender === "user" ? "Tu" : "AI"}
                </span>
              </div>

              {/* Message text */}
              {msg.text && (
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>
              )}

              {/* AI Generation State: Loading */}
              {msg.status === "loading" && (
                <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground select-none">
                  <div className="flex space-x-1 items-center h-2 mr-1">
                    <div className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{loadingText}</span>
                </div>
              )}

              {/* AI Generation State: Error */}
              {msg.status === "error" && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2 mt-1">
                  {msg.text}
                </div>
              )}

              {/* AI Generation State: Suggestion with Diff Editor */}
              {msg.status === "success" && (
                <div className="flex flex-col gap-2.5 mt-2 w-full max-w-full">
                  {!msg.applied && !msg.discarded ? (
                    <div className="flex flex-col gap-2">
                      <div className="border border-border rounded-lg overflow-hidden bg-background flex flex-col">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-medium select-none">
                          <span className="flex items-center gap-1">
                            <GitCompare size={11} className="text-muted-foreground" />
                            Anteprima differenze
                          </span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Confronto a schermo intero"
                              >
                                <Maximize2 size={11} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base">
                                  <GitCompare size={16} className="text-foreground/80" />
                                  Confronto modifiche
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex-1 min-h-0 border rounded-lg overflow-hidden mt-2 bg-background">
                                <DiffEditor
                                  height="100%"
                                  original={msg.originalContent ?? ""}
                                  modified={msg.suggestedContent ?? ""}
                                  language="markdown-math"
                                  theme="markdown-math-theme"
                                  options={{
                                    lineNumbers: "on",
                                    links: false,
                                    minimap: { enabled: true },
                                    automaticLayout: true,
                                    wordWrap: "on",
                                    quickSuggestions: false,
                                    readOnly: true,
                                  }}
                                />
                              </div>
                              <DialogFooter className="gap-2 mt-4 shrink-0">
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 text-xs px-3 gap-1 cursor-pointer"
                                    onClick={() => handleDiscard(msg.id)}
                                  >
                                    <X size={13} />
                                    Scarta
                                  </Button>
                                </DialogTrigger>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 text-xs px-3 gap-1 cursor-pointer"
                                    onClick={() => handleAccept(msg.id, msg.suggestedContent ?? "")}
                                  >
                                    <Check size={13} />
                                    Applica modifiche
                                  </Button>
                                </DialogTrigger>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className={`w-full min-w-0 transition-all duration-300 ${isExpanded ? "h-96" : "h-56"}`}>
                          <DiffEditor
                            height="100%"
                            original={msg.originalContent ?? ""}
                            modified={msg.suggestedContent ?? ""}
                            language="markdown-math"
                            theme="markdown-math-theme"
                            options={{
                              lineNumbers: "off",
                              links: false,
                              minimap: { enabled: false },
                              automaticLayout: true,
                              wordWrap: "on",
                              quickSuggestions: false,
                              readOnly: true,
                              scrollbar: {
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                                }
                              }}
                            />
                          </div>
                        </div>

                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1 cursor-pointer"
                          onClick={() => handleDiscard(msg.id)}
                        >
                          <X size={12} />
                          Scarta
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1 cursor-pointer"
                          onClick={() => handleAccept(msg.id, msg.suggestedContent ?? "")}
                        >
                          <Check size={12} />
                          Applica modifiche
                        </Button>
                      </div>

                    </div>
                  ) : msg.applied ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-foreground bg-muted border border-border rounded-md py-1 px-2 w-fit">
                      <Check size={12} /> Modifiche applicate con successo.
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic py-0.5">
                      Suggerimento scartato.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box (Shadcn style border container with inner textarea and suggestion badges) */}
      <div className="p-3 border-t bg-background flex flex-col gap-2">
        {/* Suggestion Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 select-none">
          <button
            type="button"
            onClick={() => setPrompt("Formatta in LaTeX le formule presenti in questo argomento")}
            className="px-2.5 py-1 rounded-md border border-border bg-muted/40 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0 font-medium cursor-pointer"
          >
            Formatta in LaTeX
          </button>
          <button
            type="button"
            onClick={() => setPrompt("Correggi errori di battitura, grammatica e formattazione")}
            className="px-2.5 py-1 rounded-md border border-border bg-muted/40 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0 font-medium cursor-pointer"
          >
            Correggi testo
          </button>
          <button
            type="button"
            onClick={() => setPrompt("Aggiungi spiegazioni teoriche dettagliate ed esempi pratici")}
            className="px-2.5 py-1 rounded-md border border-border bg-muted/40 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0 font-medium cursor-pointer"
          >
            Espandi teoria
          </button>
        </div>

        <div className="flex flex-col border border-input rounded-xl bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all p-1.5 shadow-xs relative">
          <Textarea
            placeholder="Scrivi le modifiche che desideri apportare..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 min-h-[48px] max-h-28 resize-none px-2.5 py-1.5 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm placeholder:text-muted-foreground/60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex justify-between items-center px-1.5 pb-0.5 pt-1 text-[11px] text-muted-foreground/50 select-none">
            <span>Usa Shift+Invio per andare a capo</span>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={loading || !prompt.trim()}
              className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
            >
              {loading ? (
                <Spinner className="size-3" />
              ) : (
                <ArrowUp size={14} className="stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/45 select-none">
          L'AI può generare risposte imprecise. Verifica prima di applicare.
        </p>
      </div>

    </div>
  );
}
