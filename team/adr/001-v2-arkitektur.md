# ADR-001: Arkitekturvalg for Kommunebarometer v2

- **Dato:** 2026-04-25
- **Status:** Foreslått — venter Vegards godkjenning før implementasjon
- **Forfatter:** Claude Code (Tech Lead-rolle, Pakke 3 / AP-01)
- **Berører:** `index.html` (v1), v2-implementasjon i kommende sprinter
- **Avhengigheter:** AP-04 SSB-spike (`spike/ssb-alle-kommuner`-branch). Bygger på rapport-anbefalingene i `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx`.

---

## Context

### Hva vi har i dag (v1)

- **Én `index.html`-fil** på ~1500 linjer (vanilla HTML/CSS/JS).
- **Eksterne biblioteker via CDN:** Chart.js 4.4, SheetJS 0.18.
- **Ingen build-steg:** `git push` → Vercel statisk hosting → live.
- **Data:** Live fra SSB PxWeb v2 via Vercel-rewrite (`/api/ssb/*`).
- **Lørenskog-spesifikk:** Kommune-koden er hardkodet, MERGERS-tabellen er hardkodet, tittel og logikk antar én kommune.

### Hva v2 krever (oppdatert BRIEF, jf. Pakke 0)

8 må-ha-punkter, hvorav de mest arkitektur-betingende:

1. **Universell kommunevelger** for alle 357 kommuner med delbar URL (`?kommune=...`).
2. **Sektor-dypdykk for grunnskole + pleie/omsorg** som første lansering — egne ruter/sider.
3. **Sammenligning på tre nivåer** samtidig (egen kommune over tid, KOSTRA-gruppe, landet uten Oslo) — krever flere parallelle datasett per visning.
4. **Indikator-register med eksplisitt retning** — JSON-basert konfigurasjon erstatter regex-heuristikk.
5. **Trend-pil + 4-årsgjennomsnitt** på hver indikator — krever historikk-prosessering.
6. **Edge-caching** (`s-maxage=86400`) og graceful degradation.
7. **Eksport CSV/Excel** per visning.
8. **WCAG 2.2 AA** — semantic HTML, keyboard navigation, skjermleser-fallback for grafer.

Bør-ha som forsterker arkitektur-kravene: politiker-modus (egen rute, forenklet visning), kart-visning (D3/Mapbox-integrasjon), justerbar vekting (tilstandshåndtering på klient), dynamisk Klass-API (separat caching).

### Funn fra AP-04-spiken (kjørt 2026-04-25)

Avgjørende konsekvenser for arkitekturvalg:

| Funn | Implikasjon for arkitektur |
|---|---|
| **p50 = 620 ms** for én SSB-fetch (cold) | Vi må cache aggressivt; ren client-side fetch på hver navigasjon er for tregt |
| **Single batch for alle kommuner umulig** (URL > 4000 tegn) | Kart og topp-10 må precomputes — kan ikke gjøres i request-path |
| **Rate-limit 429 ved >2 samtidige requests** | Pre-compute må gjøres på server (cron / serverless), ikke fra mange browser-klienter |
| **3–4 sek total tid for alle 839 kommune-koder** | Pre-compute én gang per dag er trivielt; ingen brukerbelastning |
| **Klass-API krever egen håndtering** | Kommuneliste må fetches separat og caches i uker |

**Hovedslutning:** Edge-cache + pre-computed aggregater er kritisk uavhengig av UI-rammeverk. Enhver arkitektur som ikke har en god mekanisme for dette vil tape på ytelse.

### Tilleggsfaktorer

- **Vegard er produkteier, ikke utvikler.** Endringer skal kunne forklares og diskuteres på forretningsnivå, ikke kode-nivå.
- **AI-agenter er primær-arbeidskraften.** Arkitekturen skal være lesbar og forutsigbar for LLM-baserte agenter.
- **Norsk språk i kode-kommentarer og commit-meldinger** (CLAUDE.md-regel).
- **Vercel som deploy-target er låst** (gratis Hobby-konto).
- **Ingen betalte tjenester** uten Vegards OK.

---

## Decision

**Anbefaling: Migrer til Astro 4.x med Chart.js og SheetJS som "islands".**

### Hvorfor Astro

1. **SSG by default**: Hver side bygges til ren statisk HTML ved deploy. FCP blir ~50–200 ms (innenfor BRIEFs <2s-mål med stor margin). Bygges én gang per dag på Vercel cron, oppdateres når SSB publiserer (15. mars + 15. juni).
2. **Islands architecture**: JavaScript sendes kun til klienten der det trengs. Politiker-modus blir nesten 0 KB JS. Kommune-dashboard sender Chart.js-island. Eksport-knapp sender SheetJS-island. Vi unngår å laste et 200 KB JS-bundle på alle sider.
3. **Filbasert routing**: `src/pages/index.astro`, `src/pages/kommune/[kode].astro`, `src/pages/sektor/[id].astro`, `src/pages/sammenlign.astro`. Skaleringen til 12 sektorer skjer ved å legge til én fil.
4. **Pre-compute er enkelt**: I `getStaticPaths()` kan vi hente fra SSB ved build, generere alle 357 kommune-sider statisk. Eller hybrid: 50 mest-besøkte forhåndsbygde, resten on-demand med ISR.
5. **Migrasjons-vennlig**: Astro støtter `<script>`-blokker med ren JS — vi kan portere v1-kode bit for bit, ikke alt på én gang. Den eksisterende `index.html` blir til `src/pages/index.astro` med få endringer.
6. **Vercel-native**: Astro sin Vercel-adapter er offisielt vedlikeholdt. Edge-functions, ISR og preview-deploys fungerer ut av boksen.
7. **AI-agent-vennlig**: Astros mentalmodell ("HTML med litt JS hvor det trengs") er nær LLM-trening. Mer forutsigbart enn React med hooks/context/Suspense.
8. **Tilgjengelighet**: Astro genererer ren HTML uten unødvendig wrapping. Lettere å gjøre WCAG 2.2 AA korrekt i ren HTML enn i et SPA hvor alt er `<div>`.
9. **Norsk-vennlig**: Astro-komponenter har inline JSDoc-kommentarer som tolereres på norsk. Ingen krav til engelsk-only-konvensjoner.

### Hva endres konkret

- **Repo-rot**: Får `package.json`, `astro.config.mjs`, `tsconfig.json` (TypeScript valgfritt), `src/`-mappe.
- **Build-steg innføres**: `npm install` + `npm run build` produserer `dist/`. Vercel kjører dette automatisk.
- **`index.html` flyttes** til `src/pages/index.astro`. Dagens innhold puttes i en `---`-frontmatter (server-side) + HTML-template + `<script>`-blokk for klient.
- **Chart.js og SheetJS** installeres via npm og importeres lokalt (ikke CDN). Reduserer cold-cache-treff og forhindrer CDN-down-scenarier.
- **Eksisterende `vercel.json` rewrites + headers** beholdes uendret. Astro bygger til `dist/`, Vercel serverer derfra.

### Hva vi IKKE forplikter oss til

- **Vi bytter ikke til React eller Vue.** Astro lar oss bruke ren HTML/JS. Hvis vi senere vil ha en SPA-aktig komponent (f.eks. interaktiv kart), kan vi velge framework per island uten å endre rest.
- **Ingen ISR / on-demand SSR i første runde.** v2 MVP er ren SSG. ISR vurderes senere hvis SSG-buildtiden blir et problem (estimat: ikke før 12 × 357 sektor-undersider = 4284 sider, langt unna i v2 MVP).
- **Vi forplikter oss ikke til TypeScript.** Astro støtter TS, men v2 kan være ren JS hvis Vegard ønsker det. Anbefaling: start uten TS, vurder å legge til når kodebasen er stor nok til at typesjekking betaler seg.

---

## Alternatives considered

### Alternativ A: Forbli på vanilla HTML/JS (status quo)

Splitt `index.html` i flere filer (`index.html`, `kommune.html?kode=...`, `sektor.html?id=...`), bruk client-side history API for routing, organiser JS i ES-moduler (`src/lib/ssb.js`, `src/lib/chart-helpers.js`).

**Fordeler:**
- Ingen tech-stack-bytte (CLAUDE.md-regel respekteres maksimalt).
- Ingen build-steg → enklest mulig deploy.
- Lavest mulig kompleksitet, ingen npm-avhengigheter.
- Vegard kan i prinsippet redigere filene i Notepad og pushe.

**Ulemper:**
- **Skalerer dårlig**: Sammenligning på tre nivåer + 12 sektor-sider + politiker-modus + sammenligning i samme HTML-fil-modell vil bli ~5000–8000 linjer å vedlikeholde, fordelt over 5–10 separate HTML-filer som må holdes synkronisert.
- **Ingen pre-compute-mekanisme**: Må lage Vercel serverless function manuelt + skrive resultat til Edge Config — mer infrastruktur-arbeid enn Astros build-steg.
- **Ingen komponentmodell**: Header, footer, kommune-velger osv må kopieres mellom filer. Endringer i én må gjøres i alle.
- **JavaScript-størrelse**: Hver side må enten laste hele app-JS eller dele opp manuelt — ingen automatisk code-splitting.
- **WCAG-skalering**: Ren HTML er lett tilgjengelig, men shared-state (f.eks. fokus-håndtering på tvers av kommune-bytte) blir mer komplekst uten komponenter.
- **AI-agent-utfordring**: Endringer på "alle sektor-sider" må gjøres med søk-og-erstatt på tvers av filer. Lett å introdusere subtile inkonsistenser.

**Avvist fordi:** Skalerings- og vedlikeholds-kostnaden vokser kvadratisk med antall sider/sektorer/visninger. Bjørnetjeneste mot rapportenes ambisjonsnivå.

---

### Alternativ B: Vite + Preact (lett SPA)

Vite som dev-server + bygger, Preact (3 KB React-alternativ) for komponenter. Wouter eller Preact Router for client-side routing.

**Fordeler:**
- Komponentmodell uten React-overhead.
- Reactivity og state management innebygget.
- Stort utvalg av npm-pakker tilgjengelig.
- Vite-developer-experience er topp-klasse.

**Ulemper:**
- **Ren SPA-modell**: Hele app-JS lastes ved første sidebesøk. Selv med code-splitting blir initial bundle 50–80 KB minimum (Preact + router + app-shell). FCP blir ~500–800 ms på mobil — tett opp mot BRIEFs 2s-mål.
- **Ingen SSG ut av boksen**: Pre-rendering må legges til separat (vite-ssg eller lignende), som er mindre etablert enn Astros standard.
- **Tilgjengelighet er vanskeligere**: SPA-router og fokus-håndtering er klassisk a11y-pitfall. WCAG 2.2 AA krever ekstra arbeid.
- **JSX/TSX**: Brytes med v1's HTML-først-tilnærming. AI-agenter må kunne JSX-syntaks.
- **State-håndtering**: Rapportens A6 (justerbar vekting) krever URL-synkronisert state. Trivielt i Astro (URL er sannhetskilde, hver side er ny request), mer arbeid i SPA (history.replaceState + listener).

**Avvist fordi:** SPA-modellen forlanger client-side hydration uten å gi ytelsesgevinst over SSG for vårt bruksmønster (statiske data oppdatert 2x/år, ikke real-time).

---

### Alternativ C: Ren statisk site-generator (11ty / Eleventy)

Pure SSG. Skriv templates i Nunjucks/Liquid/Markdown, bygg til statisk HTML. JavaScript inkluderes som vanlige `<script>`-tags.

**Fordeler:**
- Enklere mentalmodell enn Astro: ingen "islands"-konsept.
- Veldig modent økosystem.
- Ekstrem byggeytelse på små-mellom prosjekter.

**Ulemper:**
- **Ingen islands**: Chart.js og SheetJS lastes på alle sider, eller manuelt code-splittes via CDN-tags. Bundle-størrelsen ender opp dårligere enn Astro.
- **Mindre Vercel-integrasjon**: Fungerer, men dokumentasjon og adapter-support er mindre etablert enn Astro.
- **Templating er Nunjucks/Liquid, ikke JS**: Ny syntaks for AI-agenter å håndtere, mindre kjent enn ren HTML/JS.
- **Komponent-modellen er svakere**: Includes/macros er ikke like ergonomisk som Astro/React-komponenter.

**Avvist fordi:** Astro er strengt tatt et superset (det er en SSG også), og gir oss "islands"-fleksibilitet vi vil trenge for Chart.js og senere kart.

---

### Alternativ D: Next.js (full framework)

App Router med React Server Components + ISR.

**Fordeler:**
- Bransje-standard for Vercel.
- Mest funksjonalitet ut av boksen (image-optimering, font-loading, middleware).
- Mest etablerte AI-trening og community.

**Ulemper:**
- **Svært overdimensjonert** for vårt bruksområde. App Router med RSC er kompleks selv for utvikler-team — dramatisk overhead for en liten dataside.
- **React-lock-in**: Mer å lære, mer som kan gå galt, og har større fotavtrykk i produksjon.
- **Bryter "ingen unødvendig kompleksitet"-prinsippet** i CLAUDE.md tydeligst av alle alternativene.

**Avvist fordi:** All den ekstra komplekstiteten kjøper oss ikke noe vi faktisk trenger.

---

## Consequences

### Positive

- **Ytelse**: SSG + edge-cache + pre-compute gir oss FCP < 200 ms på mobil — godt under BRIEFs 2s-mål.
- **Skalerbarhet**: 12 sektorer + 357 kommuner + dypdykk + sammenligning passer fil-routing-modellen uten arkitekturendringer.
- **Tilgjengelighet**: Astro-genererte sider er ren HTML — startpunktet for WCAG 2.2 AA er bedre enn for SPA.
- **Vedlikeholdbarhet**: Komponentmodell + filbasert routing reduserer kopikode på tvers av sider.
- **AI-agent-vennlig**: Forutsigbar struktur, ren HTML i template, mindre "magi" enn React/Vue.
- **Migrasjonsvennlig**: v1 kan portes gradvis. `index.html` blir `index.astro` i én PR, sektor-sidene legges til i påfølgende PR-er.

### Negative / aksepterte trade-offs

- **Build-steg innføres**: Bryter v1-prinsippet "ingen build-steg". Krever Node 18+ for utvikling. Akseptert fordi gevinsten er stor og buildet er trivielt (`npm run build` på Vercel).
- **npm install-avhengighet**: ~80–120 npm-pakker kommer inn i lockfile. Sikkerhetsrisiko (typo-squatting, kompromitterte pakker) økes. Mitigering: bruk `package-lock.json`, kjør Dependabot/`npm audit` regelmessig.
- **Tech-stack-bytte krever Vegards godkjenning** (CLAUDE.md-regel). Denne ADR-en er det formelle godkjennings-grunnlaget.
- **AI-agenter må forstå Astro-syntaks** (`---`-frontmatter, `<style>`/`<script>`-scoping). Mer forskjellig fra ren HTML enn vanilla. Mitigert ved at Astro er populært og godt dokumentert.
- **Større disk-fotavtrykk**: `node_modules/` blir ~150–250 MB. Akseptert.

### Risikoer

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|---|---|---|---|
| Astro 5.x kommer og bryter API | Medium (årlig) | Lav (oppgradering er typisk 1 dag) | Bruk LTS-versjon, oppgrader bevisst |
| Vercel endrer Astro-adapter-kontrakt | Lav | Lav | Adapter er versjonert, vi pinner |
| `npm install` blir flaky på Vercel | Lav | Medium (build-feil) | Bruk `package-lock.json`, cachere npm-pakker |
| Migrasjon tar lengre enn forventet | Medium | Medium (forsinker AP-02) | Migrer i steg: Steg 1 = `index.astro` med samme funksjonalitet, Steg 2+ = nye sider |
| Vi oppdager at SSG ikke holder for et future use-case | Lav | Lav | Astro støtter SSR/ISR, kan slås på per side |

### Krav for at beslutningen står

- **Vegard godkjenner ADR-en** og tech-stack-bytte fra "vanilla, ingen build-steg" til "Astro med build-steg".
- **AP-02 (UX/UI wireframes)** levert og godkjent — sikrer at side-strukturen vi bygger faktisk passer ønsket UX.
- **AP-03 (Vercel-hygiene)** levert — sikrer at edge-cache-headers er på plass før vi flytter trafikk fra v1 til v2.

### Implementasjonsplan (skissert, ikke del av denne PR)

1. **Pre-implementasjon (etter Vegards OK):**
   - Initialiser Astro-prosjekt i en feature-branch (`feature/astro-init`).
   - Oppdater `BRIEF.md` sin tech-stack-seksjon.
   - Oppdater `DEPLOY.md` med build-kommando.
2. **Steg 1 — port v1:**
   - Flytt `index.html` til `src/pages/index.astro`. Funksjonelt likt, men nå Astro-kompilert.
   - Bekreft at preview-deploy gir samme dashboard som v1.
3. **Steg 2 — kommune-velger (rapport A1):**
   - `src/pages/kommune/[kode].astro` — én rute, dynamiske parametre.
   - Hent kommuneliste fra Klass-API ved build.
4. **Steg 3 — sektor-dypdykk (rapport D1):**
   - `src/pages/sektor/[id].astro` for grunnskole + pleie/omsorg først.
5. **Steg 4 — politiker-modus + sammenligning (rapport D5 + D2):**
   - Egne ruter med samme datagrunnlag, annen presentasjon.

Hvert steg er én PR. Implementasjonen starter ikke før Vegard har godkjent denne ADR-en.

---

## Referanser

- AP-04 SSB-spike: `spike/ssb-alle-kommuner`-branch + `spike/results/`
- AP-04 strategi: `team/API-KONTRAKT.md` seksjon "Datalast — alle kommuner"
- AP-03 deploy-prosess: `team/DEPLOY.md`
- Suksesskriterier: `team/BRIEF.md` (oppdatert i Pakke 0)
- 2.0-rapport, kapittel 5–6: anbefalinger A1, A3, A6, B1, B5, C1, D1, D5, E1, E4
- KOSTRA-rapport, kapittel 2.2: KOSTRA-grupper og sammenligningsmetodikk
- [Astro-dokumentasjon](https://docs.astro.build/)
- [Astro Vercel-adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
