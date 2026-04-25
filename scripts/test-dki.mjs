#!/usr/bin/env node
// Sanitetstest: DKI-summen for hver kommune ≈ 1,0 vektet over delkostnadsnøkkel.
// Kjøre: node scripts/test-dki.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

let allOk = true;
for (const år of ['2024', '2025']) {
  const data = JSON.parse(readFileSync(join(REPO_ROOT, 'data', `dki-${år}.json`), 'utf8'));
  const vekter = data.sektorvekter || {};
  const sumVekter = Object.entries(vekter)
    .filter(([k]) => !k.startsWith('_'))
    .reduce((a, [, v]) => a + v, 0);
  console.log(`\n=== DKI ${år} ===`);
  console.log(`  Sum sektorvekter: ${sumVekter.toFixed(4)} (forventet ~1.00)`);
  if (Math.abs(sumVekter - 1.0) > 0.01) {
    console.log(`  ✗ AVVIK fra 1.00 over toleranse`);
    allOk = false;
  } else {
    console.log(`  ✓ Vekter summerer til ~1.00`);
  }
  for (const [kode, kData] of Object.entries(data.kommuner || {})) {
    const vektetDki = Object.entries(vekter)
      .filter(([k]) => !k.startsWith('_') && kData[k] != null)
      .reduce((a, [k, w]) => a + w * kData[k], 0);
    const ok = Math.abs(vektetDki - 1.0) <= 0.10;
    console.log(`  ${ok ? '✓' : '⚠'} ${kData.navn} (${kode}): vektet DKI = ${vektetDki.toFixed(4)} ${ok ? '(rimelig — toleranse ±0.10)' : '(utenfor ±0.10 — sjekk)'}`);
    if (!ok) allOk = false;
  }
}
console.log(`\n${allOk ? '✓ Alle DKI-tester passerte' : '✗ Noen tester feilet'}`);
process.exit(allOk ? 0 : 1);
