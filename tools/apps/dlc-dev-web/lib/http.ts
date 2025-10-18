// tools/apps/dlc-dev-web/lib/http.ts
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getApiBase(): string {
  // Server: only API_BASE_URL (do not leak server-only vars to client bundle)
  if (!isBrowser()) return process.env.API_BASE_URL || 'http://localhost:30089';
  // Client: prefer NEXT_PUBLIC_API_BASE_URL, otherwise same-origin
  return (process.env.NEXT_PUBLIC_API_BASE_URL as string) || '';
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (isBrowser() && base === '') return p; // same-origin in browser
  try {
    return new URL(p, base).toString();
  } catch {
    return `${base}${p}`;
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const headers = new Headers((init && init.headers) as HeadersInit || {});
  if (!headers.has('Content-Type') && init && init.body) headers.set('Content-Type', 'application/json');
  // Optional: attach auth token from cookies or other storage here
  const res = await fetch(url, { ...init, headers, cache: 'no-store' as any });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${url}: ${text}`);
  }
  return res;
}
