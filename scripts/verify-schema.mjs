/**
 * JSON-LD entity-graph verifier.
 *
 * Runs after every build alongside verify-migration. Fails if the structured
 * data would mislead a search engine or an LLM:
 *
 *   - an @id reference points at a node that isn't on the page (the graph
 *     silently breaks — this is the most common structured-data mistake)
 *   - AggregateRating/Review markup about our own business appears anywhere
 *     (ineligible for rich results, risks a manual action)
 *   - a page has zero or multiple H1s
 *   - a page is missing its canonical
 *
 * Usage: node scripts/verify-schema.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const problems = [];

/** Walk dist and collect every built page. */
const pages = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
};
walk(DIST);

let checked = 0;
let withGraph = 0;

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = '/' + path.relative(DIST, path.dirname(file)).replace(/\\/g, '/') + '/';

  // Redirect stubs are intentionally bare — skip them.
  if (/http-equiv=["']?refresh/i.test(html)) continue;
  checked++;

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel} has ${h1s} <h1> (expected exactly 1)`);

  if (!/rel="canonical"/.test(html)) problems.push(`${rel} missing canonical`);

  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) continue;
  withGraph++;

  if (/aggregateRating|"@type"\s*:\s*"Review"/.test(m[1])) {
    problems.push(`${rel} emits self-serving review markup — not allowed`);
  }

  let graph;
  try {
    graph = JSON.parse(m[1]);
  } catch (err) {
    problems.push(`${rel} JSON-LD is not valid JSON: ${err.message}`);
    continue;
  }

  const nodes = graph['@graph'] || [];
  const defined = new Set(nodes.map((n) => n['@id']).filter(Boolean));

  // Collect { "@id": "..." } reference-only objects and check they resolve.
  const refs = [];
  JSON.stringify(graph, (k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)
        && Object.keys(v).length === 1 && v['@id']) refs.push(v['@id']);
    return v;
  });
  const dangling = [...new Set(refs)].filter((r) => !defined.has(r));
  if (dangling.length) {
    problems.push(`${rel} dangling @id ref(s): ${dangling.join(', ')}`);
  }
}

console.log(`Schema: checked ${checked} pages, ${withGraph} carry a JSON-LD graph.`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} schema problem(s):\n`);
  problems.slice(0, 40).forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('✓ Entity graph is sound — no dangling refs, no self-serving review markup, one H1 per page.');
