# SHJ Web — Sri Hanuman Jyothishyalayam

Static website for Pandit Sri Pandu Ranga Shastri Ji, with three centres:
**Bengaluru** (Sadashiva Nagar), **Hyderabad** (Kukatpally), **Mumbai** (Prabhadevi).

Built with **Astro 6** + **Tailwind CSS 4**, output as pure static HTML, deployed to
**GitHub Pages** with the domain managed at **Hostinger**.

---

## ⚠️ Before this site goes live

The site is built and working, but several facts are **unverified placeholders**.
Search the codebase for `TODO(client)` and `TODO(build)` to find every one.

```bash
grep -rn "TODO(client)\|TODO(build)" src public
```

| # | Blocker | Where |
|---|---|---|
| 1 | **Canonical brand spelling** — the audit found "Jyothishalaya", "Jyotishyalayam" and "Jyothishyalayam" all in use | `src/data/business.ts` → `brand.name` |
| 2 | **Bengaluru phone number** — currently a Sulekha-sourced number, unverified | `src/data/business.ts` → Bengaluru `phoneDisplay` |
| 3 | **Bengaluru address conflict** — Sadashiva Nagar 560080 vs a Justdial listing at HSR Layout 560102 | `src/data/business.ts` |
| 4 | **Hyderabad address conflict** — the MIG-273 address vs Sulekha's "Plot 50, Saraswati Nilayam" | `src/data/business.ts` |
| 5 | **Opening hours & languages per centre** — currently assumed | `src/data/business.ts` → `hours`, `languages` |
| 6 | **Geo coordinates** — approximate; take them from each live Google Business Profile pin | `src/data/business.ts` → `geo` |
| 7 | **Google Business Profile URLs** — empty; the reviews block will not show a rating until these are set | `src/data/business.ts` → `gbpUrl` |
| 8 | **Client reviews** — all three entries are structural placeholders and **must not be published as-is** | `src/data/reviews.ts` |
| 9 | **Real photography** — the pandit portrait is an SVG placeholder | `public/images/` |
| 10 | **Contact form endpoint** — the form posts to `#`; GitHub Pages has no server | `src/pages/contact/index.astro` |
| 11 | **Legal pages** — privacy policy and terms need review against the DPDP Act 2023 | `src/pages/privacy-policy/`, `src/pages/terms/` |

**Nothing on the site claims a review count or star rating until `gbpUrl` and
`reviews.count` are filled in.** That is deliberate — an unverifiable number is a
trust liability, and the whole positioning of this site is honesty.

---

## Running it

Astro 6 requires **Node ≥ 22.12**. Node 22 is installed via Homebrew at
`/opt/homebrew/opt/node@22`; the repo pins it in `.nvmrc` / `.node-version`.

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

```bash
npm install
```

```bash
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run check` | Type-check + validate content frontmatter |

> `package.json` pins `overrides.vite` to match Astro's Vite. Without it,
> `@tailwindcss/vite` pulls its own Vite 8 and the build fails with
> `Missing field 'tsconfigPaths'`. Don't remove it without re-testing the build.

---

## Architecture

```
src/
├── data/
│   ├── business.ts      ← SINGLE SOURCE OF TRUTH for all NAP data
│   └── reviews.ts       ← client reviews (server-rendered HTML, not a widget)
├── lib/schema.ts        ← every JSON-LD block, generated from business.ts
├── content/
│   ├── services/*.md    ← 20 service pages
│   ├── blog/*.md        ← articles
│   └── glossary/*.md    ← glossary terms
├── components/          ← Header, Footer, cards, FAQ, maps, CTAs
├── layouts/BaseLayout.astro
└── pages/
    ├── index.astro
    ├── [city]/index.astro          → /bengaluru/ /hyderabad/ /mumbai/
    ├── [city]/[service].astro      → /bengaluru/kundli-matching/ + language pages
    ├── services/[slug].astro       → city-neutral service pages
    ├── blog/[slug].astro
    └── …
```

### The three-layer URL model

| Layer | URL | Job |
|---|---|---|
| Brand | `/` | One Organization + one Person entity |
| City | `/bengaluru/` | One LocalBusiness entity per centre, linked to its own GBP |
| Service | `/services/{slug}/` | Topical authority — the pages LLMs cite |
| City × Service | `/{city}/{service}/` | Local commercial intent — the pages that convert |

Global service pages link **down** to all three city variants; city variants link
**up** to the global page. No page competes with itself.

### `business.ts` is the only place NAP data lives

No component, page or schema block hardcodes an address, phone number or opening
hour. This exists specifically to prevent the inconsistency found in the audit
(three pandit names, two Bengaluru addresses, three brand spellings across the
open web). Fix a fact once, here, and it propagates everywhere.

---

## SEO & AI decisions worth knowing

| Decision | Why |
|---|---|
| **No `AggregateRating` / `Review` schema** | Self-serving review markup on your own LocalBusiness is ineligible for Google rich results and risks a manual action. Reviews are plain HTML — which is what AI crawlers read anyway — and link to the GBP for verification. |
| **Reviews server-rendered, not a JS widget** | The old site used Trustindex, so review text never appeared in the HTML. GPTBot, ClaudeBot and PerplexityBot render JS poorly or not at all — the strongest trust content was invisible to exactly the systems we want quoting it. |
| **Answer-first `.lead-answer` block on every page** | A 40–60 word direct answer under the H1. This is the block AI assistants extract. |
| **FAQ headings written as full conversational questions** | Those strings are close to what people type into ChatGPT and Perplexity. |
| **`FAQPage` schema despite Google retiring FAQ rich results** | Its value here is machine-readable Q&A pairs for LLM extraction, not blue-link stars. |
| **AI crawlers explicitly allowed in `robots.txt`** | For a local lead-gen business, being citable in AI answers is the point. Flip to `Disallow` only if the client wants to opt out of AI training — and expect reduced AI visibility. |
| **`llms.txt` shipped** | Not a confirmed ranking input for any provider — a proposed convention. Zero cost, zero downside. |
| **Stated limitations everywhere** | "Astrology cannot predict an exact wedding date." Hedged, accurate sources are cited by LLMs more readily than absolutist ones — and it is the one thing no competitor in this market does. |
| **Maps are click-to-load** | Three eager Google Maps iframes would destroy mobile LCP. No third-party request until the user asks. |
| **Zero client JS except three small bits** | Nav toggle (CSS-only `<details>`), FAQ accordion (native `<details>`), and ~15 lines for the map loader. |

### Deliberately not built

`/vashikaran-specialist/` and `/bring-back-lost-love/` — the two highest-risk pages
on the old site. Vashikaran is the most spam-associated term in this vertical and a
Google Ads–banned category; "bring back lost love" implies control over a third
party. Both 301 to `/services/relationship-guidance/` (see the redirect map below).

---

## The doorway-page rule

3 cities × 20 services would be 60 near-identical pages — the fastest known route to
a doorway-page manual action.

**Current state: 6 tier-1 services × 3 cities = 18 city-service pages, plus 3
language pages.** Each carries its own NAP, landmark, travel notes, timings,
languages and FAQ set.

Before adding more:

- Keep **60–70% of each page unique** — city-name swaps get filtered.
- Publish **5–10 location pages per week, maximum**. Never all at once.
- Only promote a service to a city page once Search Console shows city-qualified
  impressions on its global page.

Which services get city pages is controlled per-centre by `tier1Services` in
`business.ts`.

---

## Adding content

**A new service page** — create one file:

```
src/content/services/my-service.md
```

Copy the frontmatter shape from an existing file. The schema is enforced in
`src/content.config.ts`, so a missing or misnamed field fails the build rather than
shipping broken. It appears automatically on `/services/` and in the footer if you
add it there. Add its slug to a centre's `tier1Services` to generate city variants.

**A new article** — `src/content/blog/my-post.md`. Same pattern.

**A new glossary term** — `src/content/glossary/my-term.md`.

No template editing required for any of the above.

---

## Deployment: GitHub Pages + Hostinger

### ⚠️ GitHub Pages cannot serve 301 redirects

No `.htaccess`, no `_redirects`, no custom headers. This matters because 12 live
WordPress URLs need redirecting, and a competitor teardown during research showed
exactly what a botched migration looks like — two URL structures live at once, old
URLs still indexed, some 404ing.

**Recommended: put Cloudflare (free) in front of GitHub Pages.** Point Hostinger's
nameservers at Cloudflare, proxy to Pages, and use Bulk Redirects for real 301s.
You also get edge caching and security headers.

Fallback if Cloudflare is off the table: meta-refresh + canonical stub pages. Google
treats them as redirects, but weaker and slower to consolidate.

### Steps

1. **Repo** — push to GitHub. `main` is production.
2. **Pages** — Settings → Pages → Source: **GitHub Actions**. The workflow in
   `.github/workflows/deploy.yml` runs `astro check` then `astro build`, so a type
   error or bad frontmatter field can never reach production.
3. **Custom domain** — Settings → Pages → Custom domain: `shreehanumanjyothis.in`.
   `public/CNAME` is already committed so it survives every build.
4. **Hostinger DNS** — **delete Hostinger's default parking `A` and `CNAME` records
   first**; they will silently collide. Then add GitHub Pages' apex `A` records and
   a `www` `CNAME` → `<org>.github.io`. **Check the current IPs against GitHub's
   docs** rather than copying them from anywhere else.
5. **Verify the domain** in GitHub Pages settings (TXT record) to prevent takeover.
6. **HTTPS** — wait for DNS to propagate, confirm apex *and* `www` both resolve to
   Pages, *then* tick **Enforce HTTPS**. If the cert fails, remove and re-add the
   custom domain to force reissue.
7. **Redirects** — deploy the map below at cutover, not after.
8. **Search Console** — add a **Domain property** (DNS TXT). Submit
   `sitemap-index.xml`. No Change of Address needed; the domain isn't changing.
9. **Bing Webmaster** — import from GSC. Not optional: Bing's index feeds ChatGPT
   search and Copilot.
10. **Point each GBP at its city hub** — `/bengaluru/`, `/hyderabad/`, `/mumbai/` —
    **not** the homepage. Highest-impact single action for multi-location SEO.
11. **Analytics** — GA4. Track `tel:` clicks, `wa.me` clicks, form submits and
    "Get directions" clicks *per city* as conversions.

### Redirect map

| Old (WordPress) | New | Type |
|---|---|---|
| `/best-astrologer-in-hyderabad-pandit-sri-pandu-ranga-shastri-ji/` | `/hyderabad/` | 301 |
| `/love-problem-solution-in-hyderabad-…/` | `/hyderabad/relationship-guidance/` | 301 |
| `/marriage-problem-solution-in-hyderabad-…/` | `/hyderabad/marriage-guidance/` | 301 |
| `/marriage-delay-astrology-solutions-in-hyderabad-…/` | `/services/marriage-delay/` | 301 |
| `/kundli-matching-for-marriage-in-hyderabad-…/` | `/hyderabad/kundli-matching/` | 301 |
| `/kundli-reading-in-hyderabad-…/` | `/hyderabad/kundli-reading/` | 301 |
| `/kaal-sarp-dosh-nivaran-in-hyderabad-…/` | `/services/kaal-sarp-dosha/` | 301 |
| `/navagraha-shanti-puja-in-hyderabad-…/` | `/services/navagraha-shanti-puja/` | 301 |
| `/vastu-consultant-in-hyderabad-…/` | `/hyderabad/vastu-for-home/` | 301 |
| `/bring-back-lost-love-in-hyderabad-…/` | `/services/relationship-guidance/` | 301 |
| `/vashikaran-specialist-in-hyderabad-…/` | `/services/relationship-guidance/` | 301 |
| `/hello-world/`, `/category/uncategorized/` | — | 410 Gone |

---

## Design system — "Cosmic Traditional"

Deep night-sky base, emerald/violet aurora, temple gold. Depth comes from layered
gradients, glow and grain rather than from borders and boxes.

Tokens live in `@theme` in `src/styles/global.css`. Tailwind 4 generates utilities
from them automatically — use `text-cream`, `bg-night`, `border-hairline`.

> **Do not use Tailwind v3's `text-[--color-gold]` syntax.** It silently produces
> nothing in v4. This bit us once already — 109 classes were unstyled.

| Role | Token |
|---|---|
| Page base | `void` `#04050a` |
| Section base | `night` `#080b16` |
| Raised panels / cards | `deep` `#0d1322` · `elevated` `#131b2e` |
| Headings & emphasis | `cream` `#f6f2e9` |
| Body | `mist` `#b3bacb` · meta `faint` `#6f7891` |
| Accent / primary CTA | `gold` `#d9ab5c` → `gold-bright` `#f2dca6` |
| Aura | `emerald` `#0f7a5a` · `violet` `#3a2a6b` |
| Hairlines | `hairline` `rgb(255 255 255 / 0.09)` |

**Type** — Cormorant Garamond Variable (display: high contrast, elegant, set large
and tight) + Plus Jakarta Sans Variable (body, 17px). Both self-hosted via
`@fontsource` — no Google Fonts CDN, better for CWV and DPDP.

### Atmosphere — all pure CSS, zero image requests

| Effect | How |
|---|---|
| **Aurora** | Two blurred radial blobs on `mix-blend-mode: screen`, slowly drifting. Scaled up under 768px or it's too small to read as a glow. |
| **Starfield** | Eight layered `radial-gradient` dots on a repeating 620px tile, twinkling. |
| **Grain** | Inline `feTurbulence` SVG as a data URI on `mix-blend-mode: overlay`. |
| **Constellations** | Hand-plotted inline SVG paths + nodes. |
| **Meteors** | Three out-of-phase gradient streaks. |
| **Zodiac wheel** | Generated SVG — three counter-rotating rings, names on arc paths, glyphs, house numerals, woven inner star. |
| **Gold gradient text** | `background-clip: text` on a four-stop gradient. |
| **Spotlight cards** | Cursor-follow radial gradient driven by two CSS custom props. Aceternity's effect without its 125KB React bundle. |

### Motion budget

Everything visual is native CSS: reveals and grid cascades via
`animation-timeline: view()`, above-the-fold entrances via `@starting-style`, all
behind `@supports` and `prefers-reduced-motion`.

JavaScript is **6.2 KB gzipped**, and it is Lenis (smooth scroll) plus ~80 lines of
our own for spotlight tracking, pointer tilt, count-up and the header scroll state.
Motion One was installed, used for one count-up, measured at ~18 KB gzipped, and
removed in favour of 20 lines of `requestAnimationFrame`.

> **Grid cascades are CSS, not JS, on purpose.** An earlier version set
> `opacity: 0` in JavaScript and animated on `inView` — which means a failed
> script leaves content permanently invisible. The `.stagger` class offsets
> `animation-range` per `nth-child` instead, so content is never hidden waiting
> on a script.

### Two gotchas

1. Astro scoped styles carry an extra attribute selector, so they **out-specify
   Tailwind utilities**. `class="foo lg:hidden"` loses to a scoped
   `.foo { display: grid }`. Handle responsive visibility inside the component's
   own media query — see `StickyMobileCTA.astro`.
2. Zodiac characters (♈♉♊…) get hijacked by the OS **emoji** font and render as
   coloured tiles. Append `U+FE0E` and set `font-variant-emoji: text`.

---

## Images

Everything in `public/images/` is a placeholder SVG.

The highest-ROI action on this whole project is a **half-day photo shoot at each of
the three centres** — exterior with signage, interior consultation space, and Pandit
Ji at work. It fixes imagery, trust, local proof and GBP content in one go, and it
is the longest lead time in the plan.

When replacing: export AVIF/WebP, use descriptive filenames
(`pandit-sri-pandu-ranga-shastri-ji-consultation.avif`), set explicit width/height,
and write real alt text. Update `pandit.photo` in `business.ts`.

Do **not** reuse the AI-generated stock imagery from the old site.
