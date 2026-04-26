# QA-sjekkliste — Kommunebarometer

Sjekkliste som kjøres etter hver større endring eller leveranse.
Lokal test fanger ~70% av feil; Vercel preview er nødvendig for full
data-fetch (SSB-proxy `/api/ssb/*` virker kun på Vercel).

## Konsoll-rens (clean cache + incognito)

- [ ] Forsiden `/?kommune=3222` laster uten ReferenceError
- [ ] Forsiden laster uten ufanget Promise rejection
- [ ] Ingen 404 på filer som skal eksistere (`/data/*.json`, `/sektor.html`, `/api/ssb/*`)
- [ ] Sektor-kort ⚠ foreldet kun på reelle problem-tabeller (08845, 13111), ikke alle 12
- [ ] Chart.js lastes uten CORS-feil
- [ ] localStorage-state lagres etter første scoring (kb_sector_scores, kb_overall, kb_muni_names)

## Sektor-dypdykk-rundtur

For hver av de 12 sektorene, åpne `/sektor.html?id=<id>&kommune=Lørenskog&år=2025`:

- [ ] grunnskole — sammendrag + indikator-tabell + tidsserie
- [ ] pleie — DKI-panel viser 0,81 (grønn dki-low)
- [ ] barnevern — primær tabell 12873; hvis fallback brukt, ⚠ vises
- [ ] barnehage — DKI 1,18 (rød dki-high)
- [ ] helse — DKI 0,89 (grønn dki-low)
- [ ] sosial — DKI 1,18; sosialhjelpsmottakere skal ha retning ↘ (low)
- [ ] okonomi — frie inntekter ↗, gjeld ↘
- [ ] eiendom — ingen DKI (forventet)
- [ ] kultur, saksbehandling, var, klima — sammendrag fra localStorage

Bytt til år 2024 i URL og sjekk at data fortsatt vises.

## Behovsjustert toggle

På `/?kommune=3222`:

- [ ] Bytt fra Rådata til Behovsjustert — log viser "Justerte X av Y indikatorer"
- [ ] Lørenskogs samlet rangering endrer seg merkbart (særlig nedover på pleie)
- [ ] Toggle 5 ganger raskt — ingen lekkasjer (DOM-elementer dupliseres ikke)
- [ ] URL-parameter `?mode=justert` settes/fjernes
- [ ] localStorage `kb_mode` persisterer etter reload

## Lighthouse (incognito + clean cache)

Mål: > 85 på begge metrikker, både desktop og mobil.

- [ ] Forsiden `/?kommune=3222` — Performance ≥ 85
- [ ] Forsiden — Accessibility ≥ 85
- [ ] Sektor-dypdykk `/sektor.html?id=helse&kommune=Lørenskog&år=2025` — Performance ≥ 85
- [ ] Sektor-dypdykk — Accessibility ≥ 85

## Mobil 375 px (Chrome DevTools device toolbar)

- [ ] Forsiden — ingen horisontal scroll
- [ ] Sektor-kort minst 44 × 44 px touch-target (WCAG 2.5.5 AA)
- [ ] Toolbar-knapper og toggle ikke avskåret
- [ ] sektor.html — header og indikator-tabell scroller riktig

## Auto-merge til test/alle-pakker-samlet

For hver ny PR:

- [ ] Branch pushet til origin
- [ ] Auto-merget til test/alle-pakker-samlet
- [ ] `bash scripts/sjekk-udefinerte-funksjoner.sh test/alle-pakker-samlet` returnerer 0 tap
- [ ] Vercel preview oppdaterer på pushet
- [ ] Konsollen er ren på Vercel preview (gjenta konsoll-rens-sjekken her)

## Når sjekklisten feiler

- ReferenceError → kjør verifikasjonsskriptet, identifiser hvilken branch som mistet funksjonen i merge.
- Lighthouse < 85 → mest sannsynlig årsak: store inline-scripts. Sjekk om en pakke har lagt til mye CSS/JS uten å splitte.
- Mobil overflow → sjekk om en ny komponent har fast pixel-bredde i stedet for `max-width: 100%`.
- Toggle-feil → sjekk konsoll for "Cannot access X before initialization" (TDZ) eller window.X check som feiler.
