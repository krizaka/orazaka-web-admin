"use client";

import { useEffect, useState } from "react";
import { Badge } from "@krizaka/orazaka-design-system";
import { Card } from "@krizaka/ui/card";
import { formatCredits, type CapabilityUsage } from "@krizaka/orazaka-shared";
import { BillingAdminApi } from "@/services/billing.admin.api";

/** Above this share of attempts refused, the pricing is the suspect, not the users. */
const CONCERNING_REFUSAL_RATE = 15;

/**
 * Usage analytics.
 *
 * The refusal rate is the headline because the design says it is the
 * pricing-health metric (§12): high means the price is wrong or the paywall sits
 * in the wrong place. During DRY_RUN it counts what enforcement *would* have
 * refused, which is what makes the screen worth reading before enforcement is
 * ever switched on.
 */
export function UsageScreen() {
  const [rows, setRows] = useState<CapabilityUsage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      BillingAdminApi.usageByCapability(30)
        .then(setRows)
        .catch((e: unknown) =>
          setError(e instanceof Error ? e.message : "Chargement impossible"),
        );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Consommation</h2>
        <p className="text-sm text-[var(--text-muted)]">
          30 derniers jours. Le taux de refus inclut les refus simulés en DRY_RUN —
          c’est la donnée de calibration, pas seulement les 402 réellement renvoyés.
        </p>
      </header>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <Card.Root>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="py-2">Capacité</th>
              <th>Modèle</th>
              <th className="text-right">Requêtes</th>
              <th className="text-right">Crédits</th>
              <th className="text-right">Refus</th>
              <th className="text-right">Taux</th>
              <th className="text-right">Crédits / s GPU</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const attempts = row.events + row.refusals;
              const rate = attempts === 0 ? 0 : (row.refusals / attempts) * 100;
              const margin =
                row.gpuSeconds && row.gpuSeconds > 0
                  ? (row.creditsCharged / row.gpuSeconds).toFixed(2)
                  : null;
              return (
                <tr
                  key={`${row.capability}:${row.modelName ?? "*"}`}
                  className="border-t border-[var(--border-subtle)]"
                >
                  <td className="py-2 text-[var(--text-primary)]">{row.capability}</td>
                  <td className="text-[var(--text-muted)]">{row.modelName ?? "—"}</td>
                  <td className="text-right text-[var(--text-primary)]">{row.events}</td>
                  <td className="text-right text-[var(--text-primary)]">
                    {formatCredits(row.creditsCharged)}
                  </td>
                  <td className="text-right text-[var(--text-muted)]">
                    {row.refusals}
                    {row.enforcedRefusals > 0 && ` (${row.enforcedRefusals} appliqués)`}
                  </td>
                  <td className="text-right">
                    <Badge variant={rate >= CONCERNING_REFUSAL_RATE ? "warning" : "default"}>
                      {rate.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="text-right text-[var(--text-muted)]">
                    {/* Blank, not zero: unmeasured and free are different claims. */}
                    {margin ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card.Root>
    </section>
  );
}
