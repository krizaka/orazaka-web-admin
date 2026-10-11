import type { Metadata } from "next";
import { ThemeScript } from "@krizaka/ui/theme";
import { Providers } from "@/core/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orazaka Operations",
  description: "Supervise and govern your Orazaka platform: usage, credits, prices and Studios.",
};

/** The console's root: the theme applied before the first paint (dark by default), then the providers. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript defaultMode="dark" />
      </head>
      <body className="min-h-screen bg-surface-0 text-fg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
