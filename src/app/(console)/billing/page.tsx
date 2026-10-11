"use client";

import { useState } from "react";
import { Tabs } from "@krizaka/ui/tabs";
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
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          Facturation &amp; crédits
        </h1>
        <p className="text-sm text-fg-muted">
          Tout ce qui est commercial vit en base et s’édite ici — jamais dans le code.
        </p>
      </header>

      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as TabId)}>
        <Tabs.List aria-label="Facturation" className="overflow-x-auto">
          {TABS.map((entry) => (
            <Tabs.Trigger key={entry.id} value={entry.id}>
              {entry.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="usage">
          <UsageScreen />
        </Tabs.Content>
        <Tabs.Content value="models">
          <ModelPricingScreen />
        </Tabs.Content>
        <Tabs.Content value="pricebook">
          <PricebookScreen />
        </Tabs.Content>
        <Tabs.Content value="plans">
          <PlansScreen />
        </Tabs.Content>
        <Tabs.Content value="packs">
          <PacksScreen />
        </Tabs.Content>
        <Tabs.Content value="wallets">
          <WalletScreen />
        </Tabs.Content>
      </Tabs.Root>
    </main>
  );
}
