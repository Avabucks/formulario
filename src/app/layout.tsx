import packageJson from "@/package.json";
import { Toaster } from "@/src/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { UmamiTracker } from "../components/analytics/umami-tracker";
import { ThemeProvider } from "../components/theme/theme-provider";
import "../styles/editor.css";
import "../styles/globals.css";
import AnalyticsLoader from "../components/analytics/google-analytics";
import DiscordWidget from "../components/home/discord-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app"),
  title: `${packageJson.displayName} - Formulario digitale`,
  description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
  keywords: [
    "formulari",
    "formule",
    "matematica",
    "fisica",
    "chimica",
    "formulario",
    "università",
    "scuola",
    "cheat sheet",
    "LaTeX",
    "generatore formule",
    "AI",
    "studiare",
  ],
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        rel: "manifest",
        url: "/manifest.json",
      },
    ],
  },
  openGraph: {
    title: `${packageJson.displayName} - Formulario digitale`,
    description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: `${packageJson.displayName} - Formulario digitale`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${packageJson.displayName} - Formulario digitale`,
    description: `Crea, organizza e condividi i tuoi formulari e cheat sheet con ${packageJson.displayName}. Usa l'editor avanzato e l'assistente AI per generare formule e appunti in pochi secondi.`,
    images: ["/social.png"],
  },
  appleWebApp: {
    title: `${packageJson.displayName}`,
    startupImage: ["/apple-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_APP_ID}
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
          <main className="flex flex-1 flex-col">{children}</main>
          <DiscordWidget />
          <Toaster />
          <UmamiTracker />
          <AnalyticsLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
