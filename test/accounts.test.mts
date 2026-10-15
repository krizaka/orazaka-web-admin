import { test } from "node:test";
import assert from "node:assert/strict";
import { erasureArmed, refusalMessage, stateActions } from "../src/features/accounts/utils/accounts.ts";

test("refusals are worded from their stable code", () => {
  assert.match(refusalMessage("SELF", 409), /own account/);
  assert.match(refusalMessage("LAST_ADMIN", 409), /last administrator/);
  assert.match(refusalMessage("CONFIRM_MISMATCH", 409), /does not match/);
  assert.match(refusalMessage(null, 403), /administrator/);
  assert.match(refusalMessage(null, 404), /no longer exists/);
});

test("the action offered undoes the account's current state", () => {
  assert.deepEqual(stateActions({ enabled: true, admin: false }), { status: "suspend", role: "grant" });
  assert.deepEqual(stateActions({ enabled: false, admin: true }), { status: "restore", role: "withdraw" });
});

test("the erasure is armed only by the account's own e-mail, case and spaces aside", () => {
  assert.equal(erasureArmed("  Ada@Example.test ", "ada@example.test"), true);
  assert.equal(erasureArmed("ada@example.te", "ada@example.test"), false);
  assert.equal(erasureArmed("", "ada@example.test"), false);
});
