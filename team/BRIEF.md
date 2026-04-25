# Prosjekt-brief: Kommunebarometer 2026

> **Hvem leser dette:** Alle agenter i teamet. Les hele fila FØR du starter på en oppgave. Dette er eneste kilden til "hva jobber vi med"-kontekst.

## Hva er Kommunebarometer

- Selvoppdaterende indeks over norske kommuner basert på **SSB KOSTRA-tall**.
- **Sluttbrukere** (jf. panelets brukerprofiler i 2.0-rapporten kapittel 2):
  - **Rådmann/kommunedirektør** — sammendragsbilde til formannskap, raske forklaringer på kommunesammenligning.
  - **Økonomisjef/controller** — KOSTRA hver måned i budsjett- og økonomiplan, nedlasting av tallserier, kobling til egen rapportering.
  - **Kommunalsjefer (oppvekst, helse/omsorg)** — KOSTRA + tjenestespesifikke kilder (Udir, IPLOS, folkehelseprofil) i sektor-styring.
  - **Planlegger/samfunnsanalytiker** — tidsserier, sammenhenger mellom indikatorer, kommuneplan-grunnlag.
  - **Politiker (formannskap)** — enkle bilder, store tall, én setning som forklarer, A4-utskrift.
  - **Tillitsvalgt/innbygger** — om egen kommune gir gode tjenester sammenlignet med nabokommuner.
- Dagens versjon (v1): én enkelt `index.html` med dashboard for Lørenskog, henter data live fra SSB PxWeb-API v2 via Vercel-rewrite.
- Neste versjon (v2): skalere til alle norske kommuner + dypere KOSTRA-dypdykk + panel-anbefalinger fra CEO-runden.

## Hvor ligger ting

```
kommunebarometer-github-upload/
├── index.html              ← dagens produksjonskode (dark-mode dashboard, Lørenskog)
├── vercel.json             ← deploy-config, inkl. SSB API-rewrite
├── README.md               ← kort offisiell repo-readme
├── .gitignore              ← ignorerer .claude/-worktrees, editor- og OS-filer
├── team/                   ← delt arbeidsflate for agentene (dere leser og skriver her)
│   ├── BRIEF.md            ← denne fila
│   ├── PROSJEKTLOGG.md     ← Prosjektleder/Tech Lead eier, alle leser
│   ├── HANDOFF.md          ← aktiv handoff-kø
│   ├── API-KONTRAKT.md     ← Backend/Fullstack skriver, Frontend leser
│   ├── DESIGN-TOKENS.md    ← Designer eier
│   ├── DATAKILDER.md       ← Data/Innhold eier (KOSTRA-tabeller, oppdateringskadens)
│   └── agents/             ← systempromptene til alle teammedlemmer
├── Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx
└── KOSTRA-oversikt-og-dypdykk.docx
```

## Obligatorisk lesning før du starter

1. **Denne fila (BRIEF.md).**
2. **PROSJEKTLOGG.md** — siste beslutninger og status.
3. **HANDOFF.md** — sjekk om det er noe som venter på deg.
4. **Rapportene** i roten (`Kommunebarometer-2.0-...docx` og `KOSTRA-oversikt...docx`). Tekstuttrekk fungerer via PowerShell zip-extract av `word/document.xml` om du ikke har Word installert — se PROSJEKTLOGG 2026-04-25 for kommando.

## Tech stack (v1, kan endres av Tech Lead med begrunnelse)

- **Frontend:** Vanilla HTML/CSS/JS, Chart.js 4.4, SheetJS (xlsx) 0.18. Ingen build-steg.
- **Deploy:** Vercel, `main` = produksjon.
- **Data:** SSB KOSTRA via PxWeb API v2 (proxy på `/api/ssb/*` → `data.ssb.no/api/pxwebapi/v2/*`).
- **Repo:** GitHub (spør Release Manager om remote-detaljer).

## Arbeidsregler (gjelder alle)

1. **Les /team/-mappen først.** Ikke anta — sjekk.
2. **Handoff skjer via filer**, ikke via Vegard som beskjed-budbringer. Du skriver til `HANDOFF.md` når du er ferdig og noen andre skal ta over.
3. **Vegard er produkteier.** Prosjektleder er primær-kontakten. Eskalér til Vegard kun når rolle-prompten din sier det.
4. **Ingen merge til `main` uten eksplisitt godkjenning fra Vegard.** Release Manager håndhever dette.
5. **Språk:** norsk i all kommunikasjon, kode-kommentarer og commit-meldinger.

## Avgrensning — hva vi IKKE gjør uten godkjenning

- Bytter ikke tech stack uten diskusjon i teamet og godkjenning fra Vegard.
- Legger ikke til betalte tjenester (hosting, databaser, APIer) uten Vegards OK.
- Sletter ikke `index.html` eller endrer drastisk før v2-arkitekturen er låst og Vegard har godkjent.
- Samler ikke inn persondata uten personvern-vurdering.

## Suksesskriterier for v2 — speilet fra 2.0-rapportens roadmap (kapittel 6)

Suksesskriteriene følger nå 2.0-rapportens egen tre-deling (`Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx`, kapittel 6.1–6.3) i stedet for må-ha/bør-ha-kategorier. Hver pakke har en kode (A1, B5 osv) som peker til detaljert beskrivelse i rapportens kapittel 5. Sluttbrukerne — kommunalt ansatte og innbyggere — er beskrevet i kapittel 2.

**Hovedbudskap fra panelet:**
- KOSTRA alene er utilstrekkelig — vi må koble til FHI/Helsedirektoratet, Udir, Ungdata, Brønnøysund, KMD inntektssystem.
- Metodikken må være transparent og justerbar — bruker skal kunne se hvordan tall er beregnet, og overstyre vekting.
- Siden må gå fra måling til handling — trend, kontekst, behovsjustering, eksterne kilder for å svare på "hvorfor".

### Quick wins (rapport §6.1 — 0 til 4 uker)

Bygges først. Liten kostnad, stor effekt på lesbarhet og tillit.

1. **A3 — Fireårsgjennomsnitt + trend-pil + sparkline** per indikator. Ett-års-tall er for volatilt; rådmann og planlegger trenger retning over tid.
2. **A4 — "Hva betyr dette?"-forklaringsbobler.** Topp-30 indikatorer skrives først; politiker og innbygger skal forstå om høyt tall er bra eller dårlig.
3. **A5 — Nedlasting (CSV, bilde, delelenke).** Reduserer friksjon for politiske saker og presse-bruk.
4. **B5 — Edge-cache + brukervennlige feilmeldinger + observabilitet.** Cache-Control `s-maxage=86400, stale-while-revalidate=604800` på `/api/ssb/*`. Sentry gratis-tier.
5. **C1 — SSB Klass-API for kommuneinndeling.** Forutsetning for B2 og A1; håndterer kommunesammenslåinger trygt.
6. **C6 — ROBEK-badge** på kommune-siden. Quick win, høy relevans for politiske brukere.
7. **E1 + D6 — Metodikk-side med vekt-begrunnelse og kildedokumentasjon.** Tillit hos økonomisjef, presse, akademia.
8. **E4 — Sist-oppdatert-stempel + SSB-tabellnummer** synlig på hver indikator.

### Medium-løft (rapport §6.2 — 1 til 3 måneder)

Strukturelle endringer som åpner produktet for hele 357-kommune-markedet.

9. **A1 — Universell kommunevelger** med søk over alle 357 kommuner. Delbar URL `?kommune=3029`.
10. **A6 — Justerbar vektberegning** med slidere; brukeren ser umiddelbar effekt på rangering.
11. **B1 — Eksplisitt indikator-register** (JSON med retning, enhet, kategori, beskrivelse, SSB-tabellnummer) — erstatter regex-heuristikken som i dag styrer rangering.
12. **B2 — Dynamisk kommuneinndeling** via Klass-API (avhenger av C1).
13. **B4 — WCAG 2.2 AA-audit + fargesvaksynt-trygg palett + skjermleser-fallback** for Chart.js-grafer.
14. **C2 — Folkehelseprofil-integrasjon** (Helsedirektoratet, overtatt fra FHI 2024).
15. **C3 — Udir Statistikkbanken** (nasjonale prøver, eksamen, Elevundersøkelsen). Personvern-prikking håndteres som "for få observasjoner — ikke publisert".
16. **C7 — Brønnøysund næringsstruktur** (BRREG + SSB 13011).
17. **D2 — Sammenlign-to-kommuner / Duell-side** med delbar URL.
18. **D5 — Politiker-modus** — forenklet visning med rødt/gult/grønt + én setning + A4-utskrift.
19. **D6 — Metodikk-side** (utvides fra D6-stub i Quick wins).

### Strategiske spor (rapport §6.3 — 3 til 9 måneder)

Større arkitektur-/innholds-endringer. Lavere haste, høy effekt på seriøsitet.

20. **A2 — Behovsjusterte tall** (utgiftsbehovsindeks, aldersnøkkel). Avhenger av C9. *Rapporten kaller dette "den største svakheten i dagens versjon".*
21. **B3 — Mobil-først redesign.** Stack-layout, sticky-filter, radar→bar på mobil. Avhenger av at B1 (indikator-register) er ferdig først.
22. **C4 — Ungdata-integrasjon** (NOVA/OsloMet). Manuell/halvauto innhenting per kommune (kommuneRapporter publiseres som PDF/datatabeller).
23. **C8 — DEA-effektivitetsanalyse fra SØF** (regjeringen.no, årlig CSV-vedlegg).
24. **C9 — KMD inntektssystem / utgiftsbehov** (grønne hefter, årlig Excel). Forutsetning for A2.
25. **D1 — Sektor-dypdykk** (egne ruter `/sektor/grunnskole`, `/sektor/pleie`, ...) som samler KOSTRA + Udir + FHI + Ungdata + Bedrekommune per sektor. Start med grunnskole + pleie/omsorg.
26. **D3 — Kartvisning** — Norgeskart koroplet, GeoNorge GeoJSON.
27. **D4 — KOSTRA-gruppe-analyse** — egen side per gruppe (1–16 + kraftkommuner), beste/dårligste per sektor.
28. **D7 — REST-API + abonnement-spor** (Vercel serverless). Lar økonomisjefer dra tall inn i Power BI/Excel.
29. **E2 + E3 — Indikator-kvalitetsmerking + usikkerhetsintervall** — skjul/degrader svake tall, vis "uklar forskjell" i stedet for falsk presisjon.

### Kvalitetskrav (gjelder alle pakker)

- **WCAG 2.2 AA** på kjerneskjermene (jf. tilgjengelighetsforskriften for offentlige nettsteder).
- Fargepalett verifisert fargesvaksynt-trygg (Colorbrewer / ColorBlind safe).
- Mobil (375 px) uten horisontal scroll på endrede skjermer.
- First Contentful Paint under 2 s på middels mobilnett.
- Skjermleser-fallback (data-tabell + aria-labels) for alle Chart.js-grafer.
- Sammenligning skal alltid skje på tre nivåer samtidig (egen kommune over tid + KOSTRA-gruppe + landet uten Oslo) — KOSTRA-rapportens standardpraksis.

### Utenfor scope for v2

- Innlogging/brukerkontoer, lagring av brukerdata, CMS/redaksjonelt verktøy.
- **C5 — Bedrekommune.no-integrasjon** krever kommersiell avtale (KS/KF). Egen HANDOFF-pakke åpnes for at Vegard skal vurdere lisensavtale; ikke implementert i v2.
- **SSB mikrodata / registerdata** (KOSTRA-rapport nivå 8) — søknadspliktig, ikke aktuelt.

> **Endringshistorikk:** 2026-04-25 — restrukturert mot 2.0-rapportens roadmap-tre-deling (kapittel 6.1–6.3) og fjernet feilaktig CP-foreningen/fundraising-kontekst. Sluttbrukerne er kommunalt ansatte og innbyggere/politikere, ikke en interesseorganisasjon. Endringer i suksesskriterier krever oppdatering av PROSJEKTLOGG og varsling i HANDOFF. Alle nye krav må kunne spores til en konkret anbefaling i 2.0-rapporten eller KOSTRA-rapporten.
