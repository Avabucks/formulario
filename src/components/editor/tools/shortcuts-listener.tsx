"use client";

import { useEffect } from "react";
import type { editor } from "monaco-editor";
import { toggleBold } from "../tools/toolbar/formatting-bold";
import { toggleItalic } from "../tools/toolbar/formatting-italic";
import { toggleQuote } from "../tools/toolbar/formatting-quote";
import { toggleHeading } from "../tools/toolbar/formatting-headers";
import { toggleOrderedList } from "../tools/toolbar/formatting-ordered";
import { toggleUnorderedList } from "../tools/toolbar/formatting-unordered";
import { toggleDivider } from "../tools/toolbar/formatting-divider";
import { toggleCodeInline } from "../tools/toolbar/formatting-code-inline";
type ToggleFn = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
) => void;

const ACTIONS_NO_SHIFT: Record<string, ToggleFn> = {
  b: toggleBold,
  KeyB: toggleBold,
  i: toggleItalic,
  KeyI: toggleItalic,
};

const ACTIONS_SHIFT: Record<string, ToggleFn> = {
  q: toggleQuote,
  KeyQ: toggleQuote,
  "7": toggleOrderedList,
  Digit7: toggleOrderedList,
  "8": toggleUnorderedList,
  Digit8: toggleUnorderedList,
  "9": toggleDivider,
  Digit9: toggleDivider,
  j: toggleCodeInline,
  KeyJ: toggleCodeInline,
  u: () => globalThis.dispatchEvent(new CustomEvent("editor:open-code-block")),
  KeyU: () => globalThis.dispatchEvent(new CustomEvent("editor:open-code-block")),
  g: () => globalThis.dispatchEvent(new CustomEvent("editor:open-latex-single")),
  KeyG: () => globalThis.dispatchEvent(new CustomEvent("editor:open-latex-single")),
  h: () => globalThis.dispatchEvent(new CustomEvent("editor:open-latex-double")),
  KeyH: () => globalThis.dispatchEvent(new CustomEvent("editor:open-latex-double")),
};

function getHeadingLevel(key: string, code: string): number | null {
  const match = /^([1-6])$/.exec(key) || /^Digit([1-6])$/.exec(code);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getAction(
  key: string,
  code: string,
  shiftKey: boolean,
): ToggleFn | null {
  if (shiftKey) {
    const headingLevel = getHeadingLevel(key, code);
    if (headingLevel !== null) {
      return (editorRef) => toggleHeading(editorRef, headingLevel);
    }
    return ACTIONS_SHIFT[key] || ACTIONS_SHIFT[code] || null;
  }
  return ACTIONS_NO_SHIFT[key] || ACTIONS_NO_SHIFT[code] || null;
}

export function ShortcutsListener({
  editorRef,
  isFocused,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
}>) {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      if (!isFocused) return;

      if (e.altKey) {
        const isKeyT =
          e.browserEvent.key.toLowerCase() === "t" || e.code === "KeyT";
        if (isKeyT) {
          e.preventDefault();
          e.stopPropagation();
          globalThis.dispatchEvent(new CustomEvent("editor:open-table"));
        }
        return;
      }

      const hasMeta = e.ctrlKey || e.metaKey;
      if (!hasMeta) return;

      const key = e.browserEvent.key.toLowerCase();
      const code = e.code;

      const action = getAction(key, code, e.shiftKey);
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action(editorRef);
      }
    });

    return () => disposable.dispose();
  }, [isFocused, editorRef]);

  return null;
}
