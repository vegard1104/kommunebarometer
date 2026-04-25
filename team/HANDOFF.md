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
| Prosjektleder | Tech Lead | **AP-01 — v2-arkitektur ADR.** Beslutt om vi blir på vanilla HTML/JS eller flytter til et lett framework (Vite+React/Preact, Astro, eller annet). Vurder: 357 kommuner skal støttes, dypdykk-skjermer, mobil-ytelse, vedlikeholdbarhet, deploy-enkelhet. Skriv ADR som låser valget. Oppdater `team/BRIEF.md` sin tech-stack-seksjon. | `team/adr/001-v2-arkitektur.md` (ny) | Nei | 2026-04-24 |
| Prosjektleder | UX/UI-designer | **AP-02 — Informasjonsarkitektur + wireframes.** Design fire skjermer: (1) landing/kommune-velger for 357 kommuner, (2) kommune-dashboard (utvidelse av dagens Lørenskog-skjerm), (3) sektor-dypdykk for grunnskole + pleie/omsorg (rapport D1), (4) "politiker-modus" — forenklet RØDT/GULT/GRØNT-visning (rapport D5). Bekreft/utvid `team/DESIGN-TOKENS.md` med fargesvaksynt-trygg palett. Output: lav-fi wireframes + tokens-fil. **Vent på AP-01 ADR før detaljert UI.** | `team/wireframes/` (ny), `team/DESIGN-TOKENS.md` | Nei | 2026-04-25 |
| Prosjektleder | Release Manager | **AP-03 — Repo- og Vercel-hygiene.** Bekreft at repo er kobla til Vercel-prosjekt. Branch-protection på `main`. Preview-deploy på alle PR-er. Dokumenter i `team/DEPLOY.md` (ny). Edge-caching for SSB-respons (s-maxage 24h, jf. rapport B5). | `team/DEPLOY.md` (ny), `.gitattributes` | Nei | 2026-04-24 |
| Prosjektleder | Fullstack | **AP-04 — Data-spike SSB PxWeb for alle kommuner.** Verifiser at `/api/ssb/*`-rewriten kan hente data for 357 kommuner. Test 3 kommuner først, så batch. Test også Klass-API (klassifikasjon 131) for kommuneinndeling (rapport B2). Dokumenter funn + caching-strategi i `team/API-KONTRAKT.md` under ny seksjon "Datalast — alle kommuner". | `team/API-KONTRAKT.md`, spike-branch `spike/ssb-alle-kommuner` | Nei | 2026-04-24 |

## I arbeid

_(tom)_

## Levert / arkivert

| Fra | Til | Oppgave | Artefakt | Levert |
|---|---|---|---|---|
| Bootstrap | Prosjektleder | **Pakke 0 — Verifiser BRIEF mot rapportene.** Lest 2.0-rapport + KOSTRA-dypdykket. BRIEF utvidet til 8 må-ha + 8 bør-ha med rapport-sporbarhet (A1, B1, A3, E4, B5, ...). WCAG 2.1 → 2.2 AA. v2.x-seksjon for eksterne kilder. | `team/BRIEF.md` (oppd.), `team/PROSJEKTLOGG.md` (logg), branch `chore/verifiser-brief-mot-rapporter` | 2026-04-25 |
