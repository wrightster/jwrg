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
- `npm run start` — Run production server (`node ./dist/server/entry.mjs`)
- `npm run preview` — Astro preview

## Architecture

```
src/
├── components/       # Astro components
│   ├── BtnArrow.astro        # Animated three-piece arrow button (.btn-arrow)
│   ├── FontSwitcher.astro    # Dev-only design panel (fonts/colors); inert in prod
│   ├── Form.astro            # Generic form wrapper (calls submitForm())
│   ├── ListingCard.astro     # Card view for a listing (grid) — beds/baths/sqft
│   ├── ListingRow.astro      # Row view for a listing (list layout)
│   ├── MiniContactForm.astro # Contact info + message form band
│   ├── PageBanner.astro      # Page header band (.page-banner)
│   ├── Section.astro         # Section wrapper (label/heading/description)
│   └── TeamCard.astro        # Broker / agent card
├── data/             # Static site content as TypeScript
│   ├── buyerFaq.ts        # Buyer FAQ entries
│   ├── counties.ts        # NC county data (areas served)
│   ├── forms.ts           # Form ID → backend Filament form mapping
│   ├── keyTerms.ts        # Real estate glossary
│   ├── movingTips.ts      # Relocation moving-tips content
│   ├── site.ts            # Global site metadata (name, contact, etc.)
│   └── stagingTips.ts     # Seller staging-tips content
│   # NOTE: team + neighborhoods are NOT static — they come from the office API
│   #       (fetchTeam / fetchNeighborhoods). No src/data file for them.
├── layouts/
│   └── BaseLayout.astro   # Shell: parallax topo bg + fixed flat nav + footer
├── lib/
│   ├── api.ts             # Office API client — see ../../SHARED_FRONTEND_GUIDE.md
│   └── formFields.ts      # Form field definitions
├── pages/
│   ├── about/             # About, team, triangle-area, business-directory
│   ├── buyers/            # Buying guide, FAQ, mortgage calc, RE 101
│   ├── sellers/           # Home value, list-your-property, staging, sold reports
│   ├── relocation/        # Relocation package, moving tips
│   ├── neighborhoods/     # Index + [slug] dynamic pages
│   ├── listings/          # Index + [slug] dynamic property detail
│   ├── 404.astro
│   ├── accessibility.astro
│   ├── contact.astro
│   ├── index.astro
│   ├── neighborhood-map.astro
│   ├── privacy.astro
│   ├── property-organizer.astro
│   ├── property-search.astro
│   └── testimonials.astro
└── styles/
    └── global.css         # @import tailwindcss + @theme tokens + all component classes
```

Logos live in `public/`: `JWRG_Full.svg` (footer/hero), `JWRG_Full_Gold.svg` /
`JWRG_Full_White.svg` (reversed on dark), `JWRG_Icon.svg` (favicon),
`JWRG_Icon_Red.svg` (nav-logo mask), `JWRG_Icon_Horizontal.svg`. The shared topo
overlay is `public/FallTopo_v2.svg`. Masters: `wrightster/JWRG-JWLC-Design`.

- **SSR mode** via `@astrojs/node` standalone adapter (`output: 'server'` in `astro.config.mjs`). Most pages should set `export const prerender = true` for static output unless they genuinely need request-time rendering.
- **Listings via API** — fetched from `office.jwrgnc.com/api/v1` filtered by `?site=jwrg`. See `../../SHARED_FRONTEND_GUIDE.md` for the contract.
- **Team & neighborhoods via API** — fetched from the office (`fetchTeam` / `fetchNeighborhoods` in `src/lib/api.ts`), same as listings. They are *not* static.
- **Static content** (FAQs, glossary, moving/staging tips, counties, site metadata) lives in `src/data/*.ts`.
- **No React/Vue** — pure Astro components.

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
| `gold-*` (50–950) | Light accent / muted gold — selection, pending badge, page-banner title/label text, above-footer CTA band bg. `gold-300` (`#ffcf7d`) |
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
Status pills color via `[data-status="available|coming_soon|pending|sold"]`.

CTA variants are named by emphasis, not color (flat fills, no gradients):
`.cta-bold` is the dark `bg-earth-900` band, `.cta-feature` is the gold
(`bg-gold-300`) above-footer band with dark `earth-900`/`earth-700` text and red
`primary` buttons, and `.cta-subtle` is the light bordered band. `.cta-feature`
reuses `.cta-bold-heading`/`.cta-bold-body` in markup with scoped overrides under
`.cta-feature` in `global.css`; its body `<p>`s use a bare `.cta-bold-body` (the
old `text-earth-100` utility was removed so the dark override wins over Tailwind's
utilities layer). Relatedly, the top **`.page-banner`** is a solid `bg-red-600`
band with gold title/label and light description — not the old gold gradient.

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

### Adding a New Form

1. Add a Filament form on the office side and note its form ID.
2. Add an entry in `src/data/forms.ts` mapping a friendly name to the form ID.
3. Use the `Form` or `MiniContactForm` component, passing the form ID.

## Image Handling

Sharp is in `devDependencies` and powers Astro's built-in `<Image>` for **local assets only** (team photos, hero shots in `public/images/`). For listing photos coming from the API, use the URLs from `primary_photo.urls` / `photos[].urls` directly — see `../../SHARED_FRONTEND_GUIDE.md` §"Image handling" for why.

## File Conventions

- Static assets → `public/`
- Team photos → `public/images/team/{firstname-lastname}.jpg`
- All pages should `export const prerender = true` unless they genuinely need SSR.

## Backend Coordination

- The office app's Claude has its own CLAUDE.md at `~/Herd/jwrg_office/CLAUDE.md` (Laravel Boost guidelines).
- Open requests for the backend live in `../../OFFICE_MCP_REQUESTS.md` (workspace root, two levels up). Append there rather than asking the office Claude ad-hoc.
- The MCP server `office-jwrg` returns a sparser shape than the REST API. Prefer REST (via `src/lib/api.ts`) for anything image- or detail-related until shape parity lands.

## Sister Site (JWLC)

`../jwlc/` is the Julie Wright Land Company site (land brokerage). Same backend and **shared brand tokens + class names** from the 2026 rebrand, but chrome treatment now diverges: JWRG uses an inverted red/gold scheme on nav, footer, and the top page banner; JWLC keeps the original light gold→sand gradient. Audience also differs (residential vs. land). JWLC is still a useful reference for shared design patterns and the listings index/detail. When changing shared concerns (API client, image handling, status mapping, brand tokens, class names), make the change in both repos and update `../../SHARED_FRONTEND_GUIDE.md` if the rule itself changes — but treat per-site chrome (nav/footer/banner color treatment) as site-specific.
