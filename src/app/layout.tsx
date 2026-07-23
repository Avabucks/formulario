import packageJson from "@/package.json";
import { Toaster } from "@/src/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "../components/theme/theme-provider";
import "../styles/editor.css";
import "../styles/globals.css";
import DiscordWidget from "../components/shared/discord-widget";
import { CookieConsent } from "../components/legal/cookie-consent";
import { Header } from "../components/navigation/header";
import { HeaderWrapper } from "../components/navigation/header-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://formulario-five.vercel.app",
  ),
  title: `${packageJson.displayName} - Knowledge Stack`,
  description: `Impila i tuoi progetti come uno stack di memoria, naviga tra alberi concettuali ordinati ed elabora tutto con l'assistente AI`,
  keywords: [
    "knowledge stack",
    "stack",
    "sezioni",
    "pagine",
    "appunti",
    "note",
    "dev log",
    "workspace",
    "secondo cervello",
    "assistente AI",
    "markdown editor",
    "community",
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
    title: `${packageJson.displayName} - Knowledge Stack`,
    description: `Impila i tuoi progetti come uno stack di memoria, naviga tra alberi concettuali ordinati ed elabora tutto con l'assistente AI`,
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: `${packageJson.displayName} - Knowledge Stack`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${packageJson.displayName} - Knowledge Stack`,
    description: `Impila i tuoi progetti come uno stack di memoria, naviga tra alberi concettuali ordinati ed elabora tutto con l'assistente AI`,
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
      <head />
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
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <main className="flex flex-1 flex-col">{children}</main>
          <DiscordWidget />
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
