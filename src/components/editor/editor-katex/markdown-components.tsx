"use client"

import { Check, Copy, Download, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from "lucide-react";
import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from "react";
import { useTheme } from 'next-themes';
import { Spinner } from "../../ui/spinner";
import { Button } from "../../ui/button";
import { toast } from "sonner";

export const CodeBlock = ({ className, children, node, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  // Caso 1: Mermaid
  if (language === 'mermaid') {
    return <MermaidBlock code={codeString} />;
  }

  // Caso 2: Blocco con linguaggio (SyntaxHighlighter)
  if (language) {
    return <SyntaxBlock language={language} codeString={codeString} />
  }

  // Caso 3: Blocco senza linguaggio (Multiriga)
  const isBlock = node?.position?.start.line !== node?.position?.end.line || codeString.includes("\n");

  if (isBlock) {
    return (
      <pre className="bg-foreground/8 border border-foreground/10 rounded-[6px] text-[#e36209] dark:text-[#e3b341] p-2 text-[85%] font-mono overflow-x-auto mb-5">
        <code>{children}</code>
      </pre>
    );
  }

  // Caso 4: Inline code
  return (
    <code
      className="bg-foreground/8 border border-foreground/10 text-[#e36209] dark:text-[#e3b341] px-1.5 py-0.5 rounded text-[85%] font-mono"
      {...props}
    >
      {children}
    </code>
  );
};

function SyntaxBlock({ language, codeString }: Readonly<{ language: string, codeString: string }>) {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === 'dark' ? oneDark : oneLight;

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    toast.success("Codice copiato con successo.", { position: "bottom-center" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 w-full rounded-lg border border-foreground/10 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-1 border-b border-b-foreground/10 bg-foreground/7">
        <span className="text-[12px] lowercase font-mono">{language}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <div className="relative bg-foreground/7">
        <SyntaxHighlighter
          language={language}
          style={mounted ? style : oneLight}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "13px",
            lineHeight: "1.6",
            background: "transparent",
          }}
          codeTagProps={{
            style: { textShadow: "none" },
            className: "font-mono",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

function MermaidBlock({ code }: Readonly<{ code: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const renderChart = async () => {
      if (!ref.current) return;

      setLoading(true);
      ref.current.innerHTML = "";

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        });

        const isValid = await mermaid.parse(code, { suppressErrors: true });

        if (isValid) {
          const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, code);

          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        }
      } catch (error: any) {
        console.warn("Mermaid error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    renderChart();
  }, [code, resolvedTheme]);

  const handleDownload = () => {
    const svgElement = ref.current?.querySelector('svg');
    if (!svgElement) return;

    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    const width = svgElement.viewBox.baseVal.width || svgElement.clientWidth;
    const height = svgElement.viewBox.baseVal.height || svgElement.clientHeight;
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());

    const svgData = new XMLSerializer().serializeToString(clonedSvg);

    const uint8Array = new TextEncoder().encode(svgData);
    const binString = Array.from(uint8Array, (byte) => String.fromCodePoint(byte)).join("");
    const svgBase64 = btoa(binString);
    const imgSource = `data:image/svg+xml;base64,${svgBase64}`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `diagramma-${Date.now()}.png`;
          downloadLink.click();
        } catch (e) {
          console.error("Errore durante l'esportazione: il canvas è ancora tainted.", e);
        }
      }
    };

    img.src = imgSource;
  };

  return (
    <div className="relative flex flex-col items-center bg-foreground/5 rounded-lg p-4 mb-5 w-full overflow-hidden border border-foreground/10">
      {loading && (
        <Spinner />
      )}

      {!loading && (
        <Button
          onClick={handleDownload}
          className="absolute top-2 right-2"
          size="icon"
          variant="outline"
        >
          <Download size={18} />
        </Button>
      )}

      <div
        ref={ref}
        className="flex justify-center w-full overflow-x-auto"
      />
    </div>
  );
}

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  icon: React.ElementType;
  size: number;
  className?: string;
}

const Heading = ({
  level,
  children,
  icon: Icon,
  size,
  className = ""
}: HeadingProps) => {
  const Tag = `h${level}` as any;

  const handleHover = (isEntering: any) => {
    const elements = document.querySelectorAll(`[data-heading-level="h${level}"]`);
    elements.forEach((el) => {
      if (isEntering) {
        el.classList.add("active-type");
      } else {
        el.classList.remove("active-type");
      }
    });
  };

  return (
    <div
      className="group relative"
      data-heading-level={`h${level}`}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      {/* Icona laterale */}
      <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity icon-indicator">
        <Icon size={size} />
      </span>

      {/* Sottolineatura */}
      <span className="absolute w-full h-px top-full mt-2 bg-foreground/50 opacity-0 group-hover:opacity-50 transition-opacity underline-indicator"></span>

      <Tag className={`${className} mb-6`}>
        {children}
      </Tag>
    </div>
  );
};

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <Heading level={1} icon={Heading1} size={23} className="text-[1.9em] font-bold leading-8">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading level={2} icon={Heading2} size={22} className="text-[1.5em] font-semibold leading-6">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading level={3} icon={Heading3} size={21} className="text-[1.2em] font-semibold leading-5">
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading level={4} icon={Heading4} size={19} className="text-[1em] font-semibold leading-4">
      {children}
    </Heading>
  ),
  h5: ({ children }) => (
    <Heading level={5} icon={Heading5} size={18} className="text-[0.875em] font-semibold leading-3">
      {children}
    </Heading>
  ),
  h6: ({ children }) => (
    <Heading level={6} icon={Heading6} size={18} className="text-[0.85em] font-semibold text-[#59636e] dark:text-[#9198a1] leading-3">
      {children}
    </Heading>
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
  code: CodeBlock,
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