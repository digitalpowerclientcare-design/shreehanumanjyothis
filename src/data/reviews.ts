import type { CitySlug } from '@/data/business';

/**
 * Client experiences, rendered as server-side HTML text.
 *
 * WHY NOT A WIDGET: the audited site used a Trustindex JavaScript widget, so
 * the review text never appeared in the HTML. Googlebot's cheapest pass and
 * every AI crawler (GPTBot, ClaudeBot, PerplexityBot) therefore saw nothing —
 * the strongest trust content on the site was invisible to exactly the systems
 * we want quoting it. These are plain strings in the DOM instead.
 *
 * WHY NO AggregateRating SCHEMA: self-serving review markup on your own
 * LocalBusiness is ineligible for Google rich results and risks a manual
 * action. The star rating belongs on the Google Business Profile; this page
 * links there so anyone can verify it.
 *
 * ⚠️  TODO(client): REPLACE EVERY ENTRY BELOW.
 *     These are structurally-correct placeholders, not real reviews.
 *     Publishing invented testimonials would be both dishonest and a
 *     direct contradiction of the brand's "no false promises" positioning.
 *     Pull real review text from each Google Business Profile, keep the
 *     reviewer's own words, and get consent for the name format used.
 */

export interface ClientReview {
  name: string;
  city: CitySlug;
  /** Neighbourhood, if the reviewer gave one. */
  area?: string;
  service: string;
  /** Full text — never truncate with a "Read more" link. */
  text: string;
  /** ISO date of the review. */
  date: string;
}

export const reviews: ClientReview[] = [
  // ---- PLACEHOLDER DATA — DO NOT PUBLISH AS-IS ---------------------------
  {
    name: 'Placeholder — replace with a real Bengaluru review',
    city: 'bengaluru',
    area: 'Malleswaram',
    service: 'Kundli Matching',
    text:
      'Replace this with the reviewer’s own words, copied from the Google Business Profile. ' +
      'Keep the full text — do not truncate it behind a “Read more” link, because the ' +
      'truncated portion is invisible to search engines and AI crawlers.',
    date: '2026-01-01',
  },
  {
    name: 'Placeholder — replace with a real Hyderabad review',
    city: 'hyderabad',
    area: 'Kukatpally',
    service: 'Kundli Reading',
    text:
      'Replace this with a genuine review pulled from the Hyderabad Google Business Profile.',
    date: '2026-01-01',
  },
  {
    name: 'Placeholder — replace with a real Mumbai review',
    city: 'mumbai',
    area: 'Dadar',
    service: 'Vastu for Home',
    text:
      'Replace this with a genuine review pulled from the Mumbai Google Business Profile.',
    date: '2026-01-01',
  },
];

export const reviewsByCity = (city: CitySlug) =>
  reviews.filter((r) => r.city === city);
