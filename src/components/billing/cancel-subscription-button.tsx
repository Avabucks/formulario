"use client";

import { Button } from "@/src/components/ui/button";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelSubscription() {
    setLoading(true);

    try {
      const res = await fetch("/api/paddle/subscription/cancel", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error ?? "Errore durante la cancellazione dell'abbonamento",
        );
      }

      toast.success("Abbonamento cancellato.", {
        position: "bottom-center",
      });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante la cancellazione dell'abbonamento",
        { position: "bottom-center" },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={cancelSubscription}
      disabled={loading}
      className="w-full gap-2 sm:w-fit"
    >
      {loading ? <Spinner data-icon="inline-start" /> : <XCircle />}
      Togli abbonamento
    </Button>
  );
}
