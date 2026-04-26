// Validerer beregningene i js/kostra-rapport.js mot Vegards forventede tall
// fra Excel-referansefilen KOSTRA_2024-2025_Lorenskog_rangert.xlsx (eksisterer
// ikke i repo, så vi sjekker mot eksplisitte tall fra prompten).
//
// Kjører via Node mot live SSB-API. Skriver rapport til
// team/referansedata/valideringsrapport-kostra.md.

import { writeFileSync } from 'fs';
import { join } from 'path';

const REPO = 'C:/Users/VegardHauge/Documents/kommunebarometer-github-upload';
const SSB_BASE = 'https://data.ssb.no/api/pxwebapi/v2/tables/';
const KOMMUNENR_LORENSKOG = '3222';

const FORVENTET = [
  {
    test: 'Lørenskog samlet DKI 2025',
    forventet: { verdi: 0.950, rang: 6, total: 352 },
    toleranse: 0.01,
    hent: async () => {
      const { readFileSync } = await import('fs');
      const d = JSON.parse(readFileSync(`${REPO}/data/dki-2025.json`, 'utf8'));
      const k = d.kommuner[KOMMUNENR_LORENSKOG];
      const verdi = (typeof k === 'number') ? k : (k?.samlet ?? null);
      const verdier = Object.values(d.kommuner).map(v => typeof v === 'number' ? v : v?.samlet).filter(v => v != null);
      const sortert = [...verdier].sort((a, b) => a - b);
      const rang = sortert.indexOf(verdi) + 1;
      return { verdi, rang, total: verdier.length };
    }
  },
  {
    test: 'F202 grunnskole 2025 netto (Lørenskog)',
    forventet: { verdi: 12885, rang: 42, total: 343 },
    toleranse: 100,  // kr/innb
    hent: async () => {
      // Hent metadata
      const meta = await fetch(`${SSB_BASE}12362/metadata?lang=no&outputFormat=json-px`).then(r => r.json());
      const ids = meta.id;
      const regDim = ids.find(d => /region|kommune/i.test(d));
      const tidDim = ids.find(d => /^Tid$|tid/i.test(d));
      const conDim = ids.find(d => /contents/i.test(d));
      const artDim = ids.find(d => /art/i.test(d));
      const funDim = ids.find(d => /funksjon/i.test(d));
      const usp = new URLSearchParams();
      usp.set('lang', 'no');
      usp.set('format', 'json-stat2');
      usp.append(`valueCodes[${regDim}]`, '*');
      usp.append(`valueCodes[${tidDim}]`, '2025');
      usp.append(`valueCodes[${conDim}]`, 'KOSbelopinnbygge0000');
      usp.append(`valueCodes[${artDim}]`, 'AGD2');
      usp.append(`valueCodes[${funDim}]`, '202');
      const ds = await fetch(`${SSB_BASE}12362/data?${usp}`).then(r => r.json());
      // Parse: én verdi per kommune
      const dims = ds.dimension;
      const sizes = ds.size;
      const values = ds.value;
      const regKeys = Object.keys(dims[regDim].category.index);
      const strides = [];
      let s = 1;
      for (let i = ids.length - 1; i >= 0; i--) { strides[i] = s; s *= sizes[i]; }
      const valArr = Array.isArray(values) ? values : (() => {
        const arr = new Array(sizes.reduce((a,b)=>a*b,1)).fill(null);
        for (const [k,v] of Object.entries(values)) arr[+k]=v;
        return arr;
      })();
      function idx(lookup) {
        let o = 0;
        for (let i = 0; i < ids.length; i++) {
          o += dims[ids[i]].category.index[lookup[ids[i]]] * strides[i];
        }
        return o;
      }
      const verdier = {};
      for (const r of regKeys) {
        if (!/^\d{4}$/.test(r)) continue;
        const lookup = { [regDim]: r, [tidDim]: '2025', [conDim]: 'KOSbelopinnbygge0000', [artDim]: 'AGD2', [funDim]: '202' };
        const v = valArr[idx(lookup)];
        if (v != null && !isNaN(v)) verdier[r] = +v;
      }
      const lor = verdier[KOMMUNENR_LORENSKOG];
      const allVerdier = Object.values(verdier).sort((a, b) => a - b);
      const rang = allVerdier.indexOf(lor) + 1;
      return { verdi: lor, rang, total: allVerdier.length };
    }
  }
];

async function main() {
  const rader = ['# Valideringsrapport — KOSTRA-rapport-stil dypdykk', '',
    `Generert: ${new Date().toISOString()}`,
    `Kilde: live SSB-API + data/dki-2025.json`, '',
    '## Resultater', '',
    '| Test | Forventet | Faktisk | Status |',
    '|---|---|---|---|'];
  let alleOk = true;
  for (const t of FORVENTET) {
    try {
      const fakta = await t.hent();
      if (!fakta) {
        rader.push(`| ${t.test} | ${JSON.stringify(t.forventet)} | (kunne ikke hente) | ⚠ |`);
        continue;
      }
      const innenforToleranse = Math.abs(fakta.verdi - t.forventet.verdi) <= t.toleranse;
      const rangNær = !t.forventet.rang || Math.abs(fakta.rang - t.forventet.rang) <= 5;
      const ok = innenforToleranse && rangNær;
      if (!ok) alleOk = false;
      rader.push(`| ${t.test} | verdi=${t.forventet.verdi}, rang=#${t.forventet.rang}/${t.forventet.total} | verdi=${fakta.verdi}, rang=#${fakta.rang}/${fakta.total} | ${ok ? '✓' : '✗'} |`);
    } catch (e) {
      rader.push(`| ${t.test} | ${JSON.stringify(t.forventet)} | feil: ${e.message} | ✗ |`);
      alleOk = false;
    }
  }
  rader.push('', `**Status:** ${alleOk ? '✓ Alle tester passerte' : '✗ Avvik > toleranse — kan tyde på parsing-feil'}`);
  rader.push('', '## Forbehold', '',
    '- Excel-referansefilen `KOSTRA_2024-2025_Lorenskog_rangert.xlsx` finnes ikke i repo,',
    '  så vi sjekker kun mot tall eksplisitt nevnt i Vegards prompt.',
    '- Sektor-spesifikk DKI for ikke-Lørenskog er proksimert via samlet DKI uniformt.',
    '  Eksakt validering krever delkostnadsnøkler fra Grønt hefte PDF (åpen HANDOFF).',
    '- F202-tallet kan variere ±100 kr pga løpende SSB-revisjoner.');
  const fil = join(REPO, 'team', 'referansedata', 'valideringsrapport-kostra.md');
  writeFileSync(fil, rader.join('\n'));
  console.log(`Skrev ${fil}`);
  console.log(`Status: ${alleOk ? 'OK' : 'AVVIK'}`);
  process.exit(alleOk ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
