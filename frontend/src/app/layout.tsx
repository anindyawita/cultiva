import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Cultiva — AI-Powered Smart Agriculture Platform",
  description:
    "Transform farming with artificial intelligence. AI crop recommendation, harvest prediction, IoT monitoring, and real-time analytics for next-generation agriculture.",
  keywords: [
    "AI agriculture",
    "smart farming",
    "crop prediction",
    "IoT farming",
    "precision agriculture",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Tambahkan link font jika ingin menggunakan Google Fonts di sini */}
      </head>
      <body>{children}</body>
    </html>
  );
}
