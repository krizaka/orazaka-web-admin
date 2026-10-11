"use client";

import { useState } from "react";
import { Tabs } from "@krizaka/ui/tabs";
import { StudioBuilderScreen } from "@/features/studio/components/StudioBuilderScreen";
import { StudioAnalyticsScreen } from "@/features/studio/components/StudioAnalyticsScreen";

/**
 * The Studio Builder console (ADR-034 §12.4).
 *
 * This page is the whole claim of the feature: shipping a new profession is an
 * admin action here, never a deploy.
 */
export default function StudiosPage() {
  // Usage opens first, like the billing console: an operator arriving here usually wants to know
  // whether the Studios they already published are working before authoring another.
  const [tab, setTab] = useState<"usage" | "builder">("usage");

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">Studios</h1>
        <p className="text-sm text-fg-muted">
          Un Studio est une donnée : le workflow, ses étapes et ses formulaires s’écrivent ici et se
          publient sans déploiement.
        </p>
      </header>
      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as "usage" | "builder")}>
        <Tabs.List aria-label="Studios">
          <Tabs.Trigger value="usage">Utilisation</Tabs.Trigger>
          <Tabs.Trigger value="builder">Éditeur</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="usage">
          <StudioAnalyticsScreen />
        </Tabs.Content>
        <Tabs.Content value="builder">
          <StudioBuilderScreen />
        </Tabs.Content>
      </Tabs.Root>
    </main>
  );
}
