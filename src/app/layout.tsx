import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orazaka SecOps Console",
  description: "Orazaka Administration & Security Operations Console",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
