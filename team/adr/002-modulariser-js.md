# ADR-002: Modulariser JavaScript ut av `index.html`

- **Dato:** 2026-04-25
- **Status:** Foreslått — venter Vegards godkjenning før implementasjon
- **Forfatter:** Claude Code (Tech Lead-rolle, etter to runder med merge-tap-bugs på `test/alle-pakker-samlet`)
- **Berører:** `index.html` (~2100 linjer), alle 30 feature-/chore-/design-/fix-branches som rører JS-blokken
- **Relatert:** ADR-001 (v2-arkitektur). ADR-002 er et **strukturelt mellomtiltak** uavhengig av om Astro velges — modulariseringen gir verdi også på vanilla.

---

## Context

### Hva har skjedd

`index.html` har én stor `<script>`-blokk på ~1700 linjer hvor alt JS bor. Når 30+ feature-pakker hver utvider denne blokken og senere merges sammen i `test/alle-pakker-samlet`, oppstod det merge-konflikter som ble løst med `git merge -X theirs`. Resultat: i to runder mistet vi totalt **17 funksjonsdefinisjoner** (B5: 2 funksjoner, runde 2: A3+A5+C6+E4 = 14+1 funksjoner pluss en global). Kall-stedene ble beholdt, så appen krasjet med `ReferenceError` ved oppstart.

Disse er manuelt gjenopprettet, men **rotårsaken er ikke fikset**: alt JS i én fil garanterer merge-konflikter når flere branches utvider samme region. Hver ny pakke forsterker problemet.

### Hva som påvirker arkitekturvalget

- **AP-04-spiken** (rapport B5) viste at edge-cache er kritisk; modulering gjør cache-strategien finkornet (én pakke endres → bare den modulen invalideres).
- **30 nye sider/skeletons** fra Pakke 0–29 forsterker behovet for kodemoduler — flere helper-filer er allerede lagt i `data/` (kommunestruktur.js, brreg-helper.js, behovsjustering.js osv).
- **ADR-001 (Astro)** krever uansett at JS er splittet i moduler — denne ADR-en kan implementeres som et frittstående steg som senere blir naturlig kompatibelt med Astros island-modell.
- **Skalering til 357 kommuner + 12 sektor-dypdykk + politiker-modus + kart + REST-API** vil dramatisk øke total JS-mengde. Fortsetter vi med én fil, blir den uhåndterlig (estimat: > 5000 linjer ved v2 MVP-ferdigstilt).
- **Manuell merge-konfliktløsning** for hver merge er ikke skalerbart for et team av AI-agenter som jobber parallelt.

---

## Decision

**Anbefaling: Splitt all JavaScript ut av `index.html` i separate moduler i `js/`-mappa, organisert per pakke/funksjonsområde.**

### Foreslått filstruktur

```
js/
├── core/
│   ├── config.js       # SECTORS, KONSTANTER, vekt-justering-overstyringer
│   ├── ssb.js          # fetchMeta, fetchTableV2, parseJsonStat
│   ├── klass.js        # fetchKlassKommuner, fetchKlassChanges, KLASS_KOMMUNER
│   ├── compute.js      # determineDirection, computeSectorScores, computeOverall
│   └── error.js        # kbReportError, brukerVennligFeil (B5)
├── ui/
│   ├── render.js       # renderAll, renderOverall, renderTop10
│   ├── sectors.js      # renderSectors, renderTrendRow, renderSparkline (A3)
│   ├── compare.js      # COMPARE_MUNIS, renderCompare, addCompare
│   ├── charts.js       # historyChart, radarChart, compareRadarChart
│   ├── stamp.js        # formatNorskDato, sektor-stamp (E4)
│   ├── info-popover.js # showSektorInfo, _closeActiveInfoPopover (A4)
│   └── url-state.js    # syncUrlToCurrentMuni, readKommuneFromUrl (A5)
├── features/
│   ├── robek.js        # ROBEK_DATA, loadRobek, renderRobekBadge (C6)
│   ├── share.js        # shareLink, copyChartImage, flashStatus (A5)
│   ├── kommunevelger.js # preloadKommunevelger (A1)
│   ├── forklaringer.js # SEKTOR_FORKLARINGER, loadSektorForklaringer (A4)
│   └── eksport.js      # downloadCsv, downloadXlsx, buildExportRows (eksisterende)
├── helpers/
│   └── escape.js       # escapeHtml
└── main.js             # main(), event-bindings, initialisering
```

`index.html` blir kun:
- HTML-template
- CSS (kan også flyttes til `css/`-mappa senere)
- Liste over `<script type="module" src="js/main.js">` + helpers/-filer

### Fordeling per pakke = én PR-blast-radius

Når en agent jobber på Pakke X, endrer de kun filen for X. Andre branches kan jobbe på andre filer parallelt **uten merge-konflikt**. Den eneste delte filen blir `js/main.js` (lite, ~50 linjer for binding/oppstart) og `index.html` (lite, kun struktur).

### ES modules vs IIFE

Bruker **ES modules** (`<script type="module">`) i stedet for IIFE/global-pattern:
- Native eksport/import — klar avhengighets-graf
- Ingen global variable-spam (KLASS_KOMMUNER, ROBEK_DATA osv blir module-scoped)
- Top-level await fungerer
- Browser-støtte: alle moderne nettlesere; IE11 er allerede ute av scope

Trade-off: krever HTTP/2 eller bundling for optimal ytelse på mange små filer. For nåværende skala (~15 moduler) er HTTP/2-multipleksing tilstrekkelig — Vercel støtter dette out-of-the-box.

---

## Alternatives considered

### Alternativ A: Beholde én fil, men bruke bedre merge-strategi

Bruk `merge.driver`-konfigurasjon eller manuell konfliktløsning hver gang.

**Fordeler:** Ingen kode-flytting nødvendig. Ingen build-/HTTP-overhead.

**Ulemper:** Krever at alle branch-byggings gjøres manuelt med disiplin. Sårbart mot menneskefeil og AI-agent-feil. Skalerer ikke til 30+ pakker. Vi har akkurat opplevd to runder med tap; mønsteret kommer tilbake.

**Avvist** fordi det er en prosess-fix, ikke en strukturell fix.

### Alternativ B: Hopp rett til Astro (ADR-001)

Vent på Astro-godkjenning og gjør modulariseringen som del av Astro-migrasjonen.

**Fordeler:** Én stor refaktor i stedet for to.

**Ulemper:** ADR-001 venter Vegards godkjenning som krever eksplisitt tech-stack-aksept. Astro-migrasjonen er estimert til flere PR-er. I mellomtiden fortsetter merge-konflikt-mønsteret. Hver dag uten modularisering = mer risiko.

**Avvist** fordi modularisering gir umiddelbar verdi og er kompatibel med Astro når det kommer.

### Alternativ C: Bundling med esbuild eller rollup

Bruk en bundler så vi kan fortsette med flat fil-struktur men splitte ved build.

**Fordeler:** Optimal ytelse for klient.

**Ulemper:** Krever build-steg → bryter v1-prinsippet om "ingen build". Vegard har ikke godkjent build-steg ennå (ADR-001 foreslår Astro som har bundler innebygget).

**Avvist** fordi ES modules native fungerer uten build, og hvis vi senere flytter til Astro får vi bundling automatisk.

---

## Consequences

### Positive

- **Slutten på merge-konflikter** for JS-endringer per pakke. To agenter kan jobbe parallelt på `js/features/robek.js` og `js/features/share.js` uten å treffe hverandre.
- **Lettere code review** — én PR endrer én fil i `js/`-mappa, ikke 100 linjer i en monolittisk script-blokk.
- **Lettere testing** — hver modul kan importes i en test-runner (Node-scripts, Vitest, Jest).
- **Tydeligere avhengigheter** — `import { renderTrendRow } from './sectors.js'` gjør koden selvdokumenterende.
- **Forberedt for Astro** — hvis ADR-001 blir godkjent, blir filene gjenbrukbare som islands.
- **Cache-vennlig** — endrer du én fil, invalideres bare den i Vercel edge-cache.

### Negative / aksepterte trade-offs

- **Engangskostnad:** Splitting av eksisterende ~1700 linjer JS i ~15 moduler er estimert til 1–2 dager arbeid.
- **Migrasjonsperiode:** Eksisterende åpne PR-er (alle 30 fra Pakke 0–29) må enten merges først, eller rebases mot ny modul-struktur. Anbefaling: merge alle 30 først, så lag ADR-002-implementasjon som én stor "flytting"-PR mot main.
- **Flere HTTP-requests** ved cold load (~15 i stedet for 1). HTTP/2-multipleksing reduserer effekten betydelig; med `<link rel="modulepreload">` på kjerneveien faller cold-load til < 100 ms forskjell. Akseptabelt.
- **ES module-syntax** er litt ny for AI-agenter som er vant til IIFE-pattern. Mitigering: dokumenter mønstret tydelig i `js/README.md`.

### Risikoer

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|---|---|---|---|
| Migrasjonen introduserer bugs i eksisterende funksjonalitet | Medium | Høy (regresjon) | Splitt i flere små PR-er, hver verifisert i preview før merge |
| ES module-import feiler lokalt med `file://` | Høy (uten http-server) | Lav | Dokumentér `npx http-server` som dev-rutine |
| Vercel cache-invalidering ikke finkornet nok | Lav | Lav | Bruk `Cache-Control: public, must-revalidate` på `js/`-mappa |

### Krav for at beslutningen står

- **Vegard godkjenner ADR-en.** Modulariseringen krever JS-flytting men ingen tech-stack-bytte (vanilla beholdes).
- **Implementasjonen gjøres som egen PR-serie etter at de fleste av de 30 åpne PR-ene er merget**, for å unngå massiv re-baseing.
- **Inntil implementasjonen lander:** alle merges som rører `index.html` skal **manuelt konfliktløses** med Node-syntax-sjekk + browser-test før push. Aldri `-X theirs` blindt.

### Implementasjonsplan (skissert, egen PR-serie etter godkjenning)

1. **PR a** — Opprett `js/`-struktur og flytt kjerne-helpers (`error.js`, `escape.js`, `ssb.js`, `klass.js`, `compute.js`, `config.js`). Konverter til ES modules. Verifiser alt fungerer som før.
2. **PR b** — Flytt UI-rendering (`render.js`, `sectors.js`, `charts.js`, `stamp.js`, `info-popover.js`, `url-state.js`).
3. **PR c** — Flytt features (`robek.js`, `share.js`, `kommunevelger.js`, `forklaringer.js`, `eksport.js`).
4. **PR d** — Reduser `index.html` til kun HTML/CSS + `<script type="module" src="js/main.js">`.
5. Hvert steg har egen PR-review, egen Vercel preview, og kan rulles tilbake separat.

---

## Referanser

- Bug-analyse: `team/PROSJEKTLOGG.md` 2026-04-25 — to runder med merge-tap (B5 + A3/A5/C6/E4)
- ADR-001: `team/adr/001-v2-arkitektur.md` (Astro-anbefaling)
- AP-04 SSB-spike: `team/API-KONTRAKT.md` (edge-cache-strategi)
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vercel: Caching static assets](https://vercel.com/docs/edge-network/caching)
