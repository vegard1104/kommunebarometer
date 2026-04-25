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

## 2026-04-25 — AP-04 SSB-spike: målt p50/p95, batching-strategi anbefalt
**Hvem:** Claude Code (autonom, Pakke 1, Fullstack-rolle)
**Hva:** Bygd Node-spike i `spike/ssb-spike.mjs` + `spike/batch-sweet-spot.mjs`. Testet smoke (3 kommuner), Klass-API (kommuneliste), tabell-metadata, single batch (alle), sekvensiell (n=30), parallelle batcher (3 strategier), feilmodi (5 cases). Funn: **p50=620 ms, p95=757 ms** for én kommune cold; **batchSize 100–200, concurrency 1** er trygt; **single batch ikke mulig** pga URL-grense ~4000 tegn (839 kommune-koder gir 4365 tegn → 404 i IIS); **rate-limit 429** ved ≥3 samtidige; **Klass-API gir 358 koder, tabellens metadata gir 839** (historiske + nåværende) — bruk metadata for å unngå "Non-existent value". Total tid for hele datasettet: 3–4 sekunder. Strategi-anbefaling skrevet i `API-KONTRAKT.md` under ny seksjon "Datalast — alle kommuner".
**Hvorfor:** AP-01 (arkitektur-ADR) trenger empiriske ytelsestall for å begrunne valg av build-step / framework / caching-strategi. Brukeropplevelsen for v2 avhenger kritisk av om vi kan levere kommunebytte i <1 s — uten edge-cache og pre-compute er det ikke mulig.
**Konsekvens for teamet:** Tech Lead (AP-01) kan nå skrive ADR med konkrete tall i begrunnelsen. Release Manager (AP-03) bør sette `Cache-Control: s-maxage=86400, stale-while-revalidate=604800` på `/api/ssb/*` i `vercel.json` — utkast lagt i API-KONTRAKT-dokumentet. Frontend-arbeid (når det starter) skal bruke tabellens metadata-regions-liste, ikke Klass, for å bygge query-koder. Pre-compute av "topp-10", kart-data og KOSTRA-gruppe-aggregater må ligge i Vercel cron / serverless function — ikke i request-path.

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
