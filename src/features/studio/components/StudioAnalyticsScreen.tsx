"use client";

import { useEffect, useState } from "react";
import { DataTable, type DataTableColumn } from "@krizaka/ui/data-table";
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
    return <p className="text-sm text-fg-muted">Chargement…</p>;
  }
  if (error) {
    return <p className="text-sm text-fg-danger">{error}</p>;
  }

  return (
    <DataTable
      caption="Usage des Studios"
      rows={rows}
      columns={COLUMNS}
      getRowId={(row) => row.studioKey}
      labels={{ loading: "Lecture de l'usage", empty: "Aucun Studio mesuré." }}
    />
  );
}

// Below half the runs succeeding, a Studio is a support queue rather than a product.
const isHealthy = (row: StudioUsageRow) => row.runs > 0 && row.successRate >= 0.5;

const COLUMNS: DataTableColumn<StudioUsageRow>[] = [
  {
    id: "label",
    header: "Studio",
    sortable: true,
    card: "title",
    cell: (row) => (
      <>
        {row.label}
        <span className="block font-mono text-[10px] text-fg-muted">{row.studioKey}</span>
      </>
    ),
  },
  { id: "installations", header: "Installations", sortable: true, align: "end" },
  {
    id: "runs",
    header: "Exécutions",
    sortable: true,
    align: "end",
    cell: (row) => (
      <>
        {row.runs}
        {row.failed > 0 && <span className="text-fg-danger"> ({row.failed} échecs)</span>}
      </>
    ),
  },
  {
    id: "successRate",
    header: "Réussite",
    sortable: true,
    align: "end",
    cell: (row) => (
      <span className={isHealthy(row) ? "text-fg-success" : "text-fg-muted"}>
        {row.runs === 0 ? "—" : `${Math.round(row.successRate * 100)} %`}
      </span>
    ),
  },
  { id: "estimatedCredits", header: "Crédits / exéc.", sortable: true, align: "end" },
  {
    id: "installedButUnused",
    header: "",
    cell: (row) =>
      row.installedButUnused ? (
        <span
          title="Installé puis jamais lancé — le signal de churn le plus net du produit"
          className="text-[11px] text-fg-warning"
        >
          installé, jamais lancé
        </span>
      ) : null,
  },
];
