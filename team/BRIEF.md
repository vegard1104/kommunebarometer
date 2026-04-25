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
├── kommunebarometer/       ← separat subfolder med egen README + vercel.json (eldre klone? se kort på dette før du rører det)
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
4. **Rapportene** i roten (`Kommunebarometer-2.0-...docx` og `KOSTRA-oversikt...docx`). Hvis Python-docx ikke kan åpne dem sier det "Package not found" — da er filene OneDrive-stubber og Vegard må åpne dem i Word først. Si fra til Vegard hvis det skjer.

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

## Suksesskriterier for v2 (foreløpig — Prosjektleder verifiserer mot rapportene)

Disse er baselinje som Claude (i Cowork-bootstrap-rollen) satte opp 2026-04-24 basert på repo-state og prosjekt-kontekst. **Prosjektleder skal lese `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx` og `KOSTRA-oversikt-og-dypdykk.docx` og justere/utvide denne listen.**

**Må-ha (v2 MVP):**
1. Dekning alle 357 norske kommuner — ikke bare Lørenskog. Bruker skal kunne velge kommune fra en liste/søk og få samme dashboard.
2. KOSTRA-dypdykk: minst 3 tematiske områder (foreslås av Prosjektleder basert på KOSTRA-dokumentet, f.eks. helse/omsorg, oppvekst, økonomi).
3. Sammenlikningsvisning: velg 2–3 kommuner + nasjonalt snitt for samme indikator.
4. Eksport: CSV/Excel av det som vises på skjermen (SheetJS er allerede inne i v1).
5. Produksjon på Vercel med fersk data fra SSB PxWeb — ingen manuelle data-dumper.

**Bør-ha (hvis tid):**
6. Delbare lenker (kommune + indikator i URL).
7. Enkel "om"-/metodikk-side som forklarer hva som måles og kildene.
8. Lettere hjelpetekster for ikke-tekniske brukere (fundraising-use-case).

**Kvalitet:**
- Tilgjengelighet WCAG 2.1 AA på kjerneskjermene.
- Fungerer på mobil (telefonstørrelse) uten horisontal scroll.
- First Contentful Paint under 2 s på middels mobilnett.

**Utenfor scope for v2:**
- Innlogging/brukerkontoer.
- Lagring av brukerdata.
- CMS/redaksjonelt verktøy.

> **Viktig:** Disse er foreløpige. Kommer rapportene med andre prioriteringer (spesielt CEO-anbefalingene), overstyrer de denne listen. Prosjektleder skal flagge endringer tydelig i `PROSJEKTLOGG.md`.
