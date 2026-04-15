import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from "lucide-react";
import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from 'mermaid';
import { useEffect, useRef } from "react";
import { useTheme } from 'next-themes';

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
    });
    mermaid.render(`mermaid-${Date.now()}`, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    });
  }, [code, resolvedTheme]);

  return (
    <div className="flex justify-center items-center bg-foreground/5 rounded-lg p-4 mb-5">
      <div ref={ref} />
    </div>
  );
}

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading1 size={23} />
      </span>
      <h1 className="text-[1.9em] font-bold leading-8 mb-6">
        {children}
      </h1>
    </div>
  ),
  h2: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading2 size={22} />
      </span>
      <h2 className="text-[1.5em] font-semibold leading-6 mb-6">
        {children}
      </h2>
    </div>
  ),
  h3: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading3 size={21} />
      </span>
      <h3 className="text-[1.2em] font-semibold leading-5 mb-6">
        {children}
      </h3>
    </div>
  ),
  h4: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading4 size={19} />
      </span>
      <h4 className="text-[1em] font-semibold leading-4 mb-6">
        {children}
      </h4>
    </div>
  ),
  h5: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading5 size={18} />
      </span>
      <h5 className="text-[0.875em] font-semibold leading-3 mb-6">
        {children}
      </h5>
    </div>
  ),
  h6: ({ children }) => (
    <div className="group relative">
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <Heading6 size={18} />
      </span>
      <h6 className="text-[0.85em] font-semibold text-[#59636e] dark:text-[#9198a1] leading-3 mb-6">
        {children}
      </h6>
    </div>
  ),
  p: ({ children }) => (
    <p className="leading-normal text-base font-sans mb-4">{children}</p>
  ),
  ul: ({ children }) => <ul className="list-disc pl-9 space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal [&>li::marker]:font-bold pl-9 space-y-2 mb-4">{children}</ol>,
  li: ({ children }) => <li className="leading-9 text-[1rem]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  hr: () => <hr className="mb-5 border-0 h-0.5 bg-foreground/20 rounded" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-foreground/30 pl-4 py-2 mb-5 text-foreground/70 bg-foreground/5 [&>p]:m-0 [&>p]:p-0 [&>p]:inline">
      {children}
    </blockquote>
  ),
  code: ({ className, children, node, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    if (language === 'mermaid') {
      return <MermaidBlock code={String(children).replace(/\n$/, "")} />;
    }

    // Blocco con linguaggio → SyntaxHighlighter
    if (language) {
      return (
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            fontSize: "14px",
            borderRadius: "6px",
            marginBottom: "calc(var(--spacing) * 5)",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }

    const isBlock = node?.position?.start.line !== node?.position?.end.line
      || String(children).includes("\n");

    if (isBlock) {
      return (
        <pre className="bg-foreground/8 rounded-[6px] text-[#e36209] dark:text-[#e3b341] p-2 text-[85%] font-mono overflow-x-auto mb-5">
          <code>{children}</code>
        </pre>
      );
    }

    return (
      <code
        className="bg-foreground/8 text-[#e36209] dark:text-[#e3b341] px-1.5 py-0.5 rounded text-[85%] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full my-4 rounded-[6px]" />,
  a: ({ href, children }) => (
    <span
      title={href}
      className="text-muted-foreground cursor-not-allowed mb-4"
    >
      {children}
    </span>
  ),
  table: ({ children }) => (
    <div className="overflow-auto mb-4">
      <table className="w-full border-collapse text-[16px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-t border-[#d1d9e0] dark:border-[#3d444d]">
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="px-3.25 py-1.5 border border-[#d1d9e0] dark:border-[#3d444d] font-semibold text-left bg-[#f6f8fa] dark:bg-[#161b22]"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      className="px-3.25 py-1.5 border border-[#d1d9e0] dark:border-[#3d444d]"
    >
      {children}
    </td>
  ),
};

// TODO: checkbox