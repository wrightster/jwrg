# JWRG Site Rebuild Plan

Rebuilding **juliewrightrealtygroup.com** in Astro 5. This file is the
checklist — keep it updated as you go so a fresh Claude session can resume
from where the last one stopped.

## Status legend
- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked / decision needed

---

## 1. Architecture overview

- **Framework**: Astro 5 + Tailwind CSS 4 (`@theme` block in `global.css`,
  no `tailwind.config.js`).
- **Mode**: SSR with `@astrojs/node` (mode: `standalone`). Pages that don't
  need request-time data should still set `export const prerender = true`
  individually, mirroring the jwlc convention.
- **Data sources**:
  - **Listings + lead forms**: Office API at `https://office.jwrgnc.com/api/v1`
    - `GET /listings?site=jwrg&per_page=50` — index
    - `GET /listings/{slug}` — detail (includes photos, documents)
    - `GET /forms/{formId}` — public form config
    - `POST /forms/{formId}/submit` — public form submission (CORS allowed
      by `FormCors` middleware; honeypot + validation server-side)
  - **Static content** (team, neighborhoods, counties, glossary, FAQ,
    staging tips, moving tips, testimonials, business directory): TS files
    under `src/data/` — same approach as jwlc.
- **No React/Vue** — pure Astro components. Sharp for image optimization.
- **Reference codebase**: `~/code/jwlc` — design system tokens, component
  classes, `src/lib/api.ts`, `src/data/*.ts`, page structure, deploy flow.
- **Source-of-truth Laravel app**: `~/Herd/jwrg_office` — Listing /
  ListingPhoto / Form / FormSubmission / Manager / MarketingSite models.
  Marketing-site slug for this rebuild is `jwrg`.
- **Live legacy site**: `https://juliewrightrealtygroup.com` — content
  reference. Powered by REapp/Bailey-Wright legacy CMS; flat `*.php` URLs.
- **IDX search**: legacy site hands off to `search.juliewrightrealtygroup.com`
  (Doorify MLS feed via Dakno). Decision pending — for now, embed link
  out / iframe placeholder; first-party listings come from the office API.

---

## 2. Site map (target URLs)

Use clean, modern URLs — the legacy `*.php` paths will be set aside.

```
/                                       Home
/listings                               Listings index (office API)
/listings/[slug]                        Listing detail
/property-search                        IDX search (Doorify embed)
/property-organizer                     Save searches (IDX deep link)
/neighborhoods                          List of JWRG neighborhoods
/neighborhoods/[slug]                   Neighborhood detail
/neighborhood-map                       Map of all JWRG neighborhoods

/buyers                                 Buyer resources hub
/buyers/real-estate-101                 Glossary / key terms
/buyers/faq                             Buyer FAQ
/buyers/mortgage-calculator             Working JS calculator
/buyers/buying-guide                    Free guide request form

/sellers                                Seller resources hub
/sellers/staging-tips                   Staging article
/sellers/home-value                     CMA request form
/sellers/list-your-property             List-your-home form
/sellers/neighborhood-sold-report       Sold-report form

/relocation                             Relocation hub
/relocation/relocation-package          Package request form (19 fields)
/relocation/moving-tips                 Article + external donation links

/about                                  Our history
/about/team                             Team grid
/about/team/[slug]                      Individual broker bio
/about/triangle-area                    Service area + counties
/about/triangle-area/[county]           Per-county detail
/about/business-directory               Directory + search
/contact                                Contact + map + form

/testimonials                           Testimonials + submission form
/privacy                                Privacy policy
/accessibility                          Accessibility statement
/404                                    Not found
/sitemap.xml                            Sitemap (generated)
```

---

## 3. Data layer

### `src/lib/api.ts`
Port + extend `~/code/jwlc/src/lib/api.ts`:
- `BASE_URL = 'https://office.jwrgnc.com/api/v1'`
- `SITE_SLUG = 'jwrg'`
- Types: `ApiPhoto`, `ApiListing`, `ApiDocument` (already correct shape)
- Helpers: `formatPrice`, `formatAcres`, `formatBedsBaths`, `formatSqft`
- Functions:
  - `fetchListings({ featured?, county?, city?, status? }): Promise<ApiListing[]>`
  - `fetchListing(slug): Promise<ApiListing | null>`
  - `submitForm(formId, payload): Promise<{ ok, message, errors? }>` — POSTs
    JSON to `/forms/{formId}/submit`; reads honeypot field name from
    `GET /forms/{formId}`.

### Static data files (TS) under `src/data/`
- `team.ts` — 17 brokers (see §6 Team for the full list).
- `neighborhoods.ts` — Bragg Farm, Cedar Knolls, Colvard Farms, Cannady
  Mill Rd Lots, Land, Preserve West, Woodland Park.
- `counties.ts` — Chatham, Durham, Franklin, Granville, Harnett, Johnston,
  Orange, RTP, Vance, Wake, Warren (with municipalities + blurb).
- `keyTerms.ts` — glossary (Real Estate 101).
- `buyerFaq.ts` — FAQ Q/A pairs.
- `stagingTips.ts` — staging article sections.
- `movingTips.ts` — sections + external links (Salvation Army, Goodwill,
  Habitat ReStore).
- `testimonials.ts` — start empty / seed from legacy if available.
- `businessDirectory.ts` — categories + listings (start with skeleton).

### Form IDs
Each form on the live site needs to be mirrored as a `Form` row in the
office app (Filament "Forms" resource). Capture the UUIDs and store in:
- `src/data/forms.ts` — map of `formKey → UUID`. e.g.
  `{ contact: 'uuid…', cma: 'uuid…', listYourHome: 'uuid…', buyingGuide:
  'uuid…', soldReport: 'uuid…', relocation: 'uuid…', testimonial: 'uuid…' }`.
  These IDs are filled in once the forms are created in office.

Until forms exist in office, every page should render its form normally
but submit to a stub endpoint that logs and returns success (decision:
keep page UX functional even with `null` form ID; `submitForm` returns
`{ ok: false, message: 'Form not yet configured' }` if ID missing).

---

## 4. Design system

Already established in `src/styles/global.css`:
- Fonts: Inter (sans) + Playfair Display (serif).
- Colors: `navy-50…950`, `gold-50…950`, `warm-50…900`.
- These match the home page already built. Keep them; don't swap to
  jwlc's red/earth palette.

Extract repeated patterns into component classes in `global.css` once
they're used 2+ times:
- `.btn-primary` (gold-500 fill, white text), `.btn-secondary` (outline).
- `.section-label` (uppercase, tracked, `text-gold-600`, `text-sm`).
- `.section-heading` (`font-serif`, `text-3xl md:text-4xl`,
  `text-navy-900`).
- `.content-wrap` (`max-w-7xl mx-auto px-6`).
- `.cta-block-light` / `.cta-block-dark` (existing patterns on home).

---

## 5. Components

Create under `src/components/`:
- `ListingCard.astro` — image, county/acreage overlay, status badge,
  title, price, View Details. Used on home + listings index.
- `ListingRow.astro` — list-view variant for `/listings`.
- `PhotoGallery.astro` — listing detail gallery with lightbox.
- `TeamCard.astro` — photo, name, title, phone, email, link to bio.
- `NeighborhoodCard.astro`.
- `Section.astro` — light/dark wrapper with optional label + heading.
- `MiniContactForm.astro` — the global "Questions? Just Ask!" block.
- `Form.astro` — generic form runner: renders fields from a TS schema,
  handles submit via `submitForm()`, shows confirmation/error inline.
- `FieldText`, `FieldSelect`, `FieldTextarea`, `FieldCheckbox` — small
  primitives used by `Form.astro`.
- `Icon.astro` — inline SVG sprite (re-use icons from current home page,
  centralized so they're not duplicated across pages).
- `MortgageCalculator.astro` — client-side Vanilla JS, no React.

---

## 6. Team (17 brokers)

Source: live `/staff.php` page. All photos currently hosted on
`reappdata.global.ssl.fastly.net/site_data/baileywrightrealty/staff_pictures/`
— plan is to download them once, drop into `public/images/team/{slug}.jpg`,
and reference locally so we don't depend on the legacy CDN.

| # | Name | Slug | Title | Phone | Email |
|---|---|---|---|---|---|
| 1 | Julie Wright | julie-wright | Broker-in-Charge / Owner | (919) 632-8264 | juliannawright@gmail.com |
| 2 | Mahnaz Valipour | mahnaz-valipour | Broker | (919) 805-2088 | mah_gav@yahoo.com |
| 3 | Phyllis Howard | phyllis-howard | Broker | (919) 280-6321 | phyllisphoward@gmail.com |
| 4 | Janice Coleman | janice-coleman | Broker | (919) 219-3625 | janicecoleman@gmail.com |
| 5 | Donna Saldo | donna-saldo | Broker | (919) 749-2473 | dmsaldo@gmail.com |
| 6 | Ali Watts | ali-watts | Broker | (919) 880-2153 | Aliwcasey@aol.com |
| 7 | Lisa Branch | lisa-branch | Broker | (919) 744-9933 | lisabranchhomes@gmail.com |
| 8 | Shelley Caldwell Mitchiner | shelley-mitchiner | Broker, MIRM, Mgr New Homes Div | (919) 306-4662 | scmitchiner@gmail.com |
| 9 | Mary Ammons | mary-ammons | Broker | (919) 270-2101 | maryammons5508@gmail.com |
| 10 | Janelle Clark | janelle-clark | Broker | (919) 771-4093 | janelleclark6@gmail.com |
| 11 | Alex Bailey | alex-bailey | Broker | (919) 741-7575 | alextbailey@icloud.com |
| 12 | Lindsey Ewing | lindsey-ewing | Real Estate Agent | (828) 439-3782 | lindseyewinghomes@gmail.com |
| 13 | Paul Short | paul-short | Real Estate Agent | (704) 340-2506 | ptshort10@gmail.com |
| 14 | Meri-Ashlen Bailey | meri-ashlen-bailey | Real Estate Agent | (919) 453-4633 | (form only) |
| 15 | Robert Powell | robert-powell | Real Estate Agent | (919) 691-1663 | (form only) |
| 16 | Karen McQueen | karen-mcqueen | Realtor | (919) 280-1866 | kbmcqueen37@gmail.com |
| 17 | Jeff Hunter | jeff-hunter | Broker — Developer | (919) 730-9420 | jeffnhunter@aol.com |

Bios: pull from live `/staff/<slug>` pages when authoring `team.ts`.

---

## 7. Forms inventory

Each of these maps to a `Form` row in the office app:

| Key | Page | Fields |
|---|---|---|
| `contact` | `/contact`, mini "Questions? Just Ask!" | name*, phone*, email*, message, opt-in |
| `cma` | `/sellers/home-value` | first*, last*, email*, phone, address*, city*, beds, baths, year, sqft, reason, comments |
| `listYourHome` | `/sellers/list-your-property` | first*, last*, email*, phone*, address*, city*, type, beds, baths, year, sqft, garage, condition, amenities |
| `soldReport` | `/sellers/neighborhood-sold-report` | first*, last*, email*, phone, address, city, state, zip, comments, opt-in |
| `buyingGuide` | `/buyers/buying-guide` | first*, last*, email*, phone, address, city, state, zip, priceRange, timeline, sqft, beds, baths, halfBaths, type, special |
| `relocation` | `/relocation/relocation-package` | 19 fields — see legacy `/form-relocation.php` |
| `testimonial` | `/testimonials` | name*, email, location, message* |

The shared `Form.astro` reads a field schema (TS) per form key.

---

## 8. Page-by-page checklist

### Foundation
- [x] `astro.config.mjs` + `package.json` + Tailwind 4 + `global.css`
- [x] `BaseLayout.astro` (header + footer + global styles)
- [x] Home `/`
- [x] Switch to SSR via `@astrojs/node` standalone adapter
- [x] Add `sharp` to devDependencies
- [x] Create `src/lib/api.ts`
- [x] Create `src/data/{team,neighborhoods,counties,keyTerms,buyerFaq,stagingTips,movingTips,forms,site}.ts`
      (testimonials.ts deferred — no live data yet)
- [x] Create core `src/components/`: `Section`, `PageBanner`,
      `MiniContactForm`, `Form`, `ListingCard`, `TeamCard`
      (PhotoGallery, NeighborhoodCard, Icon, MortgageCalculator are
      rolled inline into pages where needed; extract later if reused)
- [x] Update `BaseLayout.astro` nav: hover dropdown desktop megamenu +
      mobile accordion accordion under each section.

### Listings
- [x] `/listings` — fetches from API; client-side county filter; "no listings" empty state
- [x] `/listings/[slug]` — detail page (gallery, beds/baths/acres, features, agent card, virtual tour, documents)
- [x] `/property-search` — IDX iframe to search.juliewrightrealtygroup.com
- [x] `/property-organizer` — small page explaining + link out to IDX

### Neighborhoods
- [x] `/neighborhoods` — grid of 7 from `neighborhoods.ts`
- [x] `/neighborhoods/[slug]` — hero + CTA (no photo gallery yet — pending content)
- [x] `/neighborhood-map` — list + Google Maps embed of office area

### Buyers
- [x] `/buyers` — hub with cards
- [x] `/buyers/real-estate-101` — glossary with sticky TOC
- [x] `/buyers/faq` — accordion FAQ
- [x] `/buyers/mortgage-calculator` — working JS calculator (PITI)
- [x] `/buyers/buying-guide` — buying-guide form

### Sellers
- [x] `/sellers` — hub
- [x] `/sellers/staging-tips` — long-form article + CTA
- [x] `/sellers/home-value` — CMA form
- [x] `/sellers/list-your-property` — list-your-home form
- [x] `/sellers/neighborhood-sold-report` — sold-report form

### Relocation
- [x] `/relocation` — hub
- [x] `/relocation/relocation-package` — 19-field form
- [x] `/relocation/moving-tips` — article + donation links

### About
- [x] `/about` — Our History + stats
- [x] `/about/team` — grid of all 17 brokers
- [x] `/about/team/[slug]` — individual bio page
- [x] `/about/triangle-area` — counties grid
- [x] `/about/triangle-area/[slug]` — per-county page
- [x] `/about/business-directory` — directory grid + categories
- [x] `/contact` — full contact page with form, NAP, map link

### Utility
- [x] `/testimonials` — submission form (no seed testimonials yet)
- [x] `/privacy`
- [x] `/accessibility`
- [x] `/404`
- [ ] `astro-sitemap` integration for `sitemap.xml`

### Polish
- [x] Pull all 15 available staff photos into `public/images/team/`
      (16 of 17 brokers have a real photo; Meri-Ashlen Bailey and
      Jeff Hunter have no photo yet on the legacy site)
- [ ] Pull hero/section imagery off the legacy CDN into `public/images/`
      (currently still fetched from reappdata.global.ssl.fastly.net)
- [x] Verify `npm run build` succeeds
- [ ] Run through every page in dev to confirm content + responsive
- [ ] Once deployed, confirm `npm run start` boots cleanly on the host

---

## 9. Open questions / decisions

- [ ] **IDX strategy**: keep handoff to `search.juliewrightrealtygroup.com`
      vs. swap to a modern provider. Needs Julie's input. Until then,
      iframe the existing search subdomain on `/property-search`.
- [ ] **Form IDs**: when forms are created in the office Filament admin,
      paste their UUIDs into `src/data/forms.ts`. Until populated, every
      form renders normally but shows "this form is not yet configured"
      on submit.
- [ ] **Listings association**: `?site=jwrg` currently returns 0 results —
      confirm the marketing-site slug is `jwrg` and that listings have
      been associated with it (Filament → Marketing Sites → JWRG → attach
      listings). Currently 15 listings exist in the API but they all
      look like jwlc land properties.
- [ ] **Bios**: 6 of 17 brokers (Janice Coleman, Lisa Branch, Janelle
      Clark, Alex Bailey, Lindsey Ewing, Paul Short) currently have
      placeholder one-liner bios because the live site only shows their
      contact card. Replace with real bios when available.
- [ ] **Photos**: Meri-Ashlen Bailey and Jeff Hunter need real headshots
      (Meri-Ashlen has only a placeholder on the legacy site; Jeff has
      no public profile page yet).
- [ ] **Social links**: live site has none. Add Facebook / Instagram /
      LinkedIn? Confirm with Julie.
- [ ] **Blog**: legacy site has a stub but no posts. Skip until requested.
- [ ] **Promotional landing pages** (`/preservesummersale`): port one-offs
      as-needed; not in v1 scope.
- [ ] **Sitemap**: install `@astrojs/sitemap` once a deploy domain is
      finalized.

---

## 10. How to resume

If context is cleared, a new Claude session should:
1. Read this file end-to-end.
2. Run `git status` and `git log -5` to see what's already been committed.
3. Run `ls src/pages src/components src/data src/lib 2>/dev/null` to see
   what's in place.
4. Pick the next unchecked item and continue.
