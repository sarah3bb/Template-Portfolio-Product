const PRODUCTION_APP_URL = 'https://template-portfolio-product.vercel.app';

function normalizedAppUrl() {
  const configuredUrl = import.meta.env.VITE_APP_URL?.trim();

  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl);
      if (parsed.protocol === 'https:' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.origin;
      }
    } catch {
      // Fall through to a safe runtime/default origin when configuration is invalid.
    }
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return origin;
  }

  return PRODUCTION_APP_URL;
}

export function getPasswordResetRedirectUrl() {
  return new URL('/reset-password', normalizedAppUrl()).toString();
}
