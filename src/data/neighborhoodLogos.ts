// Neighborhoods that display a local brand logo (from public/images/neighborhoods/)
// over the site background instead of an API photo. Shared by the neighborhoods
// index grid (index.astro) and the detail page ([slug].astro) so both show the
// same mark for a given neighborhood.
//
// `scale` optically balances the marks so they read at a similar size. Each logo
// was rendered and measured on two axes — bounding-box extent (how far it spans)
// and ink mass (how bold/dense it is) — because a logo looks "big" if it's large
// by EITHER (a wide thin wordmark, or a small bold emblem). Perceived size = the
// max of the two (each normalized across the set); heavier/wider marks scale down
// toward the lightest (preserve-west = 1.0). Recompute if artwork changes.
//
// `aspect` is the SVG's intrinsic width/height (from its viewBox). The detail
// page uses it to size the hero container to the logo's own box (so it hugs the
// mark with no empty top/bottom space); the grid doesn't need it. Update it if
// you swap the artwork.

export interface NeighborhoodLogo {
  src: string;
  scale?: number;
  aspect?: number;
}

export const neighborhoodLogos: Record<string, NeighborhoodLogo> = {
  'aubrie-place': { src: '/images/neighborhoods/aubrie-place.svg', scale: 0.86, aspect: 1 },
  'bragg-farm': { src: '/images/neighborhoods/bragg-farm.svg', scale: 0.85, aspect: 2.56 },
  'cannady-mill-rd-lots': { src: '/images/neighborhoods/cannady-mill-rd-lots.svg', scale: 0.78, aspect: 1.6 },
  'cedar-knolls': { src: '/images/neighborhoods/cedar-knolls.svg', scale: 0.95, aspect: 2.705 },
  'colvard-farms': { src: '/images/neighborhoods/colvard-farms.svg', scale: 0.79, aspect: 1 },
  'preserve-west': { src: '/images/neighborhoods/preserve-west.svg', aspect: 1 },
  'tennyson': { src: '/images/neighborhoods/tennyson.svg', scale: 0.90, aspect: 1.25 },
  'woodland-park': { src: '/images/neighborhoods/woodland-park.svg', scale: 0.85, aspect: 1.6 },
  'yancey-farms': { src: '/images/neighborhoods/yancey-farms.svg', scale: 0.92, aspect: 2 },
};
