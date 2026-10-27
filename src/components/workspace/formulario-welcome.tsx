"use client";

import { useIsMobile } from "@/src/hooks/useIsMobile";
import { BookOpen } from "lucide-react";
import { FormularioSettings } from "../home/formulario-settings";
import { TakeFormulario } from "../home/take-formulario";
import { Kbd, KbdGroup } from "../ui/kbd";
import {
  ExplorerToggle,
  useExplorerVisibility,
  WorkspaceLayout,
} from "./workspace-layout";
import type { WorkspaceFormulario } from "./workspace";
import { useStructure, useTabs } from "./workspace-store";

export function FormularioWelcome({
  formulario,
}: Readonly<{
  formulario: WorkspaceFormulario;
}>) {
  const isMobile = useIsMobile();
  const [explorerOpen, setExplorerOpen] = useExplorerVisibility(isMobile);
  const { structure } = useStructure(formulario.id);
  const tabs = useTabs(formulario.id);

  const capitoliCount = structure?.capitoli.length ?? 0;
  const argomentiCount =
    structure?.capitoli.reduce((n, c) => n + c.argomenti.length, 0) ?? 0;

  const header = (
    <div className="flex w-full border-b bg-background/95 backdrop-blur-xs min-h-14 md:min-h-15 items-center justify-between px-2.5 md:px-4 py-1.5 md:py-2 gap-2 md:gap-4 select-none">
      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
        <ExplorerToggle open={explorerOpen} setOpen={setExplorerOpen} />
        {!formulario.editable && (
          <>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <TakeFormulario formularioId={formulario.id} />
          </>
        )}
        <div className="h-6 w-px bg-border hidden sm:block" />
        <h1 className="text-sm font-medium truncate">{formulario.titolo}</h1>
      </div>
      <FormularioSettings formularioId={formulario.id} />
    </div>
  );

  return (
    <WorkspaceLayout
      formularioId={formulario.id}
      editable={formulario.editable}
      isMobile={isMobile}
      explorerOpen={explorerOpen}
      setExplorerOpen={setExplorerOpen}
      header={header}
    >
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <BookOpen className="size-10 text-muted-foreground/60" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{formulario.titolo}</h2>
            {formulario.nomeAutore && (
              <p className="text-sm text-muted-foreground">
                di {formulario.nomeAutore}
              </p>
            )}
          </div>
          {formulario.descrizione && (
            <p className="text-sm text-muted-foreground line-clamp-4">
              {formulario.descrizione}
            </p>
          )}
          {structure && (
            <p className="text-xs text-muted-foreground">
              {capitoliCount} {capitoliCount === 1 ? "capitolo" : "capitoli"} ·{" "}
              {argomentiCount}{" "}
              {argomentiCount === 1 ? "argomento" : "argomenti"}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {tabs.length > 0
              ? "Scegli una scheda aperta o un argomento dall'explorer."
              : formulario.editable && capitoliCount === 0
                ? "Crea il primo capitolo dall'explorer per iniziare."
                : "Apri un argomento dall'explorer per iniziare."}
          </p>
          <div className="hidden md:flex flex-col gap-2 text-xs text-muted-foreground">
            <ShortcutHint
              label="Mostra/nascondi explorer"
              keys={["Alt", "E"]}
            />
            <ShortcutHint label="Chiudi scheda" keys={["Alt", "W"]} />
            <ShortcutHint
              label="Impostazioni formulario"
              keys={["Ctrl", "Shift", "I"]}
            />
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function ShortcutHint({
  label,
  keys,
}: Readonly<{ label: string; keys: string[] }>) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span>{label}</span>
      <KbdGroup>
        {keys.map((key, i) => (
          <span key={key} className="flex items-center gap-1">
            {i > 0 && <span>+</span>}
            <Kbd>{key}</Kbd>
          </span>
        ))}
      </KbdGroup>
    </div>
  );
}
