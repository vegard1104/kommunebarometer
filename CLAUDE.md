# CLAUDE.md — Kommunebarometer

> Denne fila er primær kontekst for Claude Code. Les hele før du foreslår eller skriver kode.

## Hva dette repoet er

**Kommunebarometer 2026** — selvoppdaterende indeks over norske kommuner basert på SSB KOSTRA-tall. Skal gjøre KOSTRA-data lett tilgjengelig for kommunalt ansatte (rådmann/kommunedirektør, økonomisjef, kommunalsjefer for oppvekst og helse/omsorg, planleggere), politikere og engasjerte innbyggere — i budsjett- og økonomiplan-arbeid, politiske beslutninger, sammenligning av kommuner, ROBEK-/effektivitetsvurderinger og dialog med innbyggere/media.

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
- **Sluttbrukerne er kommunalt ansatte og innbyggere/politikere.** Designvalg skal støtte konkret bruk i budsjett-/økonomiplan-arbeid, politiske saker, kommunesammenligning og presse-/innbyggerdialog — ikke teknisk eleganse for sin egen skyld. Se panelets brukerprofiler i `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx` kapittel 2.
- **Tilgjengelighet er ikke valgfritt.** WCAG 2.2 AA på kjerneskjermene (jf. tilgjengelighetsforskriften for offentlige nettsteder).
- **Data er ferskvare.** Ingen statiske dumper — alt skal hentes live fra SSB. Edge-cache (24 t) er akseptert, manuelle data-dumper er ikke.

## Aktive arbeidspakker

Se `team/HANDOFF.md` for siste status. Hovedlinjen i 2026-04-25:

- **Pakke 0–3 levert og merget til main:** BRIEF forankret i rapportene, AP-04 SSB-spike, AP-03 repo/Vercel-hygiene, AP-01 v2-arkitektur ADR (anbefaler Astro — venter Vegards godkjenning før implementasjon).
- **Pakke 1–29 fra rapportens roadmap (kapittel 6):** Implementeres autonomt i sekvensielle PR-er — quick wins (E4, C1, C6, E1+D6, A3, A4, A5, B5), medium-løft (A1, B1, A6, D2, D5, eksterne kilder, WCAG-audit), strategiske spor (A2 behovsjustering, B3 mobil, D1 sektor-dypdykk, D3 kart, D7 API).
- **AP-02 (wireframes)** venter på Vegards godkjenning av ADR-001.

Sjekk HANDOFF før du starter på en pakke. Følg avhengighetene: C1 før B2/A1, A1 før de fleste D-pakker, B1 før B3, C9 før A2.
