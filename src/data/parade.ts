// Parade of Homes on JWRG (/parade). Driven by the office Parade model
// (APP-JWRG-0002, `GET /parades/{slug}`): the communities, their order, the
// entries and the public dates all come from the payload.
//
// The office slug of the parade this site shows.
export const PARADE_SLUG = 'parade-of-homes-2026';

// Fallback heading when the parade payload isn't available.
export const PARADE_TITLE = 'Parade of Homes 2026';

// Community microsites that have their own lot pages, by office neighborhood
// slug. A lot entry links to its page there; communities without a site get no
// link. Tennyson and Aubrie route lots on the plat lot number (`/lots/3`,
// `/homesites/3`), Preserve West likewise under `/lots/`.
const COMMUNITY_LOT_BASES: Record<string, string> = {
  'preserve-west': 'https://preservewest.jwrgnc.com/lots/',
  tennyson: 'https://tennyson.jwrgnc.com/lots/',
  'aubrie-place': 'https://aubrieplace.jwrgnc.com/homesites/',
};

export function communityLotUrl(neighborhoodSlug: string | null | undefined, lotNumber: string | null | undefined): string | null {
  const base = neighborhoodSlug ? COMMUNITY_LOT_BASES[neighborhoodSlug] : undefined;
  return base && lotNumber ? `${base}${encodeURIComponent(lotNumber)}` : null;
}

const ET = 'America/New_York';
const etDay = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ET, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const etFmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: ET, ...o }).format(new Date(iso));

function etHours(starts: string, ends: string): string {
  const parts = (iso: string) => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: ET, hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(new Date(iso));
    const hour = p.find((x) => x.type === 'hour')?.value ?? '';
    const minute = p.find((x) => x.type === 'minute')?.value ?? '00';
    const mer = (p.find((x) => x.type === 'dayPeriod')?.value ?? '').toLowerCase();
    return { time: minute === '00' ? hour : `${hour}:${minute}`, mer };
  };
  const s = parts(starts);
  const e = parts(ends);
  return s.mer === e.mer ? `${s.time}–${e.time} ${e.mer}` : `${s.time} ${s.mer}–${e.time} ${e.mer}`;
}

export interface ParadeDateRange {
  /** "Oct 3–4", or "Oct 31–Nov 1" across a month end, or "Oct 3" for one day. */
  label: string;
  /** ISO date (Eastern) of the run's first day, for <time datetime>. */
  start: string;
}

export interface ParadeSchedule {
  /** Consecutive open days grouped into runs (a parade weekend is one run). */
  ranges: ParadeDateRange[];
  /** "Saturdays & Sundays" when every run is a Sat–Sun weekend, else null. */
  days: string | null;
  /** "12–5 pm" when every window keeps the same hours, else null. */
  hours: string | null;
}

/**
 * Condenses the office's open windows (one per day) into weekend-style ranges
 * plus shared hours: "Oct 3–4 · Oct 10–11 · Oct 17–18", "Saturdays & Sundays",
 * "12–5 pm". `hours` is null when the windows' hours differ — show the per-day
 * list then.
 */
export function summarizeParadeDates(dates: { starts_at: string; ends_at: string }[]): ParadeSchedule {
  const sorted = [...dates].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const runs: { starts_at: string }[][] = [];
  for (const d of sorted) {
    const run = runs[runs.length - 1];
    const prev = run?.[run.length - 1];
    const gap = prev ? (Date.parse(etDay(d.starts_at)) - Date.parse(etDay(prev.starts_at))) / 86_400_000 : NaN;
    if (run && gap <= 1) run.push(d);
    else runs.push([d]);
  }

  const ranges = runs.map((run) => {
    const first = run[0].starts_at;
    const last = run[run.length - 1].starts_at;
    const month = (iso: string) => etFmt(iso, { month: 'short' });
    const day = (iso: string) => etFmt(iso, { day: 'numeric' });
    const label =
      etDay(first) === etDay(last)
        ? `${month(first)} ${day(first)}`
        : month(first) === month(last)
          ? `${month(first)} ${day(first)}–${day(last)}`
          : `${month(first)} ${day(first)}–${month(last)} ${day(last)}`;
    return { label, start: etDay(first) };
  });

  const weekday = (iso: string) => etFmt(iso, { weekday: 'short' });
  const allWeekends =
    runs.length > 0 &&
    runs.every((r) => r.length === 2 && weekday(r[0].starts_at) === 'Sat' && weekday(r[1].starts_at) === 'Sun');

  const hourSet = new Set(sorted.map((d) => etHours(d.starts_at, d.ends_at)));

  return {
    ranges,
    days: allWeekends ? 'Saturdays & Sundays' : null,
    hours: hourSet.size === 1 ? [...hourSet][0] : null,
  };
}
