import { cn } from "@/src/lib/utils"

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

const keyMap: Record<string, string> = {
    Ctrl: isMac ? "⌘" : "Ctrl",
    Alt: isMac ? "⌥" : "Alt",
    Shift: isMac ? "⇧" : "Shift",
    Meta: isMac ? "⌘" : "Win",
};

function resolveKey(key: string): string {
    return keyMap[key] ?? key;
}

function Kbd({ className, children, ...props }: React.ComponentProps<"kbd">) {
    const resolved = typeof children === "string" ? resolveKey(children) : children;
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                "bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 h-5 w-fit min-w-5 gap-1 rounded-sm px-1 font-sans text-xs font-medium [&_svg:not([class*='size-'])]:size-3 pointer-events-none inline-flex items-center justify-center select-none",
                className
            )}
            {...props}
        >
            {resolved}
        </kbd>
    )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <kbd
            data-slot="kbd-group"
            className={cn("gap-1 inline-flex items-center", className)}
            {...props}
        />
    )
}

export { Kbd, KbdGroup }