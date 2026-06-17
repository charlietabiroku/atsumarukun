import type { Metadata } from "next";
import { ReactNode } from "react";
import { routing } from "@/lib/i18n/routing";
import "./globals.css";

export const metadata: Metadata = {
  title: "集丸くん",
  description: "集まる日、すぐ決まる。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang={routing.defaultLocale}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
