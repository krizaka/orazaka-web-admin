"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ChartsProvider } from "@krizaka/charts/provider";
import { MotionObserver } from "@krizaka/ui/motion";
import { ThemeProvider } from "@krizaka/ui/theme";
import { Toaster } from "@krizaka/ui/toast";

/**
 * The console's providers: the organisation's theme (dark by default, light and system on the toggle), the session,
 * the charts' settings (the Orazaka palette, figures in English), the motion conductor and the platform Toaster.
 */
export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider defaultMode="dark">
      <SessionProvider>
        <ChartsProvider locale="en-US" brand="orazaka">
          <MotionObserver />
          {children}
          <Toaster label="Notifications" closeLabel="Dismiss" />
        </ChartsProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
