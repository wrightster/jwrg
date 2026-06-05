/**
 * Source attribution capture. The office short-URL redirect appends
 * `ref=<code>` (+ utm_* params) to landing URLs — we stash them in
 * sessionStorage on arrival and echo them back as top-level keys on form
 * submissions, so the office can link the lead to the short URL / campaign.
 * Survives the visitor browsing several pages before submitting.
 */
const KEY = 'jwrg_source';
const PARAMS = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

/** Call once per page load (BaseLayout). Merges new params over stored ones. */
export function captureSource(): void {
  try {
    const qs = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const param of PARAMS) {
      const value = qs.get(param);
      if (value) found[param] = value;
    }
    if (Object.keys(found).length === 0) return;
    sessionStorage.setItem(KEY, JSON.stringify({ ...getStoredSource(), ...found }));
  } catch {
    // sessionStorage unavailable (private mode quirks) — attribution is best-effort
  }
}

/** Stored source params to merge into form submission payloads. */
export function getStoredSource(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}
