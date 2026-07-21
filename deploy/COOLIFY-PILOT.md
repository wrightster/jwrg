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
- Store it on your Mac **outside any git repo**: `~/.config/coolify/token`,
  `chmod 600`. It's never committed or written into a repo file.
- How Claude uses it — runs in Bash on your Mac, so it reaches the private API
  directly over the tailnet:
  ```bash
  curl -s -H "Authorization: Bearer $(cat ~/.config/coolify/token)" \
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
  container once this returns 200 → that's the zero-downtime gate).
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
