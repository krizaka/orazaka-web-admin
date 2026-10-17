// Every job state the shared contract declares has a label and a queue counter: a new state (CANCELLED, DELETED in
// @krizaka/orazaka-shared 1.3.x) must fail here, not as a type error in the build of the console.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JobStatusSchema } from "@krizaka/orazaka-shared";
import { consoleCopy } from "../src/core/copy/console.ts";
import { queueDepths } from "../src/features/operations/utils/operations.ts";
import { QUEUE_STATES } from "../src/features/operations/utils/operations.ts";

const statuses = JobStatusSchema.options as readonly string[];

test("every job state has a label", () => {
  for (const status of statuses) assert.ok((consoleCopy.operations.states as Record<string, string>)[status], `no label for ${status}`);
});

test("every job state has a queue counter, and is counted", () => {
  assert.deepEqual(Object.keys(queueDepths([])).sort(), [...statuses].sort());
  assert.deepEqual([...QUEUE_STATES].sort(), [...statuses].sort());
});
