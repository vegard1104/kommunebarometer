# Mobil-først audit — Kommunebarometer

> Pakke 22 / B3. Audit utført 2026-04-25 mot dagens `index.html` med Chrome DevTools mobile-emulator (375 px breddé / iPhone SE-profil).

## Sammendrag

| Område | Status | Antall funn | Prioritet |
|---|---|---|---|
| Layout-overflow | ⚠️ Delvis | 3 | Høy |
| Touch-target | ✅ OK | 0 | — |
| Lesbarhet (font-størrelse) | ⚠️ Delvis | 2 | Medium |
| Sektor-grid (12 kort) | ⚠️ Delvis | 2 | Medium |
| Charts på mobil | ❌ Mangler | 3 | Høy |
| Sticky filter | ❌ Mangler | 1 | Lav |

**Totalt: 11 funn.** 3 enkle CSS-fikser i denne PR-en; resten åpne HANDOFF-rader.

## Funn

### Layout-overflow

1. **❌ → ✅ FIKSET** Toolbar med 6 knapper og statusfelt brøt over på flere rader på 375 px, men status-feltet flyttet seg til et merkelig sted. Lagt til `gap: 8px; flex-wrap: wrap` med `width: 100%` på `.status` slik at den får egen linje under på mobil.
2. **❌ → ✅ FIKSET** Sammenligning-tabell (`.compare-table`) hadde minst 5 kolonner som ga horisontal scroll. Wrapper `<div style="overflow-x:auto">` finnes allerede, men WCAG 2.2 AA krever at brukeren må scrolle bevisst — vi har lagt til `tab-index="0"` på wrapperen og `aria-label="Sammenligningstabell — scroll horisontalt"`.
3. **⚠️ ÅPEN** Hero-grid (1.2fr / 2fr) bryter til én kolonne på 900 px; OK. Men score-row inni hero-card har 3 kolonner som blir trange under 380 px. Bør stables vertikalt under 380 px.

### Lesbarhet (font-størrelse)

4. **⚠️ ÅPEN** Body-tekst er 14–16 px (jf. DESIGN-TOKENS). På mobil er 16 px minimum for komfortabel lesing. Sjekk at vi ikke har 14 px på lengre tekst-blokker.
5. **⚠️ ÅPEN** "Sist oppdatert"-stempelet er 10 px (`.sector-stamp`). Bør være ≥ 12 px på mobil for lesbarhet.

### Sektor-grid (12 kort)

6. **⚠️ ÅPEN** `repeat(auto-fill, minmax(240px, 1fr))` gir 12 kort sårbar utlegg på 375 px (vises som 1 kolonne men ofte med store tomrom). Bør være `minmax(260px, 1fr)` eller eksplisitt `1fr` på mobil.
7. **❌ → ✅ FIKSET** Trend-row (sparkline + tekst + pil) brøt på små bredder. Lagt til `flex-wrap: wrap` slik at sparkline går under tekst på smale skjermer.

### Charts på mobil

8. **⚠️ ÅPEN** Radar-charten (`#radar-chart`) blir trang på mobil; etiketter overlapper. Rapportens B3-anbefaling: bytt ut radar med horizontal bar chart på mobil.
9. **⚠️ ÅPEN** Linjegraf (`#history-chart`) har høyde 280 px som er greit, men x-akse-etiketter overlapper på mobil hvis det er mer enn 6 år.
10. **⚠️ ÅPEN** Compare-radar har samme problem som radar-charten.

### Sticky filter

11. **⚠️ ÅPEN** Toolbar med kommune-velger og år-velger er statisk øverst. På lengre kommune-side må bruker scrolle tilbake til toppen. **Anbefaling:** `position: sticky; top: 0; z-index: 10` på `.bar` slik at toolbaren følger med på mobil.

## Implementert i denne PR-en

1. Toolbar wrap-fiks med tydelig status-plassering
2. Sammenligningstabell-scroll med tabindex og aria-label
3. Trend-row flex-wrap

## HANDOFF — gjenstående arbeid

- **Radar → bar chart på mobil** (rapport B3) — egen frontend-PR
- **Sticky filter på toolbar** — én CSS-blokk, men krever testing av layout
- **Font-justering** — designer-beslutning + token-oppdatering
- **Sektor-grid layout** — designer-justering
