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

## 2026-04-25 — AP-03 Repo- og Vercel-hygiene levert
**Hvem:** Claude Code (autonom, Pakke 2, Release Manager-rolle)
**Hva:** Opprettet `.gitattributes` med `* text=auto eol=lf` (eliminerer CRLF/LF-warnings på tvers av OS) og eksplisitte tekst/binær-flagg for vanlige filtyper. Utvidet `.gitignore` med `.env*`, `node_modules/`, `.vercel/`, `dist/`, `.next/`, `desktop.ini`, `*.swo`. Skrevet `team/DEPLOY.md` med branch-strategi (6 prefikser), deploy-flyt (lokal → preview → PR → main → produksjon), tre rollback-strategier, Vercel-konfigurasjon-status, `.gitattributes`/`.gitignore`-rasjonale, og 6 manuelle sjekkpunkter for Vegard. Inkludert AP-04-anbefaling om edge-cache-headers i `vercel.json` (ikke implementert i denne PR-en — Vegard avgjør timing). `gh` CLI er ikke tilgjengelig i Claude Code-miljøet, så GitHub branch-protection-instillinger må Vegard verifisere manuelt.
**Hvorfor:** Repo-hygiene er forutsetning for at flere agenter kan jobbe parallelt uten å overskrive hverandre eller spore ned line-ending-bugs i diff-er. DEPLOY.md gir Release Manager-rollen et tydelig løp og sikrer at Vegards manuelle verifikasjoner ikke faller mellom to stoler.
**Konsekvens for teamet:** Alle nye PR-er får automatisk normalisert line endings via `.gitattributes`. Vegard har en sjekkliste å gå gjennom i Vercel/GitHub før AP-02 (wireframes) eller v2-implementasjon starter. Tech Lead (AP-01) kan referere til DEPLOY.md for deploy-konsekvenser av arkitekturvalg.

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
