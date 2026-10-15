// End-to-end walk of the console: sign in as the administrator from an allowed address, open every page, and check an
// address that is not allowed is refused. Run: `npm run e2e` (needs a Chromium for playwright-core; not part of `npm test`).
// Screenshots (dark) go to $E2E_SHOTS when set.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { startMockEdge } from "./mock-edge.mjs";

const { chromium } = await import("playwright-core");
const EDGE = 4188, APP = 4101;
const ALLOWED = "203.0.113.7", OTHER = "198.51.100.9";
const PAGES = [
  ["/", "Platform supervision"],
  ["/operations", "Operations"],
  ["/models", "Models and capabilities"],
  ["/users", "People"],
  ["/audit", "Audit log"],
  ["/billing", "Facturation"],
  ["/studios", null],
];

const seen = [];
const edge = await startMockEdge(EDGE, seen);
const app = spawn("npx", ["next", "dev", "--port", String(APP)], {
  env: { ...process.env, ROUTER_URL: `http://127.0.0.1:${EDGE}`, AUTH_LOGIN_ENABLED: "true", AUTH_ALLOWED_IPS: ALLOWED, NEXTAUTH_URL: `http://localhost:${APP}`, NEXTAUTH_SECRET: "e2e-only-secret-not-used-anywhere", NEXT_PUBLIC_APP_ENV: "dev" },
  stdio: "ignore",
});
const stop = async () => { app.kill("SIGTERM"); edge.close(); };
let failed = 0;
const check = (ok, what) => { process.stdout.write(`${ok ? "ok  " : "FAIL"} ${what}\n`); if (!ok) failed += 1; };

try {
  for (let i = 0; i < 90; i += 1) {
    try { if ((await fetch(`http://localhost:${APP}/robots.txt`, { headers: { "do-connecting-ip": ALLOWED } })).ok) break; } catch { /* starting */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  const refused = await fetch(`http://localhost:${APP}/login`, { headers: { "do-connecting-ip": OTHER } });
  check(refused.status === 403 || refused.status === 404, `an address outside the list is refused (${refused.status})`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", extraHTTPHeaders: { "do-connecting-ip": ALLOWED } });
  await context.addInitScript(() => { try { localStorage.setItem("kz-theme", "dark"); } catch { /* none */ } });
  const page = await context.newPage();
  await page.goto(`http://localhost:${APP}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500); // dev compile: let the form hydrate before it is submitted
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("correct-horse");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`http://localhost:${APP}/`, { timeout: 60_000 });
  check(true, "the administrator signs in");

  if (process.env.E2E_SHOTS) mkdirSync(process.env.E2E_SHOTS, { recursive: true });
  for (const [path, heading] of PAGES) {
    await page.goto(`http://localhost:${APP}${path}`, { waitUntil: "networkidle" });
    if (heading) check(await page.getByRole("heading", { name: new RegExp(heading) }).first().isVisible(), `${path} shows "${heading}"`);
    if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/${path === "/" ? "supervision" : path.slice(1)}.png` });
  }

  await page.goto(`http://localhost:${APP}/operations`, { waitUntil: "networkidle" });
  check(await page.getByText("worker heartbeat lost").first().isVisible(), "/operations lists the failed job's error");
  await page.goto(`http://localhost:${APP}/models`, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Capabilities" }).click();
  await page.getByRole("switch", { name: /orazaka\.core\.chat/ }).click();
  await page.waitForTimeout(500);
  check(seen.includes("PUT /api/v1/features/orazaka.core.chat"), "switching a capability writes through the edge");
  // Accounts: open a row, suspend, erase with the typed e-mail; the audit records both.
  await page.goto(`http://localhost:${APP}/users`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Show details of bob@example.test/ }).click();
  await page.getByRole("button", { name: "Suspend", exact: true }).click();
  await page.getByText("Suspended").first().waitFor({ timeout: 15_000 });
  check(seen.includes("POST /api/v1/admin/users/u-bob/suspend"), "an account is suspended through the edge");
  await page.getByLabel("Type the account's e-mail to confirm").fill("bob@example.test");
  await page.getByRole("button", { name: "Erase the account" }).click();
  await page.getByText("bob@example.test").waitFor({ state: "detached", timeout: 15_000 });
  check(seen.includes("DELETE /api/v1/admin/users/u-bob"), "an account is erased once its e-mail is typed");
  await page.goto(`http://localhost:${APP}/audit`, { waitUntil: "networkidle" });
  check(await page.getByText("admin.account_deleted").first().isVisible(), "the audit shows the erasure");
  await browser.close();
} finally {
  await stop();
}
process.exit(failed ? 1 : 0);
