# JWRG — Julie Wright Realty Group

Public marketing website for **Julie Wright Realty Group**, a full-service residential brokerage in the North Carolina Triangle. Astro 5 SSR with Tailwind 4. Sister site to [`jwlc`](https://github.com/wrightster/jwlc) (Land Company); both consume the same back-office API at `office.jwrgnc.com`.

> 🧭 **First time here?** This repo is one of three siblings in the JWRG platform workspace. Read [wrightster/jwrg-workspace](https://github.com/wrightster/jwrg-workspace) for the full setup — clone the meta repo and run `bootstrap.sh` to get all three projects in place at once.

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
├── components/   Astro components (ListingCard, MiniContactForm, etc.)
├── data/         Static site content (team, neighborhoods fallback, FAQ, glossary)
├── layouts/      BaseLayout shell
├── lib/api.ts    Office API client + types — keep in sync with jwlc/src/lib/api.ts
├── pages/        Routes (about, buyers, sellers, listings, neighborhoods, etc.)
└── styles/       global.css with Tailwind @theme tokens
```

## API contract

Talks to `https://office.jwrgnc.com/api/v1`, filtered by `?site=jwrg`. The shared contract (and rules that apply to **both** JWRG and JWLC) is documented in [`SHARED_FRONTEND_GUIDE.md`](https://github.com/wrightster/jwrg-workspace/blob/main/SHARED_FRONTEND_GUIDE.md). When changing the API client, update **both** sites' `src/lib/api.ts` in the same session.

## Brand

Navy + gold + warm neutrals. Inter (sans) + Playfair Display (serif). All tokens live in `src/styles/global.css`.

## Deploy

Deploys to a DigitalOcean droplet managed by Ploi.io. Push to `main` triggers the deploy webhook. The Node SSR daemon binds to `127.0.0.1:4342` (set in `package.json`'s `start` script — Astro's default 4321 is taken by JWLC on the same host).

## Going deeper

- [`CLAUDE.md`](./CLAUDE.md) — guidance for Claude Code sessions in this repo
- [`PLAN.md`](./PLAN.md) — site-rebuild checklist
- [`../SHARED_FRONTEND_GUIDE.md`](../SHARED_FRONTEND_GUIDE.md) — cross-site rules (lives in the workspace meta repo)
