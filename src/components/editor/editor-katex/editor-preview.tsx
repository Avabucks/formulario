"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function EditorPreview({ value }: Readonly<{ value: string }>) {

    const processedValue = value
        .replaceAll(/^(#{1,6})([^\s#])/gm, "$1 $2")
        .replaceAll(/\$\$([^\n]+?)\$\$/g, (_, math) => `\n$$\n${math}\n$$\n`);

    return (
        <div className="flex-1 p-3 h-full leading-loose">
            <ReactMarkdown
                remarkPlugins={[
                    remarkMath,
                    remarkBreaks
                ]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
            >
                {processedValue}
            </ReactMarkdown>
        </div>
    );
}

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-[1.8em] font-bold mb-4 mt-2 pb-[0.3em] border-b border-[#d1d9e0] dark:border-[#3d444d]">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-[1.3em] font-semibold mb-3 mt-2 pb-[0.3em] border-b border-[#d1d9e0] dark:border-[#3d444d]">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-[1.15em] font-semibold mb-2 mt-2">{children}</h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-[1em] font-semibold mb-2 mt-2">{children}</h4>
    ),
    h5: ({ children }) => (
        <h5 className="text-[0.875em] font-semibold mb-2 mt-2">{children}</h5>
    ),
    h6: ({ children }) => (
        <h6 className="text-[0.85em] font-semibold mb-2 mt-2 text-[#59636e] dark:text-[#9198a1]">
            {children}
        </h6>
    ),
    p: ({ children }) => (
        <p className="mb-4 leading-[1.75] text-base font-sans">{children}</p>
    ),
    ul: ({ children }) => (
        <ul className="list-disc pl-8 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal pl-8 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="leading-[1.75] text-[16px]">{children}</li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <del className="line-through">{children}</del>,
    hr: () => (
        <hr className="my-6 border-0 h-[4px] bg-[#d1d9e0] dark:bg-[#3d444d] rounded" />
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-[4px] border-[#d1d9e0] dark:border-[#3d444d] pl-4 my-4 text-[#59636e] dark:text-[#9198a1]">
            {children}
        </blockquote>
    ),
    code: ({ children, className }) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
            return (
                <code className={`block text-[14px] font-mono ${className}`}>
                    {children}
                </code>
            );
        }
        return (
            <code className="bg-[#afb8c133] dark:bg-[#3d444d] px-[0.4em] py-[0.2em] rounded-[6px] text-[85%] font-mono">
                {children}
            </code>
        );
    },
    pre: ({ children }) => (
        <pre className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d1d9e0] dark:border-[#3d444d] rounded-[6px] p-4 mb-4 overflow-auto text-[14px] font-mono leading-[1.45]">
            {children}
        </pre>
    ),
    img: ({ src, alt }) => (
        <img src={src} alt={alt} className="max-w-full my-4 rounded-[6px]" />
    ),
    table: ({ children }) => (
        <div className="overflow-auto mb-4">
            <table className="w-full border-collapse text-[16px]">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
        <tr className="border-t border-[#d1d9e0] dark:border-[#3d444d] even:bg-[#f6f8fa] dark:even:bg-[#161b22]">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="px-[13px] py-[6px] border border-[#d1d9e0] dark:border-[#3d444d] font-semibold text-left bg-[#f6f8fa] dark:bg-[#161b22]">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-[13px] py-[6px] border border-[#d1d9e0] dark:border-[#3d444d]">
            {children}
        </td>
    ),
};