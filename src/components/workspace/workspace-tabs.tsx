"use client";

import { cn } from "@/src/lib/utils";
import { FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  closeTabs,
  findArgomento,
  handleWorkspaceClick,
  navigateWorkspace,
  prefetchArgomento,
  useStructure,
  useTabs,
} from "./workspace-store";

export function WorkspaceTabs({
  formularioId,
  argomentoId,
  activeTitle,
  dirty = false,
}: Readonly<{
  formularioId: string;
  argomentoId?: string;
  activeTitle?: string;
  dirty?: boolean;
}>) {
  const tabs = useTabs(formularioId);
  const { structure } = useStructure(formularioId);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  function close(ids: string[]) {
    const nextId = closeTabs(formularioId, ids, argomentoId);
    if (argomentoId && ids.includes(argomentoId))
      navigateWorkspace(formularioId, nextId);
  }

  useEffect(() => {
    stripRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [argomentoId, tabs.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isW = e.key.toLowerCase() === "w" || e.code === "KeyW";
      if (isW && e.altKey && argomentoId) {
        e.preventDefault();
        close([argomentoId]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  if (tabs.length === 0) return null;

  return (
    <div
      ref={stripRef}
      role="tablist"
      className="flex h-9 shrink-0 items-stretch overflow-x-auto overflow-y-hidden border-b bg-muted/30 scrollbar-none select-none"
    >
      {tabs.map((id) => {
        const active = id === argomentoId;
        const titolo =
          active && activeTitle
            ? activeTitle
            : (findArgomento(structure, id)?.argomento.titolo ?? "…");
        const showDirty = active && dirty;

        return (
          <DropdownMenu
            key={id}
            open={menuFor === id}
            onOpenChange={(open) => setMenuFor(open ? id : null)}
          >
            <DropdownMenuTrigger asChild>
              <div
                role="tab"
                aria-selected={active}
                data-active={active}
                onPointerDown={(e) => {
                  // Keep left click for navigation, open the menu only on right click
                  if (e.button !== 2) e.preventDefault();
                }}
                onClick={() => navigateWorkspace(formularioId, id)}
                onPointerEnter={() => prefetchArgomento(id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenuFor(id);
                }}
                onAuxClick={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    close([id]);
                  }
                }}
                className={cn(
                  "group/tab relative flex cursor-pointer max-w-52 shrink-0 items-center gap-1.5 border-r pl-3 pr-1.5 text-[0.8rem] transition-colors",
                  active
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                )}
                <a
                  href={`/editor/${id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWorkspaceClick(e, formularioId, id);
                  }}
                  className="flex min-w-0 items-center gap-1.5 outline-none"
                >
                  <FileText
                    size={13}
                    className={cn(
                      "shrink-0",
                      active ? "text-primary" : "opacity-70",
                    )}
                  />
                  <span className="truncate">{titolo}</span>
                </a>
                <button
                  type="button"
                  title="Chiudi (Alt+W)"
                  onClick={(e) => {
                    e.stopPropagation();
                    close([id]);
                  }}
                  className={cn(
                    "relative flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent",
                    active || showDirty
                      ? "opacity-100"
                      : "opacity-0 group-hover/tab:opacity-100",
                  )}
                >
                  <X
                    size={13}
                    className={cn(showDirty && "group-hover/tab:block hidden")}
                  />
                  {showDirty && (
                    <span className="size-2 rounded-full bg-foreground/70 group-hover/tab:hidden" />
                  )}
                </button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem onSelect={() => close([id])}>
                Chiudi
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={tabs.length < 2}
                onSelect={() => close(tabs.filter((t) => t !== id))}
              >
                Chiudi altre
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => close(tabs)}>
                Chiudi tutte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
