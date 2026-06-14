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
import { Plus, Sparkles } from "lucide-react";
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

  useEffect(() => {
    if (!open) {
      setTemplate("empty");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "A" && (e.metaKey || e.ctrlKey) && e.shiftKey && allowKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, allowKey]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    toast.promise(
      fetch("/api/formulari/create", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        (globalThis as unknown as { umami?: any }).umami?.track(
          "created_formulario",
        );
        const analytics = await loadAnalytics()
        if (analytics) {
          logEvent(analytics, 'generate_lead', {
            method: 'created_formulario',
          })
          console.log('Evento generate_lead tracciato con successo!')
        }
        router.refresh();
      }),
      {
        loading: "Creazione in corso...",
        success: "Formulario creato con successo!",
        error: "Errore durante la creazione del formulario.",
        position: "bottom-center",
      },
    );

    setOpen(false);
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
                      : "border-border bg-background hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                      template === "empty"
                        ? "bg-brand-purple/20 text-brand-purple"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <Plus size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-sm">Parti da vuoto</span>
                      <span className="text-xs text-muted-foreground/80">Inizia con un formulario vuoto e aggiungi formule a mano</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-200 ${
                    template === "empty"
                      ? "border-brand-purple"
                      : "border-muted-foreground/30"
                  }`}>
                    {template === "empty" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                    )}
                  </div>
                </div>

                <div
                  onClick={() => {
                    toast.info("La generazione automatica con AI sarà disponibile a breve!", {
                      position: "bottom-center",
                    });
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl border-2 border-border bg-background/50 opacity-60 cursor-not-allowed transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center p-2 rounded-lg bg-muted text-muted-foreground">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-muted-foreground">Genera con AI</span>
                        <span className="inline-flex items-center rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple border border-brand-purple/30 uppercase tracking-wider">
                          Premium
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/80">Genera automaticamente il formulario caricando i tuoi file</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-muted-foreground/20">
                    {/* Unchecked */}
                  </div>
                </div>
              </div>
            </Field>
            <Field>
              <Label htmlFor="titolo-1">Titolo del formulario</Label>
              <Input
                id="titolo-1"
                name="titolo"
                placeholder="Titolo del formulario"
                maxLength={30}
                required
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
