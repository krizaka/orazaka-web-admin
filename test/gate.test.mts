// The gate of the public admin site: closed means no backend call and no console screen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { gate } from "../src/core/config/gate.ts";

const closed = { login: false, signup: false };
const open = { login: true, signup: false };

test("closed: the BFF routes answer 404", () => {
  assert.equal(gate("/api/v1/billing/plans", false, closed), "not-found");
  assert.equal(gate("/api/auth/session", true, closed), "not-found");
});

test("closed: a page without session goes to the closed login notice, /login itself passes", () => {
  assert.equal(gate("/billing", false, closed), "login");
  assert.equal(gate("/login", false, closed), "pass");
});

test("closed: health stays reachable for the platform", () => {
  assert.equal(gate("/api/health", false, closed), "pass");
});

test("open: the BFF passes and a session reaches the console", () => {
  assert.equal(gate("/api/v1/billing/plans", false, open), "pass");
  assert.equal(gate("/billing", true, open), "pass");
  assert.equal(gate("/billing", false, open), "login");
});
