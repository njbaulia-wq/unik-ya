import type { Metadata } from "next";
import { Header, Footer } from "@/components/Header";

export const metadata: Metadata = {
  title: "DevMarket — Temukan software yang sudah jadi",
  description: "Discover useful software, templates, SaaS and developer products made by independent builders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a href="#konten" className="sr-only focus:not-sr-only">
          Lewati ke konten
        </a>
        <Header />
        <div id="konten">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
