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

## 2026-04-25 — Pakke 4 (feature/sektor-dypdykk-alle-12) levert: parameterisert sektor-side
**Hvem:** Claude Code (autonom)
**Hva:** Ny `sektor.html` — én parameterisert side som dekker alle 12 sektorer via `?id=<sektor-id>`, `?kommune=<navn>`, `?år=<årstall>` og `?mode=raa|justert`. Bygger på Pakke 1 (kommunekode), Pakke 3a (DKI-data) og Pakke 3b (modus-håndtering).

Designvalg: én HTML-fil i stedet for 12 separate (`sektor-grunnskole.html` osv) — gir mindre kode-duplisering og lettere vedlikehold. Hver sektor blir tilgjengelig på sin egen URL via query-param. Lenker fra forsiden (Pakke 5) bruker `sektor.html?id=grunnskole&kommune=Lørenskog&år=2025`.

Implementert nå:
- Header med tilbake-lenke, sektor-navn + vekt, kommune-, års- og modus-info
- Sammendrag-grid med rådata-/justert-score-kort (justert vises kun i mode=justert)
- DKI-panel med klartekst-forklaring og fargekoding (grønn/rød/standard)
- Eksterne kilde-lenker per sektor (Udir, Hdir, IPLOS, NAV, Bufdir, Norsk Vann, Miljødirektoratet, m.fl.) med kontekst-tekst
- Kildereferanse til SSB-tabell + lenke til Statistikkbanken
- Behovsjusterings-forklaring koblet til /data/behovsjustering-readme.md

Flagget i banner-tekst som "kommer i egen PR":
- Detaljert indikator-tabell (alle SSB-indikatorer for sektoren med kommune/landet/KOSTRA-gruppe-kolonner)
- Tidsserie-graf med kommune+landet+gruppe per indikator
- Live-fetch av sammendrag-score (krever kobling til hovedsidens ALL_SECTOR_SCORES via shared store eller URL-meldinger)

**Hvorfor:** D1-anbefalingen i 2.0-rapporten — gjør siden til ekte fagverktøy. Brukerinstruksen krevde alle 12 sektorer, men live SSB-fetch + tidsserie + KOSTRA-gruppe-data per sektor er for stort til én PR. Skjelett + DKI + eksterne lenker er pragmatisk MVP.

**Konsekvens for teamet:** Pakke 5 (klikkbare sektor-kort) kan nå koble alle 12 sektor-kort til `sektor.html?id=...`. Live-fetch + indikator-tabell er åpen HANDOFF for fase 2 — krever sektor-konfig-deling mellom hovedside og dypdykk-side, eller egen SSB-fetch på dypdykk-siden.

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
