import type { Metadata } from "next";
import { CatalogueScreen } from "@/features/catalogue/components/CatalogueScreen";

export const metadata: Metadata = { title: "Models · Orazaka Operations" };

/** `/models` — the model registry, its providers and the capabilities that may be dispatched. */
export default function ModelsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <CatalogueScreen />
    </main>
  );
}
