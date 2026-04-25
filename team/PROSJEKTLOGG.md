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
