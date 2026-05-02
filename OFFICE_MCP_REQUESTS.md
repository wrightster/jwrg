# Office API / MCP — Requests for the office.jwrgnc.com Claude

Notes for the Claude instance maintaining the Laravel app at `~/Herd/jwrg_office` (production: `office.jwrgnc.com`). Two Astro front-ends consume this backend:

- `~/code/jwlc` → `https://land.jwrglc.com` (Julie Wright Land Company), uses `?site=jwlc`
- `~/code/jwrg` → juliewrightrealtygroup.com (rebuild in progress), uses `?site=jwrg`

Both should be treated as equal first-class consumers. Anything added to the API for one should work for the other.

## 1. MCP ↔ REST shape parity (highest priority)

The REST API at `/api/v1/listings` and `/api/v1/listings/{slug}` returns a rich payload (the Astro sites' `ApiListing` type in `src/lib/api.ts` is the de-facto contract):

- flat `address` string + `address_line_2`, `city`, `state`, `zip`, `county`
- `latitude`, `longitude`
- `status_label`, `featured`, `agent: { name, phone }`
- `primary_photo` (with `urls: { thumbnail, web, full, original }`), `photos[]` on detail, `documents[]`
- `photo_count`, `mls_number`, `list_date`, `days_on_market`, etc.

The `office-jwrg` MCP `search-listings` / `get-listing` tools return a **different, sparser** shape: nested `address` object, no `agent`, no `primary_photo` / `photos`, no `documents`, no lat/lng, no `status_label`. Internal Claude sessions using MCP can't see what front-end Claude sessions see via REST.

**Ask:** have the MCP tools serialize through the same Eloquent API Resource(s) the REST endpoints use — ideally a thin wrapper that returns identical JSON. Same fields, same casing, same nullability.

## 2. Surface `marketing_sites` on read (for debugging / sync)

Site filtering already works via the `?site=` query param on REST, which is great. But the read responses don't tell you which sites a given listing is published on. `set-listing-sites` is a write tool, so the data exists.

Add a `marketing_sites: ["jwrg", "jwlc", ...]` field on both list and detail responses (REST and MCP). Useful for:

- Debugging "why isn't this showing on jwrg?" without running a write tool to find out.
- Admin tools / Filament UI that shows publication status.
- Cross-site reporting.

## 3. Discoverable site list

Add a `list-sites` MCP tool / `GET /api/v1/sites` REST endpoint returning the canonical site slugs and human names. Right now `set-listing-sites` requires passing the "full desired set" with no way to discover the valid set.

## 4. Image variants — the real gap

Today each photo exposes 4 fixed sizes: `thumbnail`, `web`, `full`, `original`. That's a great starting point but missing for a modern frontend:

### 4a. Width / height in the payload

Astro's `<Image>` and `<Picture>` need intrinsic dimensions to reserve layout space (CLS). Add per-photo:

```json
"primary_photo": {
  "width": 4032,
  "height": 3024,
  "urls": { "thumbnail": "...", "web": "...", "full": "...", "original": "..." }
}
```

Or per-variant width/height inside `urls`.

### 4b. Modern formats (AVIF, WebP)

Currently the URLs serve a single format (JPEG). Add AVIF + WebP variants alongside the existing JPEG, e.g.:

```json
"urls": {
  "thumbnail": { "jpg": "...", "webp": "...", "avif": "..." },
  "web":       { "jpg": "...", "webp": "...", "avif": "..." },
  "full":      { "jpg": "...", "webp": "...", "avif": "..." },
  "original":  "..."
}
```

(or whatever shape — just needs format negotiation per size.)

### 4c. More widths for `srcset`

`thumbnail / web / full` is fine for three discrete uses, but a real `srcset` wants more rungs. Recommended widths: `400, 800, 1200, 1600, 2400`. Either pre-render all of them, or sit the image storage behind a resize-on-demand CDN (Cloudflare Images, imgproxy, Bunny Optimizer) and document the URL pattern.

### 4d. Server-side optimization is the contract

Astro **will not** run Sharp / Squoosh / on-build optimization on these images. Reasons:

- The office app is the single source of truth for media.
- Astro builds need to stay fast — especially since both sites rebuild on every CMS edit.
- Other consumers (email, MLS feeds, syndication, the Filament admin) all benefit from one set of pre-rendered assets.

Implementation options on the office side:
- Spatie's `laravel-medialibrary` with image conversions registered per listing-image model (queued conversions, disk-abstracted).
- Front the storage bucket with an image CDN that handles resize/format on-demand.

API returns final URLs only — never source/originals as the primary URL.

### 4e. Alt text

Photo records currently have `caption` but no `alt`. These are different things — captions are display copy, alt text is for screen readers and SEO and should describe the image content. Add `alt` separately and require it in the admin UI for new uploads.

### 4f. Stable URLs

Image URLs must not change every time a listing is edited (as long as the image binary itself hasn't changed). Use content-hashed filenames or stable IDs in the path so CDN caches and Astro's build cache don't have to refetch the world after every minor edit.

## 5. Sparse listing metadata

Across all 15 current listings (queried via MCP), every record has `null` for:

- `mls_number`, `list_date`, `listing_agent`, `co_listing_agent`, `neighborhood`, `days_on_market`
- specs: `bedrooms`, `bathrooms_full/half`, `sqft`, `year_built`, `garage_spaces`, `stories`

For raw land listings, the spec fields are expected. But `list_date` and `listing_agent` should be populated for every active listing. Confirm: are these genuinely empty in the DB, or is the MCP serializer stripping them? (Cross-reference with the REST output — the front-end `ApiListing` type expects them.)

## 6. Slug stability contract

Slugs are used as URLs on both Astro sites. Document the contract:

- Are slugs guaranteed immutable once a listing goes `active`?
- If a slug must change, is the old slug stored on the record so consumers can build redirects?
- Is there a webhook / event that fires on slug changes?

## 7. Incremental sync hooks

For Astro builds (and email blasts, MLS sync, etc.), an `?updated_after=<iso8601>` filter on `search-listings` would let consumers pull only what changed. Bonus: ETag / `Last-Modified` on `get-listing` for conditional requests.

A webhook (publish/update/unpublish events with the listing slug) would unlock on-demand rebuilds — both Astro sites are static, so they currently re-fetch everything on every deploy.

## 8. Form submission endpoint contract

JWRG's `src/lib/api.ts` already calls `POST /api/v1/forms/{formId}/submit`. Document:

- Where form IDs come from (Filament admin? config?).
- The expected validation response shape (currently the front-end expects `{ ok, message, errors? }`).
- Rate-limiting / spam protection expectations on the backend.

## 9. Featured flag semantics

`featured: bool` is exposed today. Confirm it's a global "show on every consumer's homepage" flag, vs. something that should be per-site. If both sites want their own featured set, this needs to become `featured_on_sites: ["jwrg"]` or move into a join table.
