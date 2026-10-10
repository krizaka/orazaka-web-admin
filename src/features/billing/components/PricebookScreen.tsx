"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button } from "@krizaka/orazaka-design-system";
import { Card } from "@krizaka/ui/card";
import { formatCredits, type MarginPreview, type PricebookRate } from "@krizaka/orazaka-shared";
import { BillingField } from "./BillingField";
import { BillingAdminApi } from "@/services/billing.admin.api";

/**
 * The pricebook screen.
 *
 * Publishing is two steps because the design makes it two: no price reaches
 * production without the admin having seen what it would have done to the last
 * 30 days of traffic (§12). The publish button stays disabled until a preview
 * for the current form has been fetched — the guardrail is the flow, not a
 * warning the admin can read past.
 */
export function PricebookScreen() {
  const [rates, setRates] = useState<PricebookRate[]>([]);
  const [draft, setDraft] = useState<Omit<PricebookRate, "version"> | null>(null);
  const [preview, setPreview] = useState<MarginPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRates(await BillingAdminApi.listRates());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    // Deferred rather than called inline: loading synchronously inside the effect
    // sets state during the same commit and cascades a second render.
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const edit = (rate: PricebookRate) => {
    // The version is the server's to assign — publishing opens the next one.
    setDraft({
      capability: rate.capability,
      modelName: rate.modelName,
      unit: rate.unit,
      creditsPerUnit: rate.creditsPerUnit,
      minimumCredits: rate.minimumCredits,
      estimateCredits: rate.estimateCredits,
    });
    // The previous preview described a different proposal; keeping it on screen
    // would let an admin publish one rate having reviewed another.
    setPreview(null);
  };

  const runPreview = async () => {
    if (!draft) return;
    setIsBusy(true);
    setError(null);
    try {
      setPreview(await BillingAdminApi.previewRate(draft));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aperçu impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const publish = async () => {
    if (!draft || !preview) return;
    setIsBusy(true);
    try {
      await BillingAdminApi.publishRate(draft);
      setDraft(null);
      setPreview(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publication impossible");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Grille tarifaire</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Une publication clôture le tarif courant et en ouvre une nouvelle version.
          Les réservations en cours restent facturées à la version qu’elles ont figée.
        </p>
      </header>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <Card.Root>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="py-2">Capacité</th>
              <th>Modèle</th>
              <th>Unité</th>
              <th className="text-right">Crédits / unité</th>
              <th className="text-right">Estimation</th>
              <th className="text-right">v</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr
                key={`${rate.capability}:${rate.modelName ?? "*"}`}
                className="border-t border-[var(--border-subtle)]"
              >
                <td className="py-2 text-[var(--text-primary)]">{rate.capability}</td>
                <td className="text-[var(--text-muted)]">{rate.modelName ?? "—"}</td>
                <td className="text-[var(--text-muted)]">{rate.unit}</td>
                <td className="text-right text-[var(--text-primary)]">{rate.creditsPerUnit}</td>
                <td className="text-right text-[var(--text-primary)]">
                  {formatCredits(rate.estimateCredits)}
                </td>
                <td className="text-right text-[var(--text-muted)]">{rate.version}</td>
                <td className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => edit(rate)}>
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Root>

      {draft && (
        <Card.Root className="p-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {draft.capability} · {draft.modelName ?? "défaut"}
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <BillingField
                label="Crédits / unité"
                type="number"
                value={String(draft.creditsPerUnit)}
                onChange={(e) => {
                  setDraft({ ...draft, creditsPerUnit: Number(e.target.value) });
                  setPreview(null);
                }}
              />
              <BillingField
                label="Minimum"
                type="number"
                value={String(draft.minimumCredits)}
                onChange={(e) => {
                  setDraft({ ...draft, minimumCredits: Number(e.target.value) });
                  setPreview(null);
                }}
              />
              <BillingField
                label="Estimation (hold)"
                type="number"
                value={String(draft.estimateCredits)}
                onChange={(e) => {
                  setDraft({ ...draft, estimateCredits: Number(e.target.value) });
                  setPreview(null);
                }}
              />
            </div>

            {preview && <MarginPreviewPanel preview={preview} />}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Annuler
              </Button>
              <Button variant="secondary" onClick={runPreview} disabled={isBusy}>
                Simuler sur 30 jours
              </Button>
              <Button onClick={publish} disabled={!preview || isBusy}>
                Publier
              </Button>
            </div>
          </div>
        </Card.Root>
      )}
    </section>
  );
}

/**
 * The replay of a proposed rate against real traffic.
 *
 * The sample size is shown as prominently as the delta: a verdict drawn from
 * three events must not be presented like one drawn from three thousand.
 */
function MarginPreviewPanel({ preview }: { preview: MarginPreview }) {
  const delta = preview.proposedCredits - preview.currentCredits;
  const percent =
    preview.currentCredits === 0
      ? 0
      : Math.round((delta / preview.currentCredits) * 10000) / 100;

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] p-4">
      {!preview.sampleEvents ? (
        <p className="text-sm text-[var(--warning)]">
          Aucun trafic sur 30 jours — cette publication se fait sans données.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-[var(--text-muted)]">
            Sur <strong>{preview.sampleEvents}</strong> requêtes réelles :
          </p>
          <p className="text-[var(--text-primary)]">
            {formatCredits(preview.currentCredits)} →{" "}
            {formatCredits(preview.proposedCredits)} crédits{" "}
            <Badge variant={delta >= 0 ? "success" : "warning"}>
              {delta >= 0 ? "+" : ""}
              {percent}%
            </Badge>
          </p>
        </div>
      )}
    </div>
  );
}
