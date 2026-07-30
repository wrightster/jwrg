# JWRG — Julie Wright Realty Group

Public marketing website for **Julie Wright Realty Group**, a full-service residential brokerage in the North Carolina Triangle. Astro 5 SSR with Tailwind 4. Sister site to [`jwlc`](https://github.com/wrightster/jwlc) (Land Company); both consume the same back-office API at `office.jwrgnc.com`.

> 🧭 **First time here?** This repo is one of several siblings in the JWRG platform workspace. Read [wrightster/jwrg-workspace](https://github.com/wrightster/jwrg-workspace) for the full setup — clone the meta repo and run `./engage.sh` (one idempotent command) to get every project in place at once.

## Stack

- **Astro 5** with `@astrojs/node` (standalone SSR adapter)
- **Tailwind CSS 4** (config in `src/styles/global.css` `@theme` block — no `tailwind.config.js`)
- **TypeScript strict**
- **Sharp** for local image optimization (Astro `<Image>` for assets in `public/images/` only — listing/neighborhood photos come pre-rendered from the office API)

## Quick start

```bash
nvm use                  # Node 22 (see .nvmrc)
npm ci
npm run dev              # http://localhost:4321
```

| Command | Action |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `./dist/` |
| `npm run start` | Run the production Node server (`HOST=127.0.0.1 PORT=4342 node ./dist/server/entry.mjs`) |
| `npm run preview` | Astro preview |

## Where things live

```
src/
├── components/     Astro components (ListingCard, LotCard, EmbedForm, MiniContactForm, etc.)
├── data/           Static site content (counties, FAQ, glossary, site metadata)
├── layouts/        BaseLayout shell
├── lib/api.ts      Office API client + types — keep in sync with jwlc/src/lib/api.ts
├── middleware.ts   Short edge cache (Cache-Control) on SSR responses
├── pages/          Routes (about, resources/{buyers,sellers,relocation,real-estate-101}, listings, neighborhoods + neighborhoods/[slug]/lots/[lot] homesite pages, etc.)
└── styles/         global.css: Tailwind @theme tokens + self-hosted @font-face
```

Fonts live in `public/fonts/` (self-hosted WOFF2, preloaded) — no Google Fonts request.

## Rendering & performance

Pages `export const prerender = true` unless they need request-time data; the live
pages (home, listings, neighborhoods, team bios) set `prerender = false` and get a
short `s-maxage`/`stale-while-revalidate` edge cache from `src/middleware.ts`, which
keeps repeated renders off the shared droplet. Absolute URLs (canonical / og / JSON-LD)
derive from one source so they can't drift across hosts — see `CLAUDE.md`.

## API contract

Talks to `https://office.jwrgnc.com/api/v1`, filtered by `?site=jwrg`. The shared contract (and rules that apply to **both** JWRG and JWLC) is documented in [`SHARED_FRONTEND_GUIDE.md`](https://github.com/wrightster/jwrg-workspace/blob/main/SHARED_FRONTEND_GUIDE.md). When changing the API client, update **both** sites' `src/lib/api.ts` in the same session.

The office labels the `active` status "Active"; the public sites say "Available." Every listing-returning fetcher in `src/lib/api.ts` runs its results through `normalizeListingLabel()`, which rewrites `status_label` and leaves the raw `status` key alone. See [`CLAUDE.md`](./CLAUDE.md) § "Listing status labels."

## Brand

Red clay + earth + gold, as of the 2026 rebrand. Gabarito (display) + Anek Latin (body), self-hosted from `public/fonts/`.

Tokens and component classes are canonical in [`@jw/shared`](https://github.com/wrightster/jw-shared) (`styles/tokens.css`, `styles/components.css`), imported at the top of `src/styles/global.css`. JWRG shares those tokens, fonts, and class names with JWLC; it does **not** share its logo or its chrome — nav, footer, and the top page banner use an inverted solid red/gold treatment, where JWLC keeps a lighter gold→sand gradient.

The rebrand is fully landed as of 2026-07: every page uses the `earth-*` / `red-*` / `gold-*` tokens and `font-display` / `font-body` directly, and the `@theme` block that used to alias the retired `navy-*` / `warm-*` / `font-serif` names onto them has been deleted. Those names are dead — a page using one now gets no style rather than a silently-aliased one.

## Deploy

Deploys to a DigitalOcean droplet managed by Ploi.io. Push to `main` triggers the deploy webhook. The Node SSR daemon binds to `127.0.0.1:4342` (set in `package.json`'s `start` script — Astro's default 4321 is taken by JWLC on the same host).

## Going deeper

- [`CLAUDE.md`](./CLAUDE.md) — guidance for Claude Code sessions in this repo
- [`PLAN.md`](./PLAN.md) — site-rebuild checklist
- [`../SHARED_FRONTEND_GUIDE.md`](../SHARED_FRONTEND_GUIDE.md) — cross-site rules (lives in the workspace meta repo)
