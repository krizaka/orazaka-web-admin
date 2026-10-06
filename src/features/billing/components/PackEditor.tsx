"use client";

import { Button, Card, Input } from "@krizaka/orazaka-design-system";
import { type Entitlement, type Pack } from "@krizaka/orazaka-shared";
import { Field } from "./Field";

/**
 * The pack form — the **price tag**, which is all billing owns since ADR-036.
 *
 * It used to edit the pack's name, shelf and métier too. Those became catalogue data in
 * the studio context, alongside `studio_i18n`, so a marketing copy change stopped being a
 * deploy of the service that holds the credit ledger. This console does not edit them
 * yet: the category picker, the i18n editor and the Studio multi-select are phase 4 of
 * the Pack plan. Until then a pack's presentation is authored as a `pack` row.
 *
 * The key is therefore the one identifying field here, and it is the opaque string that
 * joins this row to its catalogue entry in the other database. Getting it wrong produces
 * a priced pack nobody can browse — which `PackCoherenceRules` fails the build on.
 */
export function PackEditor({
  pack,
  onChange,
  onSave,
  onCancel,
}: Readonly<{
  pack: Pack;
  onChange: (pack: Pack) => void;
  onSave: () => void;
  onCancel: () => void;
}>) {
  const setEntitlement = (index: number, next: Entitlement) => {
    const entitlements = [...pack.entitlements];
    entitlements[index] = next;
    onChange({ ...pack, entitlements });
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Clé"
            value={pack.packKey}
            onChange={(e) => onChange({ ...pack, packKey: e.target.value })}
          />
          <Field
            label="Prix (centimes)"
            type="number"
            value={String(pack.priceCents)}
            onChange={(e) => onChange({ ...pack, priceCents: Number(e.target.value) })}
          />
          <Field
            label="Crédits inclus"
            type="number"
            value={String(pack.includedCredits)}
            onChange={(e) => onChange({ ...pack, includedCredits: Number(e.target.value) })}
          />
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Le nom, la catégorie et l’icône du pack vivent dans le catalogue (contexte Studio), pas
          ici : la facturation répond « combien », le catalogue répond « qu’est-ce que c’est ».
          L’éditeur de catalogue arrive en phase 4.
        </p>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text-primary)]">Droits</p>
          <p className="text-xs text-[var(--text-muted)]">
            Une clé <code>studio.&lt;clé&gt;</code> débloque le Studio du même nom. Ces droits
            s’ajoutent à ceux de l’offre de l’acheteur — ils n’en retirent jamais. Un Studio ajouté
            au pack sans son droit ici fait échouer le build (PACK-001) : l’acheteur paierait et
            resterait bloqué.
          </p>
          {pack.entitlements.map((entitlement, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-3">
              <Input
                value={entitlement.key}
                onChange={(e) => setEntitlement(index, { ...entitlement, key: e.target.value })}
              />
              <Input
                value={entitlement.valueType}
                onChange={(e) =>
                  setEntitlement(index, {
                    ...entitlement,
                    valueType: e.target.value as Entitlement["valueType"],
                  })
                }
              />
              <Input
                value={entitlement.value}
                onChange={(e) => setEntitlement(index, { ...entitlement, value: e.target.value })}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onChange({
                ...pack,
                entitlements: [
                  ...pack.entitlements,
                  { key: "", valueType: "boolean", value: "true" },
                ],
              })
            }
          >
            Ajouter un droit
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={!pack.packKey.trim()}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Card>
  );
}
