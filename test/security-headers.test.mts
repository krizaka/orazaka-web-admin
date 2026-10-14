import { test } from "node:test";
import assert from "node:assert/strict";
import { SECURITY_HEADERS } from "../src/core/config/security-headers.ts";

test("the console forbids framing, sniffing and plain HTTP, and sends no referrer", () => {
  const h = Object.fromEntries(SECURITY_HEADERS.map((x) => [x.key, x.value]));
  assert.match(h["Strict-Transport-Security"], /max-age=\d{8}/);
  assert.equal(h["X-Content-Type-Options"], "nosniff");
  assert.equal(h["X-Frame-Options"], "DENY");
  assert.match(h["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(h["Referrer-Policy"], "no-referrer");
});
