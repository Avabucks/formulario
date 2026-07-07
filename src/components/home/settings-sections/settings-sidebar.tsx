"use client";

import { cn } from "@/src/lib/utils";
import { Download, Info, ListTree, Pencil, QrCode } from "lucide-react";
import { SettingsSection } from "./types";

export function SettingsSidebar({
  activeSection,
  editable,
  visibility,
  setActiveSection,
}: Readonly<{
  activeSection?: SettingsSection;
  editable: boolean;
  visibility: 0 | 1 | 2;
  setActiveSection: (section: SettingsSection) => void;
}>) {
  return (
    <div className="md:w-56 shrink-0 border-r flex flex-col">
      <nav className="flex flex-col gap-1 p-2">
        {!editable && (
          <SettingsSidebarButton
            active={activeSection === "info"}
            icon={<Info size={15} />}
            label="Informazioni"
            onClick={() => setActiveSection("info")}
          />
        )}
        {editable && (
          <SettingsSidebarButton
            active={activeSection === "edit"}
            icon={<Pencil size={15} />}
            label="Modifica"
            onClick={() => setActiveSection("edit")}
          />
        )}
        {visibility !== 0 && (
          <SettingsSidebarButton
            active={activeSection === "qr"}
            icon={<QrCode size={15} />}
            label="Condividi"
            onClick={() => setActiveSection("qr")}
          />
        )}
        <button
          disabled
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-muted-foreground/50 cursor-not-allowed"
        >
          <Download size={15} />
          <span className="hidden md:flex">Esporta</span>
          <span className="hidden md:flex ml-auto text-xs border border-border rounded-full px-2 py-0.5 bg-secondary">
            Soon
          </span>
        </button>
      </nav>
    </div>
  );
}

function SettingsSidebarButton({
  active,
  icon,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden md:flex">{label}</span>
    </button>
  );
}
