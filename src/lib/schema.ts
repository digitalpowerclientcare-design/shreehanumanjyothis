/**
 * JSON-LD builders. Every structured-data block on the site is generated here
 * from `business.ts` — nothing is hand-written per page, so the entity graph
 * can never drift out of sync with the NAP data.
 *
 * ⚠️  DELIBERATE OMISSION: no AggregateRating / Review markup about our own
 *     business. Google treats self-serving review markup on LocalBusiness and
 *     Organization as ineligible for rich results, and misuse risks a
 *     structured-data manual action. Reviews are rendered as plain HTML
 *     instead (which is what AI crawlers read anyway) and the star rating is
 *     left to the Google Business Profile in the map pack.
 */

import {
  brand, pandit, locations, ids, abs,
  type Location, type CitySlug,
} from '@/data/business';

type Json = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/*  Core entities                                                             */
/* -------------------------------------------------------------------------- */

/**
 * @param withSubOrgs Emit `subOrganization` links to all three centres. Only
 *   pass true on pages that also emit all three LocalBusiness nodes (home,
 *   contact) — otherwise the graph carries @id references that resolve to
 *   nothing on that page. The upward `parentOrganization` link on each
 *   LocalBusiness carries the same relationship and is always co-located with
 *   its own node, so nothing is lost elsewhere.
 */
export const organizationSchema = (withSubOrgs = false): Json => ({
  '@type': 'Organization',
  '@id': ids.organization,
  name: brand.name,
  alternateName: [...brand.alternateNames],
  legalName: brand.legalName,
  url: brand.domain,
  email: brand.email,
  description: brand.tagline,
  foundingDate: String(brand.foundedYear),
  founder: { '@id': ids.person },
  ...(brand.sameAs.length ? { sameAs: [...brand.sameAs] } : {}),
  logo: {
    '@type': 'ImageObject',
    url: abs('/images/logo-shj.png'),
    width: 1080,
    height: 425,
  },
  ...(withSubOrgs
    ? { subOrganization: locations.map((l) => ({ '@id': ids.localBusiness(l.slug) })) }
    : {}),
});

export const websiteSchema = (): Json => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: brand.domain,
  name: brand.name,
  publisher: { '@id': ids.organization },
  inLanguage: 'en-IN',
});

export const personSchema = (): Json => ({
  '@type': 'Person',
  '@id': ids.person,
  name: pandit.name,
  alternateName: pandit.plainName,
  jobTitle: pandit.jobTitle,
  description: pandit.bio,
  knowsAbout: [...pandit.knowsAbout],
  worksFor: { '@id': ids.organization },
  url: abs('/about-pandit-ji/'),
  image: abs(pandit.photo),
});

/**
 * One LocalBusiness per centre, each pointing at the shared Organization and
 * the shared Person. This is the structure that lets Google and LLMs treat
 * three addresses as three real branches of one business rather than three
 * unrelated entities (or, worse, a duplicate).
 */
export const localBusinessSchema = (loc: Location): Json => ({
  '@type': 'LocalBusiness',
  '@id': ids.localBusiness(loc.slug),
  name: `${brand.name} — ${loc.city}`,
  description: loc.intro,
  url: abs(`/${loc.slug}/`),
  parentOrganization: { '@id': ids.organization },
  employee: { '@id': ids.person },
  telephone: loc.phoneE164,
  email: brand.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: loc.streetAddress,
    addressLocality: loc.city,
    addressRegion: loc.state,
    postalCode: loc.postalCode,
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: loc.geo.lat,
    longitude: loc.geo.lng,
  },
  ...(loc.gbpUrl ? { hasMap: loc.gbpUrl } : { hasMap: loc.mapUrl }),
  openingHoursSpecification: loc.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.split(',').map(dayName),
    opens: h.opens,
    closes: h.closes,
  })),
  areaServed: loc.areasServed.map((a) => ({
    '@type': 'Place',
    name: `${a}, ${loc.city}`,
  })),
  availableLanguage: loc.languages.map((l) => ({ '@type': 'Language', name: l })),
  priceRange: '₹₹',
  // NOTE: no aggregateRating here. See the file header.
});

const DAYS: Record<string, string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday',
  Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};
const dayName = (d: string) => DAYS[d.trim()] ?? d;

/* -------------------------------------------------------------------------- */
/*  Page-level entities                                                       */
/* -------------------------------------------------------------------------- */

export interface ServiceSchemaInput {
  name: string;
  description: string;
  url: string;
  /** Omit for city-neutral pages — they are provided by the Organization. */
  citySlug?: CitySlug;
  serviceType?: string;
}

export const serviceSchema = (input: ServiceSchemaInput): Json => {
  const loc = input.citySlug
    ? locations.find((l) => l.slug === input.citySlug)
    : undefined;

  return {
    '@type': 'Service',
    '@id': `${input.url}#service`,
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? input.name,
    url: input.url,
    provider: loc
      ? { '@id': ids.localBusiness(loc.slug) }
      : { '@id': ids.organization },
    areaServed: loc
      ? [{ '@type': 'City', name: loc.city }]
      : locations.map((l) => ({ '@type': 'City', name: l.city })),
    ...(loc ? {} : { availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: locations[0].phoneE164,
      serviceUrl: abs('/contact/'),
    } }),
  };
};

export interface Faq { question: string; answer: string }

export const faqSchema = (faqs: Faq[], pageUrl: string): Json => ({
  '@type': 'FAQPage',
  '@id': `${pageUrl}#faq`,
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

export interface Crumb { name: string; url: string }

export const breadcrumbSchema = (crumbs: Crumb[]): Json => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: abs(c.url),
  })),
});

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export const articleSchema = (a: ArticleSchemaInput): Json => ({
  '@type': 'Article',
  '@id': `${a.url}#article`,
  headline: a.title,
  description: a.description,
  url: a.url,
  datePublished: a.datePublished,
  dateModified: a.dateModified ?? a.datePublished,
  author: { '@id': ids.person },
  publisher: { '@id': ids.organization },
  inLanguage: 'en-IN',
  ...(a.image ? { image: abs(a.image) } : {}),
});

export const definedTermSetSchema = (
  terms: { term: string; definition: string }[],
  pageUrl: string,
): Json => ({
  '@type': 'DefinedTermSet',
  '@id': `${pageUrl}#glossary`,
  name: 'Vedic Astrology Glossary',
  url: pageUrl,
  hasDefinedTerm: terms.map((t) => ({
    '@type': 'DefinedTerm',
    '@id': `${pageUrl}#${slugifyTerm(t.term)}`,
    name: t.term,
    description: t.definition,
    inDefinedTermSet: `${pageUrl}#glossary`,
  })),
});

export const slugifyTerm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* -------------------------------------------------------------------------- */
/*  Graph assembly                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Wraps any set of entities in a single @graph. Emitting one graph per page
 * (rather than several stray blocks) is what lets the @id cross-references
 * actually resolve.
 */
export const buildGraph = (...entities: (Json | null | undefined)[]): string =>
  JSON.stringify(
    { '@context': 'https://schema.org', '@graph': entities.filter(Boolean) },
    null,
    0,
  );
