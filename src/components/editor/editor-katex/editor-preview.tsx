"use client";

import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Toggle } from "@/src/components/ui/toggle";
import "katex/dist/katex.min.css";
import { Maximize2, Scan, ZoomIn, ZoomOut } from "lucide-react";
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { markdownComponents } from "./markdown-components";

const remarkPlugins = [remarkMath, remarkBreaks, remarkGfm];
const rehypePlugins = [rehypeKatex];

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;

export const EditorPreview = memo(function EditorPreview({
    markdownContent,
}: Readonly<{ markdownContent: string }>) {
    const patternId = `cross-${useId()}`;
    const [scale, setScale] = useState(1);
    const [fitMode, setFitMode] = useState<"manual" | "fit">("manual");
    const containerRef = useRef<HTMLDivElement>(null);

    const processedContent = useMemo(() => {
        return markdownContent.replaceAll(
            /(^[ \t]*)(\$\$)([\s\S]*?)(\$\$)/gm,
            (_, indent, _open, math, _close) => {
                const cleaned = math.trim();
                const indentedMath = cleaned
                    .split("\n")
                    .map((line: string) => indent + "    " + line)
                    .join("\n");
                return `${indent}$$\n${indentedMath}\n${indent}$$`;
            }
        );
    }, [markdownContent]);

    const computeFitScale = useCallback(() => {
        if (!containerRef.current) return 1;
        const self = containerRef.current.getBoundingClientRect().width;
        const parent = containerRef.current.parentElement?.getBoundingClientRect().width ?? 0;
        const win = window.innerWidth;
        const width = self || parent || win;
        if (width === 0) return 1;
        const padding = width < 640 ? 24 : 64;
        return Math.max(ZOOM_MIN, (width - padding) / A4_WIDTH_PX);
    }, []);

    useEffect(() => {
        if (fitMode !== "fit") return;
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => setScale(computeFitScale()));
        observer.observe(el);
        setScale(computeFitScale());
        return () => observer.disconnect();
    }, [fitMode, computeFitScale]);

    useEffect(() => {
        const init = () => {
            const width = containerRef.current?.getBoundingClientRect().width ?? 0;
            if (width === 0) return;
            if (A4_WIDTH_PX > width) {
                handleFitWidth();
            } else {
                setScale(1);
                setFitMode("manual");
            }
        };

        requestAnimationFrame(() => requestAnimationFrame(init));
    }, []);

    const handleZoomOut = () => {
        setFitMode("manual");
        setScale((s) => Math.max(ZOOM_MIN, Number.parseFloat((s - ZOOM_STEP).toFixed(2))));
    };

    const handleZoomIn = () => {
        setFitMode("manual");
        setScale((s) => Math.min(ZOOM_MAX, Number.parseFloat((s + ZOOM_STEP).toFixed(2))));
    };

    const handleZoom100 = () => {
        setFitMode("manual");
        setScale(1);
    };

    const handleFitWidth = () => {
        setFitMode("fit");
        setScale(computeFitScale());
    };

    return (
        <div className="flex flex-col flex-1 h-full w-full min-w-0 overflow-hidden relative">

            <div
                ref={containerRef}
                className="flex-1 overflow-auto"
                style={{ backgroundColor: "hsl(var(--sidebar-background, var(--secondary)))" }}
            >
                <div
                    className="py-10 pb-24"
                    style={{ minWidth: A4_WIDTH_PX * scale }}
                >
                    <div
                        style={{
                            width: A4_WIDTH_PX * scale,
                            marginLeft: "auto",
                            marginRight: "auto",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: A4_WIDTH_PX,
                                height: A4_HEIGHT_PX,
                                paddingBottom: 48,
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                                position: "absolute",
                                top: 0,
                                left: 0,
                            }}
                        >
                            <div className="relative w-full min-h-full bg-background border border-border overflow-hidden">
                                {/* Grid pattern */}
                                <svg
                                    className="absolute inset-0 h-full w-full opacity-[0.08] pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <pattern
                                            id={patternId}
                                            width="22"
                                            height="22"
                                            patternUnits="userSpaceOnUse"
                                        >
                                            <path
                                                d="M16 0v22M0 16h22"
                                                stroke="currentColor"
                                                strokeWidth="0.5"
                                                fill="none"
                                            />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                                </svg>

                                <div className="editor p-9 leading-loose relative">
                                    <ReactMarkdown
                                        remarkPlugins={remarkPlugins}
                                        rehypePlugins={rehypePlugins}
                                        components={markdownComponents}
                                    >
                                        {processedContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Floating zoom toolbar — bottom center */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-lg border bg-background/90 backdrop-blur-sm">
                        {/* Zoom controls */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={scale <= ZOOM_MIN}
                            aria-label="Zoom out"
                            className="h-7 w-7 p-0"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>

                        <span className="min-w-13 text-center text-xs tabular-nums text-muted-foreground select-none px-1">
                            {Math.round(scale * 100)}%
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={scale >= ZOOM_MAX}
                            aria-label="Zoom in"
                            className="h-7 w-7 p-0"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>

                        <Separator orientation="vertical" className="mx-0.5 h-4" />

                        {/* Fit / 100% — toggles mutuamente esclusivi */}
                        <Toggle
                            size="sm"
                            pressed={fitMode === "fit"}
                            onPressedChange={(pressed) => pressed ? handleFitWidth() : handleZoom100()}
                            aria-label="Fit width"
                            className="h-7 px-2 gap-1 text-xs"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                            Fit
                        </Toggle>

                        <Toggle
                            size="sm"
                            pressed={fitMode === "manual" && scale === 1}
                            onPressedChange={(pressed) => pressed ? handleZoom100() : setFitMode("manual")}
                            aria-label="Zoom to 100%"
                            className="h-7 px-2 gap-1 text-xs"
                        >
                            <Scan className="h-3.5 w-3.5" />
                            100%
                        </Toggle>
                    </div>
                </div>
            </div>
        </div>
    );
});