"use client";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Field, FieldGroup } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Plus, Sparkles, Heart, Upload, X, File, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Kbd, KbdGroup } from "../ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { loadAnalytics } from "@/src/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function ForumlarioAdd({
  allowKey = true,
  showLabel = false,
}: Readonly<{ allowKey?: boolean; showLabel?: boolean }>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<"empty" | "ai">("empty");
  const [likedAi, setLikedAi] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      setTemplate("empty");
      setFiles([]);
    }
  }, [open]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLikedAi(localStorage.getItem("like_ai_generating") === "true");
    }
  }, []);

  const handleLikeAi = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedAi) return;

    setLikedAi(true);
    localStorage.setItem("like_ai_generating", "true");

    toast.success(
      "Grazie! Abbiamo registrato il tuo interesse per la generazione con AI. ❤️",
      {
        position: "bottom-center",
      },
    );

    try {
      const analytics = await loadAnalytics();
      if (analytics) {
        logEvent(analytics, "like_ai_generating");
        console.log("Evento like_ai_generating tracciato con successo!");
      }
    } catch (error) {
      console.error("Errore nel tracciamento dell'evento:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "a" &&
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        allowKey
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, allowKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 5) {
      toast.error("Puoi selezionare al massimo 5 file.");
      return;
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    const validNewFiles: File[] = [];
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Il file "${file.name}" supera il limite di 20MB.`);
        continue;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(
          `Formato non supportato per "${file.name}". Carica solo PDF, immagini o file di testo.`,
        );
        continue;
      }
      validNewFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validNewFiles]);
    e.target.value = ""; // Reset input
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const url = template === "ai" ? "/api/formulari/create-ai" : "/api/formulari/create";
    const formData = new FormData();

    if (template === "ai") {
      if (files.length === 0) {
        toast.error("Seleziona almeno un file per generare il formulario.");
        return;
      }
      for (const file of files) {
        formData.append("files", file);
      }
    } else {
      const currentForm = e.currentTarget;
      const t = (currentForm.elements.namedItem("titolo") as HTMLInputElement)?.value;
      const d = (currentForm.elements.namedItem("descrizione") as HTMLTextAreaElement)?.value;
      if (!t) {
        toast.error("Il titolo è obbligatorio.");
        return;
      }
      formData.append("titolo", t);
      formData.append("descrizione", d || "");
    }

    setOpen(false);

    toast.promise(
      fetch(url, {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Errore durante la creazione.");
        }
        (globalThis as unknown as { umami?: any }).umami?.track(
          template === "ai" ? "created_formulario_ai" : "created_formulario",
        );
        try {
          const analytics = await loadAnalytics();
          if (analytics) {
            logEvent(
              analytics,
              template === "ai" ? "created_formulario_ai" : "created_formulario",
            );
          }
        } catch (error) {
          console.error("Errore nel tracciamento dell'evento:", error);
        }
        router.refresh();
        if (data.formulario_id) {
          router.push(`/formulario/${data.formulario_id}`);
        }
      }),
      {
        loading:
          template === "ai"
            ? "L'AI sta analizzando i file e dividendo il formulario in capitoli e argomenti (richiede circa 30-60s)..."
            : "Creazione in corso...",
        success: "Formulario creato con successo!",
        error: (err: any) => err.message || "Errore durante la creazione del formulario.",
        position: "bottom-center",
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus size={16} />
                <div className={`${!showLabel && "hidden md:flex"}`}>
                  Aggiungi formulario
                </div>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent className="pr-1.5">
            <div className="flex items-center gap-2">
              Aggiungi formulario
              {allowKey && (
                <KbdGroup className="hidden md:flex">
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                  <span>+</span>
                  <Kbd>A</Kbd>
                </KbdGroup>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Aggiungi un formulario</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label>Come vuoi iniziare?</Label>
              <div className="flex flex-col gap-3 w-full mt-1.5">
                <div
                  onClick={() => setTemplate("empty")}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    template === "empty"
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-border bg-transparent hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                        template === "empty"
                          ? "bg-brand-purple/20 text-brand-purple"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Plus size={18} />
                    </div>
                    <div className="flex flex-col text-left">
<<<<<<< HEAD
                      <span className="font-semibold text-sm">Parti da vuoto</span>
=======
                      <span className="font-semibold text-sm">
                        Parti da vuoto
                      </span>
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
                      <span className="text-xs text-muted-foreground/80">
                        Inizia con un formulario vuoto e aggiungi formule a mano
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-200 ${
<<<<<<< HEAD
                      template === "empty" ? "border-brand-purple" : "border-muted-foreground/30"
=======
                      template === "empty"
                        ? "border-brand-purple"
                        : "border-muted-foreground/30"
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
                    }`}
                  >
                    {template === "empty" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                    )}
                  </div>
                </div>

<<<<<<< HEAD
                <AiTemplateCardActive isSelected={template === "ai"} onSelect={() => setTemplate("ai")} />
=======
                <AiTemplateCardFeedback
                  likedAi={likedAi}
                  onLike={handleLikeAi}
                />
                {/* Quando implementerai la feature, usa questa riga al posto di quella sopra: */}
                {/* <AiTemplateCardActive isSelected={template === "ai"} onSelect={() => setTemplate("ai")} /> */}
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
              </div>
            </Field>

            {template === "ai" ? (
              <Field>
                <Label>Carica i tuoi file</Label>
                <div className="mt-1.5 flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 hover:border-brand-purple hover:bg-brand-purple/5 rounded-xl cursor-pointer transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground/80 mb-2" />
                      <p className="text-sm font-semibold text-foreground/90">
                        Clicca per caricare i file
                      </p>
                      <p className="text-xs text-muted-foreground/75 mt-1">
                        PDF, PNG, JPG, WEBP, TXT, MD (Max 20MB ciascuno)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                      onChange={handleFileChange}
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-1.5 border rounded-lg bg-muted/10">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-md bg-background border text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <File className="h-4 w-4 text-brand-purple flex-shrink-0" />
                            <span className="truncate font-medium">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Limiti di input:</span> Massimo 5 file, limite totale di 20MB e circa 150.000 token. I testi e le formule verranno estratti automaticamente.
                    </div>
                  </div>
                </div>
              </Field>
            ) : (
              <>
                <Field>
                  <Label htmlFor="titolo-1">Titolo del formulario</Label>
                  <Input
                    id="titolo-1"
                    name="titolo"
                    placeholder="Titolo del formulario"
                    maxLength={30}
                    required={template === "empty"}
                  />
                </Field>
                <Field>
                  <Label htmlFor="descrizione-1">Descrizione del formulario</Label>
                  <Textarea
                    id="descrizione-1"
                    name="descrizione"
                    placeholder="Descrivi il formulario"
                  />
                </Field>
              </>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Chiudi</Button>
            </DialogClose>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
export function AiTemplateCardFeedback({
  likedAi,
  onLike,
}: {
  likedAi: boolean;
  onLike: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={() => {
        toast.info(
          "La generazione automatica con AI sarà disponibile a breve!",
          {
            position: "bottom-center",
          },
        );
      }}
      className="flex gap-2 items-center justify-between p-3.5 rounded-xl border border-dashed border-border bg-muted/10 dark:bg-muted/5 transition-all duration-200 cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2 rounded-lg bg-muted/80 text-muted-foreground/80">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-muted-foreground/80">
              Genera con AI
            </span>
            <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple border border-brand-purple/30 uppercase tracking-wider">
              Premium
            </span>
          </div>
          <span className="text-xs text-muted-foreground/60">
            Genera automaticamente il formulario caricando i tuoi file
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 active:scale-95 ${
            likedAi
              ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple cursor-default"
              : "border-border bg-transparent hover:text-brand-purple hover:border-brand-purple/30 hover:bg-brand-purple/10 cursor-pointer"
          }`}
          disabled={likedAi}
        >
          <Heart size={13} className={likedAi ? "fill-current" : ""} />
          <span className="text-nowrap">
            {likedAi ? "Votato" : "Ti piace?"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function AiTemplateCardActive({
  isSelected,
  onSelect,
}: {
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected ? "border-brand-purple bg-brand-purple/10" : "border-border bg-transparent hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
<<<<<<< HEAD
            isSelected ? "bg-brand-purple/20 text-brand-purple" : "bg-muted text-muted-foreground"
=======
            isSelected
              ? "bg-brand-purple/20 text-brand-purple"
              : "bg-muted text-muted-foreground"
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
          }`}
        >
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Genera con AI</span>
            <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple border border-brand-purple/30 uppercase tracking-wider">
              Premium
            </span>
          </div>
          <span className="text-xs text-muted-foreground/80">
            Genera automaticamente il formulario caricando i tuoi file
          </span>
        </div>
      </div>
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-200 ${
          isSelected ? "border-brand-purple" : "border-muted-foreground/30"
        }`}
      >
<<<<<<< HEAD
        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />}
=======
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
        )}
>>>>>>> 19ab209e1d1e04e50f47d16839945dfeb3b8c189
      </div>
    </div>
  );
}
