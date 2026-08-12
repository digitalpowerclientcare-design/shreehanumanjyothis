/**
 * Migration safety net.
 *
 * Run after every build. Fails loudly if the URL migration would lose traffic:
 *   - a live WordPress URL is neither redirected nor deliberately retired
 *   - a redirect points at a page that does not exist (worse than no redirect)
 *   - a redirect stub was not emitted
 *   - a retired URL leaked into the sitemap
 *
 * Usage: node scripts/verify-migration.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { redirects, deliberate404s } from '../src/data/redirects.ts';

const DIST = path.resolve('dist');
const problems = [];
const ok = [];

/** Every URL currently live on the WordPress site (from its sitemaps). */
const LIVE_WORDPRESS_URLS = [
  '/',
  '/love-problem-solution-in-hyderabad-relationship-marriage-issues/',
  '/vashikaran-specialist-in-hyderabad-love-marriage-guidance/',
  '/marriage-problem-solution-in-hyderabad-husband-wife-issues/',
  '/kaal-sarp-dosh-nivaran-in-hyderabad-puja-remedies/',
  '/navagraha-shanti-puja-in-hyderabad-graha-dosh-remedies/',
  '/kundli-matching-for-marriage-in-hyderabad-guna-milan-dosha-check/',
  '/kundli-reading-in-hyderabad-birth-chart-horoscope-analysis/',
  '/bring-back-lost-love-in-hyderabad-astrology-guidance/',
  '/best-astrologer-in-hyderabad-pandit-sri-pandu-ranga-shastri-ji/',
  '/vastu-consultant-in-hyderabad-home-office-vastu-expert/',
  '/marriage-delay-astrology-solutions-in-hyderabad-vedic-remedies/',
  '/hello-world/',
  '/category/uncategorized/',
];

const pageExists = (urlPath) =>
  fs.existsSync(path.join(DIST, urlPath, 'index.html'));

/* 1 ── every live URL is accounted for ---------------------------------- */
const handled = new Set([
  ...redirects.map((r) => r.from),
  ...deliberate404s,
  '/', // the homepage maps to itself
]);

for (const url of LIVE_WORDPRESS_URLS) {
  if (!handled.has(url)) {
    problems.push(`UNHANDLED live URL — would 404 with no redirect: ${url}`);
  }
}

/* 2 ── every redirect target resolves to a real page --------------------- */
for (const r of redirects) {
  if (!pageExists(r.to)) {
    problems.push(`BROKEN TARGET — ${r.from}  →  ${r.to}  (no page built there)`);
  } else {
    ok.push(`${r.from}\n      →  ${r.to}`);
  }
}

/* 3 ── every redirect stub was actually emitted -------------------------- */
for (const r of redirects) {
  const stub = path.join(DIST, r.from, 'index.html');
  if (!fs.existsSync(stub)) {
    problems.push(`MISSING STUB — no redirect page generated at ${r.from}`);
    continue;
  }
  const html = fs.readFileSync(stub, 'utf8');
  if (!/http-equiv=["']?refresh/i.test(html)) {
    problems.push(`STUB HAS NO REFRESH — ${r.from}`);
  }
  if (!html.includes(r.to)) {
    problems.push(`STUB POINTS ELSEWHERE — ${r.from} does not reference ${r.to}`);
  }
}

/* 4 ── no retired URL leaked into the sitemap ---------------------------- */
const sitemapFile = path.join(DIST, 'sitemap-0.xml');
if (fs.existsSync(sitemapFile)) {
  const xml = fs.readFileSync(sitemapFile, 'utf8');
  for (const r of redirects) {
    if (xml.includes(r.from)) {
      problems.push(`SITEMAP LEAK — retired URL listed in sitemap: ${r.from}`);
    }
  }
  const count = (xml.match(/<loc>/g) || []).length;
  console.log(`Sitemap contains ${count} live URLs.\n`);
} else {
  problems.push('No sitemap-0.xml found in dist.');
}

/* ── report ─────────────────────────────────────────────────────────────── */
console.log(`Verified ${redirects.length} redirects:\n`);
ok.forEach((l) => console.log('  ✓ ' + l));
console.log(`\nDeliberately left to 404 (${deliberate404s.length}): ${deliberate404s.join(', ')}`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} PROBLEM(S):\n`);
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('\n✓ Migration map is safe — every live URL is handled and every target resolves.');
