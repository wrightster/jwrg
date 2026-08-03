# JWRG — Julie Wright Realty Group

## Project Overview

Real estate website for a North Carolina full-service brokerage (Triangle / Wake / Franklin / Durham / Granville areas). Astro 5 with SSR (Node.js standalone adapter), Tailwind 4, TypeScript strict mode. Sister site to **JWLC** (`../jwlc/`) — both consume the same backend.

> **Read this first when editing:** `../../SHARED_FRONTEND_GUIDE.md` (two levels up, at the workspace root). It defines rules that apply to both JWRG and JWLC. This CLAUDE.md only covers JWRG-specific details.

## Environments

- **Local dev**: `npm run dev` → localhost:4321
- **Backend**: `https://office.jwrgnc.com` (Laravel/Filament at `~/Herd/jwrg_office`)
- **Site slug for API filtering**: `jwrg` (set in `src/lib/api.ts` as `SITE_SLUG`)
- **Production**: **https://juliewrightrealtygroup.com** (apex + www) — **live on Coolify** (its own DO droplet, zero-downtime deploys) since 2026-07. See §"Deployment" below and `deploy/COOLIFY-PILOT.md`.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Production build to `./dist/`
- `npm run start` — Run production server (`HOST=127.0.0.1 PORT=4342 node ./dist/server/entry.mjs`)
- `npm run preview` — Astro preview

## Deployment (Coolify, since 2026-07)

Production `juliewrightrealtygroup.com` (apex + www) runs on **Coolify** on its own
DigitalOcean droplet — **not** the shared Ploi box — with **zero-downtime** rolling
deploys. Full runbook + operational IDs (project/app/server UUIDs, API access) in
**`deploy/COOLIFY-PILOT.md`**. Essentials:

- **Container**: `Dockerfile` (multi-stage) builds the `@astrojs/node` standalone
  server. It binds `0.0.0.0:4321` (the `npm run start` `127.0.0.1` bind is local-only
  and fatal in a container) and installs `curl` for Coolify's in-container health
  check (`GET /healthz` → `src/pages/healthz.ts`). Don't remove either.
- **Deploys**: **push to `main` auto-deploys** — `.github/workflows/deploy-coolify.yml`
  joins the tailnet and calls the Coolify deploy API (org-level secrets +
  `COOLIFY_APP_UUID` repo variable). You can also deploy manually via the Coolify
  API/dashboard. The old Ploi jwrg site no longer receives traffic; retire it when
  convenient.
- **Staging**: a `staging` branch deploys to **`jwrg.stage.jwrgnc.com`** (Coolify
  `staging` environment, app `jwrg-staging`). Staging sets `SITE_ENV=staging`,
  which emits `noindex` (robots.txt is SSR + reads it at runtime; the `<meta
  name="robots">` bakes at build via the Dockerfile `SITE_ENV` ARG). It reads the
  **same prod office API** — test forms with a `+test` email so the office skips
  agent notification. Flow: push `staging` → preview → fast-forward into `main`.
- **Management plane is Tailscale-only** — Coolify's dashboard/API is not public.
- **Analytics**: a self-hosted Umami snippet (`is:inline`) is in `BaseLayout.astro` `<head>` → `analytics.jwrgnc.com` (cookieless). Form conversions are tracked by the office widget (`forms.js`), not here. See `../../SHARED_FRONTEND_GUIDE.md` §"Analytics".
- **Legacy redirects live in the app** so they travel with it onto Traefik: exact
  Dakno→new-site 301s are in `astro.config.mjs` `redirects`; prefix fallbacks
  (`/staff`, `/neighborhood`, `/area`, `/property`) are SSR catch-all routes at
  `src/pages/<prefix>/[...slug].ts` — **not** middleware (node-standalone serves the
  prerendered 404 before middleware runs, so a 404-gated fallback silently never
  fires). `search.*` redirects at the Cloudflare edge. Reference map:
  `deploy/jwrg-legacy-redirects.conf`.

## Architecture

```
src/
├── components/       # Astro components
│   ├── BackLink.astro        # "Back to X" up-one-level link (Resources pages; href/label = the PARENT)
│   ├── BtnArrow.astro        # Animated three-piece arrow button (.btn-arrow)
│   ├── DocumentViewerModal.astro # In-page doc viewer modal — PDFs via PDF.js (see "Document viewer")
│   ├── GlossaryCallout.astro # Short full-width card → Real Estate 101 (top of Resources pages)
│   ├── EmbedForm.astro       # Office embed-form widget adapter (loads forms.js, bound to a form token)
│   ├── FontSwitcher.astro    # Dev-only design panel (fonts/colors); inert in prod
│   ├── ListingCard.astro     # Card view for a listing (grid) — beds/baths/sqft
│   ├── ListingRow.astro      # Row view for a listing (list layout)
│   ├── MiniContactForm.astro # Contact info + message form band
│   ├── PageBanner.astro      # Page header band (.page-banner)
│   ├── Section.astro         # Section wrapper (label/heading/description)
│   └── TeamCard.astro        # Broker / agent card
├── data/             # Static site content as TypeScript
│   ├── buyerFaq.ts        # Buyer FAQ entries
│   ├── counties.ts        # NC county data (areas served); ordered by descending population
│   ├── countyShapes.ts    # Generated county silhouette SVG paths (About "Triangle Area")
│   ├── keyTerms.ts        # Real estate glossary
│   ├── movingTips.ts      # Relocation moving-tips content
│   ├── neighborhoodSites.ts  # slug → external community-site URL
│   ├── site.ts            # Global site metadata (name, contact, service-area counties, embed-form tokens)
│   └── stagingTips.ts     # Seller staging-tips content
│   # NOTE: embed-form tokens live in site.ts (site.formTokens) — there is no forms.ts.
│   # NOTE: team + neighborhoods are NOT static — they come from the office API
│   #       (fetchTeam / fetchNeighborhoods). No src/data file for them.
├── layouts/
│   └── BaseLayout.astro   # Shell: parallax topo bg + fixed flat nav + footer
├── lib/
│   ├── api.ts             # Office API client — see ../../SHARED_FRONTEND_GUIDE.md
│   └── source.ts          # Captures ref/utm_* landing params for form-submission attribution
├── pages/
│   ├── about/             # Single consolidated About page (index) + team/[slug] agent profiles
│   ├── resources/         # Hub (index) → buyers/ sellers/ relocation/ subsections
│   │   ├── buyers/            # Buying guide, FAQ, mortgage calc, RE 101
│   │   ├── sellers/           # Home value, list-your-property, staging, sold reports
│   │   └── relocation/        # Relocation package, moving tips
│   ├── neighborhoods/     # Index + [slug] dynamic pages
│   ├── listings/          # Index + [slug] dynamic property detail
│   ├── 404.astro
│   ├── accessibility.astro
│   ├── contact.astro
│   ├── index.astro
│   ├── neighborhood-map.astro
│   ├── privacy.astro
│   ├── property-organizer.astro
│   └── search.astro          # Full Triangle MLS search (Flexmls iframe)
└── styles/
    └── global.css         # @import tailwindcss + shared tokens/components + self-hosted @font-face
                           # + JWRG chrome classes (nav/footer/banner). Page- and component-level
                           # classes (.hero, .listing-card, .filter-bar, …) live in @jw/shared/components.css.
```

Logos live in `public/`: `JWRG_Full.svg` (footer/hero), `JWRG_Full_Gold.svg` /
`JWRG_Full_White.svg` (reversed on dark), `JWRG_Icon_Inset.svg` (favicon — square
red badge with gold glyph), `JWRG_Icon_Horizontal_Inverse.svg` (nav-logo mask —
horizontal wordmark letterforms only, no box, matching JWLC's nav treatment).
Also present but unused by the current chrome: `JWRG_Icon.svg`, `JWRG_Icon_Red.svg`,
`JWRG_Icon_Horizontal.svg` (boxed variant). The shared topo overlay is
`public/FallTopo_v2.svg`. Masters: `wrightster/JW-Brand-Assets`.

- **SSR mode** via `@astrojs/node` standalone adapter (`output: 'server'` in `astro.config.mjs`). Most pages should set `export const prerender = true` for static output unless they genuinely need request-time rendering.
- **Listings via API** — fetched from `office.jwrgnc.com/api/v1` filtered by `?site=jwrg`. See `../../SHARED_FRONTEND_GUIDE.md` for the contract.
- **Team & neighborhoods via API** — fetched from the office (`fetchTeam` / `fetchNeighborhoods` in `src/lib/api.ts`), same as listings. They are *not* static — but see "Server islands" below: as of 2026-07 the `/listings`, `/neighborhoods`, and `/about` **pages** are prerendered shells and the actual API fetch happens inside a deferred island component, not the page.
- **Server islands (perceived-perf, 2026-07)** — the home page (`index.astro`), `/listings`, `/neighborhoods`, and `/about` were flipped from full SSR to a **prerendered static shell** whose data-bound section is a `server:defer` island that fetches its own data: `FeaturedListings.astro`, `ListingsBrowser.astro`, `NeighborhoodGrid.astro`, `TeamGrid.astro` in `src/components/`. The shell + banner paint instantly; the section streams in behind a `slot="fallback"` skeleton (`animate-pulse`). **Caveat that shaped the design:** a client `<script>` placed *inside* a server island runs unreliably ([withastro/astro#12294](https://github.com/withastro/astro/issues/12294)) — so the listings filter/pagination/view-toggle controller stays on the **page** (`listings/index.astro`), wrapped in `initListings()` and gated on the island arriving: the island root carries `data-listings-ready`, and a `MutationObserver` on `#listings-mount` fires the controller once it appears. Islands with no client script (featured strip, team, neighborhoods) need no gating — only the listings page has one. Mirrored on JWLC (`index.astro`, `listings.astro`, `about.astro`). `BaseLayout` also `preconnect`s to `office.jwrgnc.com` (photo host).
- **Static content** (FAQs, glossary, moving/staging tips, counties, site metadata) lives in `src/data/*.ts`.
- **No React/Vue** — pure Astro components.

### Listing status labels

The office labels the `active` status **"Active"** (`status_label`, from
`ListingStatus::getLabel()`), but the public sites say **"Available."** Both
JWRG and JWLC therefore run every listing through `normalizeListingLabel()`
(`@jw/shared/api`) inside their `src/lib/api.ts` shim, which rewrites
`status_label` and nothing else.

Apply it in **all three** listing-returning fetchers — `fetchListings`,
`fetchAllListings`, and `fetchListing`. The last one is easy to miss: without a
local override it falls through to `export * from '@jw/shared/api'` and the
detail page silently reads "Active" while the cards read "Available."

The raw `status` key stays `active`. Anything that keys off it — the
`[data-status]` pill colors, the `?status=a` filter, `publicStatus()`, the
sitemap's `INDEXABLE` set, JSON-LD availability — is unaffected. Don't "fix"
those to `available`.

`fetchListing` also enforces **site publication**: the office's by-slug
endpoint isn't site-scoped (unlike the index's `?site=jwrg` filter), so a
listing detached from JWRG still resolves by slug. The shim guards on
`marketing_sites?.includes(SITE_SLUG)` and returns `null` when it doesn't —
so the detail route redirects to `/listings` for a listing that isn't
published here. Keep this guard when refactoring the shim.

### Document viewer (PDF.js — don't regress to an iframe)

Document links on the listing + neighborhood detail pages open in
`DocumentViewerModal.astro`. PDFs render through **PDF.js**
(`pdfjs-viewer-element`, the same pairing as the back office's preview modal)
— **not** a bare `<iframe>`: Android Chrome has no embeddable PDF plugin, so
an iframe'd PDF degrades to a gray "Open this file" placeholder on every
phone (desktop Chrome's native plugin masks the problem). Three parts:

- **`public/vendor/pdfjs/`** — the vendored PDF.js generic viewer build,
  copied from `jwrg_office/public/vendor/pdfjs` (minus `*.map`, the debugger,
  and the sample PDF). Keep its version in step with the `pdfjs-viewer-element`
  npm pin when upgrading either.
- **`src/pages/documents/[id].ts`** — same-origin SSR proxy streaming the
  office's `GET /api/v1/documents/{id}?inline=1`. Required because PDF.js's
  viewer refuses files from another origin and the office API sends no CORS
  headers; it also gives the URL a same-origin path. UUID-validated; only
  office inline-safe mimes come back inline (scriptable types force download
  upstream), so it can't serve HTML into our origin.
- **`data-doc-id`** on every `data-doc-viewer` link (the modal builds the
  proxy URL from it). A PDF link without an id falls back to the old iframe
  — i.e. broken on mobile — so keep the attribute when adding new document
  lists.

## Design System

As of the **2026 rebrand**, JWRG shares brand tokens + fonts with JWLC —
red·earth·gold with Gabarito (display) and Anek Latin (body) — keeping JWRG's
own logo and residential content. The full system (tokens + every component
class) lives in `src/styles/global.css`. Class names (e.g. `.cta-bold`/
`.cta-feature`/`.cta-subtle`) and brand tokens are kept in sync with
`../jwlc/src/styles/global.css`, but JWRG's chrome (nav, footer, top page banner)
uses an **inverted** red/gold treatment — solid red bands with gold accents —
while JWLC keeps the original light gold→sand gradient. So: share tokens and
class structure across both; do *not* assume visual treatments mirror.

### Colors (defined in `src/styles/global.css` `@theme`)

| Family | Use |
|---|---|
| `red-*` (50–950) | Dark accent / red clay — CTAs, links, badges, section labels, footer bg, top page-banner bg. `red-600` (`#b52126`) is the primary site color |
| `gold-*` (50–950) | Light accent / muted gold — selection, pending badge, page-banner title/label text. `gold-300` (`#ffcf7d`) |
| `earth-*` (50–950) | Neutrals — page bg (`earth-50`), cards (`earth-100`), body text (`earth-700`), dark sections + main text (`earth-900`) |

In Tailwind use `bg-red-600`, `text-earth-900`, etc.; the same tokens are
available as `var(--color-red-600)` in plain CSS.

### Typography

- `--font-display: 'Gabarito'` — `h1–h5`, `.font-display`, buttons, labels (weight via `--font-display-weight`, default 700)
- `--font-body: 'Anek Latin'` — body text (weight via `--font-body-weight`, default 400)
- Loaded via Google Fonts in `BaseLayout.astro`; switchable at dev time via `FontSwitcher`.

### Component classes

Reusable classes are defined in `global.css` (not per-component `<style>`):
buttons (`.btn-primary`/`.btn-secondary`/`.btn-inverted`/`.btn-nav`, plus the
`.btn-arrow` used by `BtnArrow.astro`), typography (`.section-label`,
`.section-heading`, `.page-banner-title`), layout (`.content-wrap`, `.cta-wrap`),
CTA blocks (`.cta-bold`/`.cta-feature`/`.cta-subtle`), listing card/row, the listings
filter bar, the detail-page gallery/lightbox, and the `.topo-bg` overlay.
Status pills color via `[data-status="active|coming_soon|pending|under_contract|sold"]`
— the raw office `status`, not the label shown inside the pill (see
"Listing status labels").

**Section-label eyebrows are hidden site-wide on JWRG.** The small uppercase
kicker above section headings and page-banner titles (`.section-label`, still
defined in `@jw/shared` and rendered by `Section.astro`/`PageBanner.astro` via
their `label` prop) is suppressed by a JWRG-local `.section-label { display:none }`
override in `global.css`. `label=` props are left in the markup (harmless) — to
bring a kicker back, drop the override rather than re-adding labels. This is
JWRG-only: **JWLC still shows section labels** (don't mirror the override).

CTA variants are named by emphasis, not color (flat fills, no gradients):
`.cta-bold` is the dark `bg-earth-900` band, `.cta-feature` is the sand
(`bg-earth-100`) above-footer band with dark `earth-900`/`earth-700` text and red
`primary` buttons, and `.cta-subtle` is the light bordered band. `.cta-feature`
reuses `.cta-bold-heading`/`.cta-bold-body` in markup with scoped overrides under
`.cta-feature` in `global.css`; its body `<p>`s use a bare `.cta-bold-body` (the
old `text-earth-100` utility was removed so the dark override wins over Tailwind's
utilities layer). Relatedly, the top **`.page-banner`** is a solid `bg-red-600`
band with gold title/label and light description — not the old gold gradient.

**Homepage "How we help" cards (`.home-help-*`, JWRG-local).** The homepage's
about-and-services section is one row of five 3:4 photo cards (buying, selling,
relocating, neighborhoods, team) — the intro copy block is gone. The classes live
in `global.css`, *not* `@jw/shared`: the shared `.home-about-*` / `.home-service-*`
classes still drive **JWLC's** homepage, so don't repurpose them. Two details worth
knowing before editing: the card border is an `::after` overlay rather than a
`ring-inset`, because an inset box-shadow paints *under* the card's children and the
photo would cover its top and side edges; and the fixed 3:4 ratio only applies from
`sm` up — below that the cards go two-up and size to their content, since a portrait
box that narrow clips the copy. Photos are CC0 (StockSnap) in `public/images/home/`,
served as plain `<img>` WebP (no `<Image>` — see "Image Handling").

### Resources section (hub, back links, glossary aside)

`/resources` is a hub over three audience sections (`buyers/`, `sellers/`,
`relocation/`) plus **`/resources/real-estate-101`** — the glossary, which sits at
the **top level**, not under Buyers, because it serves both sides of a deal. The
hub leads with a full-width band linking it, above the three cards. Old URLs
(`/resources/buyers/real-estate-101`, `/buyers/real-estate-101`) are 301'd in
`astro.config.mjs`; both hops are listed explicitly so the oldest link resolves in
one redirect instead of chaining.

Every Resources page *below* the hub carries a **`BackLink`** to its parent (leaf →
section hub → `/resources`). The hub itself has none — its parent is the home page,
which the nav already covers. All of them except the hub and the glossary itself
also render **`GlossaryCallout`**, a short full-width card above the section
heading.

**Keep the callout in the normal flow.** It was briefly a card fixed to the right
gutter, and that does not work on this layout: a centered `.content-wrap` is 80rem
wide, so no gutter exists to hold a card until the viewport is ~1800px, and below
that it lands on top of the content — the card grids, and the `MiniContactForm`
band every page ends with. Making it fit meant clamping `.content-wrap` narrower on
those pages and hiding the card entirely under 1440px. All of that is gone: the
callout is an ordinary block, the content column is a full 80rem at every width,
and there is no breakpoint arithmetic to maintain. Don't reintroduce a floating
version without re-deriving it.

### Migration alias bridge (removed — 2026-07)

The 2026 rebrand is fully landed: every page uses the earth/red/gold tokens and
`font-display`/`font-body` directly, and the `@theme` block that aliased the
legacy `navy-*`/`warm-*` colors and `--font-sans`/`--font-serif` onto them **is
gone**. `navy-*`, `warm-*`, `font-serif`, and `font-sans` are now dead names — a
page using one gets no style at all rather than a quietly-aliased one, so don't
reintroduce them.

The retired mapping, for reading old diffs: `navy-900`→`earth-900`,
`navy-500`→`earth-600`, `navy-400`→`earth-500`, `navy-300`→`earth-400` (the rest
of `navy-*` and all of `warm-*` map to the same-numbered `earth-*`),
`font-serif`→`font-display`, `font-sans`→`font-body`. Gold accents on light
backgrounds became `red-600`/`red-700`, since red is the JWRG primary; gold
survives only where it's genuinely decorative (the 404 numeral, the neighborhood
placeholder icon).

### Tailwind v4 gotcha

Do **not** use `@apply` inside an Astro scoped `<style>` block — it errors
(`Cannot apply unknown utility class`) because the scoped sheet has no theme
context (`@reference`). Use inline utility classes, or add the class to
`global.css` under `@layer components`. Likewise, `<script define:vars>` blocks
are plain JS (no TS) — type annotations there silently break the script.

## Workflows

### Adding a New Listing

Listings are managed in the office Filament admin (`office.jwrgnc.com`) — the website fetches them automatically. To publish a listing on JWRG, ensure `jwrg` is in its `marketing_sites` set (use the `set-listing-sites` MCP tool or the Filament UI). No code change needed.

### Adding a Team Member

Team members are managed in the office Filament admin (`office.jwrgnc.com` → Settings → Users) and surfaced via `/api/v1/team`. To publish a user on JWRG, attach a `TeamMemberSiteProfile` for the `jwrg` site under the Public Site Profiles relation manager. Headshots upload through the Photos relation manager (single-primary invariant). Per-site bio overrides go on the site profile itself; otherwise the User's default `bio` is used. No code change needed on the Astro side.

### Adding a Neighborhood

Neighborhoods are managed in the office (Filament admin, or the `create-neighborhood` / `search-neighborhoods` MCP tools) — the site fetches them live. No code change needed:

1. Create the neighborhood in the office; the index and the detail page (`[slug].astro`, via `fetchNeighborhood(slug)`) pick it up automatically. **Note (2026-07):** the index page `src/pages/neighborhoods/index.astro` is now just a prerendered shell — the actual `fetchNeighborhoods()` call, the per-card lot enrichment, and all the card markup described below live in the deferred island **`src/components/NeighborhoodGrid.astro`** (see "Server islands" above). References to `index.astro` in the notes below mean that component.
2. To associate a listing with a neighborhood, set it on the listing in the office — it then surfaces in the neighborhood's homes list and the `/listings` neighborhood filter.

**Detail sidebar (lots):** `[slug].astro` also fetches the neighborhood's subdivision lots (`fetchNeighborhoodLots(slug)` / `ApiLot` in `src/lib/api.ts` → office `GET /neighborhoods/{slug}/lots`) to show two quick-facts rows: the count of **available** lots and a **"From the $X00s"** starting price bucketed off the cheapest available lot's `base_price`. Both rows self-hide when there's no data — the price needs the office public API to expose `base_price` (marketing-safe asking price; the office `LotResource` was extended for this) *and* a value actually set on a lot. This lots fetcher is JWRG-local for now; promote to `@jw/shared` if JWLC wants the same.

**Lot cards + lot detail pages (homesites):** for neighborhoods that have lots, `[slug].astro` renders a **"Homesites in {name}"** grid (all lots except `common_area`, in the office's lot-number order) using **`src/components/LotCard.astro`** — a JWRG-local card that reuses the shared `.listing-card*` classes so homesites read like listings. Lots carry no photos, so the card's image area is a branded placeholder (land/plat motif over an earth→gold gradient) with a status pill and the acreage as the headline. The sidebar's "Available Lots" count links to `#homesites`. Each lot has its own SSR page at **`src/pages/neighborhoods/[slug]/lots/[lot].astro`** (`/neighborhoods/{slug}/lots/{lot_number}`) — there's no single-lot API endpoint, so it finds the lot in the same memoized `fetchNeighborhoodLots` list by `lot_number` (redirects to the neighborhood if not found or `common_area`). It shows a stat grid (price/size/type), builder block, floor-plan documents, and a lead form bound to the neighborhood. The presentation helpers (`lotStatusMeta`, `lotTitle`, `lotAcresLabel`, `lotSqftLabel`, `lotPriceLabel`, `lotTypeLabel`, `lotHref`) live in `src/lib/api.ts` alongside the expanded `ApiLot` type (now includes `builder`/`agent`/`documents`, which `LotResource` already returns). The lot status pill borrows the listing color palette via a `colorKey` (reserved/under_contract → gold, sold → dark, not_released → gray). JWRG-local; promote with the fetcher if JWLC wants it.

**Index ordering:** the office `/neighborhoods` endpoint returns neighborhoods in their manual **`sort`** order (ascending; ties by name), so `index.astro` just renders in API order. `sort` is a real column editable in the back office — drag rows on the Neighborhoods list or type a number on the edit screen, and the others auto-shift (`Neighborhood::resequenceWith`). The resource also still exposes `latest_inventory_at` (newest created listing/lot `created_at`) as informational metadata.

**Index card content:** each card is just the logo/photo tile plus a centered footer line — the lifecycle label and one inventory number as **plain text** (same `text-sm font-semibold text-earth-800` style as the count), joined by a middle dot (`·`) when both are present (no plain-text name, no amenity tags, no colored pill). The label reads **"Active"** or **"Planned"** (Planned for office statuses `planning`/`under_development`; everything else, incl. unset, is Active). The number is **live listings** (`listings_count`) when > 0, else **available lots** (from `fetchNeighborhoodLots(slug)`, since `total_lots` is null on the index payload); it self-hides when both are zero. `listings_count` is scoped by the office to what's actually live on JWRG — public statuses (active/coming_soon/pending/under_contract/sold) *and* published on this site — because the shim binds the site slug (`fetchNeighborhoods()` → `sharedFetchNeighborhoods('jwrg')`, which sends `?site=jwrg`). Without that scoping it counted every listing regardless of status/site (e.g. Cedar Knolls read 37 vs. 8 live). The card link carries `aria-label={name}` so it's labeled in every image branch (logo/photo/placeholder), and logo `<img>`s keep `alt`.

**Brand logo (optional):** the neighborhoods index cards are frameless (imagery/logos sit over the site topo background — no white card). The grid uses `flex flex-wrap justify-center` (not CSS grid) with **fixed-width cards** (`w-72` / 288px, plus `max-w-full` to shrink on tiny phones and `shrink-0` so flex never sizes cards unevenly) — so cards hold the same scale at any viewport width and surplus width becomes side margin (via `justify-center` + the `max-w-7xl` wrapper) rather than stretching them. Rows are **staggered** like brickwork: each row alternates between the breakpoint's column count and one less (xl 3/4, lg 2/3, md 1/2, base 1–2), so adjacent rows offset. Equal-width cards would otherwise just pack the max per row, so the wrap is forced by zero-height, full-width spacers inserted after each row's last card; break positions differ per breakpoint (the short/full cycle length is 3 / 5 / 7 for md / lg / xl) so each card renders up to three spacers, each scoped to one breakpoint band (`hidden md:block lg:hidden`, etc., so exactly one is active at a given width). Vertical rhythm comes from a per-card `mb-6` (with `gap-x-6`, not a row-gap) so the invisible spacer lines add no space; shorter/partial rows are **centered**. A neighborhood can render a brand logo instead of its API photo, and **this is now office-managed, not a repo file.** The mark lives on the neighborhood record as its `featured_image` (a single-file media collection), set in the office — the Filament neighborhood **Details** tab, or the `attach-neighborhood-featured-image-from-url` / `-from-upload` MCP tools (each attach replaces the prior one). Both the index grid (`NeighborhoodGrid.astro`) and the detail page (`[slug].astro`) read it from the API as `n.featured_image` (`{url, aspect, scale}`) and render it as a contained hero over the background instead of the API photo gallery — these neighborhoods' single API "photo" is itself a logo that crops badly as a cover tile. `aspect` (width/height) is derived from the artwork automatically (SVG viewBox or raster dimensions), so the hero sizes without fetching the file; the optional `scale` (~0.7–1.0) optically balances the marks so they read at a similar size (heavier/wider marks scale toward the lightest, ~1.0). **The old repo-side approach — a `src/data/neighborhoodLogos.ts` map plus SVGs in `public/images/neighborhoods/` — is retired; don't reintroduce it.** It moved onto the record precisely because a slug rename orphaned the local map. Guidance for the artwork still holds: use transparent, single/dark-ink marks (they display over the light `earth-50` background); masters live in the `JW-Brand-Assets` repo; when recoloring an Illustrator SVG export to 1-color, set a root `fill="…"` on the `<svg>` so unclassed paths don't default to **black**.

### Adding a New Form

Forms are rendered by the office **embed-form widget** (`office.jwrgnc.com/js/forms.js`),
not a local form component. To add one:

1. Create the form in the office Filament admin (Marketing → Embed Forms) and copy its **form token**.
2. Add the token to `site.formTokens` in **`src/data/site.ts`** (empty string = not yet wired → the page shows a phone/email fallback).
3. Render it with **`EmbedForm.astro`** (or `MiniContactForm.astro`, which wraps it), passing the token.

## Image Handling

Sharp is in `devDependencies` and powers Astro's built-in `<Image>` for **local assets only** (hero shots in `public/images/`). For listing photos coming from the API, use the URLs from `primary_photo.urls` / `photos[].urls` directly — see `../../SHARED_FRONTEND_GUIDE.md` §"Image handling" for why. Brand fonts are **self-hosted** in `public/fonts/` (`@font-face` in `global.css`, preloaded in `BaseLayout`) — no Google Fonts request.

## File Conventions

- Static assets → `public/`
- **Team photos come from the office API** (`fetchTeam` → headshot URLs), not local files. (`public/images/team/*.jpg` are legacy/unused holdovers.)
- Pages should `export const prerender = true` unless they need request-time data; SSR pages declare `export const prerender = false` explicitly, and the caching middleware (`src/middleware.ts`) gives their HTML a short edge cache.

## Backend Coordination

- The office app's Claude has its own CLAUDE.md at `~/Herd/jwrg_office/CLAUDE.md` (Laravel Boost guidelines).
- Open requests for the backend live in `../../OFFICE_MCP_REQUESTS.md` (workspace root, two levels up). Append there rather than asking the office Claude ad-hoc.
- The MCP server `office-jwrg` returns a sparser shape than the REST API. Prefer REST (via `src/lib/api.ts`) for anything image- or detail-related until shape parity lands.

## Sister Site (JWLC)

`../jwlc/` is the Julie Wright Land Company site (land brokerage). Same backend and **shared brand tokens + class names** from the 2026 rebrand, but chrome treatment now diverges: JWRG uses an inverted red/gold scheme on nav, footer, and the top page banner; JWLC keeps the original light gold→sand gradient. Audience also differs (residential vs. land). JWLC is still a useful reference for shared design patterns and the listings index/detail. When changing shared concerns (API client, image handling, status mapping, brand tokens, class names), make the change in both repos and update `../../SHARED_FRONTEND_GUIDE.md` if the rule itself changes — but treat per-site chrome (nav/footer/banner color treatment) as site-specific.
