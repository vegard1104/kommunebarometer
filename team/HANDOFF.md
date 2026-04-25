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
| Prosjektleder | Tech Lead | **AP-01 — v2-arkitektur ADR.** Beslutt om vi blir på vanilla HTML/JS eller flytter til et lett framework (Vite+React/Preact, Astro, eller annet). Vurder: 357 kommuner skal støttes, dypdykk-skjermer, mobil-ytelse, vedlikeholdbarhet, deploy-enkelhet. Skriv ADR som låser valget. Oppdater `team/BRIEF.md` sin tech-stack-seksjon. | `team/adr/001-v2-arkitektur.md` (ny) | Nei | 2026-04-24 |
| Prosjektleder | UX/UI-designer | **AP-02 — Informasjonsarkitektur + wireframes.** Design tre skjermer: (1) landing/kommune-velger for 357 kommuner, (2) kommune-dashboard (utvidelse av dagens Lørenskog-skjerm), (3) dypdykk per KOSTRA-område. Bekreft/utvid `team/DESIGN-TOKENS.md`. Output: lav-fi wireframes + tokens-fil. | `team/wireframes/` (ny), `team/DESIGN-TOKENS.md` | Nei | 2026-04-24 |
| Prosjektleder | Release Manager | **AP-03 — Repo- og Vercel-hygiene.** Bekreft at `kommunebarometer-github-upload` er kobla til GitHub-remote og Vercel-prosjekt. Branch-protection på `main`. Preview-deploy på alle PR-er. Dokumenter i `team/DEPLOY.md` (ny). Ingen endringer i produksjon uten Vegards godkjenning. | `team/DEPLOY.md` (ny) | Nei | 2026-04-24 |

> **Merknad til alle:** De fire arbeidspakkene er forhånds-skissert av Claude (bootstrap). Prosjektleder kan åpne dem som de er, justere, eller holde igjen til rapportene er lest. Hvis en AP endres, oppdater raden her og logg endringen i PROSJEKTLOGG.

## I arbeid

_(tom)_

## Levert / arkivert

| Fra | Til | Oppgave | Artefakt | Levert |
|---|---|---|---|---|
| Prosjektleder | Fullstack | **AP-04 — Data-spike SSB PxWeb for alle kommuner.** Spike kjørt mot 3 kommuner først, så alle 839 kommune-koder fra tabell 12134. Målt p50=620ms, p95=757ms cold. Single batch ikke mulig (URL >4000 tegn → 404). Sweet spot: batchSize 100–200, concurrency 1, total 3–4s for hele datasettet. Anbefalt strategi: edge-cache `s-maxage=86400` + pre-compute via Vercel cron for topp-10/kart. Feilmodi-håndtering dokumentert. | `team/API-KONTRAKT.md` (ny seksjon "Datalast — alle kommuner"), `spike/ssb-spike.mjs`, `spike/batch-sweet-spot.mjs`, `spike/results/*.json`, branch `spike/ssb-alle-kommuner` | 2026-04-25 |
