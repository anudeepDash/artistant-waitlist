#!/usr/bin/env node
/*
 * Small load test with no dependencies (Node 18+).
 *
 *   node scripts/load-test.mjs https://www.artistant.in
 *   node scripts/load-test.mjs https://www.artistant.in --concurrency 50 --seconds 30
 *
 * It hits the public pages in parallel and prints latency percentiles, requests per
 * second and any failures for each page. Only GET requests are sent, so it never
 * writes data. Keep runs short against production: Vercel bills for the traffic, and
 * a long run can look like an attack to its firewall.
 */

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) || 'http://localhost:3000').replace(/\/$/, '');
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const CONCURRENCY = opt('concurrency', 20);
const SECONDS = opt('seconds', 20);

const PATHS = ['/', '/privacy', '/terms', '/directory', '/claim', '/card/anudeep', '/sitemap.xml', '/robots.txt'];

const stats = new Map(PATHS.map((p) => [p, { times: [], codes: {}, errors: 0, bytes: 0 }]));
const deadline = Date.now() + SECONDS * 1000;
let next = 0;

async function worker() {
  while (Date.now() < deadline) {
    const path = PATHS[next++ % PATHS.length];
    const s = stats.get(path);
    const t0 = performance.now();
    try {
      const res = await fetch(base + path, { headers: { 'user-agent': 'artistant-load-test' }, redirect: 'manual' });
      const body = await res.arrayBuffer();
      s.times.push(performance.now() - t0);
      s.codes[res.status] = (s.codes[res.status] || 0) + 1;
      s.bytes += body.byteLength;
    } catch {
      s.errors += 1;
    }
  }
}

const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : 0);

console.log(`Load test: ${base}, ${CONCURRENCY} parallel users for ${SECONDS}s\n`);
const started = Date.now();
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const elapsed = (Date.now() - started) / 1000;

let total = 0;
let bad = 0;
console.log('page'.padEnd(18), 'reqs'.padStart(6), 'p50'.padStart(8), 'p95'.padStart(8), 'p99'.padStart(8), 'max'.padStart(8), '  status codes');
for (const [path, s] of stats) {
  const t = s.times.sort((a, b) => a - b);
  total += t.length + s.errors;
  bad += s.errors + Object.entries(s.codes).filter(([c]) => Number(c) >= 500).reduce((n, [, v]) => n + v, 0);
  const ms = (v) => `${Math.round(v)}ms`.padStart(8);
  const codes = Object.entries(s.codes).map(([c, n]) => `${c}x${n}`).join(' ') + (s.errors ? ` network-errors x${s.errors}` : '');
  console.log(path.padEnd(18), String(t.length).padStart(6), ms(pct(t, 50)), ms(pct(t, 95)), ms(pct(t, 99)), ms(t[t.length - 1] || 0), ' ', codes);
}
console.log(`\n${total} requests in ${elapsed.toFixed(1)}s = ${(total / elapsed).toFixed(0)} req/s, ${bad} failed (5xx or network)`);
process.exitCode = bad > 0 ? 1 : 0;
