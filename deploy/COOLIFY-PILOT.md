# Coolify pilot — jwrg on `main.juliewrightrealtygroup.com`

Goal: prove out zero-downtime deploys for the Astro fleet by running **jwrg** on
a **new droplet + Coolify**, on the throwaway subdomain
`main.juliewrightrealtygroup.com`. Production (Ploi, `juliewrightrealtygroup.com`)
is untouched: this runs off the **`coolify-pilot`** branch, and Ploi only
auto-deploys `main`.

## What's in the repo for this

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build of the `@astrojs/node` standalone server. Binds `0.0.0.0:4321` (the repo's `npm start` binds `127.0.0.1`, which containers can't expose). |
| `.dockerignore` | Keeps the build context lean; deps/build output are generated in-image. |
| `src/pages/healthz.ts` | `GET /healthz` → `200 ok`, SSR, no API dependency. Health-check target. |

No app env vars are required — jwrg's office-API base is baked to production, so
the pilot renders live (read-only) against `office.jwrgnc.com`.

---

## Runbook

### 1. Droplet
- DigitalOcean, **4 GB / 2 vCPU** (Ubuntu 24.04). 4 GB gives Dockerized Astro
  builds headroom; on 2 GB add a swap file or builds may OOM.
- Open firewall: **22, 80, 443, 8000** (8000 = Coolify dashboard).

### 2. Install Coolify
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```
Open `http://<DROPLET_IP>:8000`, create the admin account, finish onboarding.

### 3. DNS
- `A  main.juliewrightrealtygroup.com  ->  <DROPLET_IP>`  (low TTL, e.g. 300).
- Must resolve before you set the domain in Coolify, or Let's Encrypt can't issue.

### 4. Connect GitHub
- Coolify → **Sources → GitHub App** → install on the `wrightster` account and
  grant access to the **`jwrg`** repo.

### 5. Create the application
- New **Application** → from the GitHub source → repo **`jwrg`**, branch
  **`coolify-pilot`**.
- **Build Pack: Dockerfile** (root `./Dockerfile`).
- **Ports Exposes: `4321`** (matches the Dockerfile).
- **Domain (FQDN): `https://main.juliewrightrealtygroup.com`** — Coolify's
  Traefik proxy provisions Let's Encrypt automatically.
- **Health check**: path `/healthz`, port `4321` (Coolify only swaps traffic to a
  container once this returns 200 → that's the zero-downtime gate).
- Env vars: none required.

### 6. Deploy & verify
- Click **Deploy**; watch build logs (first build pulls the base image + `npm ci`
  — a few minutes).
- Smoke test:
  ```bash
  curl -I https://main.juliewrightrealtygroup.com/healthz     # 200
  ```
  Then load `/`, `/listings`, `/neighborhoods`, and a listing detail — confirm
  **live** office data renders (the server-island sections stream in).

### 7. Prove zero-downtime (the whole point)
In one terminal, poll continuously:
```bash
while true; do \
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" \
  https://main.juliewrightrealtygroup.com/healthz; sleep 0.3; done
```
Push a trivial change to `coolify-pilot` (or hit **Redeploy** in Coolify). The
poller should stay **200 the entire time** — old container serves until the new
one is healthy, then traffic swaps. Compare with the ~2–3 min Ploi gap.

---

## Cutover notes (later, when the pilot is trusted)

Not part of the pilot — captured so we don't forget:

1. **`site` config** — `astro.config.mjs` has `site: 'https://stage.jwrgnc.com'`.
   Canonical/OG URLs on the pilot will say `stage.jwrgnc.com`. Fine for a test;
   set it to the real domain at promotion.
2. **noindex the pilot** if it'll be up more than briefly, so `main.*` doesn't get
   crawled as duplicate content. (Easy add: env-gated robots — ask.)
3. **Legacy redirects move in-app.** The nginx map in
   `deploy/jwrg-legacy-redirects.conf` is host-level (Ploi's nginx) and will NOT
   carry to Coolify's Traefik. On Coolify, fold those 301s into Astro's own
   `redirects` in `astro.config.mjs` (it already has a `redirects` block) so they
   travel with the app regardless of host. (Conversion is a ~5-min task — ask.)
4. **Promotion** — point Coolify at `main` (or merge `coolify-pilot` → `main`),
   move `juliewrightrealtygroup.com` apex/www DNS to the Coolify box, and retire
   the jwrg Node deploy on Ploi. Then repeat the pattern for jwlc + the
   neighborhood sites.
