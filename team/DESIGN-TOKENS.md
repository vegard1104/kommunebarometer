# Design-tokens — Kommunebarometer

Eies av UX/UI-designer. Endring skjer i én PR, deretter oppdaterer Frontend bruken på tvers.
Tokens hentet fra eksisterende `index.html` (v1). Designer kan foreslå justering — beslutning sammen med Vegard.

## Farger (dark mode — v1-utgangspunkt)

| Token | Verdi | Bruk |
|---|---|---|
| `--bg` | `#0f1724` | Sidebakgrunn |
| `--panel` | `#182134` | Kort, paneler |
| `--panel-2` | `#1f2b44` | Sekundærpanel, skjema-inputs |
| `--accent` | `#4cc9f0` | Primær CTA, hover |
| `--accent-2` | `#f72585` | Aksent-gradient, highlight |
| `--good` | `#4ade80` | Positiv status, over gjennomsnitt |
| `--bad` | `#f87171` | Negativ status, under gjennomsnitt |
| `--warn` | `#fbbf24` | Advarsel |
| `--text` | `#e6edf6` | Brødtekst |
| `--muted` | `#94a3b8` | Sekundærtekst, labels |
| `--border` | `#263248` | Kantlinjer, skiller |

## Typografi

- **Font stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Base:** 14–16 px, line-height 1.5
- **H1 (header):** 26 px, letter-spacing -0.3px
- **Overall rank (signatur):** 72 px, 700, letter-spacing -2px, gradient text

## Spacing og radius

- **Panel-padding:** 20 px
- **Container-padding:** 24 px vertikalt, 32 px horisontalt
- **Border-radius:** 10–12 px på kort, 7 px på kontroller, 999 px på chips

## Breakpoints

- **900 px:** hero-grid kollapser til én kolonne

## Åpne designspørsmål

- Light mode? (Ikke prioritert i v1.)
- Tilgjengelighetskontrast — dobbeltsjekk `--muted` mot `--panel` (kan være under WCAG AA).
- Profesjonell, nøytral visuell identitet for kommunalt-ansatt-bruk — vurder om dark-mode er riktig "default" for økonomisjef-/rådmann-bruk i kontortid, eller om light-mode bør prioriteres for v2 (politiker-modus i §D5 vil sannsynligvis være light-mode for A4-print).
