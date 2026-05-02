# Shared Frontend Guide — JWRG / JWLC

Common rules for both Astro sites that consume `office.jwrgnc.com`. Both Claude sessions (when editing `~/code/jwrg` or `~/code/jwlc`) should follow this.

> Suggested workflow: keep this file as the canonical source in one repo and have each site's `CLAUDE.md` link to it (or symlink / git submodule it in). Do **not** maintain two divergent copies by hand.

## The two sites

| | JWRG | JWLC |
|---|---|---|
| Repo | `~/code/jwrg` | `~/code/jwlc` |
| Domain | juliewrightrealtygroup.com | land.jwrglc.com |
| Site slug (API filter) | `?site=jwrg` | `?site=jwlc` |
| Brand | Julie Wright Realty Group (full-service residential) | Julie Wright Land Company (land brokerage) |
| Stack | Astro 5 + Tailwind 4 + TS strict | Astro 5 + Tailwind 4 + TS strict |
| Backend | `office.jwrgnc.com` (Laravel/Filament at `~/Herd/jwrg_office`) | same |

## The backend

- Laravel 12 + Filament v5 + Passport + Scout — see `~/Herd/jwrg_office/CLAUDE.md`.
- REST API: `https://office.jwrgnc.com/api/v1` (also reachable as the Herd URL in dev).
- MCP server `office-jwrg` exposes a subset (search/get listings, set sites). Note: the MCP shape currently differs from the REST shape — the REST payload is richer (photos, agent, documents). Prefer REST for anything image- or detail-related.
- Open requests for the backend live in `~/code/jwrg/OFFICE_MCP_REQUESTS.md` — append to that file rather than DM'ing the office Claude ad-hoc.

## API client (`src/lib/api.ts`)

Both sites have nearly identical `src/lib/api.ts` files. **Keep them in sync.**

The shared contract (current):

```ts
const BASE_URL = 'https://office.jwrgnc.com/api/v1';
// site slug differs per repo
fetchListings(query)  // GET /listings?site=<slug>&...
fetchListing(slug)    // GET /listings/{slug}
submitForm(formId, payload)  // POST /forms/{formId}/submit  (jwrg only — port to jwlc when needed)
```

When changing the API client:

1. **Make the change in both repos** (or extract to a shared package — see below).
2. Keep the `ApiListing` / `ApiPhoto` / `ApiDocument` types **identical** between the two repos. They're a copy of the office REST contract.
3. Don't introduce site-specific fields into the shared types — add a per-site adapter on top instead.

If divergence becomes painful, extract `src/lib/api.ts` to a sibling package (`~/code/jwrg-api`?) and have both sites import it. Don't do this prematurely.

## Image handling

**Server-side optimization only.** Neither site runs Sharp / Squoosh / on-build resizing on listing images. The office API returns ready-to-serve URLs at multiple sizes (`thumbnail`, `web`, `full`, `original`); use those directly.

- Local images (team photos, hero shots, brand assets stored in `public/images/`) — fine to optimize on build via Astro's built-in `<Image>` component.
- Listing photos coming from the API — render `<img>` with the appropriate API URL. Do **not** pipe API URLs through Astro's `getImage()` or any local transform.
- See `OFFICE_MCP_REQUESTS.md` §4 for the variants we still want from the backend (AVIF/WebP, more widths, intrinsic dimensions, alt text).

> **Note for JWLC:** the current `~/code/jwlc/CLAUDE.md` says "Image optimization via Sharp" — that line is stale and should be removed when this guide is wired in. Sharp is fine for local assets; it should not be used on API images.

## Status / labeling

The office API returns raw status (`active`, `coming_soon`, `pending`, `under_contract`, `sold`) plus a `status_label` string. Both sites map raw status to a public-facing label:

- `active` / `coming_soon` → "Available"
- `pending` / `under_contract` → "Pending"
- `sold` → "Sold"

JWRG's `publicStatus()` helper in `src/lib/api.ts` is the canonical mapping. JWLC's `normalizeLabel()` is a simpler, older version — bring it forward.

## Featured flag

Today `featured` is a single global bool from the API. If a listing is featured, it appears in homepage hero blocks on **every** consuming site. If we ever need per-site featured logic, it goes in `OFFICE_MCP_REQUESTS.md` — don't fork the logic on the frontend.

## Site filtering

`?site=jwrg` / `?site=jwlc` is enforced server-side. Do **not** add client-side filtering of "is this listing for our site?" — trust the backend. If a listing appears that shouldn't, it's a backend bug (or a missing entry in `set-listing-sites`).

## Forms

- JWRG submits forms via `POST /api/v1/forms/{formId}/submit`.
- JWLC has not yet wired forms — when it does, use the same client (port `submitForm()` from JWRG).
- Backend form IDs come from the Filament admin (TBD — see `OFFICE_MCP_REQUESTS.md` §8 for the contract clarifications we need).

## Build / deploy

| | JWRG | JWLC |
|---|---|---|
| Build | `npm run build` → `./dist/` | same |
| Adapter | static (or `@astrojs/node` standalone) | `@astrojs/node` standalone, all pages prerendered |
| Deploy | TBD | Push to `master` triggers Ploi webhook |

Both sites should rebuild on listing change. Until the backend has a webhook (`OFFICE_MCP_REQUESTS.md` §7), full rebuilds happen on a schedule or manually.

## Editing rules

When editing either site:

1. **Read this file first.** If a rule here applies, follow it. If you're about to violate it, stop and update this file (with the user's input) instead.
2. If a change should apply to both sites, **make it in both** in the same session — don't leave them divergent.
3. New backend asks → append to `OFFICE_MCP_REQUESTS.md`, don't ask the office Claude ad-hoc.
4. Don't introduce client-side image transforms on API URLs.
5. Keep `src/lib/api.ts` types aligned with the office REST contract. If REST adds fields, mirror them here. If REST changes a field, coordinate via `OFFICE_MCP_REQUESTS.md`.

## Open questions

- Should `src/lib/api.ts` be extracted to a shared package?
- Should this guide live in a third repo / location, or stay in JWRG with JWLC pointing to it?
- Should brand tokens (colors, fonts) be shared, or are the two brands intentionally different enough to keep separate?
