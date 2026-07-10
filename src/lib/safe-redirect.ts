const DEFAULT_ADMIN_REDIRECT = "/admin";

export function getSafeRedirectUrl(
  callbackUrl: string | null | undefined,
  fallback = DEFAULT_ADMIN_REDIRECT,
): string {
  if (!callbackUrl) {
    return fallback;
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  let decoded = callbackUrl;
  try {
    decoded = decodeURIComponent(callbackUrl);
  } catch {
    return fallback;
  }

  if (decoded.startsWith("//") || decoded.includes("://") || decoded.includes("\\")) {
    return fallback;
  }

  if (!decoded.startsWith("/admin") || decoded.startsWith("/admin/login")) {
    return fallback;
  }

  return callbackUrl;
}