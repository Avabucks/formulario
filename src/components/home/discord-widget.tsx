"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

const DISCORD_POPUP_DISABLED_KEY = "discord_popup_disabled";
const ACCOUNT_POPUP_KEY = "new-account-popup-closed";

export function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      {...props}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A52.49,52.49,0,0,0,31,78.22a74.37,74.37,0,0,0,65.17,0,52.49,52.49,0,0,0,2.83,2.29,68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.56,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
    </svg>
  );
}

export function DiscordDialog({
  open,
  onOpenChange,
  showDisableOption = false,
  disableAutomaticPopup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showDisableOption?: boolean;
  disableAutomaticPopup?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Card nello stile dell'invito ufficiale di Discord con loghi sovrapposti */}
        <div className="w-full aspect-[2/1] bg-[#1e1f22] flex flex-col items-center justify-center p-6 border-b border-[#2b2d31] relative overflow-hidden select-none">
          {/* Filigrana Discord logo */}
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none text-white">
            <DiscordIcon className="w-36 h-36 fill-current" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 w-full">
            {/* Loghi in modalità Stack sovrapposta */}
            <div className="flex -space-x-3 items-center">
              {/* Logo del Sito (FormulaBase) */}
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-[#1e1f22] p-2.5 z-10">
                <img
                  src="/icon0.svg"
                  alt="FormulaBase Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Logo Discord */}
              <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center border-4 border-[#1e1f22] p-3.5 z-20">
                <DiscordIcon className="w-full h-full fill-current text-white" />
              </div>
            </div>

            {/* Dettagli dell'invito */}
            <div className="text-center space-y-0.5">
              <span className="text-[10px] font-bold text-[#b5bac1] uppercase tracking-wider block">
                Community Hub
              </span>
              <h4 className="text-base font-bold text-white leading-tight">
                FormulaBase Community
              </h4>
              <span className="text-xs text-[#23a55a] font-medium flex items-center justify-center gap-1.5 pt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#23a55a]"></span>
                </span>
                Community Ufficiale
              </span>
            </div>
          </div>
        </div>

        {/* Testo descrittivo */}
        <div className="px-6 pt-5 pb-3 space-y-3">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Unisciti a FormulaBase su Discord
              </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Il nostro server ufficiale è il punto di ritrovo ideale per:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 pt-1 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white border border-foreground/30 mt-2 flex-shrink-0" />
              <span>Condividere formule e formulari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white border border-foreground/30 mt-2 flex-shrink-0" />
              <span>Ricevere supporto per i tuoi studi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white border border-foreground/30 mt-2 flex-shrink-0" />
              <span>Segnalare bug o suggerire idee per la piattaforma</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white border border-foreground/30 mt-2 flex-shrink-0" />
              <span>Collaborare con gli altri membri della community</span>
            </li>
          </ul>
        </div>

        {/* Footer del popup corretto (stile slide tutorial) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50 gap-3">
          <div>
            {showDisableOption && disableAutomaticPopup && (
              <button
                onClick={disableAutomaticPopup}
                className="text-xs text-muted-foreground underline hover:text-foreground cursor-pointer transition-colors"
              >
                Non mostrare più
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Chiudi
              </Button>
            </DialogClose>
            <Link
              href="https://discord.gg/uuRuWtteZ"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold shadow-none cursor-pointer border-none flex items-center justify-center gap-1.5 px-4 rounded-md transition-colors text-sm select-none"
            >
              <DiscordIcon className="h-4.5 w-4.5 fill-current" />
              Unisciti al server
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DiscordWidget() {
  const [open, setOpen] = useState(false);
  const [popupDisabled, setPopupDisabled] = useState(false);

  useEffect(() => {
    const isPopupDisabled =
      localStorage.getItem(DISCORD_POPUP_DISABLED_KEY) === "true";
    const accountPopupClosed =
      localStorage.getItem(ACCOUNT_POPUP_KEY) === "true";

    setPopupDisabled(isPopupDisabled);

    if (!isPopupDisabled && accountPopupClosed) {
      setOpen(true);
    }
  }, []);

  const disableAutomaticPopup = () => {
    localStorage.setItem(DISCORD_POPUP_DISABLED_KEY, "true");
    setPopupDisabled(true);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all cursor-pointer shadow-none border-none"
        aria-label="Apri community Discord"
      >
        <DiscordIcon className="h-5.5 w-5.5 fill-current" />
      </button>

      <DiscordDialog
        open={open}
        onOpenChange={setOpen}
        showDisableOption={!popupDisabled}
        disableAutomaticPopup={disableAutomaticPopup}
      />
    </>
  );
}
