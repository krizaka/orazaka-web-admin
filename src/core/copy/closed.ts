/**
 * @file closed.ts
 * @description The calm notice of a closed door (AUTH_LOGIN_ENABLED=false), in English and French.
 */
export type ClosedLocale = "en" | "fr";

export const closedCopy = {
  en: {
    title: "Orazaka Operations is in development — sign-in is closed on this site",
    body: "This is the public development deployment of the administration console. Accounts are not open yet.",
    signInBanner: "Sign-in opens when Orazaka's dev services run — watch the Orazaka demo meanwhile.",
    home: "Discover Orazaka",
    by: "A Krizaka product",
    version: "Version",
  },
  fr: {
    title: "Orazaka Operations est en développement — la connexion est fermée sur ce site",
    body: "Ceci est le déploiement public de développement de la console d'administration. Les comptes ne sont pas encore ouverts.",
    signInBanner: "La connexion s'ouvre quand les services de développement d'Orazaka tournent — regardez la démo d'Orazaka en attendant.",
    home: "Découvrir Orazaka",
    by: "Un produit Krizaka",
    version: "Version",
  },
} as const satisfies Record<ClosedLocale, Record<string, string>>;

/** The first language of an Accept-Language header that we speak; English otherwise. */
export function pickLocale(acceptLanguage: string | null | undefined): ClosedLocale {
  for (const part of (acceptLanguage ?? "").split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}
