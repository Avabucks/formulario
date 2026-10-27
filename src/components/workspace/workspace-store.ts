"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { StructureCapitolo } from "../home/settings-sections/types";

export type Structure = {
  titolo: string;
  nomeAutore: string;
  photoURL: string | null;
  capitoli: StructureCapitolo[];
};

// Module-level state survives the editor remount between argomenti
const structures = new Map<string, Structure>();
const structureErrors = new Set<string>();
const pendingLoads = new Map<string, Promise<void>>();
const tabs = new Map<string, string[]>();
const expanded = new Map<string, Set<string>>();
let explorerOpen: boolean | null = null;

const listeners = new Set<() => void>();
const EMPTY_TABS: string[] = [];
const TABS_STORAGE_PREFIX = "workspace-tabs-";
const EXPLORER_STORAGE_KEY = "editor-explorer-open";

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/* ---------- Structure ---------- */

export function reloadStructure(formularioId: string) {
  const pending = pendingLoads.get(formularioId);
  if (pending) return pending;

  const load = fetch(`/api/formulari/${formularioId}/structure`)
    .then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<Structure>;
    })
    .then((result) => {
      structures.set(formularioId, result);
      structureErrors.delete(formularioId);
      pruneTabs(formularioId, result);
    })
    .catch(() => {
      if (!structures.has(formularioId)) structureErrors.add(formularioId);
    })
    .finally(() => {
      pendingLoads.delete(formularioId);
      emit();
    });

  pendingLoads.set(formularioId, load);
  return load;
}

export function useStructure(formularioId: string) {
  const structure = useSyncExternalStore(
    subscribe,
    () => structures.get(formularioId),
    () => undefined,
  );
  const error = useSyncExternalStore(
    subscribe,
    () => structureErrors.has(formularioId),
    () => false,
  );

  useEffect(() => {
    reloadStructure(formularioId);
  }, [formularioId]);

  const reload = useCallback(
    () => reloadStructure(formularioId),
    [formularioId],
  );

  return { structure, error, reload };
}

export function findArgomento(
  structure: Structure | undefined,
  argomentoId: string,
) {
  for (const capitolo of structure?.capitoli ?? []) {
    const argomento = capitolo.argomenti.find((a) => a.id === argomentoId);
    if (argomento) return { capitolo, argomento };
  }
  return undefined;
}

/* ---------- Tabs ---------- */

function getTabs(formularioId: string) {
  let list = tabs.get(formularioId);
  if (!list) {
    try {
      const parsed = JSON.parse(
        readStorage(TABS_STORAGE_PREFIX + formularioId) ?? "[]",
      );
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
    tabs.set(formularioId, list);
  }
  return list;
}

function setTabs(formularioId: string, list: string[]) {
  tabs.set(formularioId, list);
  writeStorage(TABS_STORAGE_PREFIX + formularioId, JSON.stringify(list));
  emit();
}

function pruneTabs(formularioId: string, structure: Structure) {
  const list = getTabs(formularioId);
  const pruned = list.filter((id) => findArgomento(structure, id));
  if (pruned.length !== list.length) setTabs(formularioId, pruned);
}

export function useTabs(formularioId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getTabs(formularioId),
    () => EMPTY_TABS,
  );
}

export function openTab(formularioId: string, argomentoId: string) {
  const list = getTabs(formularioId);
  if (!list.includes(argomentoId))
    setTabs(formularioId, [...list, argomentoId]);
}

/** Removes the tabs and returns the tab to focus if the active one was closed */
export function closeTabs(
  formularioId: string,
  argomentoIds: string[],
  activeId?: string,
) {
  const list = getTabs(formularioId);
  const next = list.filter((id) => !argomentoIds.includes(id));
  setTabs(formularioId, next);

  if (!activeId || !argomentoIds.includes(activeId)) return activeId;
  const index = list.indexOf(activeId);
  return next[Math.min(index, next.length - 1)];
}

/* ---------- Explorer ---------- */

export function useExplorerOpen() {
  return useSyncExternalStore(
    subscribe,
    () => {
      explorerOpen ??= readStorage(EXPLORER_STORAGE_KEY) !== "false";
      return explorerOpen;
    },
    () => false,
  );
}

export function setExplorerOpen(open: boolean) {
  explorerOpen = open;
  writeStorage(EXPLORER_STORAGE_KEY, String(open));
  emit();
}

export function getExpanded(formularioId: string) {
  return expanded.get(formularioId) ?? new Set<string>();
}

export function saveExpanded(formularioId: string, value: Set<string>) {
  expanded.set(formularioId, value);
}

/* ---------- Client-side navigation ---------- */

export function workspaceHref(formularioId: string, argomentoId?: string) {
  return argomentoId ? `/editor/${argomentoId}` : `/formulario/${formularioId}`;
}

/** Changes the URL without a server round-trip: the workspace reads it from usePathname */
export function navigateWorkspace(formularioId: string, argomentoId?: string) {
  if (argomentoId) openTab(formularioId, argomentoId);
  const href = workspaceHref(formularioId, argomentoId);
  if (globalThis.location.pathname !== href)
    globalThis.history.pushState(null, "", href);
}

/** Click handler for workspace links: keeps ctrl/middle click as a real link */
export function handleWorkspaceClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  formularioId: string,
  argomentoId?: string,
) {
  if (e.defaultPrevented) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return;
  e.preventDefault();
  navigateWorkspace(formularioId, argomentoId);
}

/* ---------- Per-argomento caches ---------- */

export type ArgomentoData = {
  content: string;
  display_name: string;
  foto_profilo: string;
};

export type EditorView = "preview" | "divided" | "edit";

const contents = new Map<string, ArgomentoData>();
const pendingContents = new Map<string, Promise<ArgomentoData>>();
const views = new Map<string, EditorView>();

export function getCachedArgomento(argomentoId: string) {
  return contents.get(argomentoId);
}

export function setCachedArgomento(argomentoId: string, data: ArgomentoData) {
  contents.set(argomentoId, data);
}

export function loadArgomento(argomentoId: string) {
  const pending = pendingContents.get(argomentoId);
  if (pending) return pending;

  const load = fetch(`/api/argomenti/${argomentoId}`)
    .then(async (res) => {
      if (!res.ok) throw new Error("Errore nel caricamento");
      const data = await res.json();
      const result: ArgomentoData = {
        content: data.content ?? "",
        display_name: data.display_name,
        foto_profilo: data.foto_profilo,
      };
      if (!contents.has(argomentoId)) contents.set(argomentoId, result);
      return result;
    })
    .finally(() => pendingContents.delete(argomentoId));

  pendingContents.set(argomentoId, load);
  return load;
}

/** Warms the cache on hover so opening a tab is instant */
export function prefetchArgomento(argomentoId: string) {
  if (contents.has(argomentoId)) return;
  loadArgomento(argomentoId).catch(() => {});
}

export function getCachedView(argomentoId: string) {
  return views.get(argomentoId);
}

export function setCachedView(argomentoId: string, view: EditorView) {
  views.set(argomentoId, view);
}
