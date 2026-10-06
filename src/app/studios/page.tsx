"use client";

import { useState } from "react";
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
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Studios</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Un Studio est une donnée : le workflow, ses étapes et ses formulaires s’écrivent ici et se
          publient sans déploiement.
        </p>
      </header>
      <div className="flex gap-2 border-b border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setTab("usage")}
          className={`h-8 px-3 text-sm ${tab === "usage" ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
        >
          Utilisation
        </button>
        <button
          type="button"
          onClick={() => setTab("builder")}
          className={`h-8 px-3 text-sm ${tab === "builder" ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
        >
          Éditeur
        </button>
      </div>

      {tab === "usage" ? <StudioAnalyticsScreen /> : <StudioBuilderScreen />}
    </main>
  );
}
