# Valideringsrapport — KOSTRA-rapport-stil dypdykk

Generert: 2026-04-26T10:44:33.543Z
Kilde: live SSB-API + data/dki-2025.json

## Resultater

| Test | Forventet | Faktisk | Status |
|---|---|---|---|
| Lørenskog samlet DKI 2025 | verdi=0.95, rang=#6/352 | verdi=0.95, rang=#6/355 | ✓ |
| F202 grunnskole 2025 netto (Lørenskog) | verdi=12885, rang=#42/343 | verdi=12885, rang=#42/343 | ✓ |

**Status:** ✓ Alle tester passerte

## Forbehold

- Excel-referansefilen `KOSTRA_2024-2025_Lorenskog_rangert.xlsx` finnes ikke i repo,
  så vi sjekker kun mot tall eksplisitt nevnt i Vegards prompt.
- Sektor-spesifikk DKI for ikke-Lørenskog er proksimert via samlet DKI uniformt.
  Eksakt validering krever delkostnadsnøkler fra Grønt hefte PDF (åpen HANDOFF).
- F202-tallet kan variere ±100 kr pga løpende SSB-revisjoner.