import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-[1.9em] leading-12 font-bold">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[1.5em] font-bold">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[1.2em] font-bold">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-[1em] font-bold">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-[0.875em] font-semibold">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-[0.85em] font-semibold text-[#59636e] dark:text-[#9198a1]">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="leading-normal text-base font-sans my-1.5">{children}</p>
  ),
  ul: ({ children }) => <ul className="list-disc pl-9 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-8 mb-4 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-[1.75] text-[16px]">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  hr: () => <hr className="my-4 border-0 h-0.5 bg-foreground/20 rounded" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-foreground/50 pl-4 py-1 my-4 text-foreground/50 bg-foreground/5">
      {children}
    </blockquote>
  ),
  code: ({ className, children, node, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    // Blocco con linguaggio → SyntaxHighlighter
    if (language) {
      return (
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            fontSize: "14px",
            borderRadius: "6px",
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
        <pre className="bg-foreground/8 rounded-[6px] text-[#e36209] dark:text-[#e3b341] p-2 text-[85%] font-mono overflow-x-auto my-2">
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
      className="text-muted-foreground cursor-not-allowed"
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
  th: ({ children }) => (
    <th className="px-3.25 py-1.5 border border-[#d1d9e0] dark:border-[#3d444d] font-semibold text-left bg-[#f6f8fa] dark:bg-[#161b22]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3.25 py-1.5 border border-[#d1d9e0] dark:border-[#3d444d]">{children}</td>
  ),
};

// TODO: checkbox