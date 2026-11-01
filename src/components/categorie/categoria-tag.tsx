import { cn } from "@/src/lib/utils";
import { Hash } from "lucide-react";

/**
 * Category shown as "# nome": the hash icon is faded, the name full color.
 * The "pill" variant adds a soft tinted background in the category color.
 */
export function CategoriaTag({
  nome,
  colore,
  variant = "plain",
  className,
}: Readonly<{
  nome: string;
  colore: string;
  variant?: "plain" | "pill";
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 font-medium",
        variant === "plain" && "text-sm",
        variant === "pill" && "h-6 rounded-full border px-2.5 text-xs",
        className,
      )}
      style={{
        color: colore,
        ...(variant === "pill" && {
          backgroundColor: `color-mix(in srgb, ${colore} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${colore} 30%, transparent)`,
        }),
      }}
      title={nome}
    >
      <Hash
        aria-hidden
        strokeWidth={2.5}
        className="size-[1em] shrink-0 opacity-50"
      />
      <span className="truncate leading-normal">{nome}</span>
    </span>
  );
}
