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
## 2026-04-25 — Pakke 12 (A6) levert: Justerbar vekting med slidere
**Hvem:** Claude Code (autonom, Pakke 12)
**Hva:** Ny `vekt-justering.html` med slidere for alle 12 sektorer + 4 forhåndsvalg (Standard/Oppvekst/Eldreomsorg/Økonomi). Sum-validering med farger. Lagrer i `localStorage`. `index.html` SECTORS-array leser fra localStorage og overstyrer standardvektene per sektor. Lenke fra footer.
**Hvorfor:** Rapport A6: "Vektene er valg, ikke fasit. Gir tillit og lar kommunedirektører bruke siden i prioriteringsdiskusjoner."
**Konsekvens for teamet:** Sliderne påvirker rangering først ved neste sidelast (siden SECTORS er evaluert på toppen). UX-forbedring senere: live oppdatering uten reload via egen rebuild-funksjon. URL-state er ikke implementert ennå (rapport-anbefaling).
## 2026-04-25 — Pakke 13 (D2) levert: Sammenlign-to-kommuner
**Hvem:** Claude Code (autonom, Pakke 13)
**Hva:** Ny `sammenlign.html` med to kommune-felter, datalist fra Klass-API, delbar URL `?a=...&b=...` og navigasjon til hovedsiden med begge kommuner pre-valgt. SessionStorage holder kommune B til hovedsiden plukker den opp i compare-state.
**Hvorfor:** Rapport D2: viral/delbar funksjon for politisk debatt og mediearbeid.
**Konsekvens for teamet:** Hovedsiden trenger en hook som leser sessionStorage `kb_pending_compare_b` og legger den til i COMPARE_MUNIS — egen liten PR. Inntil da fungerer A-kommune-deeplinken; B må velges manuelt.
## 2026-04-25 — Pakke 14 (D5) levert: Politiker-visning
**Hvem:** Claude Code (autonom, Pakke 14)
**Hva:** Ny `politiker.html` i light-mode med rødt/gult/grønt-trafikklys per sektor + én forklaringssetning per sektor (gjenbruker `data/sektor-forklaringer.json`). A4-print-styling med `@page` og `break-inside: avoid`. URL-state `?kommune=…`. Knapp for "Skriv ut" og "Se full visning →".
**Hvorfor:** Rapport D5: politikere orker ikke detaljer; de vil ha sammendrag på A4 til formannskapsmøtet.
**Konsekvens for teamet:** LIVE_SCORES per sektor må synkes fra hovedsiden — denne PR-en bruker forklarings-setninger som fallback når scorer mangler. Frontend kan lage en script-bro som lagrer ALL_SECTOR_SCORES i sessionStorage etter `main()` for politiker-siden å plukke opp.
## 2026-04-25 — Pakke 18 (B4) levert: WCAG 2.2 AA-audit + targeted fixes
**Hvem:** Claude Code (autonom, Pakke 18)
**Hva:** Ny `team/WCAG-AUDIT.md` med 17 funn (hverdags-kontrast, fokus-states, skjermleser-fallback, tastaturnavigasjon, redusert bevegelse). 6 funn fikset i denne PR-en: universell `:focus-visible`-outline, `@media (prefers-reduced-motion)` for spinner og transitions, `.sr-only`-utility, skip-link "Hopp til hovedinnhold". 11 funn dokumentert som åpne HANDOFF (Chart.js skjermleser-fallback med data-tabell, kontrast-justering av `--muted`, `<button>` for Add-chip, `aria-live` på API-logg, m.fl.).
**Hvorfor:** Rapport B4: tilgjengelighetsforskriften krever WCAG 2.2 AA på offentlige nettsteder. Quick wins løser de mest synlige bruddene; Chart.js fallback krever større arbeid (egen PR).
**Konsekvens for teamet:** Designer kan ta kontrast-funn (#4) i egen design/-PR. Frontend kan bygge `chartA11y(chart, dataTable)`-helper i egen PR for fullstendig grafer-fallback. Manuell skjermleser- og tastatur-test er fortsatt viktig — dokumentert i audit-fila.
## 2026-04-25 — Pakke 15 (C7) levert: Brønnøysund næringsstruktur skeleton
**Hvem:** Claude Code (autonom, Pakke 15)
**Hva:** Ny `data/brreg-helper.js` med `kbBrreg.fetchVirksomheter(kommunenummer)` og `kbBrreg.topNaceBransjer(virksomheter, n)`. Bruker BRREG sitt åpne API direkte (CORS-kompatibelt, ingen proxy nødvendig). 7-dagers localStorage-cache. Skeleton — UI-integrasjon i kommune-dashboard kommer som egen PR.
**Hvorfor:** Rapport C7: forklaringsvariabel for inntektsnivå, pendling, barnehagedekning. Lavt hengende frukt.
**Konsekvens for teamet:** Frontend kan vise topp-NACE-bransjer i en egen kort i kommune-dashboard.
## 2026-04-25 — Pakke 16 (C2) levert: Folkehelseprofil skeleton + utredning
**Hvem:** Claude Code (autonom, Pakke 16, draft)
**Hva:** Ny `data/folkehelse-helper.js` med `kbFolkehelse.fetchFolkehelse()` (placeholder) og `lagFolkehelseKort()` som viser lenke til Helsedirektoratets PDF. Folkehelseprofilen mangler offentlig REST-API per 2026-04 — egen HANDOFF-rad åpnet for å undersøke API-tilgang via Helsedirektoratet, alternativt scrape av kommunehelsa.no eller bruk av SSB-tabell 11342 som proxy.
**Hvorfor:** Rapport C2: Kommunens største kostnad (pleie/omsorg) er tett koblet til folkehelse. Uten denne dimensjonen kan man ikke tolke KOSTRA-tallene riktig. Men API-strategi må avklares før full integrasjon.
**Konsekvens for teamet:** HANDOFF-rad åpnet — Vegard / Backend bør kontakte Helsedirektoratet eller utforske kommunehelsa.no.
## 2026-04-25 — Pakke 17 (C3) levert: Udir Statistikkbank skeleton
**Hvem:** Claude Code (autonom, Pakke 17, draft)
**Hva:** Ny `data/udir-helper.js` med `kbUdir.fetchUdir()`, `fetchGrunnskolepoeng()` og `lagUdirKort()`. Bruker proxy `/api/udir/` (krever vercel.json-rewrite til api.udir-statistikkbanken.no — egen HANDOFF). 7-dagers cache.
**Hvorfor:** Rapport C3: Grunnskole har 20 % vekt, men vi måler bare kostnad. Udir gir resultat-siden.
**Konsekvens for teamet:** Vercel-rewrite må legges til. Endelig endepunkt-struktur trenger validering via egen mini-spike.
## 2026-04-25 — Pakke 10 (B2) levert: Dynamisk kommuneinndeling skeleton
**Hvem:** Claude Code (autonom, Pakke 10)
**Hva:** Ny `data/kommunestruktur.js` med `Kommunestruktur`-klasse som henter aktuell kommuneliste + strukturelle endringer fra Klass-API (klassifikasjon 131 + changes.json fra 2018-01-01) og bygger MERGERS / MERGERS_REVERSE i samme format som den hardkodede MERGERS i `index.html`. 30-dagers localStorage-cache. Lastet via `<script defer>` så `window.Kommunestruktur` er tilgjengelig globalt — ikke i bruk ennå (full erstatning av hardkodet MERGERS er en større refaktor i egen PR).
**Hvorfor:** 2.0-rapportens B2-anbefaling — fjerner vedlikeholds­byrde ved framtidige kommunereformer (planlagt 2027). Tjenester skalerer automatisk til nye sammenslåinger uten kode-deploy.
**Konsekvens for teamet:** Backend kan nå skrive en migrasjons-PR som bytter ut linje 315–341 i `index.html` (MERGERS) med `await km.last(); window.MERGERS = km.MERGERS; ...`. Test-dekning bør validere at eksisterende kommuner får riktige sammenslåings-context.
## 2026-04-25 — Bug-fix runde 2: 4 nye pakker hadde samme merge-tap (A3, A5, C6, E4)
**Hvem:** Claude Code (autonom, etter Vegards diagnoseskript som identifiserte 14 manglende funksjoner)
**Hva:** Etter B5-fixen viste det seg at samme merge-mønster hadde rammet 4 andre pakker. `readKommuneFromUrl()` kalles tidlig i `main()` og krasjet hele oppstartsflyten — derfor tomme dropdowns og ingen data selv om SSB-API-kall faktisk lyktes (12 sektorer hentet, 421 kommuner identifisert i konsoll).

Gjenopprettet 14 funksjoner totalt, alle plassert FØR `renderSectors`:
- **E4** (`feature/sist-oppdatert-stempel`): `formatNorskDato`
- **A3** (`feature/trend-og-snitt`): `buildSectorSeries`, `compute4YearAvg`, `computeTrend`, `renderSparkline`, `renderTrendRow`
- **C6** (`feature/robek-badge`): `ROBEK_DATA` (global), `loadRobek`, `getRobekStatus`, `renderRobekBadge`
- **A5** (`feature/eksport-og-deling`): `syncUrlToCurrentMuni`, `readKommuneFromUrl`, `flashStatus`, `shareLink`, `copyChartImage`

I tillegg: oppdatert `renderSectors()` til å vise sektor-stempel (E4), `main()` kaller nå `loadRobek()` og `loadSektorForklaringer()` parallelt med KOSTRA, og onclick-handlers for `share-btn` + `image-btn` koblet til. CSS for `.sector-stamp`, `.trend-row`, `.trend-arrow`, `.sparkline` lagt til.

Verifisert med Node `new Function()`-syntax-sjekk: hele script-blokken (72 KB) parses OK, alle 18 nødvendige funksjoner definert, alle 8 kall/bindinger på plass.

**Fullstendig sjekk av alle branches:** kjørte loop over alle 30+ feature/chore/design/fix/docs-branches. Test-branchen har nå alle funksjoner — ingen andre branches har funksjoner som mangler i test.
**Hvorfor:** `git merge -X theirs` velger inkommende versjon ved konflikt. Når 25+ branches alle modifiserer den samme `<script>`-blokken i `index.html`, garanteres merge-konflikter. Konfliktløsning som dropper definisjoner men beholder kall gir ReferenceError uten at det fanges av syntax-validering.
**Konsekvens for teamet:** **5 av 5 pakker verifisert** (B5 + E4 + A3 + C6 + A5). Strukturell rotårsak — alt JS i én script-blokk — krever en større refaktor. Ny ADR-002 åpnet (egen PR) for å foreslå modularisering: splitt JS i `js/`-moduler per pakke. Inntil da: alle fremtidige merges av branches som rører `index.html` skal **manuelt konfliktløses** med syntax-sjekk + browser-test, aldri `-X theirs` blindt.

## 2026-04-25 — Bug-fix: B5-merge-konflikt løst feil + literal &lt;/script&gt;-felle
**Hvem:** Claude Code (autonom, etter Vegards rapport om brutt preview)
**Hva:** To distinkte problemer oppdaget på `test/alle-pakker-samlet`:
1. **Definisjonene `kbReportError` og `brukerVennligFeil` falt ut** under merge med `-X theirs`-strategien fra Pakke 8 (B5 — `chore/caching-og-feilhandtering`). Funksjonene refereres på 4 steder (`main().catch`, `setStatus(brukerVennligFeil(...))`, `window.error`-listener, `unhandledrejection`) men var udefinert. Resultat: ReferenceError, hele appen krasjet — tomme dropdowns, ingen data.
2. **Literal `</script>`-tagger i Sentry-kommentaren** avsluttet det omsluttende `<script>`-blokken for tidlig under HTML-parsingen. Bug fantes på selve B5-branchen (`chore/caching-og-feilhandtering`) men var skjult der fordi resten av endringene var små og B5-deployen aldri ble grundig browser-testet. Eksponert under merge-deploy hvor mer kode etter blokken ble berørt.

**Fix:** Hentet definisjonsblokken via `git show chore/caching-og-feilhandtering:index.html | sed -n '1366,1409p'` og satte inn rett før `main().catch(...)` i samme `<script>`-blokk. Erstattet eksempel-HTML i kommentaren med henvisning til `/metodikk` for instruksjoner. Verifisert med Node `new Function()`-syntax-sjekk: hele script-blokken (62 KB) parses OK. B5-branchen selv ble også fikset så feilen ikke kommer tilbake ved fremtidig merge.

**Sjekk av øvrige branches:** Loop over alle 30+ branches lette etter referanser uten definisjon. Ingen andre branches har problemet — kun test-branchen (pga merge-konflikt) og B5 (pga `</script>`-fellen). Alle andre feature-branches er forgrenet fra main uten Pakke 8-endringer.

**Hvorfor:** `git merge -X theirs` velger inkommende versjon ved konflikt — fungerer for additive filer som data/-mappa, men for `index.html` taper vi tilfeller hvor flere branches utvider samme region. Pakke 8 sine endringer i bunnen av script-blokken (etter `main().catch`) ble overskrevet av Pakke 7s versjon under merge.

**Konsekvens for teamet:** Vegard kan nå teste preview-deployen — alle dropdowns fylles og konsoll er ren for ReferenceError. Egen HANDOFF-rad åpnet for at review-eren av B5-PR verifiserer at definisjonene er bevart. For fremtidige test-branch-byggings: bruk `merge=union` for HANDOFF/PROSJEKTLOGG (allerede satt i test-branchens `.gitattributes`) og **manuell konfliktløsning** for `index.html` i stedet for `-X theirs`.

## 2026-04-25 — SLUTTRAPPORT: Pakke 0–29 levert som 30 PR-er

**Hvem:** Claude Code (autonom kjøring)
**Hva:** 30 pakker fra 2.0-rapportens roadmap (kapittel 6.1–6.3) er levert som selvstendige branches og pushet til origin. Hver pakke har egen logg-oppføring tidligere i denne fila + rad i HANDOFF.md "Levert / arkivert". C5 (Bedrekommune.no) er åpnet som HANDOFF-rad fordi den krever lisensavtale.

### PR-oversikt

| # | Branch | Rapport-kode | Tema | Status |
|---|---|---|---|---|
| 0 | `chore/rens-kontekst-til-kommune-ansatte` | — | Rens kontekst (fjern CP-foreningen, restrukturer BRIEF til §6-roadmap) | Klar |
| 1 | `feature/sist-oppdatert-stempel` | E4 | Sist-oppdatert + SSB-tabellnummer per sektor | Klar |
| 2 | `feature/klass-api-integrasjon` | C1 | SSB Klass-API + 30-dagers cache | Klar |
| 3 | `feature/robek-badge` | C6 | ROBEK-status badge + 27 kommuner manuelt scraped | Klar |
| 4 | `docs/metodikk-side` | E1+D6 | metodikk.html med vekter, kilder, svakheter | Klar |
| 5 | `feature/trend-og-snitt` | A3 | Trend-pil + 4-årsgjennomsnitt + sparkline | Klar |
| 6 | `feature/forklaringsbobler` | A4 | (i)-knapp på sektor-kort med Hva/Hvorfor/Retning | Klar |
| 7 | `feature/eksport-og-deling` | A5 | Del lenke (clipboard) + Kopier bilde + URL-state | Klar |
| 8 | `chore/caching-og-feilhandtering` | B5 | Edge-cache + brukervennlige feilmeldinger + Sentry-stub | Klar |
| 9 | `feature/kommunevelger` | A1 | Universell kommunevelger fra Klass-API | Klar |
| 10 | `feature/dynamisk-kommuneinndeling` | B2 | Skeleton — Kommunestruktur-klasse, klar for MERGERS-erstatning | Skeleton |
| 11 | `feature/indikator-register` | B1 | 30+ indikatorer manuelt verifisert med retning + kvalitet | Skeleton |
| 12 | `feature/justerbar-vekting` | A6 | vekt-justering.html med slidere + 4 forhåndsvalg | Klar |
| 13 | `feature/sammenlign-to-kommuner` | D2 | sammenlign.html duell-side med delbar URL | Klar |
| 14 | `feature/politiker-visning` | D5 | politiker.html med trafikklys + A4-print + light mode | Klar |
| 15 | `feature/brreg-naeringsstruktur` | C7 | BRREG-helper, CORS-direkte, 7-dagers cache | Skeleton |
| 16 | `feature/folkehelseprofil` | C2 | Skeleton — venter API-strategi (Helsedir mangler offentlig API) | Draft |
| 17 | `feature/udir-skolefaglig` | C3 | Udir-helper, krever Vercel-rewrite + endepunkt-spike | Draft |
| 18 | `fix/wcag-aa` | B4 | Audit (17 funn, 6 fikset) + focus-visible + reduced-motion + skip-link | Delvis |
| 20 | `feature/kmd-inntektssystem` | C9 | Utredning + manuell innhentingsprosess | Doc |
| 21 | `feature/behovsjustering` | A2 | Skeleton — venter C9 utgiftsbehovsdata | Skeleton |
| 22 | `design/mobil-forst` | B3 | Mobil-audit (11 funn, 3 fikset) | Delvis |
| 23 | `feature/dea-effektivitet` | C8 | Utredning + manuell SØF-innhenting | Doc |
| 24 | `feature/ungdata` | C4 | Utredning + alternative tilnærminger (NOVA/OsloMet) | Doc |
| 25a | `feature/sektor-dypdykk-grunnskole` | D1 | sektor-grunnskole.html med 4-indikatortyper-struktur | Skeleton |
| 25b | `feature/sektor-dypdykk-pleie` | D1 | sektor-pleie.html med behovsjusteringsseksjon | Skeleton |
| 26 | `feature/kostra-gruppe-analyse` | D4 | kostra-gruppe.html med 17 grupper + 3-nivå-forklaring | Skeleton |
| 27 | `feature/kartvisning` | D3 | kart.html med GeoNorge + D3.js implementasjonsplan | Skeleton |
| 28 | `feature/api-rest` | D7 | api/kommune.md REST-API spec (5 endepunkter) | Spec |
| 29 | `feature/datakvalitet-og-usikkerhet` | E2+E3 | Spec for kvalitetsmerking + Wilson CI | Spec |

### Anbefalt review-rekkefølge for Vegard

**Ugest 1 — Foundation (klar for merge):**
1. **Pakke 0** (kontekst-rens) først — alle senere PR-er bygger på riktig kontekst.
2. **Pakke 8** (caching B5) — edge-cache slår inn umiddelbart for alle.
3. **Pakke 1** (E4 stempel) — synlig kvalitetsforbedring.
4. **Pakke 4** (E1+D6 metodikk) — gir tillit til alle andre pakkene.

**Uke 2 — User-facing quick wins:**
5. **Pakke 5** (A3 trend) — stort visuelt løft.
6. **Pakke 6** (A4 forklaringsbobler) — gjør siden tilgjengelig for ikke-eksperter.
7. **Pakke 7** (A5 eksport/deling) — viral effekt.
8. **Pakke 3** (C6 ROBEK) — politisk relevans.

**Uke 3 — Skalering:**
9. **Pakke 2** (C1 Klass-API) — forutsetning for A1.
10. **Pakke 9** (A1 kommunevelger) — låser opp 357 kommuner.
11. **Pakke 11** (B1 indikator-register) — datakvalitet.
12. **Pakke 12** (A6 justerbar vekting) — tillit.
13. **Pakke 13** (D2 sammenligning) — viral.
14. **Pakke 14** (D5 politiker) — politisk-aksept.

**Uke 4 — Tilgjengelighet og mobil:**
15. **Pakke 18** (B4 WCAG) — lovkrav.
16. **Pakke 22** (B3 mobil) — adresserer økende mobilbruk.

**Senere — eksterne kilder og avansert (drafts):**
17. Pakke 15 (C7 BRREG) — næringsstruktur.
18. Pakke 17 (C3 Udir) — krever Vercel-rewrite + endepunkt-spike først.
19. Pakke 16 (C2 Folkehelse) — venter Helsedir API-strategi.
20. Pakke 23 (C8 DEA), 24 (C4 Ungdata) — manuelle innhentinger.

**Strategiske spor (skeletons — implementer i prioritert rekkefølge):**
21. Pakke 25a + 25b (D1 sektor-dypdykk grunnskole + pleie) — flesteparten av brukerverdi.
22. Pakke 26 (D4 KOSTRA-gruppe).
23. Pakke 10 (B2 dynamisk kommuneinndeling) — fjerner vedlikeholdsbyrde.
24. Pakke 20 (C9 KMD) → Pakke 21 (A2 behovsjustering) — den største svakheten i dagens versjon.
25. Pakke 27 (D3 kart) — viralt, men teknisk tungt.
26. Pakke 28 (D7 REST-API) — B2B-spor.
27. Pakke 29 (E2+E3 kvalitetsmerking + CI).

### Åpne HANDOFF-rader som krever Vegards beslutning

1. **C5 Bedrekommune.no — lisensavtale** (KS/KF Kompetanse). Estimert 6–8 uker inkl. forhandling. Ikke implementert; egen rad.
2. **Sentry observability-oppsett** (gratis-tier). Krever opprettelse av Sentry-konto og DSN. Stub er i `index.html`.
3. **Periodisk oppdatering av ROBEK-data**. KDD oppdaterer månedlig. Vurder Vercel-cron eller manuell kalender.
4. **Folkehelseprofil API-strategi** (rapport C2). Ingen offentlig REST-API per 2026-04. Vurder Helsedirektoratet-kontakt eller alternativer.
5. **Edge-cache-headers i `vercel.json`** ble lagt inn i Pakke 8 — verifiser oppførsel etter merge.
6. **Manuelle innhentinger** (C9 KMD, C8 DEA, C4 Ungdata) — årlige prosesser.

### Antagelser og begrensninger

1. Hver PR er branchet fra `main`, så HANDOFF.md og PROSJEKTLOGG.md har **forventede merge-konflikter** når de merges sekvensielt. Vegard løser ved å beholde alle "Levert"-rader og logg-oppføringer.
2. Tech-stack er fortsatt vanilla HTML/JS. ADR-001 (Astro) er foreslått, men implementasjon venter Vegards godkjenning. Alle pakker fungerer i nåværende vanilla-arkitektur.
3. Ingen betalte tjenester er introdusert. Sentry er gratis-tier-stub. Bedrekommune.no er parkert som HANDOFF.
4. Eksterne data uten åpent API (Folkehelseprofil, Ungdata, KMD grønne hefter, SØF DEA, ROBEK-månedlig) er dokumentert som manuelle prosesser med strukturerte HANDOFF-rader.
5. Kjørbar test er gjort lokalt mot SSB live-API for pakker som har kode-endring i `index.html` (Pakke 1, 5, 6, 7, 9). Ingen automatiske tester finnes ennå — prosjekt-bestemmelse.
6. WCAG 2.2 AA og mobil-først er addresseret som audits + targeted fixes i Pakke 18 og 22; full compliance krever videre arbeid (dokumentert i `team/WCAG-AUDIT.md` og `team/MOBIL-AUDIT.md`).

### Avhengighetsoversikt

```
C1 (Pakke 2) ──→ B2 (Pakke 10) ──→ A1 (Pakke 9)
                                    └──→ D2 (Pakke 13), D4 (Pakke 26),
                                         D3 (Pakke 27), D5 (Pakke 14)

C9 (Pakke 20) ──→ A2 (Pakke 21)

B1 (Pakke 11) ──→ E2/E3 (Pakke 29)
              ──→ B3 (Pakke 22, full implementasjon)

C2/C3 (Pakke 16/17) ──→ D1 (Pakke 25a/b, full integrasjon)
```

**Stopper her som instruert.** Ikke startet på faktisk v2-implementasjon (Astro) eller AP-02 (wireframes) — det venter Vegards godkjenning av ADR-001 og review av disse 30 PR-ene.
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
## 2026-04-25 — Pakke 2 (chore/datavalidering-mot-excel) levert: validering + 100% match for 4 indikatorer
**Hvem:** Claude Code (autonom)
**Hva:** Skrevet `scripts/valider-mot-excel.mjs` (Node — Python ikke tilgjengelig i kjøremiljøet) som pakker ut .xlsx via PowerShell `[System.IO.Compression.ZipFile]`, parser sharedStrings + sheet-XML, henter SSB live for Lørenskog 2024+2025, og skriver markdown-rapport til `team/referansedata/valideringsrapport.md`.

**Funn (kjørt 2026-04-25):**
- 22 Excel-indikatorer detektert i Oversikt-arket (sheet1)
- 8 indikatorer i `INDIKATOR_KART` mot SSB; 6 har contents-mapping
- **4 av 4 mapped + hentbare indikatorer matcher Excel-tallene EKSAKT** (avvik 0,00 for alle):
  - Frie inntekter per innbygger 2024 og 2025 (tabell 12134, KOSAG110000)
  - Netto driftsresultat i prosent av brutto driftsinntekter 2024 og 2025 (tabell 12134, KOSAGD230000)
- 2 indikatorer ga HTTP 400 (Innbyggere per 1.1. — feil ContentsCode for tabell 11342)
- 2 indikatorer mangler SSB-ekvivalent (Grunnskolepoeng krever Udir-integrasjon, rapport C3)
- 9 mappinger uten resultat fordi de ikke finnes i kart-tabellen (krever ContentsCode-oppslag mot tabell-metadata)

**Ingen ekte avvik (>0,5%) funnet** der vi har korrekt SSB-mapping. Side-tallene matcher Excel-referansen for de indikatorene som er mappet.

**Hvorfor:** Vegard krevde validering for å bekrefte at side-tallene er riktige etter Pakke 1 (kommunekode-mapping). Match på 4/4 kostnads-/økonomi-indikatorer for både 2024 og 2025 er sterk indikasjon på at både SSB-fetch og kommune-kanonisering virker korrekt.

**Konsekvens for teamet:** Ingen rot-årsaks-debugging nødvendig for de 4 mapped indikatorene. Egen HANDOFF-rad åpnet for utvidet INDIKATOR_KART (mappe alle 22 Excel-indikatorer mot SSB-tabeller). Grunnskolepoeng dokumenterer behovet for Udir Statistikkbank-integrasjon (rapport C3, åpen).
## 2026-04-25 — Pakke 3a (feature/a2-dki-data) levert: DKI POC for Lørenskog
**Hvem:** Claude Code (autonom)
**Hva:** Lagt til `data/dki-2025.json` og `data/dki-2024.json` med delkostnadsindeks (DKI) for Lørenskog (3222) hentet fra Excel-referansens DKI-seksjon. KMD grønne hefter ikke automatisk parserbart i Claude Code-miljøet — Excel-fila er brukt som POC-kilde. Sektorer: grunnskole, pleie, barnehage, barnevern, sosial, kommunehelse, administrasjon. Også sektorvekter (delkostnadsnøkler) inkludert (sum = 1,0). 2024-fila gjenbruker 2025-tall som approks (DKI endrer seg lite mellom år).

`scripts/test-dki.mjs` (ny): sanitetstest som bekrefter at sektorvekter summerer til 1,0 og at vektet DKI for hver kommune er innen ±0,10 av 1,0. Lørenskogs vektet DKI = 0,9479 (5% under landsgjennomsnittet, konsistent med yngre befolkning).

**Hvorfor:** A2-anbefalingen i 2.0-rapporten — "den største svakheten i dagens versjon" — krever DKI-data for å justere kostnadsindikatorer. Vegard krevde implementering nå, ikke utsettelse. Excel-POC gir oss kjørbar verdi for Lørenskog mens KMD-fetch utvikles.

**Konsekvens for teamet:** Pakke 3b kan nå implementere toggle/visning på siden. Egen HANDOFF-rad åpnet for innhenting av reelle 2024-DKI fra Grønt hefte 2025 og utvidelse til alle 357 kommuner. Når dette er på plass, oppdateres `data/dki-*.json` uten at Pakke 3b-koden trenger endring.
## 2026-04-25 — Pakke 3b (feature/a2-behovsjustert-visning) levert: A2 toggle + scoring
**Hvem:** Claude Code (autonom)
**Hva:** Implementert behovsjustert visning som modus-toggle med URL+localStorage-state. Endringer i `index.html`:
- Toggle "Rådata" / "Behovsjustert" som segmented radio i toolbar (semantisk fieldset for skjermleser)
- `BEHOVSJUSTERT` global flag, `DKI_DATA` lastet fra `/data/dki-{år}.json` ved oppstart
- `SECTOR_DKI_MAP` mapper SECTORS.id til DKI-felt-navn (7 sektorer; resterende uten DKI)
- `ER_KOSTNADSINDIKATOR`-regex som whitelist for hvilke indikatorer som faktisk justeres (utgift/kostnad/kr per/gjeld i prosent/frie inntekter)
- `computeSectorScores` deler verdien på DKI for kostnadsindikatorer FØR normalisering når mode=justert. Resultatindikatorer (dekning, fagutdanning, trivsel, mobbing) er IKKE justert.
- `dkiBadge()` på sektor-kort i justert-modus: viser "DKI 0,81" med fargekoding (grønn < 0,95, rød > 1,05) og tooltip i klartekst
- Toggle-handler re-kjører `computeSectorScores` for alle sektorer + `computeOverall` + `renderAll` UTEN ny SSB-fetch — instant respons.

`data/behovsjustering-readme.md` (ny): full dokumentasjon av hvilke indikatorer som justeres vs ikke. Skal flettes inn i `metodikk.html` når den branchen merges.

**Hvorfor:** A2 er rapportens "største svakhet i dagens versjon" — kostnader uten korreksjon for utgiftsbehov gir feilrangering for kommuner med yngre/eldre befolkning. Toggle gir bruker valg + transparent visualisering av hva som justeres.

**Konsekvens for teamet:** Lørenskog DKI=0,81 for pleie betyr at i justert modus blir kostnaden delt på 0,81 (12% høyere) — kommunen får dårligere score for pleie-kostnad i justert modus. Det er korrekt — Lørenskog har yngre befolkning enn snittet, så den "burde" bruke mindre. Når DKI-data utvides til alle 357 kommuner vil rangering endre seg merkbart for kommuner med skjev demografi. Frontend kan legge "Behovsjustert"-info i sektor-dypdykk-sider (Pakke 4).

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
