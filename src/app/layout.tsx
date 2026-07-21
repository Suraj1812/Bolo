import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolo — Voice to Text",
  description:
    "Speak naturally, listen back, and copy your words with Bolo, an accessible voice-to-text app designed for simple communication.",
  applicationName: "Bolo",
  keywords: [
    "voice to text",
    "speech to text",
    "accessible communication",
    "voice typing",
    "text to speech",
  ],
  category: "accessibility",
  creator: "Bolo",
  publisher: "Bolo",
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Bolo",
    title: "Bolo — Voice to Text",
    description:
      "Speak naturally, listen back, and copy your words with one simple, accessible app.",
  },
  twitter: {
    card: "summary",
    title: "Bolo — Voice to Text",
    description:
      "Speak naturally, listen back, and copy your words with one simple, accessible app.",
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bolo",
  },
  icons: {
    icon: "/bolo-icon.svg",
    apple: "/bolo-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f5f7ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
