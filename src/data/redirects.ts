/**
 * ============================================================================
 *  URL MIGRATION MAP — WordPress → Astro
 * ============================================================================
 *
 *  Every URL that exists on the live WordPress site is listed here exactly
 *  once. Nothing may be dropped: an old URL that stops resolving loses every
 *  link and every ranking signal pointing at it.
 *
 *  RULES APPLIED
 *  1. One-to-one, topic-for-topic. No bulk redirect to the homepage — Google
 *     treats mass redirects-to-root as soft 404s and discards the equity.
 *  2. Geo relevance is preserved. Every old URL was "<topic> in Hyderabad", so
 *     each target is the Hyderabad city page for that topic, not the
 *     city-neutral one. That is why four extra Hyderabad service pages exist
 *     (see `tier1Services` in business.ts).
 *  3. Retired topics still redirect. `vashikaran` and `bring-back-lost-love`
 *     are deliberately not rebuilt, but their URLs point at the nearest
 *     legitimate page rather than 404ing, so any inbound links still count.
 *  4. Zero-value WordPress artefacts are NOT redirected. `hello-world` and
 *     `category/uncategorized` are left to 404 on purpose — redirecting
 *     junk URLs into real pages dilutes relevance.
 *
 *  MECHANISM
 *  Astro emits a meta-refresh + canonical + noindex stub for each entry.
 *  Google honours an instant meta refresh as a permanent redirect, but it is
 *  weaker and slower to consolidate than a real 301. Put Cloudflare in front
 *  of GitHub Pages and mirror this map as Bulk Redirects to get true 301s —
 *  see README § Deployment.
 * ============================================================================
 */

export interface RedirectRule {
  from: string;
  to: string;
  /** Why this target — kept so the mapping can be audited later. */
  note: string;
}

export const redirects: RedirectRule[] = [
  {
    from: '/best-astrologer-in-hyderabad-pandit-sri-pandu-ranga-shastri-ji/',
    to: '/hyderabad/',
    note: 'Brand + "best astrologer in Hyderabad" → the Hyderabad city hub, which targets the same query.',
  },
  {
    from: '/love-problem-solution-in-hyderabad-relationship-marriage-issues/',
    to: '/hyderabad/relationship-guidance/',
    note: 'Same topic, same city. Renamed from "solution" to "guidance" for compliance.',
  },
  {
    from: '/bring-back-lost-love-in-hyderabad-astrology-guidance/',
    to: '/hyderabad/relationship-guidance/',
    note: 'Retired topic (implies control over a third party). Nearest legitimate page.',
  },
  {
    from: '/vashikaran-specialist-in-hyderabad-love-marriage-guidance/',
    to: '/hyderabad/relationship-guidance/',
    note: 'Retired topic (spam-associated, Ads-banned category). Nearest legitimate page.',
  },
  {
    from: '/marriage-problem-solution-in-hyderabad-husband-wife-issues/',
    to: '/hyderabad/marriage-guidance/',
    note: 'Direct equivalent.',
  },
  {
    from: '/marriage-delay-astrology-solutions-in-hyderabad-vedic-remedies/',
    to: '/hyderabad/marriage-delay/',
    note: 'Direct equivalent.',
  },
  {
    from: '/kundli-matching-for-marriage-in-hyderabad-guna-milan-dosha-check/',
    to: '/hyderabad/kundli-matching/',
    note: 'Direct equivalent.',
  },
  {
    from: '/kundli-reading-in-hyderabad-birth-chart-horoscope-analysis/',
    to: '/hyderabad/kundli-reading/',
    note: 'Direct equivalent.',
  },
  {
    from: '/kaal-sarp-dosh-nivaran-in-hyderabad-puja-remedies/',
    to: '/hyderabad/kaal-sarp-dosha/',
    note: 'Direct equivalent. "Nivaran" dropped — the framing implied a compulsory remedy.',
  },
  {
    from: '/navagraha-shanti-puja-in-hyderabad-graha-dosh-remedies/',
    to: '/hyderabad/navagraha-shanti-puja/',
    note: 'Direct equivalent.',
  },
  {
    from: '/vastu-consultant-in-hyderabad-home-office-vastu-expert/',
    to: '/hyderabad/vastu-for-home/',
    note: 'Old page covered home + office; home is the higher-volume intent. Office Vastu is linked from it.',
  },
];

/**
 * Left to 404 deliberately — default WordPress artefacts with no inbound value.
 * Documented here so nobody "fixes" them later by pointing them at real pages.
 */
export const deliberate404s = [
  '/hello-world/',
  '/category/uncategorized/',
];

/** Shape Astro's `redirects` config expects. */
export const redirectMap: Record<string, string> = Object.fromEntries(
  redirects.map((r) => [r.from, r.to]),
);
