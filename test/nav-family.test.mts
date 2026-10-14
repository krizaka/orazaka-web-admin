// NAV-SYS (@krizaka/ui 3.10): the private console wears the environment badge and never the family.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

test("the bar shows the environment badge and no family switcher", () => {
  const nav = read("src/components/ConsoleNav.tsx");
  assert.match(nav, /<NavBar\.Badge env=\{APP_ENV\}/);
  assert.doesNotMatch(nav, /<NavBar\.Family/);
});

test("the footer is the console's own: no family columns", () => {
  assert.doesNotMatch(read("src/components/SiteFooter.tsx"), /site-footer|amily/);
});

test("the build names its environment, dev by default", () => {
  assert.match(read("next.config.ts"), /NEXT_PUBLIC_APP_ENV[^\n]*\|\| "dev"/);
});
