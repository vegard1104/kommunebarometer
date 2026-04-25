// SSB PxWeb v2 — datalast-spike for alle 357 kommuner
//
// Mål: kvantifisere responstid, feilmodi og batch-strategi for v2-arkitekturen.
// Kjøres med: node spike/ssb-spike.mjs
// Output: spike/results/<timestamp>.json + sammendrag på stdout.
//
// Kjøres mot data.ssb.no direkte (ikke via Vercel-rewrite) siden vi tester
// i Node, ikke nettleser. Latency vil være ~likt fra Vercel edge i Stockholm.

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, 'results');

const BASE = 'https://data.ssb.no/api/pxwebapi/v2';
const KLASS_BASE = 'https://data.ssb.no/api/klass/v1';

// Tabell 12134 — Utvalgte nøkkeltall for kommuneregnskap (kommunekonsern).
// Stabil tabell, oppdateres 15. mars + 15. juni hvert år.
const TABLE_ID = '12134';
const REGION_DIM = 'KOKkommuneregion0000';
// Mandatory selections jf. SSB v2 API: ContentsCode + Tid må alltid spesifiseres.
const CONTENT_CODE = 'KOSAG110000'; // Frie inntekter per innbygger (kr) — én enkel skalar
const TID = '2024';
// Felles param-string for alle kall mot tabellen
const REQUIRED_PARAMS = `&valuecodes[ContentsCode]=${CONTENT_CODE}&valuecodes[Tid]=${TID}`;

// Snill-mot-SSB: liten pause mellom hver request for å unngå 429.
const SEQUENTIAL_DELAY_MS = 200;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Tre referansekommuner for smoke-test.
const SMOKE_KOMMUNER = [
  { code: '0301', name: 'Oslo' },
  { code: '4601', name: 'Bergen' },
  { code: '5001', name: 'Trondheim' }
];

// Hjelpefunksjon: hent og mål tid. 429 → exponential backoff opp til 3 forsøk.
async function timedFetch(url, label, timeoutMs = 30000) {
  let attempt = 0;
  let lastResult = null;
  while (attempt < 3) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const t0 = performance.now();
    try {
      const r = await fetch(url, { signal: controller.signal });
      const text = await r.text();
      const ms = performance.now() - t0;
      lastResult = {
        label, url, status: r.status, ok: r.ok,
        ms: Math.round(ms),
        bytes: text.length,
        body: r.ok ? text : text.slice(0, 500),
        attempts: attempt + 1
      };
      if (r.status === 429 && attempt < 2) {
        const wait = 1000 * Math.pow(2, attempt); // 1s, 2s
        await sleep(wait);
        attempt++;
        continue;
      }
      return lastResult;
    } catch (e) {
      lastResult = {
        label, url, status: 0, ok: false,
        ms: Math.round(performance.now() - t0),
        error: e.name === 'AbortError' ? `timeout ${timeoutMs}ms` : e.message,
        attempts: attempt + 1
      };
      return lastResult;
    } finally {
      clearTimeout(timeout);
    }
  }
  return lastResult;
}

function percentile(arr, p) {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const i = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(i, sorted.length - 1))];
}

function summarizeMs(samples) {
  return {
    n: samples.length,
    min: Math.min(...samples),
    max: Math.max(...samples),
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    p99: percentile(samples, 99),
    mean: Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
  };
}

// ============================================================
// Test 1: smoke — tre referansekommuner via valuecodes
// ============================================================
async function test1_smoke() {
  console.log('\n[1] Smoke-test — 3 kommuner i én request');
  const codes = SMOKE_KOMMUNER.map(k => k.code).join(',');
  const url = `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2`
    + `&valuecodes[${REGION_DIM}]=${codes}` + REQUIRED_PARAMS;
  const r = await timedFetch(url, 'smoke');
  console.log(`    HTTP ${r.status} · ${r.ms}ms · ${r.bytes} bytes`);
  if (!r.ok) {
    console.log(`    FEIL: ${r.body || r.error}`);
    return r;
  }
  // Valider at vi fikk data for alle tre
  const ds = JSON.parse(r.body);
  const regCount = Object.keys(ds.dimension[REGION_DIM].category.index).length;
  console.log(`    Regioner i respons: ${regCount} (forventet 3)`);
  return { ...r, regCount };
}

// ============================================================
// Test 2: Klass-API — full kommuneliste 2026
// ============================================================
async function test2_klass() {
  console.log('\n[2] Klass-API — alle kommuner per 2026-01-01');
  const url = `${KLASS_BASE}/classifications/131/codesAt?date=2026-01-01&language=nb`;
  const r = await timedFetch(url, 'klass-131');
  console.log(`    HTTP ${r.status} · ${r.ms}ms · ${r.bytes} bytes`);
  if (!r.ok) return r;
  const data = JSON.parse(r.body);
  const codes = data.codes || [];
  // Filtrer til 4-sifret kommune-kode (utelat fylker som har 2-sifret kode)
  const kommuner = codes.filter(c => /^\d{4}$/.test(c.code));
  console.log(`    Kommuner: ${kommuner.length} (forventet 357)`);
  return { ...r, kommuneCount: kommuner.length, kommuner };
}

// ============================================================
// Test 3a: hent table-metadata for å få EKSAKT regions-liste
// (Klass returnerer 2026-koder, men 2024-data har gamle koder)
// ============================================================
async function test3a_metaRegions() {
  console.log('\n[3a] Table-metadata — henter REGION-koder direkte fra tabellen');
  const url = `${BASE}/tables/${TABLE_ID}/metadata?lang=no&outputFormat=json-stat2`;
  const r = await timedFetch(url, 'meta-regions');
  console.log(`    HTTP ${r.status} · ${r.ms}ms`);
  if (!r.ok) return null;
  const m = JSON.parse(r.body);
  const regCodes = Object.keys(m.dimension[REGION_DIM].category.index);
  // Filtrer til 4-sifrede kommune-koder
  const kommuneCodes = regCodes.filter(c => /^\d{4}$/.test(c));
  console.log(`    Region-koder totalt: ${regCodes.length} (kommuner+grupper+landet)`);
  console.log(`    Kommune-koder (4-siffer): ${kommuneCodes.length}`);
  return { regCodes, kommuneCodes };
}

// ============================================================
// Test 3: én request — ALLE kommuner i tabellens regionliste
// ============================================================
async function test3_singleBatch(kommuneCodes) {
  console.log(`\n[3] Single batch — alle ${kommuneCodes.length} kommuner (fra metadata) i ÉN request`);
  const url = `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2`
    + `&valuecodes[${REGION_DIM}]=${kommuneCodes.join(',')}` + REQUIRED_PARAMS;
  console.log(`    URL-lengde: ${url.length} tegn`);
  const r = await timedFetch(url, 'single-batch-all', 60000);
  console.log(`    HTTP ${r.status} · ${r.ms}ms · ${r.bytes} bytes (forsøk: ${r.attempts || 1})`);
  if (!r.ok) {
    console.log(`    FEIL: ${r.body || r.error}`);
    return r;
  }
  const ds = JSON.parse(r.body);
  const regCount = Object.keys(ds.dimension[REGION_DIM].category.index).length;
  console.log(`    Regioner i respons: ${regCount}`);
  return { ...r, regCount, body: undefined };
}

// ============================================================
// Test 4: sekvensielle single-kommune requests for p50/p95
// ============================================================
async function test4_sequential(kommuner, n = 30) {
  console.log(`\n[4] Sekvensiell — ${n} enkelt-kommune-requests for p50/p95 (${SEQUENTIAL_DELAY_MS}ms throttle)`);
  const samples = [];
  const failures = [];
  const pickN = kommuner.slice(0, n);
  for (const k of pickN) {
    const url = `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2`
      + `&valuecodes[${REGION_DIM}]=${k.code}` + REQUIRED_PARAMS;
    const r = await timedFetch(url, `seq-${k.code}`);
    if (r.ok) samples.push(r.ms);
    else failures.push({ code: k.code, status: r.status });
    process.stdout.write(r.ok ? '.' : 'x');
    await sleep(SEQUENTIAL_DELAY_MS);
  }
  console.log('');
  if (samples.length === 0) {
    console.log(`    Ingen vellykkede requests. Feil: ${failures.slice(0,3).map(f => `${f.code}=${f.status}`).join(', ')}`);
    return { samples, stats: null, failures };
  }
  const stats = summarizeMs(samples);
  console.log(`    n=${stats.n} · min=${stats.min}ms · p50=${stats.p50}ms · p95=${stats.p95}ms · max=${stats.max}ms · feil=${failures.length}`);
  return { samples, stats, failures };
}

// ============================================================
// Test 5: parallelle batcher — split 357 i N batcher × C concurrency
// ============================================================
async function test5_parallel(allKommuner, batchSize, concurrency) {
  console.log(`\n[5] Parallell — batchSize=${batchSize}, concurrency=${concurrency}`);
  // Splitt
  const batches = [];
  for (let i = 0; i < allKommuner.length; i += batchSize) {
    batches.push(allKommuner.slice(i, i + batchSize));
  }
  console.log(`    ${batches.length} batcher × inntil ${batchSize} kommuner`);
  const t0 = performance.now();
  const results = [];
  // Enkel concurrency-pool
  let cursor = 0;
  async function worker() {
    while (cursor < batches.length) {
      const idx = cursor++;
      const batch = batches[idx];
      const codes = batch.map(k => k.code).join(',');
      const url = `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2`
        + `&valuecodes[${REGION_DIM}]=${codes}` + REQUIRED_PARAMS;
      const r = await timedFetch(url, `batch-${idx}`, 60000);
      results.push(r);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const totalMs = Math.round(performance.now() - t0);
  const ok = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  const samples = ok.map(r => r.ms);
  const stats = samples.length ? summarizeMs(samples) : null;
  console.log(`    Total wall-clock: ${totalMs}ms · ${ok.length}/${results.length} OK · ${failed.length} feilet`);
  if (stats) console.log(`    Per-batch: min=${stats.min}ms · p50=${stats.p50}ms · p95=${stats.p95}ms · max=${stats.max}ms`);
  if (failed.length) console.log(`    Feilårsaker: ${failed.slice(0,3).map(f => `${f.status}/${f.error || f.body?.slice(0,80)}`).join(' | ')}`);
  return { batchSize, concurrency, totalMs, batches: batches.length, ok: ok.length, failed: failed.length, perBatch: stats };
}

// ============================================================
// Test 6: feilmodi — ugyldig tabell, ugyldig kode, sparse kommune
// ============================================================
async function test6_errors() {
  console.log('\n[6] Feilmodi-tester');
  const baseQ = `lang=no&format=json-stat2${REQUIRED_PARAMS}`;
  const cases = [
    { label: 'ugyldig tabell-ID',     url: `${BASE}/tables/999999/data?${baseQ}&valuecodes[${REGION_DIM}]=0301` },
    { label: 'ugyldig kommune-kode',  url: `${BASE}/tables/${TABLE_ID}/data?${baseQ}&valuecodes[${REGION_DIM}]=9999` },
    { label: 'manglende mandatory',   url: `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2&valuecodes[${REGION_DIM}]=0301` },
    { label: 'ugyldig ContentsCode',  url: `${BASE}/tables/${TABLE_ID}/data?lang=no&format=json-stat2&valuecodes[${REGION_DIM}]=0301&valuecodes[ContentsCode]=FAKE&valuecodes[Tid]=2024` },
    { label: 'kommune uten data',     url: `${BASE}/tables/${TABLE_ID}/data?${baseQ}&valuecodes[${REGION_DIM}]=2222` } // 2222 finnes ikke
  ];
  const results = [];
  for (const c of cases) {
    const r = await timedFetch(c.url, c.label);
    console.log(`    ${c.label}: HTTP ${r.status} (${r.ms}ms) — ${r.ok ? 'OK uventet' : 'feilet som forventet'}`);
    if (!r.ok && r.body) {
      // Vis første linje av feilmelding
      const firstLine = r.body.split('\n')[0].slice(0, 150);
      console.log(`        ${firstLine}`);
    }
    results.push({ label: c.label, status: r.status, ms: r.ms, ok: r.ok, snippet: r.body?.slice(0, 300) });
    await sleep(SEQUENTIAL_DELAY_MS);
  }
  return results;
}

// ============================================================
// Hovedrutine
// ============================================================
async function main() {
  await mkdir(RESULTS_DIR, { recursive: true });
  const startedAt = new Date().toISOString();
  console.log(`SSB-spike startet ${startedAt}`);
  console.log(`Tabell: ${TABLE_ID} (${REGION_DIM})`);

  const out = { startedAt, table: TABLE_ID };

  out.smoke = await test1_smoke();

  const klass = await test2_klass();
  out.klass = { ...klass, kommuner: undefined }; // ikke lagre full liste i output
  if (!klass.ok || !klass.kommuner) {
    console.error('Klass-API feilet — kan ikke gjøre 357-tester');
    await writeFile(join(RESULTS_DIR, `${startedAt.replace(/[:.]/g, '-')}.json`), JSON.stringify(out, null, 2));
    return;
  }
  const allKommuner = klass.kommuner;

  // Hent eksakt regionsliste fra tabellens metadata (Klass kan inneholde
  // koder som ikke har data i den valgte tabellen/året)
  const meta = await test3a_metaRegions();
  if (!meta) {
    console.error('Metadata-kall feilet — avbryter');
    return;
  }
  out.tableMeta = { regCount: meta.regCodes.length, kommuneCount: meta.kommuneCodes.length };
  // Bygg en kommuner-liste fra metadata (kun koder som finnes i tabellen)
  const tableKommuner = meta.kommuneCodes.map(code => ({ code, name: '?' }));

  await sleep(1000); // pause mellom test-grupper
  out.singleBatch = await test3_singleBatch(meta.kommuneCodes);

  await sleep(1000);
  out.sequential = await test4_sequential(tableKommuner, 30);

  await sleep(1000);
  out.parallel = [];
  for (const cfg of [
    { batchSize: 50, concurrency: 3 },
    { batchSize: 100, concurrency: 2 }
  ]) {
    out.parallel.push(await test5_parallel(tableKommuner, cfg.batchSize, cfg.concurrency));
    await sleep(2000); // 2s pause mellom paralleltester
  }

  await sleep(2000);
  out.errors = await test6_errors();

  out.finishedAt = new Date().toISOString();
  const file = join(RESULTS_DIR, `${startedAt.replace(/[:.]/g, '-')}.json`);
  await writeFile(file, JSON.stringify(out, null, 2));
  console.log(`\nResultat skrevet til ${file}`);
}

main().catch(e => {
  console.error('Spike krasjet:', e);
  process.exit(1);
});
