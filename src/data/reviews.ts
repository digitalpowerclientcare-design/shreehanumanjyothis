import type { CitySlug } from '@/data/business';

/**
 * Client experiences, rendered as server-side HTML text.
 *
 * WHY NOT A WIDGET: the audited site used a Trustindex JavaScript widget, so
 * the review text never appeared in the HTML. Googlebot's cheapest pass and
 * every AI crawler (GPTBot, ClaudeBot, PerplexityBot) therefore saw nothing -
 * the strongest trust content on the site was invisible to exactly the systems
 * we want quoting it. These are plain strings in the DOM instead.
 *
 * WHY NO AggregateRating SCHEMA: self-serving review markup on your own
 * LocalBusiness is ineligible for Google rich results and risks a manual
 * action. The star rating belongs on the Google Business Profile; this page
 * links there so anyone can verify it.
 *
 * SOURCE: real, verbatim reviews from the owner-managed Hyderabad (Kukatpally)
 * Google Business Profile (4.9 stars, 2,142 reviews). Reviewer wording is kept
 * exactly as written. Add more as they come in; keep them real, keep full text,
 * never invent. Bengaluru and Mumbai carry no reviews here until pulled from
 * their own verified profiles.
 */

export interface ClientReview {
  name: string;
  city: CitySlug;
  /** Neighbourhood, if the reviewer gave one. */
  area?: string;
  service: string;
  /** Star rating the reviewer left, 1-5. */
  rating: number;
  /** Full text, verbatim - never truncate with a "Read more" link. */
  text: string;
  /** ISO date of the review. */
  date: string;
}

export const reviews: ClientReview[] = [
  {
    name: 'K. Tharun',
    city: 'hyderabad',
    service: 'Vastu Consultation',
    rating: 5,
    text:
      'We asked for vastu consult for our house the suggestion was very perfect for our expectation lot layout and did not involve unnecessary changes',
    date: '2026-09-22',
  },
  {
    name: 'Chaitanya',
    city: 'hyderabad',
    service: 'Marriage Guidance',
    rating: 4,
    text:
      'It was very helpfull for me it helped for my marriage I am very thankful full for that..',
    date: '2026-09-09',
  },
];

export const reviewsByCity = (city: CitySlug) =>
  reviews.filter((r) => r.city === city);
