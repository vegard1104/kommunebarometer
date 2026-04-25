# Handoff-kø

Liste over pågående handoffs mellom agenter. Én aktiv handoff per rad.
Når du har tatt over en oppgave og begynt å jobbe, flytt raden til "I arbeid".
Når du er ferdig og leverer videre, legg til ny rad under "Åpne".

Format:
- **Fra → Til:** Hvem leverer til hvem
- **Oppgave:** Kort beskrivelse
- **Artefakt:** Hvor ligger det (branch, fil, PR)
- **Lest av mottaker?:** Ja/Nei
- **Opprettet:** Dato

---

## Åpne (venter på mottaker)

| Fra | Til | Oppgave | Artefakt | Lest? | Opprettet |
|---|---|---|---|---|---|
| Bootstrap | Prosjektleder | **Oppstart:** Les 2.0-rapporten + KOSTRA-dokumentet. Verifiser/juster de foreløpige suksesskriteriene i BRIEF.md. Logg endringer i PROSJEKTLOGG. Åpne de fire arbeidspakkene nedenfor for teamet når du har gjort dette. | `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx`, `KOSTRA-oversikt-og-dypdykk.docx`, `team/BRIEF.md` | Nei | 2026-04-24 |
| Prosjektleder | UX/UI-designer | **AP-02 — Informasjonsarkitektur + wireframes.** Design tre skjermer: (1) landing/kommune-velger for 357 kommuner, (2) kommune-dashboard (utvidelse av dagens Lørenskog-skjerm), (3) dypdykk per KOSTRA-område. Bekreft/utvid `team/DESIGN-TOKENS.md`. Output: lav-fi wireframes + tokens-fil. | `team/wireframes/` (ny), `team/DESIGN-TOKENS.md` | Nei | 2026-04-24 |


> **Merknad til alle:** De fire arbeidspakkene er forhånds-skissert av Claude (bootstrap). Prosjektleder kan åpne dem som de er, justere, eller holde igjen til rapportene er lest. Hvis en AP endres, oppdater raden her og logg endringen i PROSJEKTLOGG.

## I arbeid

_(tom)_

## Levert / arkivert

| Fra | Til | Oppgave | Artefakt | Levert |
|---|---|---|---|---|
| Prosjektleder | Tech Lead | **AP-01 — v2-arkitektur ADR.** ADR-001 skrevet med Context/Decision/Alternatives/Consequences. Anbefaling: **Astro 4.x med Chart.js og SheetJS som islands**, begrunnet i AP-04-funn (SSG passer data oppdatert 2x/år) og rapportenes skaleringskrav (12 sektorer × 357 kommuner). Tre alternativer vurdert: vanilla HTML, Vite+Preact, Next.js — alle avvist med eksplisitt begrunnelse. Implementasjonsplan i 4 steg. **Implementasjon ikke startet — venter Vegards eksplisitte godkjenning av ADR.** BRIEF tech-stack-seksjon ikke oppdatert ennå (skjer i steg 1 av implementasjonen). | `team/adr/001-v2-arkitektur.md`, branch `docs/adr-001-v2-arkitektur` | 2026-04-25 |
