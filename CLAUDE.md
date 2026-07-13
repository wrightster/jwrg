# JWRG — Julie Wright Realty Group

## Project Overview

Real estate website for a North Carolina full-service brokerage (Triangle / Wake / Franklin / Durham / Granville areas). Astro 5 with SSR (Node.js standalone adapter), Tailwind 4, TypeScript strict mode. Sister site to **JWLC** (`../jwlc/`) — both consume the same backend.

> **Read this first when editing:** `../../SHARED_FRONTEND_GUIDE.md` (two levels up, at the workspace root). It defines rules that apply to both JWRG and JWLC. This CLAUDE.md only covers JWRG-specific details.

## Environments

- **Local dev**: `npm run dev` → localhost:4321
- **Backend**: `https://office.jwrgnc.com` (Laravel/Filament at `~/Herd/jwrg_office`)
- **Site slug for API filtering**: `jwrg` (set in `src/lib/api.ts` as `SITE_SLUG`)
- **Production**: juliewrightrealtygroup.com (rebuild in progress; legacy site still live)

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Production build to `./dist/`
- `npm run start` — Run production server (`HOST=127.0.0.1 PORT=4342 node ./dist/server/entry.mjs`)
- `npm run preview` — Astro preview

## Architecture

```
src/
├── components/       # Astro components
│   ├── BtnArrow.astro        # Animated three-piece arrow button (.btn-arrow)
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
│   ├── neighborhoodLogos.ts # slug → local brand-logo SVG (index grid + detail hero)
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
`public/FallTopo_v2.svg`. Masters: `wrightster/JWRG-JWLC-Design`.

- **SSR mode** via `@astrojs/node` standalone adapter (`output: 'server'` in `astro.config.mjs`). Most pages should set `export const prerender = true` for static output unless they genuinely need request-time rendering.
- **Listings via API** — fetched from `office.jwrgnc.com/api/v1` filtered by `?site=jwrg`. See `../../SHARED_FRONTEND_GUIDE.md` for the contract.
- **Team & neighborhoods via API** — fetched from the office (`fetchTeam` / `fetchNeighborhoods` in `src/lib/api.ts`), same as listings. They are *not* static.
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

### Migration alias bridge (temporary)

`@theme` contains a commented block aliasing the **legacy** `navy-*`/`warm-*`
colors and `--font-sans`/`--font-serif` onto the new earth/brand tokens, so
pages not yet rewritten to the new classes stay visually coherent. **Remove this
block once every page uses the new tokens directly.** See `PLAN.md` for which
pages remain. When rewriting a page, prefer the new tokens/classes over the
aliases.

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

1. Create the neighborhood in the office; the index (`src/pages/neighborhoods/index.astro`, via `fetchNeighborhoods()`) and the detail page (`[slug].astro`, via `fetchNeighborhood(slug)`) pick it up automatically.
2. To associate a listing with a neighborhood, set it on the listing in the office — it then surfaces in the neighborhood's homes list and the `/listings` neighborhood filter.

**Detail sidebar (lots):** `[slug].astro` also fetches the neighborhood's subdivision lots (`fetchNeighborhoodLots(slug)` / `ApiLot` in `src/lib/api.ts` → office `GET /neighborhoods/{slug}/lots`) to show two quick-facts rows: the count of **available** lots and a **"From the $X00s"** starting price bucketed off the cheapest available lot's `base_price`. Both rows self-hide when there's no data — the price needs the office public API to expose `base_price` (marketing-safe asking price; the office `LotResource` was extended for this) *and* a value actually set on a lot. This lots fetcher is JWRG-local for now; promote to `@jw/shared` if JWLC wants the same.

**Index ordering:** the office `/neighborhoods` endpoint returns neighborhoods in their manual **`sort`** order (ascending; ties by name), so `index.astro` just renders in API order. `sort` is a real column editable in the back office — drag rows on the Neighborhoods list or type a number on the edit screen, and the others auto-shift (`Neighborhood::resequenceWith`). The resource also still exposes `latest_inventory_at` (newest created listing/lot `created_at`) as informational metadata.

**Index card content:** each card is just the logo/photo tile plus a centered footer line — the lifecycle label and one inventory number as **plain text** (same `text-sm font-semibold text-earth-800` style as the count), joined by a middle dot (`·`) when both are present (no plain-text name, no amenity tags, no colored pill). The label reads **"Active"** or **"Planned"** (Planned for office statuses `planning`/`under_development`; everything else, incl. unset, is Active). The number is **live listings** (`listings_count`) when > 0, else **available lots** (from `fetchNeighborhoodLots(slug)`, since `total_lots` is null on the index payload); it self-hides when both are zero. `listings_count` is scoped by the office to what's actually live on JWRG — public statuses (active/coming_soon/pending/under_contract/sold) *and* published on this site — because the shim binds the site slug (`fetchNeighborhoods()` → `sharedFetchNeighborhoods('jwrg')`, which sends `?site=jwrg`). Without that scoping it counted every listing regardless of status/site (e.g. Cedar Knolls read 37 vs. 8 live). The card link carries `aria-label={name}` so it's labeled in every image branch (logo/photo/placeholder), and logo `<img>`s keep `alt`.

**Brand logo (optional):** the neighborhoods index cards are frameless (imagery/logos sit over the site topo background — no white card). The grid uses `flex flex-wrap justify-center` (not CSS grid) with **fixed-width cards** (`w-72` / 288px, plus `max-w-full` to shrink on tiny phones and `shrink-0` so flex never sizes cards unevenly) — so cards hold the same scale at any viewport width and surplus width becomes side margin (via `justify-center` + the `max-w-7xl` wrapper) rather than stretching them. Rows are **staggered** like brickwork: each row alternates between the breakpoint's column count and one less (xl 3/4, lg 2/3, md 1/2, base 1–2), so adjacent rows offset. Equal-width cards would otherwise just pack the max per row, so the wrap is forced by zero-height, full-width spacers inserted after each row's last card; break positions differ per breakpoint (the short/full cycle length is 3 / 5 / 7 for md / lg / xl) so each card renders up to three spacers, each scoped to one breakpoint band (`hidden md:block lg:hidden`, etc., so exactly one is active at a given width). Vertical rhythm comes from a per-card `mb-6` (with `gap-x-6`, not a row-gap) so the invisible spacer lines add no space; shorter/partial rows are **centered**. A neighborhood can render a local brand logo instead of its API photo: drop the SVG in `public/images/neighborhoods/` and add a `slug → {src, scale?}` entry to the shared `neighborhoodLogos` map in **`src/data/neighborhoodLogos.ts`**. That map is the single source of truth for **both** the index grid (`index.astro`, as the card image) **and** the detail page (`[slug].astro`, which renders the logo as a contained hero band over the background instead of the API photo gallery — these neighborhoods' single API "photo" is itself a logo that crops badly as a cover tile, so the local SVG replaces it). Adding/removing an entry updates both pages. The optional `scale` optically balances the marks so they read at a similar size. Each logo was rendered and measured on two axes — bounding-box **extent** (how far it spans) and ink **mass** (how bold/dense it is) — and perceived size is the max of the two (each normalized across the set), because a logo looks big if it's large by *either* (a wide thin wordmark or a small bold emblem). Heavier/wider marks scale down toward the lightest (preserve-west = 1.0). Recompute if artwork changes. Use transparent, single/dark-ink marks (they display over the light `earth-50` background) — masters live in the `JWRG-JWLC-Design` repo. When recoloring an Illustrator SVG export to 1-color, don't just edit the `<style>` classes: some exports leave a few paths unclassed, so they default to **black**. Set a root `fill="…"` on the `<svg>` so unclassed paths inherit the intended color (that's how `aubrie-place.svg` is forced to mauve). Current logo cards (all neighborhoods): Aubrie Place (1-color mauve), Bragg Farm (1-color), Cannady Mill, Cedar Knolls (nobg mark), Colvard Farms (1-color), Preserve West (SVG, positive/near-black), Tennyson (1-color dark blue, borderless), Woodland Park (dark), Yancey Farms (full dark-green lockup).

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
