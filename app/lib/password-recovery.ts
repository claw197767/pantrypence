export function passwordRecoveryRedirect(origin: string, next: string) {
  const passwordUrl = new URL("/account/password", origin);
  passwordUrl.searchParams.set("next", next);
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", `${passwordUrl.pathname}${passwordUrl.search}`);
  return callbackUrl.toString();
}
