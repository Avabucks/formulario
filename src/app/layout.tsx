import packageJson from '@/package.json';
import { Toaster } from "@/src/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from "../components/theme/theme-provider";
import "../styles/editor.css";
import "../styles/globals.css";
import { UmamiTracker } from '../components/analytics/umami-tracker';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://formulario-five.vercel.app'),
  title: `${packageJson.displayName} - Formulario digitale`,
  description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        rel: 'manifest',
        url: '/manifest.json',
      },
    ],
  },
  openGraph: {
    title: `${packageJson.displayName} - Formulario digitale`,
    description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
    images: ["/social.png"],
  },
  twitter: {
    card: 'summary',
    title: `${packageJson.displayName} - Formulario digitale`,
    description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
  },
  appleWebApp: {
    title: `${packageJson.displayName}`,
    startupImage: [
      '/apple-icon.png',
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="9abb9d74-9441-448b-8b19-0c95429d510e"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen overflow-y-auto`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="var(--muted-foreground)"
            height={3}
            showSpinner={false}
          />
          <main className="flex flex-1 flex-col">
            {children}
          </main>
          <Toaster />
          <UmamiTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
