import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blauwdruk voor High Performance",
  description: "Persoonlijke groei- en reflectie-app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-[#0f1a14] text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
