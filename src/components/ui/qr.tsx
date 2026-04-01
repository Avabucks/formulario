"use client"

import { Check, Copy, Download } from 'lucide-react';
import { useQRCode } from 'next-qrcode';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

export function Qr({ link, title }: Readonly<{ link: string, title: string }>) {
    const { SVG: SvgQrCode } = useQRCode();
    const [copied, setCopied] = useState(false)
    const svgRef = useRef<HTMLDivElement | null>(null);

    const downloadQrPng = () => {
        if (!svgRef.current) return;

        const svg = svgRef.current.querySelector("svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        const svgBlob = new Blob([svgString], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = async () => {
            const padding = 20;
            const lineHeight = 22;
            const maxWidth = img.width - 20;

            const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2)');
            await font.load();
            document.fonts.add(font);

            // Calcola le righe prima di creare il canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCtx.font = 'bold 16px Inter';
            const lines = wrapText(tempCtx, title, maxWidth);

            const textHeight = lines.length * lineHeight + padding;

            canvas.width = img.width;
            canvas.height = img.height + textHeight + padding;

            ctx?.drawImage(img, 0, 0);

            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, img.height, canvas.width, textHeight + padding);

                ctx.fillStyle = '#000000';
                ctx.font = 'bold 16px Inter';
                ctx.textAlign = 'center';

                lines.forEach((line, i) => {
                    ctx.fillText(line, canvas.width / 2, img.height + padding + (i + 1) * lineHeight);
                });
            }

            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${title}.png`;
            link.click();
        };

        img.src = url;
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(link)
        setCopied(true)
        toast.success("Link copiato con successo.", { position: "bottom-center" })
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex mb-3 pl-2">
            <div className="flex flex-1 flex-col gap-4">
                <Label>Condividi il tuo formulario</Label>
                <div className="flex items-center gap-2 w-full">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={link}
                            readOnly
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="rounded-xl overflow-hidden mx-auto" ref={svgRef}>
                        <SvgQrCode
                            text={link}
                            options={{
                                margin: 3,
                                scale: 5,
                                width: 200,
                                color: {
                                    dark: '#000000',
                                    light: '#ffffff',
                                },
                            }}
                        />
                    </div>
                    <Button variant="outline" onClick={downloadQrPng}>
                        <Download size={16} /> Download QR
                    </Button>
                </div>
            </div>
        </div>
    );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}