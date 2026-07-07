"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";

export function MermaidBlock({ code }: Readonly<{ code: string }>) {
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
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "strict",
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
    const svgElement = ref.current?.querySelector("svg");
    if (!svgElement) return;

    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    const width = svgElement.viewBox.baseVal.width || svgElement.clientWidth;
    const height = svgElement.viewBox.baseVal.height || svgElement.clientHeight;
    clonedSvg.setAttribute("width", width.toString());
    clonedSvg.setAttribute("height", height.toString());

    const svgData = new XMLSerializer().serializeToString(clonedSvg);

    const uint8Array = new TextEncoder().encode(svgData);
    const binString = Array.from(uint8Array, (byte) =>
      String.fromCodePoint(byte),
    ).join("");
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
        ctx.fillStyle = resolvedTheme === "dark" ? "#1a1a1a" : "#ffffff";
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
          console.error(
            "Errore durante l'esportazione: il canvas è ancora tainted.",
            e,
          );
        }
      }
    };

    img.src = imgSource;
  };

  return (
    <div className="relative flex flex-col items-center bg-foreground/5 rounded-lg p-4 mb-5 w-full overflow-hidden border border-foreground/10">
      {loading && <Spinner />}

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

      <div ref={ref} className="flex justify-center w-full overflow-x-auto" />
    </div>
  );
}
