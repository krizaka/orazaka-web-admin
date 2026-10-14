// APP_VERSION: package.json + short sha, shown in the footer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatVersion, resolveSha } from "../src/core/config/app-version.ts";

test("the version carries the 7-character sha", () => {
  assert.equal(formatVersion("1.0.0", "abcdef0123456"), "1.0.0+abcdef0");
});

test("without a sha, the bare version", () => {
  assert.equal(formatVersion("1.0.0", ""), "1.0.0");
  assert.equal(formatVersion("1.0.0"), "1.0.0");
});

test("the platform's APP_COMMIT wins, an unbound placeholder is ignored", () => {
  assert.equal(resolveSha({ APP_COMMIT: "1234567890" }), "1234567890");
  assert.equal(resolveSha({ APP_COMMIT: "${_self.COMMIT_HASH}", GITHUB_SHA: "feedface00" }), "feedface00");
});
