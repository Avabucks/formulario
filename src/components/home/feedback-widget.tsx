"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";

const FEEDBACK_POPUP_DISABLED_KEY = "feedback_popup_disabled";
const ACCOUNT_POPUP_KEY = "new-account-popup-closed";

const RATING_LABELS = ["Pessimo", "Scarso", "Nella media", "Buono", "Ottimo"];

export default function FeedbackWidget() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const popupDisabled =
      localStorage.getItem(FEEDBACK_POPUP_DISABLED_KEY) === "true";

    const accountPopupClosed =
      localStorage.getItem(ACCOUNT_POPUP_KEY) === "true";

    setVisible(true);

    if (!popupDisabled && accountPopupClosed) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, [open]);

  const disableAutomaticPopup = () => {
    localStorage.setItem(FEEDBACK_POPUP_DISABLED_KEY, "true");
    setOpen(false);
  };

  const submit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          testo: text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error ?? "Errore invio feedback", {
          position: "top-center",
        });

        return;
      }

      setSubmitted(true);
      localStorage.setItem(FEEDBACK_POPUP_DISABLED_KEY, "true");
    } catch {
      toast.error("Errore invio feedback", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const activeRating = hover ?? rating;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm transition hover:bg-muted"
      >
        <MessageCircle className="h-4 w-4" />
        Feedback
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Feedback</DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Grazie per il tuo feedback.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;

                    return (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() => setHover(value)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setRating(value)}
                        className="text-lg leading-none text-muted-foreground transition hover:text-foreground"
                      >
                        {value <= activeRating ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-muted-foreground">
                  {RATING_LABELS[activeRating - 1]}
                </div>
              </div>

              <Separator />

              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Descrivi la tua esperienza..."
                className="min-h-[90px] text-sm"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={disableAutomaticPopup}
                  className="text-xs text-muted-foreground transition hover:text-foreground hover:underline"
                >
                  Non mostrare più
                </button>

                <Button
                  size="sm"
                  onClick={submit}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}

                  <span className="ml-1">Invia</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
