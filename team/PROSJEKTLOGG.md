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

## 2026-04-25 — BRIEF-suksesskriterier forankret i 2.0-rapporten og KOSTRA-dypdykket
**Hvem:** Claude Code (autonom kjøring på vegne av Vegard, Pakke 0)
**Hva:** Lest begge rapportene (`Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx`, kapittel 5–6 + roadmap A/B/C/D/E; og `KOSTRA-oversikt-og-dypdykk.docx`, kapittel 2–6). Tekstuttrekk gjort med PowerShell `[System.IO.Compression.ZipFile]::ExtractToDirectory()` mot `word/document.xml` — ingen Word-installasjon nødvendig. Justert `BRIEF.md`: 5 må-ha → 8 må-ha (lagt til indikator-register med eksplisitt retning, trend-pil, sist-oppdatert-stempel, edge-caching). 8 bør-ha med behovsjustering (A2), justerbar vekting, politiker-modus, ROBEK, dynamisk Klass-API, kart, m.fl. WCAG 2.1 AA → 2.2 AA. Lagt inn egen v2.x-seksjon for eksterne kilder (FHI, Udir, Ungdata, Brønnøysund, DEA, KMD) som panelet flagget som kritisk men utenfor MVP. Eksplisitt utenfor scope: Bedrekommune.no (lisens), SSB mikrodata, API-/abonnement-spor.
**Hvorfor:** CEO-rapportens hovedbudskap er at "KOSTRA alene er utilstrekkelig" og at metodikken må være transparent og justerbar. KOSTRA-rapporten understreker at sammenligning skal skje mot egen utvikling, KOSTRA-gruppe og landet uten Oslo — ikke bare landssnitt. Forrige BRIEF (2026-04-24) var skissert før rapportene var lest og hadde gap på datakvalitet (regex-heuristikk for retning), kontekst (ingen behovsjustering), trend (kun ettårsverdier) og transparens (skjult metodikk).
**Konsekvens for teamet:** Tech Lead kan nå starte AP-01 ADR med rapport-anbefalingene som grunnlag. UX/UI-designer (AP-02) bør tegne både "ekspertvisning" og "politiker-modus" (D5). Fullstack (AP-04) skal i SSB-spike også teste Klass-API (klassifikasjon 131) for kommuneinndeling — ikke bare KOSTRA-tabeller. Release Manager (AP-03) bør planlegge edge-caching som del av Vercel-oppsettet. Alle nye må-ha skal kunne spores tilbake til en konkret rapport-anbefaling.

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
