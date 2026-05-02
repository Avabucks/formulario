"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getIsActiveList, handleListToggle } from "@/src/lib/editor/formatting-utils";
import { Heading, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useRef, useState } from "react";

const getH1Regex = () => /^#\s(.+)$/gm;
const getH2Regex = () => /^##\s(.+)$/gm;
const getH3Regex = () => /^###\s(.+)$/gm;
const getH4Regex = () => /^####\s(.+)$/gm;
const getH5Regex = () => /^#####\s(.+)$/gm;
const getH6Regex = () => /^######\s(.+)$/gm;

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

    const handleToggleRef = useRef(() => { });
    handleToggleRef.current = () => {
        handleListToggle(
            editorRef,
            getIsActiveList(editorRef, getRegex),
            getRegex,
            (line) => {
                const stripped = line.replace(/^#{1,6}\s/, "");
                return `${prefix} ${stripped}`;
            },
            (line) => line.replace(new RegExp(String.raw`^${prefix}\s`), ""),
        );
        onToggle();
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log(e.key)
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === shortcut && isFocused) {
                e.preventDefault();
                handleToggleRef.current();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="outline"
                        onPressedChange={() => handleToggleRef.current()}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={label}
                        pressed={isActive && isFocused}
                        disabled={!isFocused}
                    >
                        <Icon size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent className="pr-1.5">
                    <div className="flex items-center gap-2">
                        {label}
                        <KbdGroup className="hidden md:flex">
                            <Kbd>Ctrl</Kbd>
                            <span>+</span>
                            <Kbd>Alt</Kbd>
                            <span>+</span>
                            <Kbd>{shortcut}</Kbd>
                        </KbdGroup>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function FormattingHeaders({
    _selection,
    editorRef,
    isFocused,
}: Readonly<{
    _selection: Selection | null;
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
}>) {
    const [open, setOpen] = useState(false);

    const anyActive =
        getIsActiveList(editorRef, getH1Regex) ||
        getIsActiveList(editorRef, getH2Regex) ||
        getIsActiveList(editorRef, getH3Regex) ||
        getIsActiveList(editorRef, getH4Regex) ||
        getIsActiveList(editorRef, getH5Regex) ||
        getIsActiveList(editorRef, getH6Regex);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Toggle
                    variant="outline"
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Heading"
                    pressed={anyActive && isFocused}
                    disabled={!isFocused}
                >
                    <Heading size={16} />
                </Toggle>
            </PopoverTrigger>
            <PopoverContent
                className="flex flex-row gap-2 w-fit"
                onMouseDown={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH1Regex}
                    icon={Heading1}
                    label="Heading 1"
                    shortcut="1"
                    prefix="#"
                    onToggle={() => setOpen(false)}
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH2Regex}
                    icon={Heading2}
                    label="Heading 2"
                    shortcut="2"
                    prefix="##"
                    onToggle={() => setOpen(false)}
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH3Regex}
                    icon={Heading3}
                    label="Heading 3"
                    shortcut="3"
                    prefix="###"
                    onToggle={() => setOpen(false)}
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH4Regex}
                    icon={Heading4}
                    label="Heading 4"
                    shortcut="4"
                    prefix="####"
                    onToggle={() => setOpen(false)}
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH5Regex}
                    icon={Heading5}
                    label="Heading 5"
                    shortcut="5"
                    prefix="#####"
                    onToggle={() => setOpen(false)}
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH6Regex}
                    icon={Heading6}
                    label="Heading 6"
                    shortcut="6"
                    prefix="######"
                    onToggle={() => setOpen(false)}
                />
            </PopoverContent>
        </Popover>
    );
}