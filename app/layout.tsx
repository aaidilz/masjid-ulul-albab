import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { metadata, viewport } from "./constants/site";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
