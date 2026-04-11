/**
 * fetch with an automatic AbortController timeout.
 * Defaults to 10 seconds; pass `ms` to override.
 */
export function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  ms = 10_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}
