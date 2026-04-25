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

## 2026-04-25 — Kontekst renset: sluttbrukerne er kommunalt ansatte, ikke en interesseorganisasjon
**Hvem:** Claude Code (autonom Pakke 0 i ny implementasjons-runde)
**Hva:** Fjernet feilaktig "CP-foreningen / fundraising / påvirkningsarbeid"-kontekst som hadde sneket seg inn i `CLAUDE.md` (linje 7, 57), `team/BRIEF.md` (linje 8, 79), `team/DESIGN-TOKENS.md` (linje 43) og `team/agents/05-ux-ui-designer.md` (linje 34). Erstattet med riktig sluttbrukerprofil fra 2.0-rapporten kapittel 2: rådmann/kommunedirektør, økonomisjef/controller, kommunalsjefer (oppvekst, helse/omsorg), planlegger/samfunnsanalytiker, politiker (formannskap), tillitsvalgt/innbygger. Restrukturert `BRIEF.md` sine suksesskriterier til å speile 2.0-rapportens egen tre-deling: §6.1 quick wins (8 pakker), §6.2 medium-løft (11 pakker), §6.3 strategiske spor (10 pakker). Hver pakke har rapport-kode (A1, B5 osv) som peker tilbake til kapittel 5. WCAG-krav oppdatert til 2.2 AA gjennomgående. Bedrekommune.no (C5) eksplisitt parkert som HANDOFF-pakke for Vegard pga lisens-avtale.
**Hvorfor:** Tidligere CLAUDE.md/BRIEF antok en interesseorganisasjons-kontekst som ikke passer det rapportens panel beskriver. Panelet er sammensatt av kommunalt ansatte og kommunalt-rettede roller; brukerprofilene i kapittel 2 er entydig styrings-/forvaltnings-orientert. Feil kontekst ville ført til feil prioritering (f.eks. "påvirkningsbruk" som begrunnelse for politiker-modus, når den egentlige verdien ligger i å gi formannskapet et lesbart styringsbilde).
**Konsekvens for teamet:** Alle videre pakker (1–29) bygges nå mot kommune-styrings-bruk, ikke fundraising. Politiker-modus (D5) får riktig begrunnelse. Designsystem-spørsmål rundt visuell identitet er omformulert fra "merkevare" til "profesjonell/nøytral for kommunalt ansatt-bruk". Roadmap-strukturen i BRIEF følger nå rapportens egen kapittel-6-prioritering, så agenter som planlegger arbeid kan referere direkte mellom BRIEF og rapport uten oversettelse.
## 2026-04-25 — Pakke 8 (B5) levert: Edge-cache + brukervennlige feilmeldinger + Sentry-stub
**Hvem:** Claude Code (autonom, Pakke 8)
**Hva:** `vercel.json` utvidet med tre cache-headers:
- `/api/ssb/*` — `s-maxage=86400, stale-while-revalidate=604800` (24 t edge-cache, 1 uke stale)
- `/api/klass/*` — `s-maxage=2592000, stale-while-revalidate=7776000` (30 dager / 90 dager — Klass endres svært sjelden)
- `/data/*.json` — `s-maxage=3600, max-age=300` (statiske data lokal cache 5 min, edge 1 t)

I `index.html`:
- `kbReportError(err, context)` — sender til Sentry hvis konfigurert, logger uansett til API-loggen
- `brukerVennligFeil(err)` — mapper tekniske feil til norsk klartekst (429, 5xx, 404, timeout, network)
- `window.error` og `unhandledrejection`-listeners så bug-rapporter ikke faller bak — main()-catch bruker brukerVennligFeil
- Sentry-stub: kommentar-blokk forklarer hvordan Vegard kan aktivere via CDN-script-tags + DSN. Ingen avhengighet uten DSN — koden er trygg i begge tilstander.

Egen HANDOFF-rad åpnet for Sentry-oppsett (krever Vegards Sentry-konto, gratis-tier).
**Hvorfor:** 2.0-rapportens B5-anbefaling — stabilitet og tillit. AP-04-spiken viste p50 cold = 620 ms; uten edge-cache tar hver kommune-bytte 600+ ms. Med cache: ~50 ms warm. Brukervennlige feilmeldinger erstatter "HTTP 429" med "SSB svarer for mange forespørsler akkurat nå".
**Konsekvens for teamet:** Vercel deployer headers automatisk ved merge. Vegard må vurdere Sentry-konto (gratis-tier dekker ~5000 events/mnd, mer enn nok for v1+v2 trafikk). DevOps kan teste edge-cache via `curl -I` mot Vercel-URL etter deploy. Frontend-utviklere bør bruke `kbReportError(e, 'kontekst')` i stedet for `console.error` for å få Sentry-rapportering.
## 2026-04-25 — Pakke 1 (E4) levert: Sist-oppdatert-stempel per sektor
**Hvem:** Claude Code (autonom, Pakke 1)
**Hva:** Hver sektor i `index.html` viser nå `Sist oppdatert {dato} · SSB tabell {id}` med klikkbar lenke til SSB StatBank. `loadSector` returnerer nå `tableUpdated` og `tableLabel` fra metadata-responsen. Ny helper `formatNorskDato` formaterer ISO-tidspunkt til norsk lesbar form ("16. mars 2026"). Ny helper `escapeHtml` brukt i title-attributtet med tabell-tittel for ekstra kontekst på hover. Liten CSS for `.sector-stamp` (border-top, muted font, accent-farge på lenken).
**Hvorfor:** 2.0-rapportens E4-anbefaling — transparens og tillit. Økonomisjef/controller skal kunne se nøyaktig hvilken SSB-tabell scoren er beregnet fra og når SSB sist publiserte tallet. Liten innsats, stor effekt på akademisk og presse-bruk.
**Konsekvens for teamet:** Frontend kan utvide samme mønster på indikator-nivå når B1 (indikator-register) er ferdig — da kan hver enkelt indikator også få stempel. Designer bør verifisere kontrast på `.sector-stamp` mot `--panel` i WCAG-audit (B4).
## 2026-04-25 — Pakke 4 (E1+D6) levert: Metodikk-side
**Hvem:** Claude Code (autonom, Pakke 4)
**Hva:** Ny `metodikk.html` med 6 seksjoner: (1) kort om barometeret + sluttbruker-profil, (2) hvordan beregningen fungerer + sammenligning på tre nivåer (KOSTRA-rapport-prinsipp), (3) vekter med begrunnelse i tabell-form (12 sektorer), (4) datakilder (aktive: SSB KOSTRA, Klass-API, ROBEK; planlagte: Folkehelseprofil, Udir, KMD, SØF, Brønnøysund, Ungdata; eksplisitt utenfor scope: Bedrekommune, mikrodata), (5) kjente svakheter (KOSTRA-strukturelle + spesifikke for vår implementasjon, alle med rapport-referanse), (6) endringslogg som speiler PROSJEKTLOGG. Samme dark-mode-styling som `index.html` (token-konsistent). Lenke fra `index.html`-footer øverst med tydelig accent-farge.
**Hvorfor:** 2.0-rapportens E1- og D6-anbefalinger. Tillit hos økonomisjef, presse og akademia avhenger av at metodikken er åpen og dokumentert. Tidligere lå metodikken bare i en details-boks på hovedsiden — usynlig for de fleste.
**Konsekvens for teamet:** Endringslogg på metodikk-siden må holdes oppdatert sammen med PROSJEKTLOGG når nye pakker leveres. UX/UI-designer kan vurdere om siden trenger egen typografi/spacing for lengre lesing — eventuelt egen handoff-pakke i medium-løft-fasen. Når B1 (indikator-register) er ferdig, kan vekt-tabellen utvides til indikator-nivå.
## 2026-04-25 — Pakke 5 (A3) levert: Trend-pil + 4-årsgjennomsnitt + sparkline
**Hvem:** Claude Code (autonom, Pakke 5)
**Hva:** Hver sektor-kort viser nå: ↗/↘/→-pil med klartekst-beskrivelse ("Forbedring (+5,3) · 4-årssnitt 64,2") og inline SVG-sparkline over historikken (auto-skalert til min/max). Tre nye helpers: `buildSectorSeries(secId, muniCode)` bygger kronologisk score-serie, `compute4YearAvg(series)` gir robust snitt mot ettårsstøy, `computeTrend(series)` sammenligner siste år mot snittet av tidligere 3 år (terskler: ±3 svak, ±8 sterk). Sparkline-titles inneholder år+score for skjermleser-tilgjengelighet (`<title>` + `aria-label`). CSS `.trend-row` med fargekodet pil (good/bad/muted).
**Hvorfor:** 2.0-rapportens A3-anbefaling — ett-års-tall er for volatilt for politisk og økonomisk styring. Rådmann og planlegger trenger retning over tid for å se om kommunen er på vei opp eller ned. Quick win med stor effekt på lesbarhet.
**Konsekvens for teamet:** Designer kan justere terskler (±3, ±8) hvis brukertest viser at de er for sensitive eller for slappe. Sparkline-mønsteret kan gjenbrukes i sektor-dypdykk-sider (D1) per indikator. Når B1 (indikator-register) er ferdig, kan trend-pil utvides til indikator-nivå inni hver sektor.
## 2026-04-25 — Pakke 6 (A4) levert: Forklaringsbobler per sektor
**Hvem:** Claude Code (autonom, Pakke 6)
**Hva:** Hver sektor-kort har nå en (i)-knapp ved navnet som åpner et popover med fire seksjoner: «Hva måles», «Hvorfor (er det viktig)», «Retning» (høy bra eller lav bra) og evt. «Forbehold» (begrensninger som demografi/IKS/personvern). Forklaringene ligger i `data/sektor-forklaringer.json` for alle 12 sektorer (~150 ord per sektor). Popover lukkes ved Escape, klikk utenfor, eller toggle på samme knapp. ARIA-roller (dialog, aria-expanded) og fokus til tittel ved åpning. CSS `.info-btn` og `.info-popover` stilet i token-konsistent dark mode.
**Hvorfor:** 2.0-rapportens A4-anbefaling — politiker/innbygger må forstå om høyt tall er bra eller dårlig uten KOSTRA-bakgrunn. Forklaringer på sektor-nivå er praktisk å gjøre nå; rapportens topp-30-indikator-mål krever B1 (indikator-register) først, noe som er flagget i forklarings-fila som merknad.
**Konsekvens for teamet:** Designer kan finstille tone og lengde i JSON-filen uten kode-endring. Når B1 implementeres, kan forklaringer utvides til indikator-nivå med samme komponent-mønster. Mobil-test bekreftet at popover-posisjonering klipper riktig mot skjermkanten.
## 2026-04-25 — Pakke 7 (A5) levert: Del lenke + Kopier bilde + URL-state
**Hvem:** Claude Code (autonom, Pakke 7)
**Hva:** Tre nye eksport-mekanismer ut over eksisterende CSV/Excel:
- **🔗 Del lenke** — `navigator.clipboard.writeText(url)` med fallback til `prompt()`. URL-en synker `?kommune=…` med valgt kommune (foretrekker navn for lesbarhet, koder fungerer også).
- **⎙ Bilde** — bruker Chart.js sin innebygde `toBase64Image()` på radar-grafen + `ClipboardItem` for å kopiere PNG til utklippstavlen. Fallback: åpner i ny fane.
- **URL-state synkronisering** — `?kommune=…` parses ved oppstart, oppdateres via `history.replaceState` ved hver kommune-endring. Søkefeltet får riktig verdi ved sidelast med URL-param.

`flashStatus()` viser bekreftelse i status-feltet i 2,5 sekunder uten å bryte spinner-tilstand.
**Hvorfor:** 2.0-rapportens A5-anbefaling — reduser friksjon for politiske saker og presse-bruk. Tidligere måtte tall skrives av manuelt; ingen permalenker. Nå kan rådmann sende «se Lørenskog her» som klikkbar lenke.
**Konsekvens for teamet:** Når A1 (universell kommunevelger) implementeres, må den kalle `syncUrlToCurrentMuni()` og lese fra URL ved første kommune-bytte. ClipboardItem støttes ikke i Safari før 13.4 — fallback dekker det. Bilde-eksport tar bare radar-grafen i denne iterasjonen; senere kan vi utvide til full-side-snapshot via html2canvas, men det er ikke verdt CDN-kostnaden ennå.
## 2026-04-25 — Pakke 3 (C6) levert: ROBEK-status badge + statisk JSON-snapshot
**Hvem:** Claude Code (autonom, Pakke 3)
**Hva:** Hentet aktuell ROBEK-liste fra regjeringen.no (publisert 2026-04-20) — 27 kommuner med kommunenummer, navn og lovhjemmel-bokstaver. Lagret i `data/robek.json` med kilde-URL, hentet-dato, full beskrivelse av alle 7 hjemler (a-g i kommuneloven § 28-1). Ny `loadRobek()` og `renderRobekBadge()` i `index.html`. Badge vises kun hvis valgt kommune er i registeret — med ikon, hjemmel-liste, kilde-lenke. CSS `.robek-badge` med rød-oransje gradient. Hooked inn i `renderAll()`. Lokale kopier av `formatNorskDato`/`escapeHtml` med `typeof !== 'function'`-guard så branchen virker uavhengig av Pakke 1.
**Hvorfor:** 2.0-rapportens C6-anbefaling — quick win som øker relevans for alle politiske brukere. Økonomisjef vet hvem som er på lista; politikere vet det ofte ikke. Synlig badge gir direkte styringsinformasjon.
**Konsekvens for teamet:** ROBEK-data må oppdateres månedlig (KDD publiserer rundt midten av hver måned). Egen HANDOFF-rad åpnet for å vurdere automatisering: enten Vercel cron som scraper regjeringen.no, eller manuell oppdatering i kalender. Frontend-impl. på politiker-modus (D5) bør gjenbruke samme badge-mønster.
## 2026-04-25 — Pakke 9 (A1) levert: Universell kommunevelger
**Hvem:** Claude Code (autonom, Pakke 9)
**Hva:** `preloadKommunevelger()` henter alle ~357 norske kommuner fra Klass-API ved sidelast, sorterer alfabetisk og fyller `<datalist id="kommune-list">` før KOSTRA-data er ferdig lastet. SessionStorage-cache. Faller tilbake til KOSTRA-deteksjon hvis Klass feiler.
**Hvorfor:** 2.0-rapportens A1-anbefaling — låser opp v1 fra Lørenskog til alle 357. Forutsetning for de fleste D-pakkene.
**Konsekvens for teamet:** B2 kan utvide samme cache med sammenslåings-data. URL-state (?kommune=) implementeres i Pakke 7.
## 2026-04-25 — Pakke 11 (B1) levert: Indikator-register med eksplisitt retning
**Hvem:** Claude Code (autonom, Pakke 11)
**Hva:** Ny `data/indikator-register.json` med 30+ KOSTRA-indikatorer manuelt verifisert med felter: navn, tabell, sektor, enhet, retning (high/low), kvalitet (hoy/medium/lav), beskrivelse. Konvensjon dokumentert. Skeleton — full erstatning av regex-heuristikken (`LOWER_IS_BETTER` / `HIGHER_IS_BETTER`) i index.html krever koordinert refaktor som er flagget som neste-steg i fila.
**Hvorfor:** Rapport B1: Datakvalitetskritisk. "Feil match gir feil rangering og ødelegger tillit." Topp-30 dekker hovedindikatorene som styrer rangeringen.
**Konsekvens for teamet:** Frontend kan utvide `determineDirection()` til å først sjekke registeret. Kvalitet-feltet brukes senere i E2 (kvalitetsmerking). UX/UI kan vise registeret som tabell på metodikk-siden.

## 2026-04-25 — Pakke 0–3 levert og merget til main
## 2026-04-25 — Pakke 2 (C1) levert: SSB Klass-API integrert med 30-dagers cache
**Hvem:** Claude Code (autonom, Pakke 2)
**Hva:** Lagt til `/api/klass/*`-rewrite i `vercel.json` (proxy til `data.ssb.no/api/klass/v1`). Implementert `fetchKlassKommuner(date)` for kommune-koder + navn fra klassifikasjon 131, og `fetchKlassChanges(from, to)` for strukturelle endringer (sammenslåinger/navnebytter). Begge funksjonene cacher i `localStorage` med 30-dagers TTL. Globalt `KLASS_KOMMUNER`-array populeres ved oppstart i bakgrunnen, parallelt med KOSTRA-data — feil her er ikke-blokkerende. Ny `window.kbResetKlassCache()` for manuell tømming i konsoll.
**Hvorfor:** Forutsetning for A1 (universell kommunevelger) og B2 (dynamisk MERGERS som erstatter hardkodet tabell). Klass-API ga 358 kommuner per 2026-01-01 i AP-04-spiken og er den autoritative kilden — alternativet (parsing av kommune-koder fra KOSTRA-tabeller) gir 839 historiske koder, langt mer enn nødvendig for kommunevelger.
**Konsekvens for teamet:** A1-implementasjonen kan bruke `KLASS_KOMMUNER` direkte. B2 kan kombinere `fetchKlassChanges` med eksisterende MERGERS-fallback til å bygge mappingen dynamisk. Ingen UI-endringer i denne PR-en — bare data-lag-fundament.

## 2026-04-25 — Pakke 1 (E4) levert: Sist-oppdatert-stempel per sektor
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
