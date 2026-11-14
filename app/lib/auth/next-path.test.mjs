import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getSafeNextPath } from "./next-path.ts";

test("keeps local destinations and defaults to the members area", () => {
  assert.equal(getSafeNextPath(null), "/members");
  assert.equal(getSafeNextPath("/api/checkout"), "/api/checkout");
  assert.equal(getSafeNextPath("/files?folder=one"), "/files?folder=one");
});

test("rejects external or browser-normalized external destinations", () => {
  for (const path of ["https://example.com", "//example.com", "/\\example.com", "/\n/example.com"]) {
    assert.equal(getSafeNextPath(path), "/members");
  }
});
