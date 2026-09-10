import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevMarket — Temukan software yang sudah jadi",
  description: "Discover useful software, templates, SaaS and developer products made by independent builders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
