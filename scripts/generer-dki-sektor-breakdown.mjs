// Genererer data/dki-{år}.json med full sektor-breakdown for ALLE kommuner.
// Henter kriterieindekser fra Tabell E-k og kombinerer med KMDs delkostnadsnøkler
// (hardkodet fra Grønt hefte 2026 PDF, side 19-20, side 21).
//
// Verifisert mot Lørenskog grunnskule:
//   0,6227×1,0405 + 0,2776×0,9362 + 0,0348×1,013 + 0,0211×0,3091
//   + 0,0219×0,412 + 0,0219×0,5183 = 0,9700 ✓
//
// Bruk: node scripts/generer-dki-sektor-breakdown.mjs

import { writeFileSync, readFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

const REPO = 'C:/Users/VegardHauge/Documents/kommunebarometer-github-upload';
const URL_LANDING = 'https://www.regjeringen.no/no/tema/kommuner-og-regioner/kommuneokonomi/gront-hefte/id547024/';

// Kriterier i E-k i kolonnerekkefølge (K1-K26).
const KRITERIER = [
  'innb_0', 'innb_1_5', 'innb_6_12', 'innb_13_15', 'innb_16_22', 'innb_23_24',
  'innb_25_66', 'innb_67_79', 'innb_80_89', 'innb_90_plus',
  'basis', 'reise_sone', 'reise_nabo', 'landbruk', 'innv_6_15',
  'sysselsette_heiltid', 'pu_16_plus', 'dodelighet', 'aleine_67_plus',
  'lav_inntekt', 'lav_utdanning', 'ufore_18_49', 'aleine_30_66',
  'flyktning', 'rus_psyk_npr', 'opphoping'
];

// KMDs delkostnadsnøkler 2026 fra Grønt hefte PDF (side 21).
// Hver sektor: { kriterium: vekt }, sum av vekter = 1,0.
const DELKOSTNADSNOKLER = {
  grunnskole: {
    innb_6_12: 0.6227,
    innb_13_15: 0.2776,
    innv_6_15: 0.0348,
    basis: 0.0211,
    reise_sone: 0.0219,
    reise_nabo: 0.0219
  },
  barnehage: {
    innb_1_5: 0.8377,
    sysselsette_heiltid: 0.1623
  },
  pleie: {
    // PU og eldre dominerer; også aldersgrupper og dødelighet
    innb_0: 0.0029,
    innb_1_5: 0.0157,
    innb_6_12: 0.0245,
    innb_13_15: 0.0114,
    innb_16_22: 0.0256,
    innb_23_24: 0.0078,
    innb_25_66: 0.1702,
    innb_67_79: 0.1163,
    innb_80_89: 0.1558,
    innb_90_plus: 0.1082,
    basis: 0.0136,
    reise_sone: 0.0090,
    reise_nabo: 0.0090,
    pu_16_plus: 0.0595,
    dodelighet: 0.1241,
    aleine_67_plus: 0.1464
    // Sum: 1,0000
  },
  kommunehelse: {
    // Helse: aldersgrupper + reiseavstand
    innb_0: 0.0099,
    innb_1_5: 0.0529,
    innb_6_12: 0.0829,
    innb_13_15: 0.0385,
    innb_16_22: 0.0866,
    innb_23_24: 0.0122,
    innb_25_66: 0.2669,
    innb_67_79: 0.2597,
    innb_80_89: 0.0830,
    innb_90_plus: 0.0056,
    basis: 0.0390,
    reise_sone: 0.0314,
    reise_nabo: 0.0314
    // Sum: 1,0000
  },
  barnevern: {
    // Sosial-relaterte kriterier dominerer
    innb_0: 0.0021,
    innb_1_5: 0.0111,
    innb_6_12: 0.0174,
    innb_13_15: 0.0081,
    innb_16_22: 0.0182,
    innb_23_24: 0.0055,
    lav_inntekt: 0.3720,
    lav_utdanning: 0.3472,
    ufore_18_49: 0.2183
    // Sum: 0,9999 ≈ 1
  },
  sosial: {
    // Aleneboende, flyktninger, rus/psykiatri, opphoping
    innb_16_22: 0.0251,
    innb_23_24: 0.0076,
    innb_25_66: 0.1663,
    aleine_30_66: 0.2918,
    flyktning: 0.2110,
    rus_psyk_npr: 0.2113,
    opphoping: 0.0870
    // Sum: 1,0001 ≈ 1
  },
  administrasjon: {
    innb_0: 0.0081,
    innb_1_5: 0.0434,
    innb_6_12: 0.0680,
    innb_13_15: 0.0316,
    innb_16_22: 0.0711,
    innb_23_24: 0.0215,
    innb_25_66: 0.4714,
    innb_67_79: 0.1017,
    innb_80_89: 0.0325,
    innb_90_plus: 0.0071,
    basis: 0.1200,
    landbruk: 0.0237
    // Sum: 1,0001 ≈ 1
  }
};

// Sjekk at vektene summerer til 1.0 ±0.01
for (const [s, v] of Object.entries(DELKOSTNADSNOKLER)) {
  const sum = Object.values(v).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.01) {
    console.warn(`⚠ Sektor ${s}: vekt-sum = ${sum.toFixed(4)} (forventet 1,0)`);
  }
}

// KMDs sektorvekter (delkostnadsnøkler i hovedkostnadsnøkkelen).
// Brukes for å verifisere samlet DKI = Σ(sektorvekt × sektorindeks).
const SEKTORVEKTER_2026 = {
  grunnskole: 0.2299,
  pleie: 0.3532,
  barnehage: 0.1597,
  barnevern: 0.0422,
  sosial: 0.0741,
  kommunehelse: 0.0637,
  administrasjon: 0.0772
};

const SEKTORVEKTER_2025 = {
  grunnskole: 0.272,
  pleie: 0.353,
  barnehage: 0.157,
  barnevern: 0.030,
  sosial: 0.046,
  kommunehelse: 0.046,
  administrasjon: 0.096
};

async function hentEk(år) {
  const html = await fetch(URL_LANDING).then(r => r.text());
  const r = /<a[^>]+href="([^"]+\.ods)"[^>]*>([^<]*)<\/a>/gi;
  let m, url = null;
  while ((m = r.exec(html)) !== null) {
    let h = m[1];
    if (h.startsWith('/')) h = 'https://www.regjeringen.no' + h;
    if (h.includes('/' + år + '/') && /tabell.{0,3}e.k/i.test(h) && !/fykom|fk\b/i.test(h)) {
      url = h;
      break;
    }
  }
  if (!url) throw new Error(`E-k for ${år} ikke funnet`);
  console.log(`  Henter ${url}`);
  const buf = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
  const odsPath = join(tmpdir(), `ek-${år}.ods`);
  writeFileSync(odsPath, buf);
  const utPakk = mkdtempSync(join(tmpdir(), `ek-${år}-`));
  execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${odsPath}', '${utPakk}')"`);
  const xml = readFileSync(join(utPakk, 'content.xml'), 'utf8');

  const radSplitter = /<table:table-row\b[^>]*>([\s\S]*?)<\/table:table-row>/g;
  const rader = [];
  let mr;
  while ((mr = radSplitter.exec(xml)) !== null) {
    const cellRegex = /<table:table-cell\b([^>]*)>([\s\S]*?)<\/table:table-cell>|<table:table-cell\b([^>]*)\/>/g;
    const celler = [];
    let mc;
    while ((mc = cellRegex.exec(mr[1])) !== null) {
      const attrs = mc[1] || mc[3] || '';
      const innhold = mc[2] || '';
      const numVal = attrs.match(/office:value="([^"]+)"/)?.[1];
      const tekstVal = innhold.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/)?.[1]?.replace(/<[^>]+>/g, '').trim();
      const repeated = +(attrs.match(/table:number-columns-repeated="(\d+)"/)?.[1] || 1);
      const val = numVal || tekstVal || '';
      for (let i = 0; i < Math.min(repeated, 50); i++) celler.push(val);
    }
    rader.push(celler);
  }

  // Parse: rad 0-2 er header, deretter data. Kolonne 0 = "kommunenr Navn", kolonne 1-26 = K1-K26.
  const kommuner = {};
  for (const rad of rader) {
    if (!rad || rad.length < 27) continue;
    const knrMatch = String(rad[0]).match(/^(\d{4})\s+(.+)/);
    if (!knrMatch) continue;
    const knr = knrMatch[1];
    const navn = knrMatch[2].trim();
    const kriterier = {};
    for (let i = 0; i < KRITERIER.length; i++) {
      const v = parseFloat(String(rad[i + 1]).replace(',', '.'));
      kriterier[KRITERIER[i]] = isFinite(v) ? v : 0;
    }
    // K27 = Indeks berekna utgifts-behov (samlet)
    const samletFraEk = parseFloat(String(rad[27]).replace(',', '.'));
    kommuner[knr] = { navn, kriterier, samletFraEk: isFinite(samletFraEk) ? samletFraEk : null };
  }
  console.log(`  ${Object.keys(kommuner).length} kommuner med kriterieindekser fra E-k ${år}`);
  return kommuner;
}

function beregnSektorDKI(kriterier, vekter) {
  let sum = 0;
  for (const [krit, vekt] of Object.entries(vekter)) {
    sum += (kriterier[krit] || 0) * vekt;
  }
  return +sum.toFixed(4);
}

async function genererForÅr(år) {
  console.log(`\n=== ${år} ===`);
  const kommuner = await hentEk(år);
  const vekter = år >= 2026 ? SEKTORVEKTER_2026 : SEKTORVEKTER_2025;
  const ut = {};

  let validert = 0, varslet = 0;
  for (const [knr, info] of Object.entries(kommuner)) {
    const obj = { navn: info.navn };
    let samletBeregnet = 0;
    for (const sektor of Object.keys(DELKOSTNADSNOKLER)) {
      const dki = beregnSektorDKI(info.kriterier, DELKOSTNADSNOKLER[sektor]);
      obj[sektor] = dki;
      samletBeregnet += dki * vekter[sektor];
    }
    samletBeregnet = +samletBeregnet.toFixed(4);
    obj.samlet = samletBeregnet;
    // Sammenlign med E-k samlet
    if (info.samletFraEk != null) {
      const avvik = Math.abs(samletBeregnet - info.samletFraEk);
      if (avvik > 0.05) {
        varslet++;
        if (varslet <= 5) console.log(`  ⚠ ${knr} ${info.navn}: beregnet=${samletBeregnet}, E-k=${info.samletFraEk} (avvik ${avvik.toFixed(3)})`);
      } else {
        validert++;
      }
    }
    ut[knr] = obj;
  }
  console.log(`  Validering: ${validert} OK, ${varslet} avvik > 0,05`);

  // Spot-check
  for (const [knr, navn] of [['3222', 'Lørenskog'], ['4601', 'Bergen'], ['5501', 'Tromsø']]) {
    if (ut[knr]) {
      console.log(`  ${knr} ${ut[knr].navn}: samlet=${ut[knr].samlet}, grunnskole=${ut[knr].grunnskole}, pleie=${ut[knr].pleie}, barnehage=${ut[knr].barnehage}`);
    }
  }

  const payload = {
    år,
    kilde: `KMD Grønt hefte ${år} — Tabell E-k (kriterieindekser) × delkostnadsnøkler (Grønt hefte PDF s.21)`,
    kildeUrl: URL_LANDING,
    publisert: new Date().toISOString().slice(0, 10),
    hentet: new Date().toISOString().slice(0, 10),
    format: 'v3-full-breakdown: hver kommune har 7 sektor-indekser + samlet',
    definisjon: 'DKI > 1,0 = høyere utgiftsbehov enn landsgjennomsnittet. < 1,0 = lavere. Beregnet som Σ(delkostnadsnøkkel × kriterieindeks).',
    antallKommuner: Object.keys(ut).length,
    kommuner: ut,
    sektorvekter: { _kommentar: `KMDs offisielle sektorvekter for ${år}. Sum = 1,00.`, ...vekter }
  };
  const fil = `${REPO}/data/dki-${år}.json`;
  writeFileSync(fil, JSON.stringify(payload, null, 2));
  console.log(`  → ${fil}`);
}

// Hovedflyt
for (const år of [2025, 2026]) {
  await genererForÅr(år);
}

// Forsøk også 2024
try {
  await genererForÅr(2024);
} catch (e) {
  console.log(`\n2024: ${e.message}. Bruker 2025 som proxy.`);
  const d2025 = JSON.parse(readFileSync(`${REPO}/data/dki-2025.json`, 'utf8'));
  d2025.år = 2024;
  d2025.merknad = '2024 ODS ikke tilgjengelig fra KMD landingsside — bruker 2025 som proxy. HANDOFF for manuell oppdatering.';
  writeFileSync(`${REPO}/data/dki-2024.json`, JSON.stringify(d2025, null, 2));
  console.log(`  → ${REPO}/data/dki-2024.json (proxy fra 2025)`);
}
