# Prosjektlogg — Kommunebarometer

Kronologisk logg over beslutninger, retningsvalg og viktige hendelser. Nyeste øverst.
Prosjektleder og Tech Lead har ansvar for å holde denne oppdatert. Alle andre skriver bare korte notater som er relevante for resten av teamet.

Format per oppføring:
```
## ÅÅÅÅ-MM-DD — Tittel
**Hvem:** [Rolle/navn]
**Hva:** [Kort]
**Hvorfor:** [Kort]
**Konsekvens for teamet:** [Hvem må gjøre hva]
```

---

## 2026-04-25 — Pakke 1 (fix/lorenskog-knr-3222) levert: generisk CODE_HISTORY for Viken-oppløsningen
**Hvem:** Claude Code (autonom)
**Hva:** Lagt til `data/code-history.json` med 112 rene kommunekode-endringer fra SSB Klass-API klassifikasjon 131 changes.json (perioden 2023-12-01 til 2024-02-01) — Viken-oppløsningen + Møre og Romsdal-omnummerering. Format: `newCode → { name, oldCodes: [{code, validTo}] }`. Lørenskog-eksempel: 3029 (Viken 2020-2023) → 3222 (Akershus 2024-). NB: Vegard angav 3030 som gammel kode, men Klass-API + SSB-tabell-data viser entydig **3029**. Bruker Klass-data som autoritativ.

I `index.html`:
- Globale `CODE_HISTORY` og `CODE_HISTORY_REVERSE` (oldCode → newCode) lastes via `loadCodeHistory()` ved oppstart i `main()`.
- `parseJsonStat`-grupperingen kanoniserer nå koder via `CODE_HISTORY_REVERSE` i tillegg til label-matching: gammel kode 3029 og ny kode 3222 havner i samme gruppe `__codehist__3222`. Sammenhengende historikk 2019–2025 uten avhengighet til at SSB legger ved årstalls-parentes i label.
- `findMuniCode` mapper historiske koder (eks. `?kommune=3029`) til nåværende (3222) automatisk.
- Helpere `allCodesForKommune(currentCode)` og `codeForYear(currentCode, year)` eksponert for fremtidige API-kall som trenger eksplisitt år-til-kode-mapping (Pakke 2/3 vil bruke disse).

**Hvorfor:** Viken-fylket ble oppløst 1. januar 2024. 112 kommuner fikk ny kode uten navnebytte eller sammenslåing. Tidligere håndteringen i `index.html` baserte seg på label-matching ("Lørenskog" mot "Lørenskog (2020-2023)"), som er skjør hvis SSB endrer label-konvensjon. Nå har vi eksplisitt mapping fra Klass-API som autoritativ kilde.

**Konsekvens for teamet:** Pakke 2 (datavalidering) og Pakke 3 (DKI/behovsjustering) kan nå bruke `allCodesForKommune('3222')` for å få begge koder ved API-kall. URL-state med gammel kode (3029) vil automatisk vise 3222 i søkefelt og url. `data/code-history.json` augmenteres ved oppstart med fersk Klass-fetch (cache 30 dager) når Klass-rewrite (Pakke 2/C1) er på plass — i dag er den statiske snapshoten primær kilde.

## 2026-04-25 — Pakke 0–3 levert og merget til main
**Hvem:** Claude Code (autonom kjøring på vegne av Vegard) + Vegard (merging)
**Hva:** Fire pakker levert som selvstendige PR-er og merget til main:
- **Pakke 0** (PR #3, denne): BRIEF forankret i rapportene. 5 må-ha → 8 må-ha med rapport-sporbarhet (A1, B1, A3, E4, B5). 8 bør-ha med behovsjustering (A2), politiker-modus (D5), ROBEK, dynamisk Klass-API. WCAG 2.1 → 2.2 AA. v2.x-seksjon for eksterne kilder (FHI, Udir, Ungdata, Brønnøysund, DEA, KMD). Eksplisitt utenfor scope: Bedrekommune.no, mikrodata, API/abonnement.
- **Pakke 1** (PR #2, AP-04): SSB-spike. Målt p50=620 ms, p95=757 ms cold for én kommune. Single batch ikke mulig (URL >4000 tegn). Sweet spot: batchSize 100–200, concurrency 1, total 3–4 s for hele datasettet. Strategi-anbefaling i `API-KONTRAKT.md`.
- **Pakke 2** (PR #4, AP-03): `.gitattributes` + `.gitignore` utvidet + `team/DEPLOY.md` med branch-strategi, deploy-flyt, rollback og 6 manuelle Vegard-sjekkpunkter. Edge-cache-anbefaling fra AP-04 dokumentert (ikke implementert i `vercel.json`).
- **Pakke 3** (PR #5, AP-01): `team/adr/001-v2-arkitektur.md` anbefaler Astro 4.x med Chart.js/SheetJS som islands. Tre alternativer (vanilla, Vite+Preact, Next.js) vurdert og avvist. Implementasjonsplan i 4 steg. Implementasjon ikke startet — venter Vegards eksplisitte godkjenning av tech-stack-bytte.

Tekstuttrekk fra `.docx` gjort med PowerShell `[System.IO.Compression.ZipFile]` mot `word/document.xml` — ingen Word-installasjon nødvendig. Verifisert at Vercel deployer fra main automatisk.
**Hvorfor:** CEO-rapportens hovedbudskap er at "KOSTRA alene er utilstrekkelig" og metodikken må være transparent. KOSTRA-rapporten understreker sammenligning på tre nivåer (egen utvikling, KOSTRA-gruppe, landet uten Oslo). v1's status quo (én 1500-linjers `index.html`) skalerer ikke til 12 sektorer × 357 kommuner. AP-04-funnene viser at edge-caching og pre-compute er kritisk uavhengig av framework-valg.
**Konsekvens for teamet:** AP-02 (wireframes) er eneste åpne oppgave. UX/UI-designer kan tegne både ekspertvisning og politiker-modus (D5). Vegard må godkjenne ADR-001 før Astro-implementasjon kan starte. Vegard må verifisere 6 manuelle sjekkpunkter i DEPLOY.md (branch-protection, Vercel-konfig, edge-cache-headers, miljøvariabler, konto-grense). Edge-cache-headers i `vercel.json` venter på Vegards OK.

## 2026-04-24 — Foreløpige suksesskriterier + fire arbeidspakker åpnet
**Hvem:** Claude (Cowork-bootstrap, på vegne av Vegard)
**Hva:** Skissert foreløpige suksesskriterier i `BRIEF.md` (5 må-ha, 3 bør-ha, kvalitetskrav). Åpnet fire arbeidspakker i `HANDOFF.md`: AP-01 v2-arkitektur ADR (Tech Lead), AP-02 wireframes + design-tokens (UX/UI), AP-03 repo/Vercel-hygiene (Release Manager), AP-04 SSB PxWeb-spike for alle kommuner (Fullstack).
**Hvorfor:** Gi Prosjektleder-agenten en konkret startpakke i stedet for blank start. Rapportene (`Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx`, `KOSTRA-oversikt-og-dypdykk.docx`) leses av Prosjektleder-agenten som første oppgave og skal styre endelige prioriteringer.
**Konsekvens for teamet:** Prosjektleder-agenten må lese rapportene og verifisere/justere suksesskriteriene før arbeidspakkene fyres av for fullt. Endringer flagges i denne loggen. Tech Lead, UX/UI, Release Manager og Fullstack kan starte lesing av sine AP-er parallelt med at Prosjektleder leser rapportene, men skal vente med levering til Prosjektleder har bekreftet scope.

## 2026-04-24 — Team etablert i Cowork
**Hvem:** Vegard (produkteier)
**Hva:** 9 agent-roller opprettet: Prosjektleder, Tech Lead, Frontend, Backend, Fullstack, UX/UI-designer, DevOps, QA, Release Manager. Delte kontekst-filer lagt i `/team/`.
**Hvorfor:** Skalere utviklingen av Kommunebarometer v2 med minst mulig koordineringslast på Vegard.
**Konsekvens for teamet:** Alle agenter starter med å lese `BRIEF.md` og denne loggen. Prosjektleder er primær-kontakt. Neste steg: Prosjektleder leser 2.0-rapport + KOSTRA-dokument og fyller inn suksesskriterier i `BRIEF.md`.
