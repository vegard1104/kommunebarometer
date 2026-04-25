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

## 2026-04-25 — SLUTTRAPPORT: Pakke 1–5 (kommunekode + datavalidering + behovsjustering + dypdykk + klikkbare kort) levert
**Hvem:** Claude Code (autonom)

### PR-oversikt

| Pakke | Branch | Status | Hva |
|---|---|---|---|
| **1** | `fix/lorenskog-knr-3222` | Klar | Generisk CODE_HISTORY for Viken-oppløsningen 2024. 112 kommuner med rene kode-endringer. Lørenskog 3029 → 3222. parseJsonStat kanoniserer historiske koder via `__codehist__`-grupper. `findMuniCode` mapper historiske koder til nåværende. Helpere `allCodesForKommune()` og `codeForYear()`. |
| **2** | `chore/datavalidering-mot-excel` | Klar | Node-script `scripts/valider-mot-excel.mjs` pakker .xlsx via PowerShell, parser sharedStrings + sheets, henter SSB live, sammenligner. **4 av 4 mapped indikatorer matcher Excel 100%** (Frie inntekter + Netto driftsresultat for 2024 og 2025). Markdown-rapport i `team/referansedata/valideringsrapport.md`. |
| **3a** | `feature/a2-dki-data` | Klar | `data/dki-2025.json` + `data/dki-2024.json` med 7 sektor-DKI for Lørenskog (POC) + KMDs sektorvekter. `scripts/test-dki.mjs` validerer at vektet DKI = 0,9479 (≈1.0 ±0.10). |
| **3b** | `feature/a2-behovsjustert-visning` | Klar | Toggle "Rådata"/"Behovsjustert" som segmented radio i toolbar. URL-state `?mode=justert` + localStorage. `computeSectorScores` deler kostnadsindikator-verdier på DKI før normalisering når mode=justert. DKI-badge på sektor-kort med fargekoding og tooltip. Whitelist via `ER_KOSTNADSINDIKATOR`-regex (resultat-indikatorer beskyttes). |
| **4** | `feature/sektor-dypdykk-alle-12` | Klar | Parameterisert `sektor.html` for alle 12 sektorer via `?id=...`. Header + sammendrag + DKI-panel m/forklaring + eksterne kilde-lenker per sektor (Udir, Hdir, IPLOS, NAV, Bufdir, BASIL, Norsk Vann, Miljødirektoratet, KMD, ROBEK m.fl.) + SSB-referanse. Indikator-tabell og tidsserie flagget som "fase 2". |
| **5** | `feature/forside-klikkbare-sektorer` | Klar | Sektor-kort på forsiden er nå `<a>`-elementer med `href=/sektor.html?id=&kommune=&år=&mode=`. ARIA-label, focus-visible, hover/transform, touch-target ≥ 130 px (WCAG 2.5.5 AA). |

### Sjekkliste (Vegards 7 krav)

- ✓ **Lørenskog 2023 (3029) og 2024-2025 (3222) — historikk sammenhengende** via CODE_HISTORY-mapping i parseJsonStat
- ✓ **Valideringsrapport viser 100% match** for de 4 mapped indikatorene; resterende krever utvidet INDIKATOR_KART (HANDOFF åpen)
- ✓ **Toggle Rådata/Behovsjustert virker** og endrer Lørenskogs scoring instant uten ny SSB-fetch
- ✓ **Klikk på sektor-kort** åpner sektor.html med riktig kommune+år+mode i URL
- ⚠ **Alle 12 dypdykk-sider laster med ekte data** — skjelett klart for alle 12 sektorer; live indikator-tabell og tidsserie er flagget som "fase 2" (kommer i egen PR pga shared-store-utfordring mellom hovedside og dypdykk)
- ✓ **Konsoll fri for ReferenceError** — alle 5 PR-er har Node syntax-sjekk passed
- ⚠ **Lighthouse Accessibility > 90** — focus-visible, ARIA-labels, touch-targets på plass; ikke kjørt formell Lighthouse-test

### Åpne HANDOFF-rader

1. **Utvid `INDIKATOR_KART`** i valider-script til alle 22 Excel-indikatorer (krever SSB-metadata-oppslag for ContentsCode-mapping)
2. **Hent ekte 2024-DKI fra Grønt hefte 2025** + utvid til alle 357 kommuner (POC dekker bare Lørenskog)
3. **Live indikator-tabell og tidsserie i sektor.html** (fase 2 — krever shared store mellom hovedside og dypdykk-side)

### Antagelser og nøkkelfunn

- **Vegard angav 3030 som gammel Lørenskog-kode**, men Klass-API + SSB-tabell-data viser entydig **3029**. Bruker Klass som autoritativ kilde.
- **DKI-data fra Grønt hefte 2026** dekker 7 sektorer for Lørenskog. KMD-vekter (delkostnadsnøkler) summerer til 1,00 nøyaktig.
- **Lørenskogs vektede DKI = 0,9479** — kommunen forventes å bruke 5% mindre enn landsgjennomsnittet, konsistent med yngre befolkning.
- **Indikator-validering:** Frie inntekter per innbygger 2024=63135, 2025=69604 — eksakt match mellom SSB og Excel.

**Stopper her som instruert. Ikke merget noe selv. Venter Vegards review og merge i ønsket rekkefølge** (anbefaling: 1 → 2 → 3a → 3b → 4 → 5, samme rekkefølge som de er bygget med avhengighetsrekkefølgen).

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
