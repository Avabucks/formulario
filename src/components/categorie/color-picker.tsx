"use client";

import { CATEGORIA_COLORI } from "@/src/lib/categorie";
import { cn } from "@/src/lib/utils";
import { Check, Pipette } from "lucide-react";

/** Preset swatches plus a native picker for a custom color */
export function ColorPicker({
  value,
  onChange,
}: Readonly<{
  value: string;
  onChange: (colore: string) => void;
}>) {
  const isCustom = !CATEGORIA_COLORI.some(
    (c) => c.toLowerCase() === value.toLowerCase(),
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CATEGORIA_COLORI.map((colore) => {
        const selected = colore.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={colore}
            type="button"
            aria-label={`Colore ${colore}`}
            aria-pressed={selected}
            onClick={() => onChange(colore)}
            className={cn(
              "flex size-6 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected && "ring-2 ring-foreground/60",
            )}
            style={{ backgroundColor: colore }}
          >
            {selected && <Check className="size-3.5 text-white" />}
          </button>
        );
      })}
      <label
        title="Colore personalizzato"
        className={cn(
          "relative flex size-6 cursor-pointer items-center justify-center rounded-full border ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring",
          isCustom && "ring-2 ring-foreground/60",
        )}
        style={isCustom ? { backgroundColor: value } : undefined}
      >
        <Pipette
          className={cn(
            "size-3.5",
            isCustom ? "text-white" : "text-muted-foreground",
          )}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
