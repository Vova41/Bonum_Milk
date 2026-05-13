import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeMilk — Мониторинг молока",
  description: "Система мониторинга молока во время транспортировки",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
