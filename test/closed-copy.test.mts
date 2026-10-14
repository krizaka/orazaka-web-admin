// The closed-login notice speaks English and French; English is the default.
import { test } from "node:test";
import assert from "node:assert/strict";
import { closedCopy, pickLocale } from "../src/core/copy/closed.ts";

test("English by default, French when the browser prefers it", () => {
  assert.equal(pickLocale(null), "en");
  assert.equal(pickLocale("de-DE,de;q=0.9"), "en");
  assert.equal(pickLocale("fr-CA,fr;q=0.9,en;q=0.8"), "fr");
  assert.equal(pickLocale("en-US,en;q=0.9,fr;q=0.8"), "en");
});

test("both languages say the same things", () => {
  assert.deepEqual(Object.keys(closedCopy.en), Object.keys(closedCopy.fr));
  for (const lang of ["en", "fr"] as const) for (const v of Object.values(closedCopy[lang])) assert.ok(v.length > 0);
});
