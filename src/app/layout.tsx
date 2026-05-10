import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Council V1 | Expert Multi-Agent Reasoning",
  description: "A lightweight, browser-based multi-agent reasoning system optimized for low-end hardware.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
