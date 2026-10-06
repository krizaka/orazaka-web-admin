"use client";

import { useEffect, useState } from "react";
import { StudioAdminApi, type StudioUsageRow } from "@/services/studio.admin.api";

/**
 * How the marketplace is actually performing (design §14).
 *
 * Sorted busiest first by the server, and rows with no runs are kept rather than
 * filtered: a Studio installed by four people and run by none is the single most
 * actionable line on this screen, and hiding it would leave the operator looking at
 * only the products that already work.
 */
export function StudioAnalyticsScreen() {
  const [rows, setRows] = useState<StudioUsageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        void StudioAdminApi.analytics()
          .then(setRows)
          .catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Chargement impossible"),
          )
          .finally(() => setLoading(false)),
      0,
    );
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Chargement…</p>;
  }
  if (error) {
    return <p className="text-sm text-[var(--status-error)]">{error}</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[var(--text-muted)]">
          <th className="py-1">Studio</th>
          <th>Installations</th>
          <th>Exécutions</th>
          <th>Réussite</th>
          <th>Crédits / exéc.</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <StudioAnalyticsRow key={row.studioKey} row={row} />
        ))}
      </tbody>
    </table>
  );
}

interface StudioAnalyticsRowProps {
  row: StudioUsageRow;
}

/** One measured Studio. A sub-component so the table above stays a table. */
function StudioAnalyticsRow({ row }: Readonly<StudioAnalyticsRowProps>) {
  // Below half the runs succeeding, a Studio is a support queue rather than a product.
  const healthy = row.runs > 0 && row.successRate >= 0.5;

  return (
    <tr className="border-t border-[var(--border-subtle)]">
      <td className="py-2">
        {row.label}
        <span className="block font-mono text-[10px] text-[var(--text-muted)]">
          {row.studioKey}
        </span>
      </td>
      <td>{row.installations}</td>
      <td>
        {row.runs}
        {row.failed > 0 && (
          <span className="text-[var(--status-error)]"> ({row.failed} échecs)</span>
        )}
      </td>
      <td className={healthy ? "text-[var(--status-success)]" : "text-[var(--text-muted)]"}>
        {row.runs === 0 ? "—" : `${Math.round(row.successRate * 100)} %`}
      </td>
      <td>{row.estimatedCredits}</td>
      <td className="text-right">
        {row.installedButUnused && (
          <span
            title="Installé puis jamais lancé — le signal de churn le plus net du produit"
            className="text-[11px] text-[var(--status-warning)]"
          >
            installé, jamais lancé
          </span>
        )}
      </td>
    </tr>
  );
}
