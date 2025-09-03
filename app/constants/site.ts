import type { Metadata, Viewport } from "next";

export const siteConfig = {
  name: "Masjid Ulul Albaab",
  description:
    "Website resmi Masjid Ulul Albaab - Pusat kegiatan keislaman yang membina umat menuju masyarakat yang berakhlak mulia dan berilmu",
  keywords:
    "masjid, ulul albaab, DKM, islam, bandung, kajian, TPA, majelis taklim",
  url: process.env.NODE_ENV === "production"
    ? "https://ulul-albaab-website.vercel.app/"
    : "http://localhost:3000",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "DKM Masjid Ulul Albaab" }],
  creator: "DKM Masjid Ulul Albaab",
  publisher: "DKM Masjid Ulul Albaab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ulul Albaab",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - DKM Website`,
    description: siteConfig.description,
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
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
