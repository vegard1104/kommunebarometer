#!/usr/bin/env node
// Datavalidering: sammenlign verdier i team/referansedata/Lorenskog_KOSTRA_2025_nokkeltall.xlsx
// med live SSB-data for samme indikatorer 2024 og 2025.
//
// Skriver markdown-rapport til team/referansedata/valideringsrapport.md.
//
// Krav:
//   - Node 18+ (native fetch)
//   - Excel pakkes ut via PowerShell (Compress.FileSystem) — ingen npm install
//
// Kjøre: node scripts/valider-mot-excel.mjs
//
// Kommunekode-strategi:
//   Lørenskog: 3222 (Akershus 2024-) + 3029 (Viken 2020-2023, Pakke 1 CODE_HISTORY)
//   For 2024 og 2025 er kun 3222 relevant; 3029 er der for historikk-validering.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const EXCEL_PATH = join(REPO_ROOT, 'team', 'referansedata', 'Lorenskog_KOSTRA_2025_nokkeltall.xlsx');
const RAPPORT_PATH = join(REPO_ROOT, 'team', 'referansedata', 'valideringsrapport.md');
const KOMMUNE_NR = '3222';
const ÅR_VALIDERES = ['2024', '2025'];
const TOLERANSE = 0.005; // 0,5 %

// SSB-tabell-mapping for utvalgte nøkkeltall i Oversikt-arket.
// Indikator-navn matchet mot Excel-tekst (case-insensitiv, normalisert whitespace).
// Tabell + ContentsCode-kombinasjon er manuelt slått opp i SSB Statistikkbanken.
// Ikke alle Excel-indikatorer har én-til-én SSB-ekvivalent — markert med null.
const INDIKATOR_KART = [
  { ekselNavn: 'Innbyggere per 1.1.', tabell: '11342', contents: 'Personer1', enhet: 'antall', merknad: 'Folkemengde 1.1' },
  { ekselNavn: 'Frie inntekter per innbygger', tabell: '12134', contents: 'KOSAG110000', enhet: 'kr' },
  { ekselNavn: 'Netto driftsresultat i prosent av brutto driftsinntekter', tabell: '12134', contents: 'KOSAGD230000', enhet: '%' },
  { ekselNavn: 'Langsiktig gjeld ex pensjonsforpliktelser i prosent av brutto driftsinntekter', tabell: '12134', contents: 'KOSKG320000', enhet: '%' },
  { ekselNavn: 'Netto renteeksponering i prosent av brutto driftsinntekter', tabell: '12134', contents: 'KOSKG400000', enhet: '%' },
  { ekselNavn: 'Fri egenkapital drift i prosent av brutto driftsinntekter', tabell: '12134', contents: 'KOSKG210000', enhet: '%' },
  { ekselNavn: 'Andel barn 1-5 år i barnehage', tabell: '12379', contents: null, enhet: '%', merknad: 'ContentsCode må verifiseres mot 12379-metadata' },
  { ekselNavn: 'Grunnskolepoeng', tabell: null, contents: null, enhet: 'poeng', merknad: 'Ikke i KOSTRA — krever Udir Statistikkbank (rapport C3, ikke implementert)' }
];

// === 1. Pakk ut Excel via PowerShell ===
function packUtExcel(excelPath) {
  const dest = mkdtempSync(join(tmpdir(), 'kostra-xlsx-'));
  const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${excelPath.replace(/'/g, "''")}', '${dest.replace(/'/g, "''")}')`;
  execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'pipe' });
  return dest;
}

function lesXml(path) {
  return readFileSync(path, 'utf8');
}

// === 2. Parse sharedStrings + sheet ===
function parseSharedStrings(xml) {
  // <si><t>...</t></si> eller <si><r>...<t>...</t>...</r></si>
  const out = [];
  const siRegex = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRegex.exec(xml)) !== null) {
    const inner = m[1];
    // Slå sammen alle <t>-innhold (rich text)
    const tParts = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(x => x[1]);
    out.push(tParts.join(''));
  }
  return out;
}

function parseSheet(xml, sharedStrings) {
  const rader = [];
  const rowRegex = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = rowRegex.exec(xml)) !== null) {
    const rNum = parseInt(m[1], 10);
    const cellsRaw = m[2];
    const celler = {};
    // Cell-attributter kan komme i hvilken som helst rekkefølge (r, s, t).
    // Match selve <c ...>-taggen med innhold, så slå opp attributter separat.
    const cellRegex = /<c\s+([^>]*)>(?:<v>([^<]*)<\/v>|<is><t[^>]*>([^<]*)<\/t><\/is>)?<\/c>/g;
    let cm;
    while ((cm = cellRegex.exec(cellsRaw)) !== null) {
      const attrs = cm[1];
      const v = cm[2];
      const inlineStr = cm[3];
      const refMatch = attrs.match(/r="([A-Z]+)\d+"/);
      const typeMatch = attrs.match(/t="([^"]+)"/);
      if (!refMatch) continue;
      const col = refMatch[1];
      const type = typeMatch ? typeMatch[1] : null;
      if (inlineStr !== undefined) {
        celler[col] = inlineStr;
      } else if (type === 's' && v !== undefined) {
        celler[col] = sharedStrings[parseInt(v, 10)] || '';
      } else if (type === 'b' && v !== undefined) {
        celler[col] = v === '1';
      } else if (v !== undefined) {
        const num = parseFloat(v);
        celler[col] = isNaN(num) ? v : num;
      }
    }
    rader.push({ r: rNum, celler });
  }
  return rader;
}

// === 3. Hent fra SSB ===
async function hentSsb(tabell, contents, kommunenummer, år) {
  if (!tabell || !contents) return null;
  const url = `https://data.ssb.no/api/pxwebapi/v2/tables/${tabell}/data?lang=no&format=json-stat2`
    + `&valuecodes[KOKkommuneregion0000]=${kommunenummer}`
    + `&valuecodes[ContentsCode]=${contents}`
    + `&valuecodes[Tid]=${år}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return { error: `HTTP ${r.status}` };
    const ds = await r.json();
    const v = ds.value;
    if (Array.isArray(v) && v.length > 0 && v[0] != null) return { verdi: +v[0] };
    if (v && typeof v === 'object') {
      const keys = Object.keys(v);
      if (keys.length > 0) return { verdi: +v[keys[0]] };
    }
    return { error: 'Ingen verdi i respons' };
  } catch (e) {
    return { error: e.message };
  }
}

// === 4. Hovedrutine ===
async function main() {
  if (!existsSync(EXCEL_PATH)) {
    console.error(`Fant ikke Excel-fila: ${EXCEL_PATH}`);
    process.exit(1);
  }
  console.log(`Pakker ut ${EXCEL_PATH} ...`);
  const dest = packUtExcel(EXCEL_PATH);

  const sharedStrings = parseSharedStrings(lesXml(join(dest, 'xl', 'sharedStrings.xml')));
  console.log(`Delte strenger: ${sharedStrings.length}`);

  // Parse Oversikt-arket (sheet1)
  const sheet1 = parseSheet(lesXml(join(dest, 'xl', 'worksheets', 'sheet1.xml')), sharedStrings);
  console.log(`Sheet1: ${sheet1.length} rader`);

  // Bygg lookup: indikator-tekst → { 2024, 2025, landet, enhet }
  const ekselDataPerÅr = {};
  let iHeaderFunnet = false;
  let kolonneMapping = null;
  for (const rad of sheet1) {
    const celler = rad.celler;
    if (!iHeaderFunnet) {
      // Lete etter rad som har "Lørenskog 2024" og "Lørenskog 2025" som kolonneoverskrift
      const tekstFelter = Object.values(celler);
      if (tekstFelter.some(v => typeof v === 'string' && /Lørenskog 2024/i.test(v))) {
        kolonneMapping = {};
        for (const [col, v] of Object.entries(celler)) {
          if (typeof v === 'string') {
            if (/Lørenskog 2024/i.test(v)) kolonneMapping['2024'] = col;
            else if (/Lørenskog 2025/i.test(v)) kolonneMapping['2025'] = col;
            else if (/Landet/i.test(v)) kolonneMapping['landet'] = col;
            else if (/Enhet/i.test(v)) kolonneMapping['enhet'] = col;
            else if (/Indikator/i.test(v)) kolonneMapping['indikator'] = col;
          }
        }
        if (kolonneMapping['2024'] && kolonneMapping['2025']) iHeaderFunnet = true;
      }
      continue;
    }
    const indikatorTekst = celler[kolonneMapping['indikator']];
    if (!indikatorTekst || typeof indikatorTekst !== 'string') continue;
    const v2024 = celler[kolonneMapping['2024']];
    const v2025 = celler[kolonneMapping['2025']];
    if (typeof v2024 === 'number' || typeof v2025 === 'number') {
      ekselDataPerÅr[indikatorTekst.trim()] = {
        '2024': typeof v2024 === 'number' ? v2024 : null,
        '2025': typeof v2025 === 'number' ? v2025 : null,
        landet: typeof celler[kolonneMapping['landet']] === 'number' ? celler[kolonneMapping['landet']] : null,
        enhet: typeof celler[kolonneMapping['enhet']] === 'string' ? celler[kolonneMapping['enhet']] : ''
      };
    }
  }
  console.log(`Excel-indikatorer hentet: ${Object.keys(ekselDataPerÅr).length}`);

  // === 5. Sammenlign mot SSB ===
  const resultater = [];
  for (const kart of INDIKATOR_KART) {
    const eksel = ekselDataPerÅr[kart.ekselNavn] || finnFuzzy(ekselDataPerÅr, kart.ekselNavn);
    if (!eksel) {
      resultater.push({ ...kart, ekselFunnet: false, status: 'EXCEL-RAD MANGLER' });
      continue;
    }
    for (const år of ÅR_VALIDERES) {
      const ekselVerdi = eksel[år];
      const ssbResp = await hentSsb(kart.tabell, kart.contents, KOMMUNE_NR, år);
      const ssbVerdi = ssbResp?.verdi;
      let status, avvik = null;
      if (ssbResp?.error) {
        status = `SSB-FEIL: ${ssbResp.error}`;
      } else if (ekselVerdi == null) {
        status = 'EXCEL-VERDI MANGLER';
      } else if (ssbVerdi == null) {
        status = 'SSB-VERDI MANGLER';
      } else {
        avvik = ssbVerdi - ekselVerdi;
        const relAvvik = ekselVerdi !== 0 ? Math.abs(avvik / ekselVerdi) : 0;
        status = relAvvik <= TOLERANSE ? '✓ OK' : `✗ AVVIK ${(relAvvik * 100).toFixed(2)}%`;
      }
      resultater.push({
        indikator: kart.ekselNavn,
        år,
        excelVerdi: ekselVerdi,
        ssbVerdi,
        avvik,
        status,
        tabell: kart.tabell,
        contents: kart.contents,
        merknad: kart.merknad || ''
      });
    }
  }

  // === 6. Skriv rapport ===
  const md = byggRapport(resultater, ekselDataPerÅr);
  writeFileSync(RAPPORT_PATH, md, 'utf8');
  console.log(`\nValideringsrapport: ${RAPPORT_PATH}`);

  // Rydd opp
  rmSync(dest, { recursive: true, force: true });
}

function finnFuzzy(dict, søkenavn) {
  const s = søkenavn.toLowerCase().replace(/\s+/g, ' ').trim();
  for (const k of Object.keys(dict)) {
    const ks = k.toLowerCase().replace(/\s+/g, ' ').trim();
    if (ks.includes(s) || s.includes(ks)) return dict[k];
  }
  return null;
}

function byggRapport(resultater, ekselDataPerÅr) {
  const okCount = resultater.filter(r => r.status?.startsWith('✓')).length;
  const avvikCount = resultater.filter(r => r.status?.startsWith('✗')).length;
  const feilCount = resultater.length - okCount - avvikCount;
  const linjer = [];
  linjer.push('# Valideringsrapport — KOSTRA-tall mot Excel-referanse');
  linjer.push('');
  linjer.push(`**Generert:** ${new Date().toISOString()}`);
  linjer.push(`**Kommune:** Lørenskog (kommunenummer ${KOMMUNE_NR}, Akershus 2024-)`);
  linjer.push(`**Årstall validert:** ${ÅR_VALIDERES.join(', ')}`);
  linjer.push(`**Toleranse:** ${(TOLERANSE * 100).toFixed(1)}% relativt avvik`);
  linjer.push(`**Excel-fil:** \`team/referansedata/Lorenskog_KOSTRA_2025_nokkeltall.xlsx\``);
  linjer.push('');
  linjer.push(`## Sammendrag`);
  linjer.push('');
  linjer.push(`- ✓ OK: **${okCount}**`);
  linjer.push(`- ✗ Avvik: **${avvikCount}**`);
  linjer.push(`- ⚠ Mangler/feil: **${feilCount}**`);
  linjer.push('');
  linjer.push(`## Resultater per indikator og år`);
  linjer.push('');
  linjer.push(`| Indikator | År | Excel | SSB | Avvik | Status | SSB-tabell | Merknad |`);
  linjer.push(`|---|---|---|---|---|---|---|---|`);
  for (const r of resultater) {
    const fmt = (v) => v == null ? '–' : (typeof v === 'number' ? v.toFixed(2) : String(v));
    linjer.push(`| ${r.indikator || '?'} | ${r.år || '?'} | ${fmt(r.excelVerdi)} | ${fmt(r.ssbVerdi)} | ${fmt(r.avvik)} | ${r.status || '?'} | ${r.tabell || '–'} | ${r.merknad || ''} |`);
  }
  linjer.push('');
  linjer.push(`## Excel-indikatorer detektert (alle 14)`);
  linjer.push('');
  for (const [navn, data] of Object.entries(ekselDataPerÅr)) {
    linjer.push(`- **${navn}** (${data.enhet}): 2024=${data['2024']}, 2025=${data['2025']}, landet=${data.landet}`);
  }
  linjer.push('');
  linjer.push(`## Indikator-mapping mot SSB-tabeller`);
  linjer.push('');
  linjer.push(`Mapping er manuelt slått opp i SSB Statistikkbanken. ${INDIKATOR_KART.length} indikatorer er forsøkt mappet; ${INDIKATOR_KART.filter(k => k.contents).length} har full SSB-ekvivalent.`);
  linjer.push('');
  linjer.push(`**Indikatorer uten direkte SSB-ekvivalent:**`);
  for (const k of INDIKATOR_KART.filter(k => !k.contents)) {
    linjer.push(`- ${k.ekselNavn}: ${k.merknad || 'krever ekstern kilde'}`);
  }
  linjer.push('');
  linjer.push(`## Tolking av avvik`);
  linjer.push('');
  linjer.push(`Avvik over ${(TOLERANSE * 100).toFixed(1)}% kan ha flere årsaker:`);
  linjer.push(`1. **SSB har revidert tall** etter Excel-fila ble produsert (16. mars 2026 — foreløpige tall).`);
  linjer.push(`2. **Feil ContentsCode** i kart-tabellen — verifiser mot SSB-metadata.`);
  linjer.push(`3. **Foreløpige vs reviderte tall** — Excel kan ha foreløpige (15. mars), SSB-API kan ha oppdaterte tall.`);
  linjer.push(`4. **Konsern-tall vs kommunekassa** — KOSTRA publiserer begge; Excel velger ofte konsern.`);
  linjer.push('');
  linjer.push(`Hver enkelt avvikende indikator skal åpnes som HANDOFF-rad for utredning.`);
  linjer.push('');
  return linjer.join('\n');
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
