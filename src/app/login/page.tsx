import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Orazaka Operations" };

/** `/login` — where the gate (`src/proxy.ts`) and next-auth (`pages.signIn`) send an operator without a session. */
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-0 px-4 py-10">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
