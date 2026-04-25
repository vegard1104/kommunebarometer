# Prosjekt-brief: Kommunebarometer 2026

> **Hvem leser dette:** Alle agenter i teamet. Les hele fila FØR du starter på en oppgave. Dette er eneste kilden til "hva jobber vi med"-kontekst.

## Hva er Kommunebarometer

- Selvoppdaterende indeks over norske kommuner basert på **SSB KOSTRA-tall**.
- Målgruppe: CP-foreningen (Cerebral Parese-foreningen) og allmennhet — siden brukes også i fundraising- og påvirkningsarbeid.
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

## Suksesskriterier for v2 (verifisert mot rapportene 2026-04-25)

Forankret mot `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx` (kapittel 5–6, roadmap A/B/C/D/E) og `KOSTRA-oversikt-og-dypdykk.docx`. Referanser i parentes peker tilbake til anbefalingene i 2.0-rapporten for sporbarhet. CEO-rapportens kjernebudskap: KOSTRA alene er utilstrekkelig; metodikken må være transparent og justerbar; siden må gå fra måling til handling.

**Må-ha (v2 MVP):**
1. **Universell kommunevelger** — alle 357 norske kommuner via SSB Klass-API (klassifikasjon 131). Delbar URL med `?kommune=...` (A1).
2. **Sektor-dypdykk for grunnskole + pleie/omsorg** som første lansering — egne sider med KOSTRA-indikatorer i de fire indikatortypene fra KOSTRA-rapporten (prioritering, dekningsgrad, produktivitet, utdypende kvalitetstall) (D1).
3. **Sammenlikning på tre nivåer samtidig** per visning: egen kommune over tid, egen KOSTRA-gruppe, og landet uten Oslo (KOSTRA-rapport seksjon 6, standard kommunesektorpraksis).
4. **Eksplisitt indikator-register med retning per indikator** — fjerner regex-heuristikken (LOWER_IS_BETTER / HIGHER_IS_BETTER) som i dag styrer rangering (B1). Datakvalitetskritisk.
5. **Trend-pil + 4-årsgjennomsnitt** per indikator (sparkline) — ett-års-tall er for volatilt for politisk og økonomisk styring (A3).
6. **Sist-oppdatert-stempel + SSB-tabellnummer** synlig på hver indikator (E4).
7. **Eksport: CSV/Excel** av det som vises på skjermen (SheetJS allerede i v1) (A5).
8. **Produksjon på Vercel med fersk data fra SSB PxWeb + edge-caching og graceful degradation** ved SSB-utfall (B5).

**Bør-ha (hvis tid):**
9. **Behovsjustering** — vis "råtall" og "justert for utgiftsbehov/aldersnøkkel" side om side. Krever KMDs grønne hefte / inntektssystemet (A2 + C9). *Flagget i CEO-rapporten som "den største svakheten i dagens versjon"; bør forfremmes til må-ha hvis tid tillater.*
10. **Justerbar vekting** — slidere som lar bruker se hvordan rangering endres (A6).
11. **"Hva betyr dette?"-forklaringsbobler** per indikator (A4).
12. **Politiker-modus** — forenklet visning med rødt/gult/grønt + én setning per sektor + A4-utskrift (D5). *Direkte relevant for CP-foreningens påvirkningsbruk.*
13. **ROBEK-badge** på kommune-siden (C6).
14. **Dynamisk kommuneinndeling** via SSB Klass — fjerner hardkodet MERGERS-tabell (B2).
15. **Metodikk-/dokumentasjonsside** med kildekildeliste, vekting, kjente svakheter, endringslogg (D6).
16. **Kartvisning** — koroplet over Norge per indikator (D3).

**Kvalitet:**
- Tilgjengelighet **WCAG 2.2 AA** på kjerneskjermene (oppdatert fra 2.1 jf. tilgjengelighetsforskriften for offentlige sider).
- Fargepalett verifisert fargesvaksynt-trygg (Colorbrewer / ColorBlind safe).
- Fungerer på mobil (telefonstørrelse) uten horisontal scroll. Mobil-først redesign der det gir mening (B3).
- First Contentful Paint under 2 s på middels mobilnett.
- Skjermleser-fallback for alle Chart.js-grafer (data-tabell + aria-labels) (B4).

**Utenfor scope for v2:**
- Innlogging/brukerkontoer.
- Lagring av brukerdata.
- CMS/redaksjonelt verktøy.
- **Bedrekommune.no-integrasjon (C5)** — krever kommersiell avtale, parkeres til etter v2.
- **SSB mikrodata / registerdata (KOSTRA-rapport nivå 8)** — søknadspliktig, ikke aktuelt.
- **API/abonnement-spor (D7)** — v3-vurdering.

**v2.x — eksterne datakilder ut over KOSTRA (planlagt etter v2-lansering):**
Panelet i 2.0-rapporten understreker at "KOSTRA alene er utilstrekkelig" for å svare på "hvorfor"-spørsmål. Disse parkeres bevisst utenfor v2 MVP, men løftes i v2.x-roadmap så snart MVP er stabil:
- Folkehelseprofilen (Helsedirektoratet, fra 2024) (C2)
- Udir Statistikkbanken — nasjonale prøver, eksamen, Elevundersøkelsen (C3)
- Ungdata (NOVA/OsloMet) (C4)
- Brønnøysund / næringsstruktur (C7)
- SØFs DEA-effektivitetsanalyse (C8)
- KMDs grønne hefter / inntektssystemet (C9) — forutsetning for å løfte A2 til må-ha

> **Endringer fra forrige versjon:** Listen er forankret mot rapportene 2026-04-25. Endringer her krever oppdatering av PROSJEKTLOGG og varsling i HANDOFF. Alle nye må-ha må kunne spores til en konkret anbefaling i 2.0-rapporten eller KOSTRA-rapporten.
