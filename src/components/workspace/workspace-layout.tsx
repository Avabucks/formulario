"use client";

import clsx from "clsx";
import { PanelLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Toggle } from "../ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { WorkspaceExplorer } from "./workspace-explorer";
import { setExplorerOpen, useExplorerOpen } from "./workspace-store";
import { WorkspaceTabs } from "./workspace-tabs";

/** Desktop keeps a persisted preference, mobile opens the explorer as an overlay */
export function useExplorerVisibility(isMobile: boolean) {
  const desktopOpen = useExplorerOpen();
  const [mobileOpen, setMobileOpen] = useState(false);

  const setOpen = useCallback(
    (open: boolean) => (isMobile ? setMobileOpen(open) : setExplorerOpen(open)),
    [isMobile],
  );
  const open = isMobile ? mobileOpen : desktopOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isE = e.key.toLowerCase() === "e" || e.code === "KeyE";
      if (isE && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return [open, setOpen] as const;
}

export function ExplorerToggle({
  open,
  setOpen,
}: Readonly<{ open: boolean; setOpen: (open: boolean) => void }>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            variant="outline"
            pressed={open}
            onPressedChange={setOpen}
            className="h-7 w-7 md:h-8 md:w-8 text-foreground shrink-0 cursor-pointer p-0 flex items-center justify-center"
          >
            <PanelLeft className="size-3.5 md:size-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="pr-1.5">
          <div className="flex items-center gap-2">
            Explorer
            <KbdGroup className="hidden md:flex">
              <Kbd>Alt</Kbd>
              <span>+</span>
              <Kbd>E</Kbd>
            </KbdGroup>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function WorkspaceLayout({
  formularioId,
  argomentoId,
  activeTitle,
  dirty,
  editable,
  isMobile,
  explorerOpen,
  setExplorerOpen,
  header,
  children,
}: Readonly<{
  formularioId: string;
  argomentoId?: string;
  activeTitle?: string;
  dirty?: boolean;
  editable: boolean;
  isMobile: boolean;
  explorerOpen: boolean;
  setExplorerOpen: (open: boolean) => void;
  header: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx(
        "flex flex-1 min-h-0 overflow-hidden relative bg-background",
      )}
    >
      <aside
        className={clsx(
          "h-full bg-background",
          !explorerOpen && "hidden",
          isMobile ? "absolute inset-0 z-30 w-full" : "w-64 shrink-0 border-r",
        )}
      >
        <WorkspaceExplorer
          formularioId={formularioId}
          argomentoId={argomentoId}
          activeTitle={activeTitle}
          editable={editable}
          onOpen={() => setExplorerOpen(true)}
          onClose={() => setExplorerOpen(false)}
          onNavigate={() => isMobile && setExplorerOpen(false)}
        />
      </aside>

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {header}
        <WorkspaceTabs
          formularioId={formularioId}
          argomentoId={argomentoId}
          activeTitle={activeTitle}
          dirty={dirty}
        />
        <div className="flex flex-1 min-h-0 w-full relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
