// Interim best-effort neighborhood coordinates, keyed by office slug. The
// office neighborhood records are the source of truth for lat/lng, but the
// office write path was unavailable when the neighborhood map shipped, so
// these seed the maps in the meantime. Office lat/lng, once set, takes
// precedence (consumers merge `n.latitude ?? seed`). Delete this file once
// every neighborhood carries coordinates in the office — do NOT grow it into
// a permanent static coords file (that's the office's job).
// Confidence: cedar-knolls/aubrie-place/bragg-farm/cannady-mill = in-subdivision
// geocodes; tennyson/kirkland/colvard/woodland = road/place-level; preserve-west
// + yancey-farms = low-confidence offsets to verify.
export const SEED_COORDS: Record<string, [number, number]> = {
  'cedar-knolls': [36.072282, -78.556095],
  tennyson: [36.058341, -78.595311],
  'preserve-west': [36.1, -78.56],
  'aubrie-place': [36.075973, -78.573054],
  'yancey-farms': [36.101816, -78.458054],
  'kirkland-at-wilton': [36.142909, -78.577572],
  'bragg-farm': [36.088441, -78.583083],
  'cannady-mill-road-lots': [36.172495, -78.57346],
  'colvard-farms': [35.866904, -78.95692],
  'woodland-park': [36.319346, -78.573973],
};
