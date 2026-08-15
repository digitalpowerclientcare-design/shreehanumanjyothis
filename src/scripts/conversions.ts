/**
 * ============================================================================
 *  CONVERSION SIGNALS
 * ============================================================================
 *
 *  WHY THIS EXISTS
 *  The Google Ads account records two conversion actions — "Submit lead forms"
 *  (6,690 in 30 days) and "Phone call leads" (4,160) — against roughly 19,600
 *  clicks. A 34% form-fill rate is not real. Meanwhile the four actions that
 *  would indicate an actual lead (Book appointment, Contact, Get directions,
 *  Page view) all record zero.
 *
 *  Every campaign runs "Maximize conversions". So Smart Bidding is optimising
 *  toward a fabricated signal — which is why the account bought the bare word
 *  "astrology" for ₹23,333 and why terms like "flower moon full moon astrology"
 *  show 56 conversions.
 *
 *  This file gives the account something real to bid on: four distinct,
 *  unambiguous, deduplicated events, each tagged with the city and the place on
 *  the page it came from.
 *
 *  HOW TO USE (in Google Ads / GTM)
 *    call_click        -> import as "Phone call lead"   (primary)
 *    whatsapp_click    -> import as "Contact"           (primary)
 *    form_submit       -> import as "Submit lead form"  (primary)
 *    directions_click  -> import as "Get directions"    (secondary)
 *
 *  Events are pushed to window.dataLayer (GTM) and to gtag() if present.
 *  Nothing here loads a tag manager — that stays the marketing team's call.
 * ============================================================================
 */

import { locations } from '@/data/business';

type Channel = 'call' | 'whatsapp' | 'directions' | 'form';

interface ConversionPayload {
  event: string;
  channel: Channel;
  /** bengaluru | hyderabad | mumbai | unknown */
  city: string;
  /** Which block on the page produced it — header, hero, sticky_bar… */
  placement: string;
  page_path: string;
  page_type: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/* -------------------------------------------------------------------------- */
/*  Lookups built at compile time from business.ts                            */
/* -------------------------------------------------------------------------- */

const mapUrlToCity = new Map<string, string>();
for (const loc of locations) mapUrlToCity.set(loc.mapUrl, loc.slug);

/** The centre the visitor is actually looking at, from the URL. */
function cityFromPath(): string {
  const seg = location.pathname.split('/').filter(Boolean)[0];
  return locations.some((l) => l.slug === seg) ? seg : 'none';
}

/**
 * Which centre does this click belong to?
 *
 * All three centres share a single phone and WhatsApp line, so the number
 * cannot identify the centre — attributing by phone would tag every call as
 * Bengaluru. Page context is the only honest signal for call/WhatsApp.
 * Map links remain per-centre, so those still resolve from the href.
 */
function cityFromHref(href: string): string {
  for (const [url, slug] of mapUrlToCity) {
    if (href.startsWith(url)) return slug;
  }
  return cityFromPath();
}

/** Where on the page did the click happen? Useful for judging which CTA works. */
function placementOf(el: Element): string {
  if (el.closest('.sticky-cta')) return 'sticky_bar';
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  if (el.closest('.hero')) return 'hero';
  if (el.closest('.centre-card')) return 'centre_card';
  if (el.closest('.final-cta')) return 'final_cta';
  if (el.closest('form')) return 'form';
  if (el.closest('section')) return 'section';
  return 'other';
}

/** Coarse page type, so Ads can segment city hubs vs service pages. */
function pageType(): string {
  const p = location.pathname;
  if (p === '/') return 'home';
  const seg = p.split('/').filter(Boolean);
  if (seg.length === 1) {
    if (locations.some((l) => l.slug === seg[0])) return 'city_hub';
    return seg[0];
  }
  if (locations.some((l) => l.slug === seg[0])) return 'city_service';
  return seg[0];
}

/* -------------------------------------------------------------------------- */
/*  Emit                                                                      */
/* -------------------------------------------------------------------------- */

/** One fire per channel+city per pageview — stops double-counting rage clicks. */
const alreadyFired = new Set<string>();

function emit(channel: Channel, city: string, placement: string) {
  const key = `${channel}:${city}`;
  if (alreadyFired.has(key)) return;
  alreadyFired.add(key);

  const payload: ConversionPayload = {
    event: `${channel === 'form' ? 'form_submit' : channel + '_click'}`,
    channel,
    city,
    placement,
    page_path: location.pathname,
    page_type: pageType(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === 'function') {
    window.gtag('event', payload.event, {
      city: payload.city,
      placement: payload.placement,
      page_type: payload.page_type,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*  Delegated listener — instruments every CTA, including ones added later     */
/* -------------------------------------------------------------------------- */

document.addEventListener(
  'click',
  (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link) return;

    const href = link.getAttribute('href') || '';
    let channel: Channel | null = null;

    if (href.startsWith('tel:')) channel = 'call';
    else if (href.includes('wa.me/')) channel = 'whatsapp';
    else if (/maps\.google\.|google\.[a-z.]+\/maps|goo\.gl\/maps/.test(href)) channel = 'directions';

    if (!channel) return;
    emit(channel, cityFromHref(href), placementOf(link));
  },
  { capture: true },
);

/* Real form submissions only — not focus, not abandonment. */
document.querySelectorAll<HTMLFormElement>('form[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', () => {
    const citySelect = form.querySelector<HTMLSelectElement>('select[name="city"]');
    emit('form', citySelect?.value || 'unknown', 'form');
  });
});

export {};
