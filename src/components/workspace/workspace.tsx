"use client";

import packageJson from "@/package.json";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { EditorPage } from "../editor/editor-page";
import { FormularioWelcome } from "./formulario-welcome";
import { findArgomento, useStructure } from "./workspace-store";

export type WorkspaceFormulario = {
  id: string;
  titolo: string;
  descrizione?: string;
  nomeAutore?: string;
  editable: boolean;
};

/**
 * Single client shell for /formulario/[id] and /editor/[id]: switching
 * argomento only pushes a new URL, so the page is never reloaded.
 */
export function Workspace({
  formulario,
}: Readonly<{ formulario: WorkspaceFormulario }>) {
  const pathname = usePathname();
  const argomentoId = /^\/editor\/([^/]+)/.exec(pathname)?.[1];
  const { structure } = useStructure(formulario.id);

  const argomentoTitolo = argomentoId
    ? findArgomento(structure, argomentoId)?.argomento.titolo
    : undefined;

  useEffect(() => {
    const titolo = argomentoId ? argomentoTitolo : formulario.titolo;
    if (titolo) document.title = `${titolo} - ${packageJson.displayName}`;
  }, [argomentoId, argomentoTitolo, formulario.titolo]);

  if (!argomentoId) return <FormularioWelcome formulario={formulario} />;

  return (
    <EditorPage
      key={argomentoId}
      argomentoId={argomentoId}
      editable={formulario.editable}
      formularioId={formulario.id}
    />
  );
}
