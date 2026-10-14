// The operator console is never indexed (the Krizaka family contract, scripts/check-seo-family.mjs): robots.txt shuts the door,
// every response says noindex, every page says noindex, and the sign-in gate lets a crawler read robots.txt.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { auditRobots } from "../scripts/check-seo-family.mjs";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("robots.txt: Disallow / for everyone, and no sitemap for a console", () => {
  assert.match(read("src/app/robots.ts"), /userAgent: "\*", disallow: "\/"/);
  assert.deepEqual(auditRobots("User-Agent: *\nDisallow: /\n", { host: "https://admin.orazaka.com", index: false, sitemap: false }), []);
});

test("every response carries X-Robots-Tag: noindex, nofollow", () => {
  assert.match(read("next.config.ts"), /key: "X-Robots-Tag", value: "noindex, nofollow"/);
});

test("every page carries the robots noindex meta", () => {
  assert.match(read("src/app/layout.tsx"), /robots: \{ index: false, follow: false \}/);
});

test("the sign-in proxy does not send robots.txt to /login", () => {
  assert.match(read("src/proxy.ts"), /robots\.txt/);
});
