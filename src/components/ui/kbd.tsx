"use client";

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

function detectMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function useIsMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(detectMac());
  }, []);

  return isMac;
}

const keyMap: Record<string, (isMac: boolean) => string> = {
  Ctrl: (isMac) => (isMac ? "⌘" : "Ctrl"),
  Alt: (isMac) => (isMac ? "⌥" : "Alt"),
  Shift: (isMac) => (isMac ? "⇧" : "Shift"),
};

function resolveKey(key: string, isMac: boolean): string {
  return keyMap[key]?.(isMac) ?? key;
}

export function Kbd({
  className,
  children,
  ...props
}: React.ComponentProps<"kbd">) {
  const isMac = useIsMac();

  const resolved =
    typeof children === "string" ? resolveKey(children, isMac) : children;

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 h-5 w-fit min-w-5 gap-1 rounded-sm px-1 font-sans text-xs font-medium [&_svg:not([class*='size-'])]:size-3 pointer-events-none inline-flex items-center justify-center select-none",
        className,
      )}
      {...props}
    >
      {resolved}
    </kbd>
  );
}

export function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kbd-group"
      className={cn("gap-1 inline-flex items-center", className)}
      {...props}
    />
  );
}
