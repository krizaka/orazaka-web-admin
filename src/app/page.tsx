import {
  Badge,
  Button,
  Icon,
  ChatShowcase,
  type IconName,
} from "@krizaka/orazaka-design-system";
import { Card } from "@krizaka/ui/card";

/**
 * SecOps console landing — consumes the shared `orazaka-design-system`
 * components, theme, and the sovereign ChatShowcase, the same source used
 * by `orazaka-web-client` (AGENTS.md §8: no duplicated components across
 * web clients). Token-driven, cinematic dark-mode, no hardcoded colors.
 */

const OPS: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "shield",
    title: "Policy governance",
    desc: "Enable, order, and short-circuit interceptors from the DB — no redeploy. Kill-switch cuts all AI-dependent stages instantly.",
  },
  {
    icon: "key",
    title: "RBAC & identity",
    desc: "Resolve roles, scopes, and rate-limit tiers per actor. Every decision is enforced at the router boundary.",
  },
  {
    icon: "pipeline",
    title: "Pipeline audit",
    desc: "Trace every request through the 10-tier pipeline. See which stage enriched, routed, or blocked — with full lineage.",
  },
  {
    icon: "gauge",
    title: "Local health",
    desc: "Watch unified-memory pressure, model load, and queue depth. Cost-shield shifts load before saturation.",
  },
];

const CHAT = {
  labels: {
    agent: "Orazaka",
    status: "Online · local",
    model: "engine · router",
    routed: "Audited locally",
    privacy: "0 data leaves your network",
    placeholder: "Query the audit log…",
  },
  question: "Show the last blocked request and which interceptor short-circuited it.",
  answer:
    "Request #4821 blocked by SecurityInterceptor — RBAC scope 'media:write' missing for actor a3f9. Logged to the local audit trail; nothing left your network.",
  pipeline: ["Security", "Governance", "Audit"],
};

/**
 * Renders the remastered SecOps console landing.
 *
 * @returns The admin landing React element.
 */
export default function AdminDashboard() {
  return (
    <main className="min-h-screen w-full bg-[var(--surface-0)] text-[var(--text-primary)]">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon name="shield" size={18} />
          </span>
          <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight">
            Orazaka
          </span>
          <Badge variant="accent">SecOps</Badge>
        </div>
        <Button variant="outline" size="sm">
          Open console
        </Button>
      </header>

      {/* Hero + live engine activity */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-10 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
            Sovereign operations · Law 25 · GDPR
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Command your sovereign AI engine.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Govern policy, identity, and the interceptor pipeline from one console — every
            action audited on your own infrastructure. Nothing leaves your network.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="primary" size="lg">
              Open console
            </Button>
            <Button variant="outline" size="lg">
              Read the docs
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ChatShowcase
            labels={CHAT.labels}
            question={CHAT.question}
            answer={CHAT.answer}
            pipeline={CHAT.pipeline}
          />
        </div>
      </section>

      {/* Ops feature grid */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-6">
          <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
            Operations
          </span>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight md:text-3xl">
            Everything the engine does, under your control.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPS.map((op) => (
            <Card.Root key={op.title} className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name={op.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-[var(--text-primary)]">
                {op.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {op.desc}
              </p>
            </Card.Root>
          ))}
        </div>
      </section>
    </main>
  );
}
