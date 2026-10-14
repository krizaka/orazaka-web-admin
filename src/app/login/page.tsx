import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { readAuthFlags } from "@/core/config/auth-flags";
import { closedCopy, pickLocale } from "@/core/copy/closed";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Orazaka Operations" };

/**
 * `/login` — where the gate (`src/proxy.ts`) and next-auth (`pages.signIn`) send an operator without a session.
 * While AUTH_LOGIN_ENABLED is off (default) the real form is shown disabled under a calm banner: submitting does
 * nothing and no backend call is made.
 */
export default async function LoginPage() {
  const open = readAuthFlags().login;
  const locale = pickLocale((await headers()).get("accept-language"));
  return (
    <Suspense fallback={null}>
      <LoginForm preview={open ? undefined : { banner: closedCopy[locale].signInBanner, link: closedCopy[locale].home, href: "https://dev.orazaka.com", locale }} />
    </Suspense>
  );
}
