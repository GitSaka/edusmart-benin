import "./globals.css";
import { Metadata, Viewport } from "next";
import TopLoader from "@/components/TopLoader";
import SonnerProvider from "@/components/SonnerProvider";
import OfflineProvider from "@/lib/offline/providers/OfflineProvider";

export const metadata: Metadata = {
  title: "EduSmart Bénin",
  description: "Plateforme éducative moderne pour l'excellence au Bénin",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduSmart",
  },

  formatDetection: {
    telephone: false,
  },

  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e1" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>

      <body className="antialiased">
        <TopLoader />
        <SonnerProvider />
        <OfflineProvider>
        {children}
        </OfflineProvider>
      </body>
    </html>
  );
}