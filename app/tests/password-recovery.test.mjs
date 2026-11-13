import test from "node:test";
import assert from "node:assert/strict";
import { passwordRecoveryRedirect } from "../lib/password-recovery.ts";

test("recovery links return through the callback and password form to the requested page", () => {
  const callback = new URL(passwordRecoveryRedirect("https://example.test", "/api/checkout?plan=monthly"));
  assert.equal(callback.origin, "https://example.test");
  assert.equal(callback.pathname, "/auth/callback");
  const passwordPage = new URL(callback.searchParams.get("next"), callback.origin);
  assert.equal(passwordPage.pathname, "/account/password");
  assert.equal(passwordPage.searchParams.get("next"), "/api/checkout?plan=monthly");
});

test("recovery links keep the admin destination within the nested password URL", () => {
  const callback = new URL(passwordRecoveryRedirect("https://example.test", "/admin/files"));
  const passwordPage = new URL(callback.searchParams.get("next"), callback.origin);
  assert.equal(passwordPage.pathname, "/account/password");
  assert.equal(passwordPage.searchParams.get("next"), "/admin/files");
});
