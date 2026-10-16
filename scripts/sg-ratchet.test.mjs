import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { withDateFnsImports } from "./sg-fix.mjs";
import { compare, countStream } from "./sg-ratchet.mjs";

describe("sg-ratchet", () => {
  it("counts the violations per rule from the JSON stream", () => {
    const stream = ['{"ruleId":"a"}', '{"ruleId":"b"}', "", '{"ruleId":"a"}', "not json"].join("\n");
    assert.deepEqual(countStream(stream), { a: 2, b: 1 });
  });

  it("fails when a count goes up", () => {
    const r = compare({ a: 2, b: 0 }, { a: 3 }, ["a", "b"]);
    assert.equal(r.ok, false);
    assert.deepEqual(r.increased, ["a"]);
  });

  it("passes and lowers when a count goes down, never raises", () => {
    const r = compare({ a: 5 }, { a: 2 }, ["a"]);
    assert.equal(r.ok, true);
    assert.deepEqual(r.decreased, ["a"]);
    assert.deepEqual(r.next, { a: 2 });
  });

  it("refuses a rule that is not recorded yet", () => {
    const r = compare({ a: 1 }, { a: 1, c: 4 }, ["a", "c"]);
    assert.equal(r.ok, false);
    assert.deepEqual(r.unrecorded, ["c"]);
    assert.equal(r.next.c, 4);
  });
});

describe("sg-fix", () => {
  it("adds the date-fns import after the last import", () => {
    const out = withDateFnsImports('import a from "a";\nimport b from "b";\n\nconst x = hoursToMilliseconds(2);\n');
    assert.ok(out.includes('import b from "b";\nimport { hoursToMilliseconds } from "date-fns";'));
  });
  it("merges into an existing date-fns import and is idempotent", () => {
    const src = 'import { addDays } from "date-fns";\nconst x = minutesToMilliseconds(5) + addDays(1);\n';
    const out = withDateFnsImports(src);
    assert.ok(out.includes('import { addDays, minutesToMilliseconds } from "date-fns";'));
    assert.equal(withDateFnsImports(out), out);
  });
});
