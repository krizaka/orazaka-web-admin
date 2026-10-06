"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card } from "@krizaka/orazaka-design-system";
import {
  capabilityForModelCategory,
  isModelPriced,
  suggestedUnitFor,
  type CatalogModel,
  type MarginPreview,
  type PricebookRate,
} from "@krizaka/orazaka-shared";
import { ModelRateEditor } from "./ModelRateEditor";
import { asRate, type ModelRateDraft } from "./ModelRateDraft";
import { BillingAdminApi } from "@/services/billing.admin.api";

/**
 * Per-model pricing.
 *
 * The screen exists because a model with no rate is not merely untracked — the
 * hold refuses it outright rather than guessing a price, so the capability stops
 * working for that model entirely. Adding an AI model to the catalogue and
 * forgetting to price it is therefore an outage with a billing-shaped cause, and
 * the only way to notice used to be a 409 in a log.
 *
 * Unpriced models are listed first for that reason: this screen answers "what is
 * broken" before it answers "what does it cost".
 *
 * The capability and the suggested unit come from the model's catalogue category,
 * but both stay editable — the unit is a property of the model, not of its
 * category, which is why speech and transcription share AUDIO and bill
 * differently.
 */
export function ModelPricingScreen() {
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [rates, setRates] = useState<PricebookRate[]>([]);
  const [draft, setDraft] = useState<ModelRateDraft | null>(null);
  const [preview, setPreview] = useState<MarginPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [catalogue, pricebook] = await Promise.all([
        BillingAdminApi.listModels(),
        BillingAdminApi.listRates(),
      ]);
      setModels(catalogue);
      setRates(pricebook);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const rows = useMemo(() => {
    const decorated = models.map((model) => {
      const capability = capabilityForModelCategory(model.category);
      const own = rates.find(
        (rate) => rate.capability === capability && rate.modelName === model.modelName,
      );
      const fallback = rates.find(
        (rate) => rate.capability === capability && rate.modelName === null,
      );
      return { model, capability, own, fallback, priced: isModelPriced(model, rates) };
    });
    // Unpriced first: these are the models that currently refuse every request.
    return decorated.sort((a, b) => Number(a.priced) - Number(b.priced));
  }, [models, rates]);

  const unpriced = rows.filter((row) => !row.priced).length;

  const startDraft = (model: CatalogModel, existing?: PricebookRate) => {
    setPreview(null);
    setDraft({
      capability: capabilityForModelCategory(model.category),
      modelName: model.modelName,
      unit: existing?.unit ?? suggestedUnitFor(model.category),
      creditsPerUnit: existing?.creditsPerUnit ?? 1,
      minimumCredits: existing?.minimumCredits ?? 1,
      estimateCredits: existing?.estimateCredits ?? 1,
      isReprice: Boolean(existing),
    });
  };

  const runPreview = async () => {
    if (!draft) return;
    setIsBusy(true);
    try {
      setPreview(await BillingAdminApi.previewRate(asRate(draft)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aperçu impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const publish = async () => {
    if (!draft) return;
    setIsBusy(true);
    try {
      await BillingAdminApi.publishRate(asRate(draft));
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
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Tarification par modèle
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Un modèle sans tarif ni tarif par défaut est refusé à la réservation : la
          capacité cesse de fonctionner pour ce modèle. Les modèles non tarifés sont
          affichés en premier.
        </p>
      </header>

      {unpriced > 0 && (
        <p className="text-sm text-[var(--warning)]">
          {unpriced} modèle(s) sans tarif — toute requête les utilisant sera refusée.
        </p>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="py-2">Modèle</th>
              <th>Catégorie</th>
              <th>Capacité</th>
              <th>Unité</th>
              <th className="text-right">Crédits / unité</th>
              <th className="text-right">Estimation</th>
              <th>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ model, capability, own, fallback, priced }) => (
              <tr key={model.modelName} className="border-t border-[var(--border-subtle)]">
                <td className="py-2 text-[var(--text-primary)]">
                  {model.modelLabel || model.modelName}
                </td>
                <td className="text-[var(--text-muted)]">{model.category}</td>
                <td className="text-[var(--text-muted)]">{capability}</td>
                <td className="text-[var(--text-muted)]">
                  {own?.unit ?? fallback?.unit ?? "—"}
                </td>
                <td className="text-right text-[var(--text-primary)]">
                  {own?.creditsPerUnit ?? fallback?.creditsPerUnit ?? "—"}
                </td>
                <td className="text-right text-[var(--text-primary)]">
                  {own?.estimateCredits ?? fallback?.estimateCredits ?? "—"}
                </td>
                <td>
                  {!priced && <Badge variant="danger">non tarifé</Badge>}
                  {priced && own && <Badge variant="success">tarif dédié</Badge>}
                  {priced && !own && <Badge variant="default">tarif par défaut</Badge>}
                </td>
                <td className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => startDraft(model, own)}>
                    {own ? "Modifier" : "Tarifer"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {draft && (
        <ModelRateEditor
          draft={draft}
          preview={preview}
          isBusy={isBusy}
          onChange={(next) => {
            setDraft(next);
            // Any edit invalidates the replay it was not run against.
            setPreview(null);
          }}
          onPreview={runPreview}
          onPublish={publish}
          onCancel={() => setDraft(null)}
        />
      )}
    </section>
  );
}
