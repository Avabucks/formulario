"use client";

import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const remarkPlugins = [remarkMath, remarkGfm];
const rehypePlugins = [rehypeKatex];

function InlineLatexParagraph({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <>{children}</>;
}

function InlineLatexCode({ children }: Readonly<{ children?: React.ReactNode }>) {
  return (
    <code className="rounded bg-foreground/8 px-1 py-0.5 font-mono text-[85%]">
      {children}
    </code>
  );
}

const inlineLatexComponents = {
  p: InlineLatexParagraph,
  code: InlineLatexCode,
};

export function InlineLatex({ children }: Readonly<{ children: string }>) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={inlineLatexComponents}
    >
      {children}
    </ReactMarkdown>
  );
}