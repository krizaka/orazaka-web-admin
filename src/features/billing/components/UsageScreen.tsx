"use client";

import { useEffect, useState } from "react";
import { Badge } from "@krizaka/ui/badge";
import { DataTable, type DataTableColumn } from "@krizaka/ui/data-table";
import { formatCredits, type CapabilityUsage } from "@krizaka/orazaka-shared";
import { BillingAdminApi } from "@/services/billing.admin.api";

/** Above this share of attempts refused, the pricing is the suspect, not the users. */
const CONCERNING_REFUSAL_RATE = 15;

const refusalRate = (row: CapabilityUsage) => {
  const attempts = row.events + row.refusals;
  return attempts === 0 ? 0 : (row.refusals / attempts) * 100;
};

/** Credits per GPU second, or null: unmeasured and free are different claims. */
const margin = (row: CapabilityUsage) => (row.gpuSeconds && row.gpuSeconds > 0 ? row.creditsCharged / row.gpuSeconds : null);

const COLUMNS: DataTableColumn<CapabilityUsage>[] = [
  { id: "capability", header: "Capacité", sortable: true, card: "title" },
  { id: "modelName", header: "Modèle", sortable: true, value: (row) => row.modelName ?? "—" },
  { id: "events", header: "Requêtes", sortable: true, align: "end" },
  { id: "creditsCharged", header: "Crédits", sortable: true, align: "end", cell: (row) => formatCredits(row.creditsCharged) },
  {
    id: "refusals",
    header: "Refus",
    sortable: true,
    align: "end",
    cell: (row) => `${row.refusals}${row.enforcedRefusals > 0 ? ` (${row.enforcedRefusals} appliqués)` : ""}`,
  },
  {
    id: "rate",
    header: "Taux",
    sortable: true,
    align: "end",
    value: refusalRate,
    cell: (row) => <Badge tone={refusalRate(row) >= CONCERNING_REFUSAL_RATE ? "warning" : "neutral"}>{refusalRate(row).toFixed(1)}%</Badge>,
  },
  { id: "margin", header: "Crédits / s GPU", sortable: true, align: "end", value: margin, cell: (row) => margin(row)?.toFixed(2) ?? "—" },
];

/**
 * Usage analytics, on the platform's data table (@krizaka/ui/data-table): sortable by any column, skeleton rows while
 * the ledger answers, cards on a narrow screen.
 *
 * The refusal rate is the headline because the design says it is the
 * pricing-health metric (§12): high means the price is wrong or the paywall sits
 * in the wrong place. During DRY_RUN it counts what enforcement *would* have
 * refused, which is what makes the screen worth reading before enforcement is
 * ever switched on.
 */
export function UsageScreen() {
  const [rows, setRows] = useState<CapabilityUsage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      BillingAdminApi.usageByCapability(30)
        .then(setRows)
        .catch((e: unknown) => {
          setRows([]);
          setError(e instanceof Error ? e.message : "Chargement impossible");
        });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-fg">Consommation</h2>
        <p className="text-sm text-fg-muted">
          30 derniers jours. Le taux de refus inclut les refus simulés en DRY_RUN —
          c’est la donnée de calibration, pas seulement les 402 réellement renvoyés.
        </p>
      </header>

      <DataTable
        caption="Consommation par capacité et modèle"
        rows={rows ?? []}
        columns={COLUMNS}
        getRowId={(row) => `${row.capability}:${row.modelName ?? "*"}`}
        defaultSort={{ column: "creditsCharged", direction: "descending" }}
        loading={rows === null}
        loadingRows={4}
        error={error ? <p className="text-sm text-fg-danger">{error}</p> : undefined}
        labels={{ loading: "Lecture de la consommation", empty: "Aucune consommation sur la période." }}
      />
    </section>
  );
}
