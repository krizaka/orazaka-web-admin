import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { readAuthFlags } from "@/core/config/auth-flags";
import { pickLocale } from "@/core/copy/closed";
import { LoginClosed } from "./LoginClosed";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Orazaka Operations" };

/**
 * `/login` — where the gate (`src/proxy.ts`) and next-auth (`pages.signIn`) send an operator without a session.
 * Closed behind AUTH_LOGIN_ENABLED (default false): a calm notice, the form never mounts, no backend call.
 */
export default async function LoginPage() {
  const open = readAuthFlags().login;
  const locale = pickLocale((await headers()).get("accept-language"));
  return (
    <main className="grid min-h-screen place-items-center bg-surface-0 px-4 py-10">
      {open ? (
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      ) : (
        <LoginClosed locale={locale} />
      )}
    </main>
  );
}
