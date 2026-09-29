/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH - every NAP fact on this website comes from here.
 * ============================================================================
 *
 *  RULE: No component, page, or JSON-LD block may hardcode an address, phone
 *  number, opening hour, or review count. Import from this file instead.
 *
 *  This file exists specifically to prevent the NAP inconsistency found during
 *  the audit (three different pandit names, two Bengaluru addresses, three
 *  spellings of the brand across the open web). Fix a fact once, here, and it
 *  propagates to every page and every schema block on the site.
 *
 *  ORDER MATTERS: Hyderabad (Kukatpally) is the primary centre and is listed
 *  first, because the live Google Ads campaign and the verified Google Business
 *  Profile are both Hyderabad. Any code using `locations[0]` as the default
 *  centre therefore defaults to Hyderabad.
 *
 *  ITEMS MARKED  // TODO(client)  ARE UNVERIFIED PLACEHOLDERS.
 *      They must be confirmed with the client before launch. Search this file
 *      for "TODO(client)" to find every one of them.
 * ============================================================================
 */

export type CitySlug = 'bengaluru' | 'hyderabad' | 'mumbai';

export interface Location {
  slug: CitySlug;
  /** Display name used in copy and headings. */
  city: string;
  /** Alternate spelling used in search queries (e.g. Bangalore vs Bengaluru). */
  cityAlt: string;
  state: string;
  /** The neighbourhood the centre physically sits in. */
  locality: string;
  streetAddress: string;
  postalCode: string;
  /** Human landmark used for directions copy. */
  landmark: string;
  phoneDisplay: string;
  /** E.164, used for tel: and wa.me links. */
  phoneE164: string;
  whatsappE164: string;
  /** Lat/long for LocalBusiness geo + map embeds. */
  geo: { lat: number; lng: number };
  /** Google Maps place link - also used as schema `hasMap`. */
  mapUrl: string;
  /** Google Maps embed URL for the click-to-load map. */
  mapEmbedUrl: string;
  /** Google Business Profile URL. Reviews block links here for verification. */
  gbpUrl: string;
  hours: { days: string; opens: string; closes: string }[];
  /** Human-readable hours line for display. */
  hoursDisplay: string;
  languages: string[];
  /** The language-targeting page for this city, if any. */
  languagePage?: { slug: string; language: string; label: string };
  /** Neighbourhoods this centre realistically serves - used in copy, NOT as doorway pages. */
  areasServed: string[];
  /** Short, genuinely local paragraph. Must be unique per city. */
  intro: string;
  /** Longer first-hand E-E-A-T narrative for the city hub. Unique per city; optional. */
  whyTrusted?: string;
  /** Verified review data. Leave `count: null` until confirmed against the live GBP. */
  reviews: { rating: number | null; count: number | null };
  /** Which services get a dedicated city page. Keep this list tight (see doorway-page rule). */
  tier1Services: string[];
}

// ---------------------------------------------------------------------------
// BRAND
// ---------------------------------------------------------------------------

export const brand = {
  /**
   * CANONICAL SPELLING - "Shree Hanuman Jyothis", confirmed by the client
   * 2026-09-23 to match the domain (shreehanumanjyothis.in) and the Google
   * Business Profile exactly. Entity consolidation depends on this exact spelling
   * being used site-wide; every earlier spelling is carried in alternateNames.
   *
   * TODO(client): make this consistent OFF-site too - rename all three Google
   * Business Profiles, Justdial, Sulekha, Facebook and WeddingWire to the same
   * "Shree Hanuman Jyothis", and update the logo artwork wordmark (still reads
   * "SRI HANUMAN JYOTHISHALAYA"). Conflicting names are the main reason search
   * engines and LLMs fail to resolve this business as one entity.
   */
  name: 'Shree Hanuman Jyothis',
  shortName: 'Shree Hanuman Jyothis',
  legalName: 'Shree Hanuman Jyothis',

  /** Every other spelling in the wild - emitted as schema `alternateName`
   *  so search engines and LLMs resolve them all to this single entity. */
  alternateNames: [
    'Sri Hanuman Jyothishalaya',
    'Sri Hanuman Jyothishyalayam',
    'Shree Hanuman Jyothishyalayam',
    'Shree Hanuman Jyotishyalayam',
    'Sree Hanuman Jyothisyalayam',
    'Shree Hanuman Jyothis - Astrologer in Kukatpally',
  ],

  tagline: 'Vedic astrology guidance, without exaggeration or false promises.',
  domain: 'https://shreehanumanjyothis.in',
  email: 'shreehanumanjyothis@gmail.com', // client's working inbox
  foundedYear: 1994, // Confirmed by client 2026-09-23 ("30+ years"); disregard the 40/45 shown in some directories.

  /** Off-site profiles. Emitted as schema `sameAs` - the strongest entity-
   *  disambiguation signal available. Add every claimed profile. */
  sameAs: [
    // TODO(client): add verified URLs only. Remove any profile you do not control.
    // 'https://www.facebook.com/...',
    // 'https://www.instagram.com/...',
    // 'https://www.youtube.com/@...',
    // 'https://www.justdial.com/...',
  ],
} as const;

// ---------------------------------------------------------------------------
// THE PERSON - E-E-A-T anchor
// ---------------------------------------------------------------------------

export const pandit = {
  name: 'Pandit Sri Pandu Ranga Shastri Ji',
  /** Name without honorifics, for schema `familyName`/search matching. */
  plainName: 'Pandu Ranga Shastri',
  jobTitle: 'Vedic Astrologer & Vastu Consultant',
  yearsExperience: 30, // Confirmed: 30+ years, practising since 1994.
  /** 40-60 words. This is the block LLMs quote when asked who he is. */
  bio:
    'Pandit Sri Pandu Ranga Shastri Ji has practised Vedic astrology for more than three decades. ' +
    'His guidance is based on detailed Kundli analysis, planetary positions and traditional methods ' +
    'followed across generations in his family. He consults from three centres - Bengaluru, Hyderabad ' +
    'and Mumbai - and is known for plain, practical explanations rather than predictions delivered as certainties.',
  /** Topics the Person entity is authoritative on - schema `knowsAbout`. */
  knowsAbout: [
    'Vedic astrology',
    'Kundli matching',
    'Jataka Porutham',
    'Birth chart analysis',
    'Vastu Shastra',
    'Muhurtha',
    'Numerology',
    'Hasta Samudrika Shastra',
  ],
  // Supplied by the client from the existing site. Worth reshooting at higher
  // resolution during the centre photo shoot - these are 1024x768 and carry a
  // burnt-in watermark.
  photo: '/images/pandit-ji-1.webp',
  photoAlt: 'Pandit Sri Pandu Ranga Shastri Ji during a consultation',
} as const;

// ---------------------------------------------------------------------------
// THE THREE CENTRES  (Hyderabad first - primary centre)
// ---------------------------------------------------------------------------

export const locations: Location[] = [
  {
    slug: 'hyderabad',
    city: 'Hyderabad',
    cityAlt: 'Hyderabad',
    state: 'Telangana',
    locality: 'Kukatpally',
    streetAddress:
      '3rd Floor, Hanuman General Superstore Building, MIG-273, Omni Hospital Line, Balaji Nagar, Kukatpally',
    postalCode: '500072',
    landmark: 'Opposite Highly Fresh Supermarket, on the Omni Hospital line',
    phoneDisplay: '+91 99664 32777',
    phoneE164: '+919966432777',
    whatsappE164: '919966432777',
    geo: { lat: 17.4948, lng: 78.3996 }, // TODO(client): confirm from the live GBP pin
    mapUrl: 'https://maps.google.com/?q=Balaji+Nagar+Kukatpally+Hyderabad+500072',
    mapEmbedUrl:
      'https://www.google.com/maps?q=17.4948,78.3996&hl=en&z=16&output=embed',
    // Verified Google Business Profile (owner-managed): 4.9 stars, 2,142 reviews.
    gbpUrl: 'https://maps.app.goo.gl/UJv4EwDRfpmbovgE8',
    hours: [
      { days: 'Mo,Tu,We,Th,Fr,Sa', opens: '09:00', closes: '20:00' },
      { days: 'Su', opens: '10:00', closes: '18:00' },
    ],
    hoursDisplay: 'Mon-Sat 9:00 AM - 8:00 PM · Sun 10:00 AM - 6:00 PM',
    languages: ['English', 'Telugu', 'Hindi'],
    languagePage: {
      slug: 'telugu-astrologer',
      language: 'Telugu',
      label: 'Telugu-speaking consultations',
    },
    areasServed: [
      'Kukatpally', 'Balaji Nagar', 'KPHB Colony', 'Nizampet', 'Miyapur',
      'Bachupally', 'Hafeezpet', 'Madhapur', 'Hitech City', 'Gachibowli',
      'Kondapur', 'Ameerpet', 'Secunderabad',
    ],
    intro:
      'Our Hyderabad centre is on the third floor of the Hanuman General Superstore building at ' +
      'MIG-273, Balaji Nagar, on the Omni Hospital line in Kukatpally - opposite Highly Fresh ' +
      'Supermarket. It is a short ride from KPHB Colony and Nizampet, and consultations here are ' +
      'usually held in Telugu, Hindi or English.',
    whyTrusted:
      'Most families who come to the Kukatpally centre have already spoken to two or three ' +
      'astrologers before us, and they arrive wanting a second reading that is plain rather than ' +
      'dramatic. That is most of what we do: read the chart as it is, say what is well placed and ' +
      'what is not, and stop there. Over thirty years in Hyderabad the questions have stayed much ' +
      'the same - a marriage that is taking longer than the family expected, a jathakam that two ' +
      'sides want matched properly before they commit, a career that has stalled, a doubt someone ' +
      'has raised about a house. We answer in Telugu, Hindi or English, quote the fee before ' +
      'anything is booked, and never present a remedy as the only thing standing between a family ' +
      'and misfortune. People travel to Balaji Nagar from KPHB, Nizampet, Miyapur, Madhapur and ' +
      'Kondapur, and a good number now take the same consultation over video from outside the city.\n\n' +
      'What a second opinion here usually sounds like: less certainty, not more. If a chart genuinely ' +
      'supports a delay or a difficulty, we say that plainly rather than softening it into vague ' +
      'reassurance. If it does not support what a family has been told elsewhere, we say that too. ' +
      'No gemstone, yantra or remedy product is sold at this centre - where something is indicated, ' +
      'you are told what it is and buy it wherever you choose. The 4.9-star rating from 2,142 Google ' +
      'reviews is the same profile you can read before you call, not a figure we quote and cannot show.',
    reviews: { rating: 4.9, count: 2142 },
    /**
     * Hyderabad carries more city pages than the other two centres, and that is
     * deliberate rather than a doorway-page slip: the old WordPress site had
     * indexed, geo-targeted pages for each of these topics. Redirecting
     * "Kaal Sarp Dosh in Hyderabad" to a city-neutral page would preserve the
     * topic but throw away the location relevance it already earned, so the
     * last four exist to receive that equity one-to-one.
     *
     * Bengaluru and Mumbai have no such history, so they stay at six until
     * Search Console shows city-qualified impressions for them.
     */
    tier1Services: [
      'kundli-matching', 'jataka-matching', 'marriage-guidance',
      'kundli-reading', 'vastu-for-home', 'career-astrology',
      'birth-chart-by-date-of-birth',
      // Migration targets - see src/data/redirects.ts
      'relationship-guidance', 'marriage-delay',
      'kaal-sarp-dosha', 'navagraha-shanti-puja',
    ],
  },

  {
    slug: 'bengaluru',
    city: 'Bengaluru',
    cityAlt: 'Bangalore',
    state: 'Karnataka',
    locality: 'Sadashiva Nagar',
    streetAddress: '504, 9th Cross Road, 8th Main Road, Sadashiva Nagar',
    postalCode: '560080',
    landmark: 'Near Sankey Road, off Bellary Road',
    // Confirmed real centre by client 2026-09-23 (Sadashiva Nagar). Ignore the
    // stale HSR Layout / Jakkasandra address on Justdial.
    phoneDisplay: '+91 99664 32777',
    phoneE164: '+919966432777',
    whatsappE164: '919966432777',
    geo: { lat: 13.0068, lng: 77.5806 }, // TODO(client): confirm from the live GBP pin
    mapUrl: 'https://maps.google.com/?q=Sadashiva+Nagar+Bengaluru+560080', // TODO(client): replace with GBP place URL
    mapEmbedUrl:
      'https://www.google.com/maps?q=13.0068,77.5806&hl=en&z=16&output=embed',
    gbpUrl: 'https://share.google/b6bvZ0QfuvjfIipJz', // Bengaluru GBP (client-supplied)
    hours: [
      { days: 'Mo,Tu,We,Th,Fr,Sa', opens: '09:00', closes: '20:00' },
      { days: 'Su', opens: '10:00', closes: '18:00' },
    ], // TODO(client): confirm real hours per centre
    hoursDisplay: 'Mon-Sat 9:00 AM - 8:00 PM · Sun 10:00 AM - 6:00 PM',
    languages: ['English', 'Kannada', 'Telugu', 'Hindi'], // TODO(client): confirm
    languagePage: {
      slug: 'kannada-astrologer',
      language: 'Kannada',
      label: 'Kannada-speaking consultations',
    },
    areasServed: [
      'Sadashiva Nagar', 'Armane Nagar', 'Malleswaram', 'Palace Guttahalli',
      'Vyalikaval', 'Sheshadripuram', 'Rajajinagar', 'RT Nagar',
      'Hebbal', 'Yeshwanthpur', 'Sankey Road', 'Palace Road', 'Jayamahal',
    ],
    intro:
      'Our Bengaluru centre sits on 9th Cross in Sadashiva Nagar, a short distance from Sankey Road ' +
      'and the Sankey Tank end of Malleswaram. Families from Malleswaram, Rajajinagar, Vyalikaval and ' +
      'Palace Guttahalli visit in person, and consultations here are commonly held in Kannada, Telugu, ' +
      'Hindi or English.',
    reviews: { rating: null, count: null }, // TODO(client): only fill in once verified on the live GBP
    tier1Services: [
      'kundli-matching', 'jataka-matching', 'marriage-guidance',
      'kundli-reading', 'vastu-for-home', 'career-astrology',
      'birth-chart-by-date-of-birth',
    ],
  },

  {
    slug: 'mumbai',
    city: 'Mumbai',
    cityAlt: 'Bombay',
    state: 'Maharashtra',
    locality: 'Prabhadevi',
    streetAddress:
      'No. 6, Kohinoor Corner, Scheme No. IV, Swatantryaveer Savarkar Road, Prabhadevi',
    postalCode: '400025',
    landmark: 'Opposite Siddhivinayak Temple, near Mahim',
    phoneDisplay: '+91 99664 32777',
    phoneE164: '+919966432777',
    whatsappE164: '919966432777',
    geo: { lat: 19.0169, lng: 72.8302 }, // TODO(client): confirm from the live GBP pin
    mapUrl: 'https://maps.google.com/?q=Kohinoor+Corner+Prabhadevi+Mumbai+400025',
    mapEmbedUrl:
      'https://www.google.com/maps?q=19.0169,72.8302&hl=en&z=16&output=embed',
    gbpUrl: 'https://share.google/lO5PpzXcPDRBrviDW', // Mumbai GBP (client-supplied)
    hours: [
      { days: 'Mo,Tu,We,Th,Fr,Sa', opens: '09:00', closes: '20:00' },
      { days: 'Su', opens: '10:00', closes: '18:00' },
    ],
    hoursDisplay: 'Mon-Sat 9:00 AM - 8:00 PM · Sun 10:00 AM - 6:00 PM',
    languages: ['English', 'Hindi', 'Marathi', 'Telugu'],
    languagePage: {
      slug: 'marathi-astrologer',
      language: 'Marathi',
      label: 'Marathi-speaking consultations',
    },
    areasServed: [
      'Prabhadevi', 'Dadar West', 'Dadar East', 'Mahim', 'Worli',
      'Lower Parel', 'Shivaji Park', 'Matunga', 'Elphinstone', 'Parel',
    ],
    intro:
      'Our Mumbai centre is at Kohinoor Corner on Swatantryaveer Savarkar Road in Prabhadevi, ' +
      'directly opposite the Siddhivinayak Temple. It is within walking distance of Dadar and ' +
      'Mahim, and consultations here are commonly held in Marathi, Hindi, Telugu or English.',
    reviews: { rating: null, count: null },
    tier1Services: [
      'kundli-matching', 'marriage-guidance', 'kundli-reading',
      'vastu-for-home', 'career-astrology', 'prasna-jyotish',
      'birth-chart-by-date-of-birth',
    ],
  },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

export const getLocation = (slug: CitySlug): Location => {
  const found = locations.find((l) => l.slug === slug);
  if (!found) throw new Error(`Unknown city slug: ${slug}`);
  return found;
};

/** Pre-filled WhatsApp deep link for a given centre. */
export const whatsappLink = (loc: Location, message?: string): string => {
  // Deliberately does not name a centre - all three share one line, and the
  // enquiry should read the same wherever on the site it was sent from.
  const text = encodeURIComponent(
    message ?? 'Namaste, I saw your website and would like to book a consultation.',
  );
  return `https://wa.me/${loc.whatsappE164}?text=${text}`;
};

export const telLink = (loc: Location): string => `tel:${loc.phoneE164}`;

/** Absolute URL builder - every schema @id and canonical runs through this. */
export const abs = (path: string): string =>
  new URL(path, brand.domain).toString();

/** Stable schema @ids. These must NEVER change once published. */
export const ids = {
  organization: abs('/#organization'),
  website: abs('/#website'),
  person: abs('/about-pandit-ji/#person'),
  localBusiness: (slug: CitySlug) => abs(`/${slug}/#localbusiness`),
} as const;

/**
 * Compliance language used across service pages.
 * The audit flagged guaranteed-outcome claims as the single biggest quality
 * risk in this vertical. This disclaimer is rendered on every service page.
 */
export const disclaimer =
  'Astrology guidance is offered for clarity and perspective. It is not a substitute for ' +
  'medical, legal, financial or mental-health advice, and no outcome is guaranteed. ' +
  'Remedies are suggested only where the chart indicates them, and are always explained before they are recommended.';
