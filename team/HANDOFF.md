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
| Pakke 8 | Vegard / DevOps | **Sentry observability-oppsett.** Sentry-stub er klart i `index.html` via `kbReportError()` + `window.error`-handlers. For å aktivere: opprett Sentry-konto (gratis-tier, ~5000 events/mnd), opprett prosjekt for Kommunebarometer, kopier DSN. Legg inn 2 CDN-script-tags i `<head>` av `index.html`: Sentry bundle + `Sentry.init({dsn: "..."})`. Ingen kode-endring i resten av appen. | `index.html` (kbReportError er allerede klar) | Nei | 2026-04-25 |
| Prosjektleder | UX/UI-designer | **AP-02 — Informasjonsarkitektur + wireframes.** Design fire skjermer: (1) landing/kommune-velger for 357 kommuner, (2) kommune-dashboard (utvidelse av dagens Lørenskog-skjerm), (3) sektor-dypdykk for grunnskole + pleie/omsorg (rapport D1), (4) "politiker-modus" — forenklet RØDT/GULT/GRØNT-visning (rapport D5). Bekreft/utvid `team/DESIGN-TOKENS.md` med fargesvaksynt-trygg palett. Output: lav-fi wireframes + tokens-fil. **Vent på Vegards godkjenning av ADR-001 før detaljert UI.** | `team/wireframes/` (ny), `team/DESIGN-TOKENS.md` | Nei | 2026-04-25 |

> **Merknad til alle:** Pakke 0–3 (AP-01, AP-03, AP-04 + BRIEF-forankring) er levert av Claude Code i autonom kjøring 2026-04-25 og merget til main av Vegard. AP-02 venter på Vegards godkjenning av ADR-001 (v2-arkitektur) før det aktiveres.

## I arbeid

_(tom)_

## Levert / arkivert

| Fra | Til | Oppgave | Artefakt | Levert |
|---|---|---|---|---|
| Bootstrap | Prosjektleder | **Kontekst-rens.** Fjernet feilaktig CP-foreningen/fundraising/påvirknings-kontekst i CLAUDE.md, BRIEF.md, DESIGN-TOKENS.md, agents/05-ux-ui-designer.md. BRIEF restrukturert mot 2.0-rapportens roadmap (§6.1 quick wins, §6.2 medium, §6.3 strategisk). Sluttbrukerne er kommunalt ansatte og innbyggere/politikere. | branch `chore/rens-kontekst-til-kommune-ansatte` | 2026-04-25 |
| DevOps | Prosjektleder | **Pakke 8 (B5) — Edge-cache + brukervennlige feilmeldinger + Sentry-stub.** vercel.json med 3 Cache-Control-regler. kbReportError + brukerVennligFeil-helpers. window.error/unhandledrejection-handlers. Sentry-stub klart for DSN. | `vercel.json`, `index.html`, branch `chore/caching-og-feilhandtering` | 2026-04-25 |
| Frontend | Prosjektleder | **Pakke 1 (E4) — Sist-oppdatert-stempel per sektor.** Hver sektor viser `Sist oppdatert {dato} · SSB tabell {id}` med klikkbar lenke til SSB StatBank. `loadSector` returnerer `tableUpdated`/`tableLabel`. Helpers: `formatNorskDato`, `escapeHtml`. CSS: `.sector-stamp`. | `index.html`, branch `feature/sist-oppdatert-stempel` | 2026-04-25 |
| Frontend | Prosjektleder | **Pakke 4 (E1+D6) — Metodikk-side.** Ny `metodikk.html` med 6 seksjoner (oversikt, beregning, vekter med begrunnelse, datakilder, kjente svakheter, endringslogg). Token-konsistent styling. Lenket fra index-footer. | `metodikk.html`, `index.html`, branch `docs/metodikk-side` | 2026-04-25 |
| Bootstrap | Prosjektleder | **Pakke 0 — Verifiser BRIEF mot rapportene.** Lest 2.0-rapport + KOSTRA-dypdykket. BRIEF utvidet til 8 må-ha + 8 bør-ha med rapport-sporbarhet (A1, B1, A3, E4, B5, ...). WCAG 2.1 → 2.2 AA. v2.x-seksjon for eksterne kilder (FHI, Udir, Ungdata m.fl.). | `team/BRIEF.md` (oppd.), `team/PROSJEKTLOGG.md`, PR #3 (`chore/verifiser-brief-mot-rapporter`) | 2026-04-25 |
| Prosjektleder | Tech Lead | **AP-01 — v2-arkitektur ADR.** ADR-001 skrevet med Context/Decision/Alternatives/Consequences. Anbefaling: **Astro 4.x med Chart.js og SheetJS som islands**, begrunnet i AP-04-funn og rapportenes skaleringskrav (12 sektorer × 357 kommuner). Tre alternativer vurdert: vanilla HTML, Vite+Preact, Next.js — alle avvist med eksplisitt begrunnelse. Implementasjonsplan i 4 steg. **Implementasjon ikke startet — venter Vegards eksplisitte godkjenning av ADR.** | `team/adr/001-v2-arkitektur.md`, PR #5 (`docs/adr-001-v2-arkitektur`) | 2026-04-25 |
| Prosjektleder | Release Manager | **AP-03 — Repo- og Vercel-hygiene.** `.gitattributes` (LF-normalisering) lagt til. `.gitignore` utvidet (.env, node_modules, .vercel, etc). `team/DEPLOY.md` skrevet med branch-strategi, deploy-flyt, rollback (3 strategier), Vercel-konfigurasjon, og 6 manuelle sjekkpunkter for Vegard. Edge-cache-anbefaling fra AP-04 dokumentert (ikke implementert i PR-en). | `team/DEPLOY.md`, `.gitattributes`, `.gitignore`, PR #4 (`chore/repo-og-vercel-hygiene`) | 2026-04-25 |
| Prosjektleder | Fullstack | **AP-04 — Data-spike SSB PxWeb for alle kommuner.** Spike kjørt mot 3 kommuner først, så alle 839 kommune-koder fra tabell 12134. Målt p50=620ms, p95=757ms cold. Single batch ikke mulig (URL >4000 tegn → 404). Sweet spot: batchSize 100–200, concurrency 1, total 3–4s for hele datasettet. Anbefalt strategi: edge-cache `s-maxage=86400` + pre-compute via Vercel cron for topp-10/kart. Feilmodi-håndtering dokumentert. | `team/API-KONTRAKT.md` (ny seksjon "Datalast — alle kommuner"), `spike/ssb-spike.mjs`, `spike/batch-sweet-spot.mjs`, `spike/results/*.json`, PR #2 (`spike/ssb-alle-kommuner`) | 2026-04-25 |
