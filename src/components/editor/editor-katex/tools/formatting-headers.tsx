"use client";

import { CommandItem, CommandShortcut } from "@/src/components/ui/command";
import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import {
  getH1Regex,
  getH2Regex,
  getH3Regex,
  getH4Regex,
  getH5Regex,
  getH6Regex,
  getIsActiveList,
  handleListToggle
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

export const toggleHeading = (
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>,
  level: number,
) => {
  const getRegex = [getH1Regex, getH2Regex, getH3Regex, getH4Regex, getH5Regex, getH6Regex][level - 1];
  const prefix = "#".repeat(level);

  const anyActive =
    getIsActiveList(editorRef, getH1Regex) ||
    getIsActiveList(editorRef, getH2Regex) ||
    getIsActiveList(editorRef, getH3Regex) ||
    getIsActiveList(editorRef, getH4Regex) ||
    getIsActiveList(editorRef, getH5Regex) ||
    getIsActiveList(editorRef, getH6Regex);

  handleListToggle(
    editorRef,
    anyActive,
    getRegex,
    (line) => `${prefix} ${line.replace(/^#{1,6}\s/, "")}`,
    (line) => line.replace(new RegExp(String.raw`^${prefix}\s`), ""),
  );
  setTimeout(() => editorRef.current?.focus(), 0);
};

function HeadingToggle({
  editorRef,
  getRegex,
  icon: Icon,
  label,
  shortcut,
  prefix,
  onToggle,
}: Readonly<{
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
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
  onSelect,
}: Readonly<{
  _selection: Selection | null;
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onSelect?: () => void;
}>) {
  const onToggle = onSelect ?? (() => {});

  return (
    <>
      <HeadingToggle
        editorRef={editorRef}
        getRegex={getH1Regex}
        icon={Heading1}
        label="Titolo 1"
        shortcut="1"
        prefix="#"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        getRegex={getH2Regex}
        icon={Heading2}
        label="Titolo 2"
        shortcut="2"
        prefix="##"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        getRegex={getH3Regex}
        icon={Heading3}
        label="Titolo 3"
        shortcut="3"
        prefix="###"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        getRegex={getH4Regex}
        icon={Heading4}
        label="Titolo 4"
        shortcut="4"
        prefix="####"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
        getRegex={getH5Regex}
        icon={Heading5}
        label="Titolo 5"
        shortcut="5"
        prefix="#####"
        onToggle={onToggle}
      />
      <HeadingToggle
        editorRef={editorRef}
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
