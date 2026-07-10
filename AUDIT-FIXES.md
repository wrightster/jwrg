# JWRG Audit — Remediation Plan

Fix plan for the 2026-07-10 accessibility / performance / consistency audit.
Sequenced by risk-adjusted value: correctness-and-safety first, then the big
infra win, then polish and content. No fix here has been applied yet.

## Implementation status (2026-07-10)

**Done + build-verified (local + mirrored shared):** Chunks 1–6 in full, except the
items explicitly deferred/flagged below. Runtime-verified: cache headers, prerender
split, self-hosted fonts (serve 200 `font/woff2`, no Google request), eager/lazy LCP
split, SEO single-host canonical/og, 10-county contact tags, `/property-search`→`/search`.

**Gated on user confirm (push = deploys BOTH sites):** the `@jw/shared` edits
(lightbox `inert`, video-iframe title, token darkening, `ListingCard/Row` `index`,
`will-change` removal) are made in the clone and mirrored into `node_modules` for
local testing, but **not yet tagged/pinned**. Ship = tag `jw-shared`, bump the pin in
JWRG + JWLC. JWLC inherits the token darkening + the a11y/LCP fixes — verify there.

**Deferred / flagged (my call, awaiting yours):**
- #21 neighborhood logo SVGO — needs visual verify (color-trick `<style>` risk); not done.
- #22 delete 15 team JPGs — it's real photography, ~1 MB, never downloaded by users
  (unreferenced); surfaced, not deleted. `git rm` if you don't want them as a fallback.
- #30 FontSwitcher swatch/copy drift — dev-only (compiled out of prod); not done.
- #17 topo `background-attachment: fixed` — left as-is (subtle gradient; unverifiable
  visual risk on both sites). Also: topo SVGO used the safe precision-3 (8.7%); precision-1
  would save 33% more if you accept imperceptible rounding on the decorative bg.

**Residual (token approach limits):** earth-500/gold-600 now pass 4.5:1 on white but land
~3.9:1 on the warm `earth-100` card bg; earth-400-as-text is untouched. Fully clearing the
warm card bg would need per-usage darker steps (a follow-up).

---

**Legend**
- Effort: **S** ≤30 min · **M** ~1–3 h · **L** half-day+
- ⚠️ **shared** = touches `@jw/shared` → requires a tag bump + pin and also
  lands on **JWLC** (coordinate per the chrome-divergence / shared-package rules).
- 🟡 **decision** = needs a business/content call from Michael before coding.

Cross-cutting note: the ~16 "legacy alias" pages (`resources/*`, `neighborhoods/*`,
`about/team/[slug]`, `404`, `privacy`, `accessibility`, `neighborhood-map`,
`property-organizer`) are the worst offenders for contrast **and** carry the
`navy-*`/`warm-*`/`font-serif` bridge that `PLAN.md` already tracks for removal.
This plan does a **targeted contrast pass now** rather than waiting for those
pages to be fully rebuilt.

---

## Chunk 1 — Accessibility correctness (do first: high value, low risk, mostly local)

1. **Nav modifier-click guard** — `layouts/BaseLayout.astro:352-379`. The click
   handler calls `e.preventDefault()` on every click and defers nav 100 ms.
   Add an early return `if (e.defaultPrevented || e.button !== 0 || e.metaKey ||
   e.ctrlKey || e.shiftKey || e.altKey) return;` so Cmd/Ctrl/Shift-click and
   middle-click behave natively. Prefer dropping the 100 ms `window.location`
   delay entirely (let the link navigate; run the animation without blocking).
   **S**

2. **`prefers-reduced-motion` guard** — `layouts/BaseLayout.astro:312-349`
   (parallax) and `listings/index.astro:539,542` (smooth scroll). Gate the
   scroll-driven `.topo-bg` transform behind
   `matchMedia('(prefers-reduced-motion: reduce)')`; when reduced, render the
   topo statically centered and use `scrollTo` without `behavior:'smooth'`. **S**

3. **Hidden-region focus management** — three spots, same root cause (hidden via
   `clip-path`/`opacity`, not `display:none`/`inert`, so controls stay tabbable):
   - Mobile menu — `BaseLayout.astro:159` + toggle JS `:383-391`. Add/remove
     `inert` with the open state; add Escape-to-close; move focus into the panel
     on open and restore to the button on close. **M**
   - Listings filter panel — `listings/index.astro:69` + `setFilterCollapsed`
     `:601-628`. Add `inert` when collapsed. **S**
   - Lightbox — ⚠️ **shared** `ListingGallery.astro:86-112` **and** the local
     copy `neighborhoods/[slug].astro:344-374`. `display:none` (or `inert`) until
     `.is-open`, and `inert` the page behind it while open (fixes both the
     phantom-focus and the non-contained `aria-modal`). **M**

4. **Mortgage-calculator live region** — `resources/buyers/mortgage-calculator.astro:44-59`.
   Wrap the `#out-*` results in `aria-live="polite"` so recomputed payments are
   announced. **S**

5. **Video iframe title** — ⚠️ **shared** `VideoSection.astro:89-94`. Set
   `title` (e.g. `v.title ?? 'Property video'`) on the injected `<iframe>`. **S**

6. **View-toggle button state** — `listings/index.astro:187-203`. Add
   `aria-pressed` to the grid/list and page-size toggles. **S**

---

## Chunk 2 — Contrast (WCAG 1.4.3)

7. **`gold-500` CTA buttons → `red-600`** (white-on-gold-500 ≈ 2.4:1 → fix ≈ 6.5:1).
   `404.astro:16`, `property-organizer.astro:26`,
   `resources/sellers/staging-tips.astro:33`. Swap `bg-gold-500 text-white` for a
   passing pairing (red bg + white, or dark text). **S**

8. **Muted body/link text below 4.5:1** — targeted pass over `text-earth-600`
   (~4.5:1 white / 3.7:1 on cream bg), `text-earth-500` (~3.3:1),
   `text-earth-400` (~2.6:1), and `text-gold-600` links (~3.6:1 at rest). Bump
   body copy to `earth-700`+, link rest-state to `gold-700`/`red-600`. Note the
   legacy pages express these as `text-navy-400/500` (= earth-500/600) — same
   fix. **Decide the mechanism:** either (a) darken the `earth-500/600` +
   `gold-600` steps in ⚠️ **shared** `tokens.css` once (fixes JWLC too, but a
   shared visual change), or (b) reclass the specific usages on JWRG pages.
   Recommend (a) if JWLC has the same failing pairs, else (b). **M** 🟡 decision
   (token-level vs per-usage)

9. **Footer fine print** — `global.css:261-268`. Raise `.footer-copyright` /
   `.footer-location` / `.footer-affiliations` from `earth-50/70` and `/65` to
   ~`/90` (3.0–3.3:1 → ≥4.5:1). **S**

10. **Nav search placeholder** — `global.css:165-167`, `earth-50/60` on red ≈
    2.8:1. Raise to ~`/80`. (Minor; label already `sr-only`.) **S**

---

## Chunk 3 — Performance: caching + prerender (the biggest infra win)

11. **HTTP caching on live SSR responses.** No `Cache-Control` anywhere today;
    the 60 s memo shields the office API but not the Node render, so home /
    neighborhoods / listings re-render every hit on the swap-prone 2 GB box. Add
    a `src/middleware.ts` (or per-page `Astro.response.headers`) setting
    `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` on the SSR
    pages. **M**

12. **Prerender the two genuinely-static SSR pages** — `404.astro` and
    `neighborhood-map.astro` → `export const prerender = true`
    (neighborhood-map only lists names + an iframe). **S**

13. **Fix `about/team/[slug]` prerender** — `about/team/[slug].astro:6-9` exports
    `getStaticPaths()` but has no `prerender = true`, so server mode **ignores
    it**. Add `export const prerender = true` (team changes rarely → prerender is
    correct). **S**

14. **Explicit prerender on the 6 pages missing a declaration** (consistency with
    the documented convention): `index.astro`, `neighborhoods/index.astro`,
    `neighborhoods/[slug].astro`, `about/team/[slug].astro` (covered by #13),
    `neighborhood-map.astro` (covered by #12), `404.astro` (covered by #12).
    Declare `false` on the ones that must stay SSR (home, neighborhood index +
    detail) so intent is explicit. **S**

---

## Chunk 4 — Performance: assets & data-loading

15. **Honor the `index` prop for eager LCP images** — ⚠️ **shared**
    `ListingCard.astro:26,57` and `ListingRow.astro:55`. Both hardcode
    `loading="lazy"`; `ListingCard` even receives `index` (already threaded from
    home + listings) but never reads it. Use it:
    `loading={index != null && index < 3 ? 'eager' : 'lazy'}` and
    `fetchpriority={index === 0 ? 'high' : undefined}`. **S**

16. **Un-block the fonts** — `BaseLayout.astro:95`. Either self-host the two
    variable WOFF2s (best; removes the cross-origin render-block) or the
    `media="print"` + `onload="this.media='all'"` swap. Preconnects already
    correct. **M** (swap) / **L** (self-host) 🟡 decision (self-host vs swap)

17. **Topo SVG cost** — `public/FallTopo_v2.svg` (114 KB) + permanent GPU layers.
    SVGO the file; drop the always-on `will-change: transform` in ⚠️ **shared**
    `components.css:1021-1028` (apply only while scrolling, or remove);
    reconsider `background-attachment: fixed` (components.css:32) on mobile. **M**

18. **`defer` the office forms embed** — `EmbedForm.astro:31-39`. Add `defer` to
    the `forms.js` `<script>` (its MutationObserver already tolerates async). **S**

19. **Memoize `fetchNeighborhoodLots`** — `lib/api.ts:57-68` uses a raw `fetch`
    that bypasses the shared memo, re-hitting the office every request. Route it
    through the shared `cachedJson` (add a memoized export to ⚠️ **shared** or
    memoize locally). **S**

20. **Parallelize the neighborhood-detail waterfall** — `neighborhoods/[slug].astro:11,21,27`.
    Listings + lots depend only on `slug`, not on the fetched neighborhood, so
    `Promise.all` them. **S**

21. **SVGO the oversized neighborhood logos** — `public/images/neighborhoods/colvard-farms.svg`
    (287 KB), `cedar-knolls.svg` (191 KB). **S**

22. **Delete dead assets** — unused local team JPGs in `public/images/team/*.jpg`
    (team photos come from the API now; grep confirms no references). **S**

---

## Chunk 5 — Consistency: content, data & SEO

23. 🟡 **Counties served — 6 vs 10.** `site.ts` (6: Wake, Granville, Franklin,
    Johnston, Harnett, Durham) drives footer, JSON-LD, Contact, home; `counties.ts`
    (10, adds Orange, Chatham, Vance, Warren) drives the About map. **Decide the
    real service area**, then make one file derive from the other so they can't
    diverge. **S** once decided.

24. 🟡 **Footer "Testimonials" dead anchor** — `BaseLayout.astro:72` →
    `/about#testimonials`, but `about/index.astro:20` sets
    `showTestimonials = false`. Either remove the footer link or restore the
    section (drop the gate). **S**

25. **SEO absolute-URL host unification** — canonical uses request origin
    (`BaseLayout.astro:29`), og:image + listing JSON-LD use `Astro.site` =
    staging (`:37`, `listings/[slug].astro:34`), brokerage JSON-LD is hardcoded
    to production (`:44`). Pick the production host, flip `astro.config.mjs:14`
    `site`, and build canonical + og + JSON-LD from one source. (Shared pattern
    with JWLC.) **M** 🟡 decision (which host / when to flip)

26. **Title format** — standardize on `<Page> | Julie Wright Realty Group`
    (mixed `|`/`—`; `areas/granville-vs-wake.astro:171` has no brand suffix). **S**

27. **Search naming + redirect** — nav search → `/listings?q=` (own listings)
    vs footer "Property Search" → `/search` (MLS iframe). Point the
    `/property-search` redirect (`astro.config.mjs:19`) at `/search`, and
    disambiguate the two labels. **S**

28. **Name / claim phrasing** — one broker CTA drops "Group"
    (`resources/sellers/list-your-property.astro:16`); the experience claim
    appears as "Five decades" / "50+ Years" / "50 years" / "over 50 years".
    Normalize the copy. **S**

29. **Sitemap + orphan pages** — `sitemap.xml.ts:10-21` omits `/search`; add it.
    `/neighborhood-map`, `/property-organizer`, `/accessibility` are reachable
    only by direct URL — decide whether any belong in nav/footer. **S**

30. **FontSwitcher drift** (dev-only, inert in prod) — swatch hexes no longer
    match tokens and the preview copy is JWLC's (`FontSwitcher.astro:37-44,87`).
    Sync or leave; low priority. **S**

---

## Chunk 6 — Docs & the accessibility statement

31. **Fix stale `jwrg/CLAUDE.md`** — documents a `Form.astro`, `src/data/forms.ts`,
    `src/lib/formFields.ts`, and `property-search.astro` that don't exist; claims
    "all component classes live in `global.css`" when page-level classes live in
    shared `components.css`. Rewrite the Architecture + "Adding a New Form"
    sections. **S**

32. **Update `PLAN.md`** alias-bridge status once Chunk 2/#8 and any page
    rebuilds land. **S**

33. **Accessibility statement** — `accessibility.astro:18-20` claims full keyboard
    operability and legible contrast. Land Chunks 1–2 first, then make the
    statement true (or soften to "we work toward"). **S**

---

## Decisions (RESOLVED 2026-07-10)

- **#23 Counties:** **10** — service area is the full 10-county set in
  `counties.ts`. Reconcile `site.ts` to derive from it.
- **#24 Testimonials:** **remove** the footer link.
- **#8 Contrast mechanism:** **token-level** — darken `earth-500/600` +
  `gold-600` in shared `tokens.css` (lands on JWLC too; verify there).
- **#16 Fonts:** **self-host** the two variable WOFF2s.
- **#25 SEO host:** **apex** `https://juliewrightrealtygroup.com`. Do the
  structural single-source-of-truth fix now; leave `astro.config` `site` on
  staging until launch (the flip is the cutover action).

## Cross-repo (⚠️ `@jw/shared`) items — batch into one tag bump

#3 lightbox, #5 video iframe title, #8 (if token route), #15 ListingCard/Row
`index`, #17 `will-change`, #19 memo helper. Change in `jw-shared`, tag a
release, bump the pin in both JWRG and JWLC, and sanity-check JWLC since these
land there too.

## Suggested execution order

Chunk 1 → Chunk 2 → Chunk 3 → Chunk 4 → Chunk 5 → Chunk 6. Within the shared
items, do them together so there's a single `@jw/shared` tag bump rather than
several. Verify with `npm run build` after each chunk; drive the affected flow
(nav modified-click, keyboard through the menu/filter/lightbox, a cold listings
request for cache headers) before committing.
