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
