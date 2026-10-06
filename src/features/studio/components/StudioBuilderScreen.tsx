"use client";

import { useEffect, useState } from "react";
import { StudioAdminApi } from "@/services/studio.admin.api";
import { useStudioAdmin } from "@/features/studio/hooks/useStudioAdmin";
import { BlueprintEditor } from "@/features/studio/components/BlueprintEditor";
import { BlueprintVersionTable } from "@/features/studio/components/BlueprintVersionTable";

/**
 * The Studio Builder.
 *
 * Three panes, as ADR-034 §12.4 describes: the catalogue on the left, the selected
 * Studio's version history, and the authoring editor. The history sits above the
 * editor deliberately — the first question an author has is "what is live right
 * now", and publishing without that answer is how a working version gets replaced
 * by accident.
 */
export function StudioBuilderScreen() {
  const { studios, versions, selected, select, isLoading, error, reloadVersions } =
    useStudioAdmin();
  const [featureKeys, setFeatureKeys] = useState<string[]>([]);

  useEffect(() => {
    // A best-effort list: the picker is a convenience, and the server is what actually
    // refuses a step naming a capability that does not exist.
    const timer = setTimeout(
      () => void StudioAdminApi.featureKeys().then(setFeatureKeys).catch(() => setFeatureKeys([])),
      0,
    );
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Chargement du catalogue…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="space-y-1">
        {studios.map((studio) => (
          <button
            key={studio.studioKey}
            type="button"
            onClick={() => select(studio.studioKey)}
            className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
              selected === studio.studioKey
                ? "bg-[var(--surface-2)] font-semibold text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {studio.label}
            <span className="block font-mono text-[10px] text-[var(--text-muted)]">
              {studio.studioKey}
            </span>
          </button>
        ))}
        {studios.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">Aucun Studio au catalogue.</p>
        )}
      </nav>

      <div className="space-y-6">
        {error && <p className="text-sm text-[var(--status-error)]">{error}</p>}

        {selected && (
          <>
            <BlueprintVersionTable
              studioKey={selected}
              versions={versions}
              onChanged={reloadVersions}
            />
            <BlueprintEditor
              studioKey={selected}
              featureKeys={featureKeys}
              onSaved={reloadVersions}
            />
          </>
        )}
      </div>
    </div>
  );
}
