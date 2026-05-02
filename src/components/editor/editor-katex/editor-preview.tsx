"use client";

import "katex/dist/katex.min.css";
import { useId, useMemo, memo, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import { markdownComponents } from "./markdown-components";
import remarkGfm from "remark-gfm";
import { Spinner } from "../../ui/spinner";

const remarkPlugins = [remarkMath, remarkBreaks, remarkGfm];
const rehypePlugins = [rehypeKatex];

export const EditorPreview = memo(function EditorPreview({ markdownContent }: Readonly<{ markdownContent: string }>) {
    const patternId = `cross-${useId()}`;
    const [loading, setLoading] = useState(true)

    const processedContent = useMemo(() =>
        markdownContent.replaceAll(/\$\$([^\n]+?)\$\$/g, (_, math) => `\n$$\n${math}\n$$\n`),
        [markdownContent]
    );

    useEffect(() => setLoading(false))
    if (loading) return (
        <div className="flex items-center justify-center flex-1 h-full w-full min-w-fit">
            <Spinner />
        </div>
    )

    return (
        <div className="relative flex-1 h-full w-full min-w-fit">
            <div className="editor p-9 min-h-full w-full leading-loose relative">
                <svg
                    className="absolute inset-0 h-full w-full opacity-[0.08] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <pattern id={patternId} width="22" height="22" patternUnits="userSpaceOnUse">
                            <path d="M16 0v22M0 16h22" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </svg>
                <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={markdownComponents}
                >
                    {processedContent}
                </ReactMarkdown>
            </div>
        </div>
    );
});