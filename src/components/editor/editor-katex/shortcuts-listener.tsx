"use client";

import { useEffect } from "react";
import type { editor } from "monaco-editor";
import { toggleBold } from "./tools/formatting-bold";
import { toggleItalic } from "./tools/formatting-italic";
import { toggleQuote } from "./tools/formatting-quote";
import { toggleHeading } from "./tools/formatting-headers";
import { toggleOrderedList } from "./tools/formatting-ordered";
import { toggleUnorderedList } from "./tools/formatting-unordered";
import { toggleDivider } from "./tools/formatting-divider";

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
      const hasMeta = e.ctrlKey || e.metaKey;

      // Ctrl + B -> Bold
      const isKeyB = e.browserEvent.key.toLowerCase() === "b" || e.code === "KeyB";
      if (hasMeta && isKeyB && !e.shiftKey && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleBold(editorRef);
        return;
      }

      // Ctrl + I -> Italic
      const isKeyI = e.browserEvent.key.toLowerCase() === "i" || e.code === "KeyI";
      if (hasMeta && isKeyI && !e.shiftKey && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleItalic(editorRef);
        return;
      }

      // Ctrl + Shift + Q -> Quote
      const isKeyQ = e.browserEvent.key.toLowerCase() === "q" || e.code === "KeyQ";
      if (hasMeta && e.shiftKey && isKeyQ && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleQuote(editorRef);
        return;
      }

      // Ctrl + Shift + 7 -> Ordered List
      const isDigit7 = e.browserEvent.key === "7" || e.code === "Digit7";
      if (hasMeta && e.shiftKey && isDigit7 && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleOrderedList(editorRef);
        return;
      }

      // Ctrl + Shift + 8 -> Unordered List
      const isDigit8 = e.browserEvent.key === "8" || e.code === "Digit8";
      if (hasMeta && e.shiftKey && isDigit8 && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleUnorderedList(editorRef);
        return;
      }

      // Ctrl + Shift + 9 -> Divider
      const isDigit9 = e.browserEvent.key === "9" || e.code === "Digit9";
      if (hasMeta && e.shiftKey && isDigit9 && !e.altKey && isFocused) {
        e.preventDefault();
        e.stopPropagation();
        toggleDivider(editorRef);
        return;
      }

      // Ctrl + Shift + 1..6 -> Headings
      if (hasMeta && e.shiftKey && !e.altKey && isFocused) {
        const key = e.browserEvent.key;
        if (key === "1" || e.code === "Digit1") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 1);
        } else if (key === "2" || e.code === "Digit2") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 2);
        } else if (key === "3" || e.code === "Digit3") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 3);
        } else if (key === "4" || e.code === "Digit4") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 4);
        } else if (key === "5" || e.code === "Digit5") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 5);
        } else if (key === "6" || e.code === "Digit6") {
          e.preventDefault();
          e.stopPropagation();
          toggleHeading(editorRef, 6);
        }
      }
    });

    return () => disposable.dispose();
  }, [isFocused, editorRef]);

  return null;
}
