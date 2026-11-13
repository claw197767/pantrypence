export function safeNextPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(path)) {
    return "/members";
  }
  return path;
}
