# JWRG — Julie Wright Realty Group

## Project Overview

Real estate website for a North Carolina full-service brokerage (Triangle / Wake / Franklin / Durham / Granville areas). Astro 5 with SSR (Node.js standalone adapter), Tailwind 4, TypeScript strict mode. Sister site to **JWLC** (`~/code/jwlc`) — both consume the same backend.

> **Read this first when editing:** `../SHARED_FRONTEND_GUIDE.md` (one level up). It defines rules that apply to both JWRG and JWLC. This CLAUDE.md only covers JWRG-specific details.

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
│   ├── Form.astro            # Generic form wrapper (calls submitForm())
│   ├── ListingCard.astro     # Card view for a listing
│   ├── MiniContactForm.astro # Compact contact form embedded in pages
│   ├── PageBanner.astro      # Standard page header
│   ├── Section.astro         # Section wrapper
│   └── TeamCard.astro        # Broker / agent card
├── data/             # Static site content as TypeScript
│   ├── buyerFaq.ts        # Buyer FAQ entries
│   ├── counties.ts        # NC county data (areas served)
│   ├── forms.ts           # Form ID → backend Filament form mapping
│   ├── keyTerms.ts        # Real estate glossary
│   ├── movingTips.ts      # Relocation moving-tips content
│   ├── neighborhoods.ts   # Neighborhood directory
│   ├── site.ts            # Global site metadata (name, contact, etc.)
│   ├── stagingTips.ts     # Seller staging-tips content
│   └── team.ts            # Broker/agent profiles
├── layouts/
│   └── BaseLayout.astro   # Main shell: nav + footer
├── lib/
│   ├── api.ts             # Office API client — see ../SHARED_FRONTEND_GUIDE.md
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
    └── global.css         # @import tailwindcss + @theme tokens
```

- **SSR mode** via `@astrojs/node` standalone adapter (`output: 'server'` in `astro.config.mjs`). Most pages should set `export const prerender = true` for static output unless they genuinely need request-time rendering.
- **Listings via API** — fetched from `office.jwrgnc.com/api/v1` filtered by `?site=jwrg`. See `../SHARED_FRONTEND_GUIDE.md` for the contract.
- **Static content** (team, neighborhoods, FAQs, etc.) lives in `src/data/*.ts`.
- **No React/Vue** — pure Astro components.

## Design System

JWRG's brand is more "polished residential" than JWLC's "land/agriculture" feel — navy + gold + warm neutrals with Inter (sans) and Playfair Display (serif).

### Colors (defined in `src/styles/global.css` `@theme`)

| Family | Use |
|---|---|
| `navy-*` (50–950) | Primary brand color, dark backgrounds, text |
| `gold-*` (50–950) | Accent — CTAs, highlights, badges |
| `warm-*` (50–900) | Neutral — page bg, cards, dividers |

### Typography

- `--font-sans: "Inter", system-ui, -apple-system, sans-serif`
- `--font-serif: "Playfair Display", Georgia, serif`

(Where these get loaded — Google Fonts in `BaseLayout.astro` — verify before changing.)

## Workflows

### Adding a New Listing

Listings are managed in the office Filament admin (`office.jwrgnc.com`) — the website fetches them automatically. To publish a listing on JWRG, ensure `jwrg` is in its `marketing_sites` set (use the `set-listing-sites` MCP tool or the Filament UI). No code change needed.

### Adding a Team Member

Team members are managed in the office Filament admin (`office.jwrgnc.com` → Settings → Users) and surfaced via `/api/v1/team`. To publish a user on JWRG, attach a `TeamMemberSiteProfile` for the `jwrg` site under the Public Site Profiles relation manager. Headshots upload through the Photos relation manager (single-primary invariant). Per-site bio overrides go on the site profile itself; otherwise the User's default `bio` is used. No code change needed on the Astro side.

### Adding a Neighborhood

1. Add entry to `src/data/neighborhoods.ts`
2. The dynamic page at `src/pages/neighborhoods/[slug].astro` will render it automatically.

### Adding a New Form

1. Add a Filament form on the office side and note its form ID.
2. Add an entry in `src/data/forms.ts` mapping a friendly name to the form ID.
3. Use the `Form` or `MiniContactForm` component, passing the form ID.

## Image Handling

Sharp is in `devDependencies` and powers Astro's built-in `<Image>` for **local assets only** (team photos, hero shots in `public/images/`). For listing photos coming from the API, use the URLs from `primary_photo.urls` / `photos[].urls` directly — see `../SHARED_FRONTEND_GUIDE.md` §"Image handling" for why.

## File Conventions

- Static assets → `public/`
- Team photos → `public/images/team/{firstname-lastname}.jpg`
- All pages should `export const prerender = true` unless they genuinely need SSR.

## Backend Coordination

- The office app's Claude has its own CLAUDE.md at `~/Herd/jwrg_office/CLAUDE.md` (Laravel Boost guidelines).
- Open requests for the backend live in `../OFFICE_MCP_REQUESTS.md` (top of `jwrg_all/`). Append there rather than asking the office Claude ad-hoc.
- The MCP server `office-jwrg` returns a sparser shape than the REST API. Prefer REST (via `src/lib/api.ts`) for anything image- or detail-related until shape parity lands.

## Sister Site (JWLC)

`../jwlc/` is the Julie Wright Land Company site (land brokerage). Same backend, different brand/audience. When changing shared concerns (API client, image handling, status mapping), make the change in both repos and update `../SHARED_FRONTEND_GUIDE.md` if the rule itself changes.
