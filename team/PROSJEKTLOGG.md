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

## 2026-04-25 — AP-01 v2-arkitektur ADR levert (anbefaling: Astro)
**Hvem:** Claude Code (autonom, Pakke 3, Tech Lead-rolle)
**Hva:** Skrevet `team/adr/001-v2-arkitektur.md` med Context / Decision / Alternatives considered / Consequences-format. Vurdert fire alternativer: (A) forbli vanilla HTML, (B) Astro med islands [anbefalt], (C) Vite + Preact, (D) Next.js. Anbefaling Astro begrunnet i AP-04-funn (SSG passer for data oppdatert 2x/år, islands-arkitektur lar oss laste Chart.js bare der det trengs, filbasert routing skalerer naturlig til 12 sektorer × 357 kommuner). Eksplisitt akseptert trade-off: build-steg innføres, bryter v1-prinsippet "ingen build-steg" — gevinst (FCP <200ms, skalerbarhet, vedlikeholdbarhet) overstiger kostnaden (npm install, lockfile). Implementasjonsplan skissert i 4 steg, hver som egen PR. **Implementasjon ikke startet i denne PR-en — venter Vegards eksplisitte OK på ADR.** BRIEF.md sin tech-stack-seksjon **er ikke oppdatert** — det skjer i steg 1 av implementasjonen etter godkjenning.
**Hvorfor:** v2-rapportenes ambisjonsnivå (8 må-ha + 8 bør-ha med flere ruter, flere visninger, eksterne datakilder i v2.x) gjør at status quo (én 1500-linjers `index.html`) ikke skalerer. Astro gir oss en migrasjonsvennlig vei: v1-koden kan portes bit for bit, og vi kan beholde vanilla HTML/JS som hovedspråk i template og scripts.
**Konsekvens for teamet:** UX/UI-designer (AP-02) kan begynne å tegne wireframes med vissheten om at Astro støtter SSG + islands. Release Manager (AP-03) bør oppdatere DEPLOY.md med build-kommando når implementasjonen starter. Frontend (når rollen aktiveres) får en tydelig fil-routing-modell å bygge mot. Hvis Vegard avviser eller justerer ADR-en: ny ADR-runde + plan tilpasses før implementasjon. Hvis Vegard godkjenner: åpne `feature/astro-init`-branch som første implementasjons-PR.

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
