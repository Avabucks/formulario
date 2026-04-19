"use client";

import { Kbd, KbdGroup } from "@/src/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Toggle } from "@/src/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { getIsActive, handleFormattingToggle } from "@/src/lib/formatting-utils";
import { Heading, Heading1, Heading2, Heading3 } from "lucide-react";
import type { editor, Selection } from "monaco-editor";
import { useEffect, useRef } from "react";

const getH1Regex = () => /^#\s(.+)$/gm;
const getH2Regex = () => /^##\s(.+)$/gm;
const getH3Regex = () => /^###\s(.+)$/gm;

function HeadingToggle({
    editorRef,
    isFocused,
    getRegex,
    wrap,
    unwrap,
    icon: Icon,
    label,
    shortcut,
}: Readonly<{
    editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
    isFocused: boolean;
    getRegex: () => RegExp;
    wrap: (text: string) => string;
    unwrap: (match: RegExpExecArray) => string;
    icon: React.ElementType;
    label: string;
    shortcut: string;
}>) {
    const isActive = getIsActive(editorRef, getRegex);

    const handleToggleRef = useRef(() => { });
    handleToggleRef.current = () =>
        handleFormattingToggle(
            editorRef,
            getIsActive(editorRef, getRegex),
            getRegex,
            wrap,
            unwrap,
            (trimStart, text) => trimStart + text.length + wrap("").length / 2,
            (matchIndex, match) => matchIndex + match[1].length,
        );

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
    const anyActive =
        getIsActive(editorRef, getH1Regex) ||
        getIsActive(editorRef, getH2Regex) ||
        getIsActive(editorRef, getH3Regex);

    return (
        <Popover>
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
                className="flex gap-1 w-fit"
                onMouseDown={(e) => e.preventDefault()}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH1Regex}
                    wrap={(text) => `# ${text}`}
                    unwrap={(match) => match[1]}
                    icon={Heading1}
                    label="Heading 1"
                    shortcut="1"
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH2Regex}
                    wrap={(text) => `## ${text}`}
                    unwrap={(match) => match[1]}
                    icon={Heading2}
                    label="Heading 2"
                    shortcut="2"
                />
                <HeadingToggle
                    editorRef={editorRef}
                    isFocused={isFocused}
                    getRegex={getH3Regex}
                    wrap={(text) => `### ${text}`}
                    unwrap={(match) => match[1]}
                    icon={Heading3}
                    label="Heading 3"
                    shortcut="3"
                />
            </PopoverContent>
        </Popover>
    );
}