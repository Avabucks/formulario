import { useQRCode } from 'next-qrcode';

export function Qr({ text }: Readonly<{ text: string }>) {
    const { SVG: SvgQrCode } = useQRCode();

    return (
        <div className="rounded-xl overflow-hidden">
            <SvgQrCode
                text={text}
                options={{
                    margin: 3,
                    scale: 5,
                    width: 150,
                    color: {
                        dark: '#000000',
                        light: '#ffffff',
                    },
                }}
            />
        </div>
    );
}