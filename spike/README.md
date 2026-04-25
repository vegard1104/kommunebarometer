# SSB-spike — datalast for alle kommuner

Måler responstid og feilmodi mot SSB PxWeb v2 for å avgjøre batching-strategi i v2-arkitekturen.

## Forhåndskrav

- Node 18+ (testet med 25.8.2)
- Ingen npm-pakker — bare innebygd `fetch`

## Kjøre testene

```bash
# Hovedspike (smoke + Klass + sekvensiell + parallell + feilmodi)
node spike/ssb-spike.mjs

# Sweet-spot batch-test (sammenligner batchSize × concurrency)
node spike/batch-sweet-spot.mjs
```

Resultater fra hovedspike skrives til `spike/results/<timestamp>.json`.

## Hva testes

| Test | Hensikt |
|---|---|
| 1. Smoke | Validér at API returnerer JSON-stat2 med korrekt struktur for 3 kommuner |
| 2. Klass-API | Hent kommuneliste per dato, valider antall (~357) |
| 3a. Tabell-metadata | Hent regions-liste fra tabellen selv (forskjellig fra Klass) |
| 3. Single batch | Kan vi få alle kommuner i én request? (Spoiler: nei, URL > 4000 tegn) |
| 4. Sekvensiell | p50/p95-baseline for enkelt-kommune-fetch |
| 5. Parallell | Hvilken batch-størrelse + concurrency unngår 429? |
| 6. Feilmodi | Hva returnerer SSB ved ugyldig tabell, kode, manglende mandatory? |

## Hovedfunn (fra kjøring 2026-04-25)

- **p50 = 620 ms** for én kommune × én indikator (cold)
- **URL-grense ~4000 tegn** → maks ~700 kommune-koder per request
- **Rate-limit 429** ved >2 samtidige requests vedvarende
- **Sweet spot**: batchSize 100–200, concurrency 1, total 3–4 s for alle 839 kommune-koder
- **Klass-API ≠ tabellens regions-liste** — 358 vs 839 koder (Klass har bare nåværende, tabellen inkluderer historiske)

Full strategi-anbefaling i [`team/API-KONTRAKT.md`](../team/API-KONTRAKT.md) under "Datalast — alle kommuner".

## Notat

Spike kjører mot `data.ssb.no` direkte (ikke via `/api/ssb/*` Vercel-rewrite) fordi vi tester fra Node, ikke nettleser. Latency vil være sammenlignbar siden Vercel proxy bare videresender requesten.
