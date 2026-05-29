"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdsenseBannerProps = {
  slot?: string;
  className?: string;
  format?: "auto" | "fluid" | "horizontal" | "rectangle";
  minHeight?: string;
};

export function AdsenseBanner({
  slot,
  className,
  format = "auto",
  minHeight = "5.5rem",
}: Readonly<AdsenseBannerProps>) {
  const hasPushed = useRef(false);
  const [isClosed, setIsClosed] = useState(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!client || !slot || hasPushed.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      hasPushed.current = true;
    } catch {
      hasPushed.current = false;
    }
  }, [client, slot]);

  if (!client || !slot) {
    return null;
  }

  if (isClosed) {
    return null;
  }

  return (
    <aside
      aria-label="Pubblicita"
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-dashed bg-muted/20 px-2 py-2 pr-10",
        className,
      )}
      style={{ minHeight, width: "100%" }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Chiudi banner pubblicitario"
        className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
        onClick={() => setIsClosed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight, width: "100%" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(isProduction ? {} : { "data-adtest": "on" })}
      />
    </aside>
  );
}
