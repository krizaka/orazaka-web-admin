"use client";

import { useState } from "react";
import { Button } from "@krizaka/orazaka-design-system";
import { PlansScreen } from "@/features/billing/components/PlansScreen";
import { PacksScreen } from "@/features/billing/components/PacksScreen";
import { ModelPricingScreen } from "@/features/billing/components/ModelPricingScreen";
import { PricebookScreen } from "@/features/billing/components/PricebookScreen";
import { UsageScreen } from "@/features/billing/components/UsageScreen";
import { WalletScreen } from "@/features/billing/components/WalletScreen";

const TABS = [
  { id: "usage", label: "Consommation" },
  { id: "models", label: "Tarifs par modèle" },
  { id: "pricebook", label: "Tarifs par capacité" },
  { id: "plans", label: "Offres" },
  { id: "packs", label: "Packs métier" },
  { id: "wallets", label: "Portefeuilles" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * The billing console.
 *
 * Consumption opens first, not the catalogue: the refusal rate is the screen that
 * tells you whether the pricing is working, and an admin arriving here usually
 * wants to know that before changing anything.
 */
export default function BillingPage() {
  const [tab, setTab] = useState<TabId>("usage");

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Facturation &amp; crédits
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Tout ce qui est commercial vit en base et s’édite ici — jamais dans le code.
        </p>
      </header>

      <nav className="flex gap-2 border-b border-[var(--border-subtle)] pb-2">
        {TABS.map((entry) => (
          <Button
            key={entry.id}
            size="sm"
            variant={tab === entry.id ? "primary" : "ghost"}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
      </nav>

      {tab === "usage" && <UsageScreen />}
      {tab === "models" && <ModelPricingScreen />}
      {tab === "pricebook" && <PricebookScreen />}
      {tab === "plans" && <PlansScreen />}
      {tab === "packs" && <PacksScreen />}
      {tab === "wallets" && <WalletScreen />}
    </main>
  );
}
