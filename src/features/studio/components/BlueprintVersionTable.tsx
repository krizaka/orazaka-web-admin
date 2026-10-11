"use client";

import { useState } from "react";
import { StudioAdminApi } from "@/services/studio.admin.api";
import type { BlueprintVersion } from "@krizaka/orazaka-shared";

interface BlueprintVersionTableProps {
  studioKey: string;
  versions: BlueprintVersion[];
  onChanged: () => void;
}

/**
 * The version history, with publish and deprecate.
 *
 * Deprecate never deletes: a run records the version it executed, and removing that
 * row would destroy its reproducibility (ADR-034 §4.6). The button says so.
 */
export function BlueprintVersionTable({
  studioKey,
  versions,
  onChanged,
}: Readonly<BlueprintVersionTableProps>) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (version: string, action: () => Promise<void>) => {
    setBusy(version);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Échec");
    } finally {
      setBusy(null);
    }
  };

  if (versions.length === 0) {
    return <p className="text-sm text-fg-muted">Aucune version pour ce Studio.</p>;
  }

  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wide text-fg-muted">Versions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-fg-muted">
            <th className="py-1">Version</th>
            <th>Statut</th>
            <th>Crédits</th>
            <th>Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {versions.map((version) => (
            <tr key={version.version} className="border-t border-border-subtle">
              <td className="py-2 font-mono text-[12px]">{version.version}</td>
              <td>
                <span
                  className={
                    version.status === "PUBLISHED"
                      ? "text-fg-success"
                      : "text-fg-muted"
                  }
                >
                  {version.status}
                </span>
              </td>
              <td>{version.estimatedCredits}</td>
              <td className="max-w-[280px] truncate text-fg-secondary">
                {version.changelog ?? "—"}
              </td>
              <td className="space-x-2 text-right">
                {version.status === "DRAFT" && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      void act(version.version, () =>
                        StudioAdminApi.publish(studioKey, version.version),
                      )
                    }
                    className="text-xs text-accent disabled:opacity-50"
                  >
                    Publier
                  </button>
                )}
                {version.status === "PUBLISHED" && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    title="La version reste exécutable pour les installations qui l'ont épinglée"
                    onClick={() =>
                      void act(version.version, () =>
                        StudioAdminApi.deprecate(studioKey, version.version),
                      )
                    }
                    className="text-xs text-fg-muted disabled:opacity-50"
                  >
                    Déprécier
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="whitespace-pre-wrap text-sm text-fg-danger">{error}</p>}
    </section>
  );
}
