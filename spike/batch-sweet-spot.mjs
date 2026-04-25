// Følge-opp-test: finn workable batch-størrelse + concurrency-kombinasjon
// for å laste alle kommuner uten å trigge 429.
//
// Kjøres med: node spike/batch-sweet-spot.mjs

const BASE = 'https://data.ssb.no/api/pxwebapi/v2';
const TABLE_ID = '12134';
const REGION_DIM = 'KOKkommuneregion0000';
const REQUIRED = '&valuecodes[ContentsCode]=KOSAG110000&valuecodes[Tid]=2024';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchMeta() {
  const r = await fetch(`${BASE}/tables/${TABLE_ID}/metadata?lang=no&outputFormat=json-stat2`);
  const m = await r.json();
  return Object.keys(m.dimension[REGION_DIM].category.index).filter(c => /^\d{4}$/.test(c));
}

async function timedBatch(codes, label) {
  const url = `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2&valuecodes[${REGION_DIM}]=${codes.join(',')}${REQUIRED}`;
  if (url.length > 4000) return { label, urlLen: url.length, status: 0, error: 'URL > 4000 chars' };
  const t0 = performance.now();
  try {
    const r = await fetch(url);
    const text = await r.text();
    return { label, urlLen: url.length, status: r.status, ok: r.ok, ms: Math.round(performance.now() - t0), bytes: text.length };
  } catch (e) {
    return { label, urlLen: url.length, status: 0, ok: false, error: e.message };
  }
}

async function strategy(name, codes, batchSize, concurrency, betweenBatchMs = 0) {
  console.log(`\n[${name}] batchSize=${batchSize} concurrency=${concurrency} delay=${betweenBatchMs}ms`);
  const batches = [];
  for (let i = 0; i < codes.length; i += batchSize) batches.push(codes.slice(i, i + batchSize));
  const t0 = performance.now();
  const results = [];
  let cursor = 0;
  async function worker(id) {
    while (cursor < batches.length) {
      const idx = cursor++;
      const r = await timedBatch(batches[idx], `b${idx}`);
      results.push(r);
      if (betweenBatchMs > 0 && cursor < batches.length) await sleep(betweenBatchMs);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
  const total = Math.round(performance.now() - t0);
  const ok = results.filter(r => r.ok).length;
  const errs = results.filter(r => !r.ok).map(r => r.status).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {});
  const okMs = results.filter(r => r.ok).map(r => r.ms);
  console.log(`    ${ok}/${batches.length} OK · total=${total}ms`);
  if (okMs.length) {
    okMs.sort((a, b) => a - b);
    const p50 = okMs[Math.floor(okMs.length / 2)];
    const p95 = okMs[Math.floor(okMs.length * 0.95)];
    console.log(`    Per-batch: p50=${p50}ms p95=${p95}ms`);
  }
  if (Object.keys(errs).length) console.log(`    Feil: ${JSON.stringify(errs)}`);
  return { name, batchSize, concurrency, betweenBatchMs, batches: batches.length, ok, total, errors: errs };
}

async function main() {
  const codes = await fetchMeta();
  console.log(`Henter alle ${codes.length} kommune-koder fra tabell ${TABLE_ID}`);
  await sleep(1500);

  const results = [];
  // Strategi A: stor batch, sekvensiell (concurrency=1, ingen rate-limit-risk)
  results.push(await strategy('A: 200×1 sekvensiell', codes, 200, 1, 200));
  await sleep(3000);
  // Strategi B: medium batch, lav concurrency
  results.push(await strategy('B: 150×2 med 300ms', codes, 150, 2, 300));
  await sleep(3000);
  // Strategi C: liten batch, sekvensiell rask
  results.push(await strategy('C: 100×1 sekvensiell rask', codes, 100, 1, 50));

  console.log('\n=== SAMMENLIGNING ===');
  console.table(results.map(r => ({
    strategi: r.name,
    batches: r.batches,
    OK: r.ok,
    total_ms: r.total,
    feil: JSON.stringify(r.errors)
  })));
}

main().catch(e => { console.error(e); process.exit(1); });
