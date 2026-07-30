# Coolify pilot — jwrg on `main.juliewrightrealtygroup.com`

> **STATUS (2026-07-22): LIVE IN PRODUCTION.** This began as a pilot on
> `main.juliewrightrealtygroup.com`, but jwrg is now fully cut over — the apex
> `juliewrightrealtygroup.com` (+ `www`) is served by Coolify with a Let's Encrypt
> cert and zero-downtime deploys. The old Ploi jwrg site and the `search.*` site
> were **deleted (2026-07-30)**, and push-to-deploy is live (org secrets + the repo
> `COOLIFY_APP_UUID` variable). Treat this as **the jwrg deploy doc**, not a proposal.

Goal: prove out zero-downtime deploys for the Astro fleet by running **jwrg** on
a **new droplet + Coolify**, on the throwaway subdomain
`main.juliewrightrealtygroup.com`. Production (Ploi, `juliewrightrealtygroup.com`)
is untouched: this runs off the **`coolify-pilot`** branch, and Ploi only
auto-deploys `main`.

## What's in the repo for this

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build of the `@astrojs/node` standalone server. Binds `0.0.0.0:4321` (the repo's `npm start` binds `127.0.0.1`, which containers can't expose). Installs `curl` in the runtime image — Coolify's health check runs `curl` *inside* the container and `node:22-slim` ships neither curl nor wget (without it the container builds + starts fine but is marked unhealthy and rolled back). |
| `.dockerignore` | Keeps the build context lean; deps/build output are generated in-image. |
| `src/pages/healthz.ts` | `GET /healthz` → `200 ok`, SSR, no API dependency. Health-check target. |

No app env vars are required — jwrg's office-API base is baked to production, so
the pilot renders live (read-only) against `office.jwrgnc.com`.

---

## Security model — two planes

Coolify has two surfaces that need **opposite** treatment. Get this right before
exposing anything; most Coolify compromises are an open `:8000` or `:22`, not the
apps.

- **App plane (public):** `80`/`443` serving the actual sites — *should* be public.
- **Management plane (private):** the dashboard (`:8000`), the REST API, and SSH
  (`:22`) — must **not** be on the public internet. We reach these over Tailscale.

---

## Runbook

### 1. Droplet
- DigitalOcean, **4 GB / 2 vCPU** (Ubuntu 24.04). 4 GB gives Dockerized Astro
  builds headroom; on 2 GB add a swap file or builds may OOM.

### 2. Lock the public surface + private management (do this FIRST)
- **DO Cloud Firewall** (managed, off-box — cleaner than `ufw`): inbound allow
  **`80` and `443` only**. Do **not** open `22` or `8000` to the world.
  - Bootstrap access without public SSH: use DigitalOcean's **web console**, or
    temporarily allow `22` from your current IP and remove that rule once
    Tailscale (below) is up.
- **Tailscale** on the droplet **and** your Mac. SSH and the dashboard are then
  reachable only over the WireGuard tailnet at `http://<droplet-tailscale-ip>:8000`
  — zero public exposure, no public TLS cert needed for the dashboard. Tailscale
  traverses NAT via outbound/DERP, so the locked-down inbound firewall doesn't
  block it.
- **Harden:** enable **2FA** on the Coolify admin account (step 3); SSH key-only
  with root password login disabled; leave Coolify auto-update on.

### 3. Install Coolify
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```
Reach the dashboard **over the tailnet** at `http://<droplet-tailscale-ip>:8000`,
create the admin account, **enable 2FA**, finish onboarding.

### 4. Scoped API token (for Claude / automation)
- Coolify → **Keys & Tokens → API Tokens** → new token scoped to **deploy +
  write** on this team/project — **not** the `root` scope. Enough to create,
  configure, deploy, and read logs; can't delete the server or touch other
  projects. Revocable in one click; every call is attributed in the audit log.
- Store it on your Mac in the **login Keychain** (encrypted at rest):
  `security add-generic-password -U -a "$USER" -s coolify-api-token -w`. A
  `coolify-token` shell helper (in `~/.zshrc`) reads it back, falling back to a
  legacy `~/.config/coolify/token` file (`chmod 600`). Either way it's never
  committed or written into a repo file.
- How Claude uses it — runs in Bash on your Mac, so it reaches the private API
  directly over the tailnet:
  ```bash
  curl -s -H "Authorization: Bearer $(coolify-token)" \
    http://<droplet-tailscale-ip>:8000/api/v1/applications
  ```
  Routine deploys still fire automatically on git push (GitHub webhook); the
  token is for setup, config, and observability. SSH over Tailscale only for the
  rare thing the API can't do. Destructive/outward ops (delete app, move DNS)
  stay gated on your explicit go-ahead.

### 5. DNS
- `A  main.juliewrightrealtygroup.com  ->  <DROPLET_PUBLIC_IP>`  (low TTL, e.g. 300).
- Must resolve before you set the domain in Coolify, or Let's Encrypt (HTTP-01 on
  the public `80`) can't issue.

### 6. Connect GitHub
- Coolify → **Sources → GitHub App** → install on the `wrightster` account and
  grant access to the **`jwrg`** repo.

### 7. Create the application
- New **Application** → from the GitHub source → repo **`jwrg`**, branch
  **`coolify-pilot`**.
- **Build Pack: Dockerfile** (root `./Dockerfile`).
- **Ports Exposes: `4321`** (matches the Dockerfile).
- **Domain (FQDN): `https://main.juliewrightrealtygroup.com`** — Coolify's
  Traefik proxy provisions Let's Encrypt automatically.
- **Health check**: path `/healthz`, port `4321` (Coolify only swaps traffic to a
  container once this returns 200 → that's the zero-downtime gate). The probe runs
  `curl` **inside** the container, so the runtime image must contain `curl`/`wget`
  — the Dockerfile installs `curl` for exactly this reason.
- Env vars: none required.

### 8. Deploy & verify
- Click **Deploy**; watch build logs (first build pulls the base image + `npm ci`
  — a few minutes).
- Smoke test:
  ```bash
  curl -I https://main.juliewrightrealtygroup.com/healthz     # 200
  ```
  Then load `/`, `/listings`, `/neighborhoods`, and a listing detail — confirm
  **live** office data renders (the server-island sections stream in).

### 9. Prove zero-downtime (the whole point)
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

---

## Auto-deploy: GitHub Actions secrets (public vs private repos)

Coolify's API is Tailscale-only, so GitHub webhooks can't reach it —
`.github/workflows/deploy-coolify.yml` instead joins the tailnet on push and
calls the deploy API. It needs 3 secrets + 2 variables:

| Kind | Name | Value | Same for every site? |
|---|---|---|---|
| secret | `TS_OAUTH_CLIENT_ID` | Tailscale trust-credential (OAuth) client id, scope `Auth Keys:write`, tag `tag:ci` | ✅ |
| secret | `TS_OAUTH_SECRET` | …its secret | ✅ |
| secret | `COOLIFY_TOKEN` | scoped Coolify API token (`coolify-token` helper / Keychain) | ✅ |
| variable | `COOLIFY_HOST` | `100.94.121.24:8000` | ✅ |
| variable | `COOLIFY_APP_UUID` | the site's Coolify app uuid (jwrg = `ieunvd3nlxbnv1chvg3ghc3n`) | ❌ per-site |

Fleet-wide, set-once prerequisites (not per repo): the Tailscale `tag:ci`
tagOwner + OAuth trust credential, and Coolify's **API Allowed-IPs widened to the
tailnet range `100.64.0.0/10`** (CI joins with a *dynamic* tailnet IP, so a
single-IP allowlist would 403 it).

**The GitHub Free gotcha — org secrets don't reach private repos.** On the Free
org plan, **organization** secrets can be used by **public** repos only (the
"Private repositories" scope is greyed out: *"Organization secrets cannot be used
by private repositories with your plan"*). So:

- **Public repos** (`jwrg`, `jwlc`, `jw-shared`) → set the 3 secrets + `COOLIFY_HOST`
  **once as org-level** secrets/variables; only `COOLIFY_APP_UUID` is per-repo.
- **Private repos** (the neighborhood sites + `jwrg-brochures`) → org secrets
  won't apply. Use **repository-level** secrets instead — the same 3 values in each
  private repo's own Settings → Secrets → Actions. Don't paste by hand: run the
  **`enable-autodeploy.sh` helper** (see below), which sets all 5 for a repo from
  the Keychain. Repo secrets work on private repos on Free; the only cost is
  re-running per repo. Do it per site at migration time (they're all still on Ploi
  until then, where push = deploy with no secrets).
- **Upgrading to GitHub Team** (~$4/mo, one solo seat) lifts this — org secrets
  then reach private repos. Optional convenience once several private Coolify
  sites exist; not required.

Note: GitHub **Actions itself** on private repos is free (2,000 min/mo; this
job runs seconds). The only thing gated is org-secret *scope*, not running Actions.

### Scripted setup + credential storage (macOS Keychain)

Rather than paste secrets by hand, use **`~/.config/coolify/enable-autodeploy.sh`**
(lives outside any git repo, next to the token). It sets all 3 secrets + 2
variables on a repo via `gh secret set` / `gh variable set` — `COOLIFY_APP_UUID`
**last**, so the workflow never fires half-configured:

```bash
~/.config/coolify/enable-autodeploy.sh [REPO] [APP_UUID]
# defaults to preserve-west; e.g. for another site:
~/.config/coolify/enable-autodeploy.sh wrightster/<repo> <coolify-app-uuid>
```

It resolves credentials from the **macOS login Keychain** (encrypted at rest),
falling back to env vars / the token file — nothing lands in shell history. Store
the three items once (each prompts hidden):

```bash
security add-generic-password -U -a "$USER" -s coolify-api-token         -w   # Coolify API token
security add-generic-password -U -a "$USER" -s coolify-ts-oauth-client-id -w   # tag:ci OAuth client id
security add-generic-password -U -a "$USER" -s coolify-ts-oauth-secret    -w   # …its secret
```

GitHub can't reveal existing secret values, so the Keychain is also the durable
**backup of the `tag:ci` OAuth pair** — if it's lost, mint a fresh client
(Tailscale admin → OAuth clients, scope `Auth Keys:write`, tag `tag:ci`; reuse
across sites is fine). For manual Coolify API calls, the **`coolify-token`** shell
helper (in `~/.zshrc`) reads the token back the same way:
`curl -H "Authorization: Bearer $(coolify-token)" …`.

---

## Staging tier

Each Coolify site gets a staging deployment from a **`staging` branch** at
`<site>.stage.jwrgnc.com`. jwrg's staging pilot (2026-07-24) is the reference.

**Structure**
- Coolify project `julie-wright-sites` → **`staging` environment** (uuid
  `pepwi1f4hxiqtasyxrkm1zbb`) alongside `production`.
- App **`jwrg-staging`** (uuid `m11r2gz1cimucnayzszpuf6k`), tracks branch
  **`staging`**, domain **`jwrg.stage.jwrgnc.com`**, Dockerfile build, health
  check `/healthz`.
- DNS: `jwrg.stage.jwrgnc.com` A → the droplet (dns-only). Intended fleet
  convention is a **`*.stage.jwrgnc.com` wildcard** so new staging sites need no
  per-site DNS — not yet created (the wildcard write was blocked by the safety
  classifier; approve it to enable zero-DNS staging).

**Noindex (`SITE_ENV`)** — the staging app sets env var **`SITE_ENV=staging`**
(`is_buildtime` + `is_runtime`). It drives two signals so staging is never indexed:
- `src/pages/robots.txt.ts` is SSR → returns `Disallow: /` at runtime when
  `SITE_ENV=staging`.
- `src/layouts/BaseLayout.astro` emits `<meta name="robots" content="noindex,
  nofollow">` — baked at **build** time (pages are prerendered), so the Dockerfile
  takes `SITE_ENV` as a build **ARG** (defaults `production`; the staging env var
  is passed as a build arg). Prod builds (no `SITE_ENV`) are unaffected.

**Data & forms** — staging reads the **same prod office API** (realistic data).
Forms submit to the prod office, so when testing a staging form use a **`+test`
email** (`you+test@…`) — the office marks `+test` submissions as test, tags them,
and does **not** notify agents (`FormController::isTestSubmission`). No sink form
or code needed.

**Promotion flow** — work → push `staging` → preview at `jwrg.stage.jwrgnc.com`
→ fast-forward `staging` into `main` (→ prod auto-deploys). The `SITE_ENV`/noindex
infra lives on `staging`; it's backwards-compatible (defaults to production) so it
flows to `main` harmlessly on first promotion.

**Adding staging for another site** — create a `staging` branch, add the
`SITE_ENV` ARG to its Dockerfile + the robots/meta gates (copy jwrg), create a
Coolify app in the `staging` environment on the `staging` branch at
`<site>.stage.jwrgnc.com`, set `SITE_ENV=staging`, and add a `<site>.stage` DNS
record (or rely on the wildcard once it exists).
