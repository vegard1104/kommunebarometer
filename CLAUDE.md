# CLAUDE.md — Kommunebarometer

> Denne fila er primær kontekst for Claude Code. Les hele før du foreslår eller skriver kode.

## Hva dette repoet er

**Kommunebarometer 2026** — selvoppdaterende indeks over norske kommuner basert på SSB KOSTRA-tall. Brukes av Cerebral Parese-foreningen (CP-foreningen) i fundraising og påvirkningsarbeid.

- **v1 (i produksjon):** Single-file `index.html` — dark-mode dashboard for Lørenskog. Vanilla HTML/CSS/JS, ingen build-steg. Henter data live fra SSB PxWeb API v2 via Vercel-rewrite.
- **v2 (under utvikling):** Skalere til alle 357 norske kommuner + KOSTRA-dypdykk + sammenlikningsvisning + eksport.

## Tech stack

- Frontend: Vanilla HTML/CSS/JS, Chart.js 4.4, SheetJS 0.18. Ingen build-steg per nå (kan endres av Tech Lead-agent med ADR).
- Deploy: Vercel. `main` = produksjon. Preview-deploy på alle PR-er.
- Data: SSB KOSTRA via PxWeb API v2 (proxy `/api/ssb/*` → `data.ssb.no/api/pxwebapi/v2/*` definert i `vercel.json`).
- Repo: GitHub.

## Hvor finner jeg kontekst?

Prosjektet drives av et team med Cowork-agenter som samarbeider via fil-basert handoff. Du (Claude Code) er en del av samme system. Les disse før du tar avgjørelser:

| Fil | Innhold |
|---|---|
| `team/BRIEF.md` | Suksesskriterier, scope, arbeidsregler. Sannhetskilden. |
| `team/HANDOFF.md` | Aktiv arbeidskø. Sjekk om det er noe som venter på en utvikler-rolle. |
| `team/PROSJEKTLOGG.md` | Beslutninger og endringer over tid. |
| `team/API-KONTRAKT.md` | Grensesnitt mellom frontend og data-lag. |
| `team/DESIGN-TOKENS.md` | Farger, typografi, spacing. |
| `team/DATAKILDER.md` | KOSTRA-tabeller, lisens, oppdateringskadens. |
| `team/agents/` | Systempromptene til de andre agentene — viser hvordan ansvar er fordelt. |

## Arbeidsregler

1. **Les `team/BRIEF.md` og `team/HANDOFF.md` først.** Ikke anta scope.
2. **Norsk språk** i kode-kommentarer, commit-meldinger og dokumentasjon.
3. **Branch-strategi:**
   - `main` = produksjon. **ALDRI merge til `main` uten Vegards eksplisitte godkjenning i chat.**
   - Egen branch per endring: `feature/`, `fix/`, `design/`, `chore/`.
   - PR mot `main` med beskrivelse + preview-link fra Vercel.
4. **Ingen tech-stack-bytter** uten ADR + Vegards godkjenning.
5. **Ingen betalte tjenester** uten Vegards OK.
6. **Ikke rør `index.html` (v1) drastisk** før v2-arkitektur er låst.
7. **Logg viktige beslutninger** i `team/PROSJEKTLOGG.md` (én oppføring per beslutning, format står i fila).

## Når du leverer

1. Commit på egen branch med norsk commit-melding.
2. Push og åpne PR mot `main`.
3. Skriv én linje i `team/PROSJEKTLOGG.md` om hva som ble gjort og hvorfor.
4. Oppdater `team/HANDOFF.md` — flytt raden til "Levert" eller åpne ny rad mot neste mottaker.
5. Gi Vegard preview-linken og vent på eksplisitt godkjenning før merge.

## Det som er viktig å forstå

- **Vegard er produkteier.** Ikke utvikler. Forklar valg på et nivå han kan ta avgjørelser på, ikke kode-detaljer.
- **CP-foreningen er sluttbruker.** Designvalg skal støtte fundraising og påvirkning, ikke teknisk eleganse for sin egen skyld.
- **Tilgjengelighet er ikke valgfritt.** WCAG 2.1 AA på kjerneskjermene.
- **Data er ferskvare.** Ingen statiske dumper — alt skal hentes live fra SSB.

## Foreløpige aktive arbeidspakker

Se `team/HANDOFF.md` for siste status. Per 2026-04-24 er fire pakker åpnet:

- **AP-01** v2-arkitektur ADR (Tech Lead-rolle)
- **AP-02** Wireframes + design-tokens (UX/UI-rolle)
- **AP-03** Repo + Vercel-hygiene (Release Manager-rolle)
- **AP-04** SSB PxWeb-spike for alle kommuner (Fullstack-rolle)

Som Claude Code kan du ta hvilken som helst utvikler-pakke (AP-01, AP-04, eller fremtidige Frontend/Backend-pakker). Sjekk HANDOFF før du starter.
