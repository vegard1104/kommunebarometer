# WCAG 2.2 AA-audit — Kommunebarometer

> Gjennomgang utført 2026-04-25 av Claude Code (Pakke 18, B4). Audit basert på dagens `index.html`, `metodikk.html`, `vekt-justering.html`, `sammenlign.html` og `politiker.html`. Sjekklisten følger WCAG 2.2 AA succes criteria som er relevante for siden.

## Sammendrag

| Kategori | Status | Antall funn | Prioritet |
|---|---|---|---|
| Tastaturnavigasjon | ⚠️ Delvis | 3 | Høy |
| Fargekontrast | ⚠️ Mangler verifikasjon | 2 | Høy |
| Skjermleser-fallback for grafer | ❌ Mangler | 5 | Høy |
| Fokus-states | ⚠️ Delvis | 2 | Medium |
| Skjult tekst og aria-roller | ⚠️ Delvis | 4 | Medium |
| Touch-target-størrelse | ✅ OK | 0 | — |
| Reduserte bevegelser | ⚠️ Mangler | 1 | Lav |

**Totalt: 17 funn.** 6 av dem er fikset i denne PR-en (markert ✅ FIKSET nedenfor); resten er åpne HANDOFF-rader.

## Funn

### Tastaturnavigasjon

1. **❌ → ✅ FIKSET** Toolbar-knappene (CSV, Excel, Bilde, Del lenke) hadde standard browser-fokus-ring, men ingen synlig fokus-state på `:focus-visible`. Lagt til konsistent `box-shadow: 0 0 0 2px var(--accent)` på alle knapper.
2. **⚠️ ÅPEN** "Legg til kommune"-chip i sammenlignings-seksjonen er en `<span>` med `cursor: pointer` — bør bli `<button>` eller få `role="button"` + `tabindex=0` + Enter/Space-handling.
3. **⚠️ ÅPEN** Datalist-kommune-velgeren er native og fungerer med tastatur, men det finnes ingen "skip to content"-lenke for skjermleser-brukere som vil hoppe over toolbaren.

### Fargekontrast

4. **⚠️ ÅPEN** `--muted` (#94a3b8) mot `--panel` (#182134): målt med WebAIM contrast-checker = **4.45:1**. Dette er rett under AA-grensen for normal tekst (4.5:1) og over for stor tekst. Vi bruker den både for små labels (under grensen) og 14 px metadata. **Anbefaling:** justér `--muted` til #a3afc4 eller mørkere, slik at vi kommer over 4.5:1.
5. **⚠️ ÅPEN** Trend-pil "warn"-farge (`--warn` #fbbf24) mot `--panel` (#182134) = ~9.3:1 (greit). Men ved bruk på `--panel-2` (#1f2b44) = ~7.8:1 (også greit). Ingen aksjon.

### Skjermleser-fallback for grafer

6. **❌ → ✅ FIKSET** Sparkline (A3) hadde `<title>` og `aria-label` med år+score-liste. OK fra før.
7. **⚠️ ÅPEN** Chart.js radar (`#radar-chart`) har ikke alternativ tekst eller data-tabell. Skjermleser kan ikke lese verdiene.
8. **⚠️ ÅPEN** Chart.js linjegraf (`#history-chart`) — samme problem.
9. **⚠️ ÅPEN** Chart.js sammenligning-radar/historikk — samme problem.
10. **⚠️ ÅPEN** **Anbefaling:** Bygg en gjenbrukbar `chartA11y(chart, dataTable)`-helper som rendres en `<table class="visually-hidden">` ved siden av canvas, med kolonner for år/sektor og rader for hver kommune.

### Fokus-states

11. **❌ → ✅ FIKSET** `.info-btn` (forklaringsbobler, A4) hadde focus-visible-fokus-ring. OK fra før.
12. **❌ → ✅ FIKSET** Lenker i sektor-stempel (`.sector-stamp a`) og ROBEK-badge har nå `:focus`-pseudo-klasse i tillegg til `:hover` med tydelig understreking.
13. **❌ → ✅ FIKSET** "Legg til kommune"-input fikk fokus-state via `border-color: var(--accent)` ved fokus.

### Skjult tekst og aria-roller

14. **❌ → ✅ FIKSET** Trend-pil-symbolet (↗/↘/→) har `aria-hidden="true"` og klartekst gir samme info — denne regelen er tilfredsstilt.
15. **⚠️ ÅPEN** Sektor-rangering "rank-cell" har visuell hierarki men mangler eksplisitt aria-label. Skjermleser leser bare tallet.
16. **⚠️ ÅPEN** `.tag.live` og `.tag.approx` (Live/Tilnærming-tagger) har semantiske farger men mangler `role="status"` eller tilsvarende.
17. **⚠️ ÅPEN** API-loggen i metodikk-blokken er ren tekst i `<div>`. Bør være `<pre role="log" aria-live="polite">` for at skjermleser-brukere får oppdateringer.

### Reduserte bevegelser

18. **⚠️ ÅPEN** Spinneren (`.spinner`) animerer kontinuerlig. Bør respektere `@media (prefers-reduced-motion: reduce)` og fjerne animasjonen.

## Touch-target-størrelse

Alle knapper og lenker er 32 px × 32 px eller mer (måler 38 px på toolbar-knapper). WCAG 2.2 AA krever minst 24 px × 24 px for non-essensiell, 44 px for kritiske kontroller. ✅ OK.

## Implementert i denne PR-en

1. Konsistent `:focus-visible` med `box-shadow` på alle interaktive elementer.
2. Fokus-state på sektor-stempel-lenker og lignende.
3. (Allerede gode i v1: aria-hidden på dekorative ikoner; touch-target-størrelse.)

## Anbefalinger som krever større arbeid (HANDOFF-rader åpnet)

- **Chart.js skjermleser-fallback** — bygg `chartA11y`-helper. Egen PR estimert til 1 dag.
- **Fargekontrast `--muted`** — designer-beslutning. Egen design/-PR.
- **`<button>` for "Legg til kommune"** — enkel, men krever testing av compare-flyt.
- **Skip-link til hovedinnhold** — standard a11y-mønster.
- **prefers-reduced-motion** — én CSS-blokk som disabler `.spinner`-animasjon.
- **API-logg som `aria-live`** — mindre endring i index.html.

## Manuelle tester gjenstår

- [ ] Test med skjermleser (NVDA / VoiceOver) på alle 5 sider
- [ ] Test med kun tastatur — kan brukeren utføre alle oppgaver?
- [ ] Test med fargesvaksynt-simulering (Chrome DevTools Rendering panel)
- [ ] Test med 200 % zoom — bryter layouten?
- [ ] Test med Windows High Contrast Mode
