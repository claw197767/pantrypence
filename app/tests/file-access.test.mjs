import test from "node:test";
import assert from "node:assert/strict";
import { getFileAccess } from "../lib/membership.ts";
import { safeNextPath } from "../lib/safe-next-path.ts";

function clientFor(data, error = null) {
  return {
    from(table) {
      assert.equal(table, "user_subscriptions");
      return {
        select() {
          return {
            eq(column, value) {
              assert.equal(column, "user_id");
              assert.equal(value, "user-1");
              return { async maybeSingle() { return { data, error }; } };
            },
          };
        },
      };
    },
  };
}

const user = { id: "user-1", app_metadata: {}, user_metadata: {} };

test("active and trialing members can read and upload, but expired or inactive members cannot", async () => {
  for (const status of ["active", "trialing"]) {
    assert.deepEqual(await getFileAccess(clientFor({ status, current_period_end: "2999-01-01" }), user), {
      active: true, isAdmin: false, canRead: true,
    });
  }
  for (const membership of [null, { status: "canceled", current_period_end: "2999-01-01" }, { status: "active", current_period_end: "2000-01-01" }]) {
    assert.deepEqual(await getFileAccess(clientFor(membership), user), {
      active: false, isAdmin: false, canRead: false,
    });
  }
});

test("only trusted admin metadata grants file access without a subscription", async () => {
  assert.deepEqual(await getFileAccess(clientFor(null), { ...user, app_metadata: { role: "admin" } }), {
    active: false, isAdmin: true, canRead: true,
  });
  assert.equal((await getFileAccess(clientFor(null), { ...user, user_metadata: { role: "admin" } })).canRead, false);
});

test("membership lookup failures are not treated as an inactive membership", async () => {
  await assert.rejects(getFileAccess(clientFor(null, new Error("database unavailable")), user), /Unable to check membership/);
});

test("email-link redirect destinations stay on the application", () => {
  for (const path of [null, "https://example.com", "//example.com", "/\\example.com", "/\t/example.com"]) {
    assert.equal(safeNextPath(path), "/members");
  }
  assert.equal(safeNextPath("/api/checkout"), "/api/checkout");
  assert.equal(safeNextPath("/admin/files"), "/admin/files");
});
