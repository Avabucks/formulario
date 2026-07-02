"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  checkActiveLatexOrCode,
  getH1Regex,
  getH2Regex,
  getH3Regex,
  getH4Regex,
  getH5Regex,
  getH6Regex,
  getIsActiveList,
  handleListToggle,
} from "@/src/lib/editor/formatting-utils";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect } from "react";

function HeadingToggle({
  editorRef,
  isFocused,
  getRegex,
  icon: Icon,
  label,
  shortcut,
  prefix,
  onToggle,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  getRegex: () => RegExp;
  icon: React.ElementType;
  label: string;
  shortcut: string;
  prefix: string;
  onToggle: () => void;
}>) {
  const isActive = getIsActiveList(editorRef, getRegex);

  const handleToggle = () => {
    handleListToggle(
      editorRef,
      isActive,
      getRegex,
      (line) => {
        const stripped = line.replace(/^#{1,6}\s/, "");
        return `${prefix} ${stripped}`;
      },
      (line) => line.replace(new RegExp(String.raw`^${prefix}\s`), ""),
    );
    onToggle();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  if (checkActiveLatexOrCode(editorRef) && isFocused) return null;

  return (
    <CommandItem
      onSelect={handleToggle}
      className="flex items-center gap-2 cursor-pointer"
    >
      <Icon size={14} />
      <span>{label}</span>
      <CommandShortcut className="ml-auto">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>{shortcut}</Kbd>
        </KbdGroup>
      </CommandShortcut>
    </CommandItem>
  );
}

export function FormattingHeaders({
  editorRef,
  isFocused,
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  isFocused: boolean;
  onSelect?: () => void;
}>) {
  const anyActive =
    getIsActiveList(editorRef, getH1Regex) ||
    getIsActiveList(editorRef, getH2Regex) ||
    getIsActiveList(editorRef, getH3Regex) ||
    getIsActiveList(editorRef, getH4Regex) ||
    getIsActiveList(editorRef, getH5Regex) ||
    getIsActiveList(editorRef, getH6Regex);

  const triggerHeading = (getRegex: () => RegExp, prefix: string) => {
    handleListToggle(
      editorRef,
      anyActive,
      getRegex,
      (line) => `${prefix} ${line.replace(/^#{1,6}\s/, "")}`,
      (line) => line.replace(new RegExp(String.raw`^${prefix}\s`), ""),
    );
    onSelect?.();
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onKeyDown((e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && isFocused) {
        const actions: Record<string, () => void> = {
          "1": () => triggerHeading(getH1Regex, "#"),
          "2": () => triggerHeading(getH2Regex, "##"),
          "3": () => triggerHeading(getH3Regex, "###"),
          "4": () => triggerHeading(getH4Regex, "####"),
          "5": () => triggerHeading(getH5Regex, "#####"),
          "6": () => triggerHeading(getH6Regex, "######"),
          Digit1: () => triggerHeading(getH1Regex, "#"),
          Digit2: () => triggerHeading(getH2Regex, "##"),
          Digit3: () => triggerHeading(getH3Regex, "###"),
          Digit4: () => triggerHeading(getH4Regex, "####"),
          Digit5: () => triggerHeading(getH5Regex, "#####"),
          Digit6: () => triggerHeading(getH6Regex, "######"),
        };
        const key = e.browserEvent.key;
        const action = actions[key] || actions[e.code];
        if (action) {
          e.preventDefault();
          e.stopPropagation();
          action();
        }
      }
    });
    return () => disposable.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, editorRef]);

  const onToggle = onSelect ?? (() => {});

  return (
    <>
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH1Regex}
        icon={Heading1}
        label="Titolo 1"
        shortcut="1"
        prefix="#"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH2Regex}
        icon={Heading2}
        label="Titolo 2"
        shortcut="2"
        prefix="##"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH3Regex}
        icon={Heading3}
        label="Titolo 3"
        shortcut="3"
        prefix="###"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH4Regex}
        icon={Heading4}
        label="Titolo 4"
        shortcut="4"
        prefix="####"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH5Regex}
        icon={Heading5}
        label="Titolo 5"
        shortcut="5"
        prefix="#####"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        isFocused={isFocused}
        getRegex={getH6Regex}
        icon={Heading6}
        label="Titolo 6"
        shortcut="6"
        prefix="######"
        onToggle={onToggle}
      />
    </>
  );
}
