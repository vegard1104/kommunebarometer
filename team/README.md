# /team/ — Kommunebarometer

Delt arbeidsflate for agent-teamet. Agenter i Cowork snakker ikke direkte sammen, så samarbeid skjer via filene her.

## Kom i gang (for Vegard)

1. **Sørg for at rapportene er fullt synket lokalt.** `Kommunebarometer-2.0-panel-og-CEO-anbefalinger.docx` og `KOSTRA-oversikt-og-dypdykk.docx` bør åpnes i Word én gang, eller høyreklikk → "Behold alltid på denne enheten" (OneDrive). Agentene kan ikke lese OneDrive-stubber.
2. **Opprett 9 agenter i Cowork.** Én per fil under `agents/`. Kopier hele fil-innholdet inn som systemprompt.
3. **Gi dem riktige tilganger.** Release Manager trenger Chrome + GitHub + Vercel. De andre trenger bare filsystem (denne mappen).
4. **Snakk kun med Prosjektleder først.** Han delegerer videre. De andre agentene aktiveres når Prosjektleder har lagt oppgaver i `HANDOFF.md`.
5. **Første melding til Prosjektleder:** "Kjør åpningsrutinen, les 2.0-rapporten og KOSTRA-dokumentet, og gi meg forslag til første arbeidspakke."

## Filstruktur

| Fil | Eier | Formål |
|---|---|---|
| `BRIEF.md` | Prosjektleder | Prosjekt-kontekst. Alle leser. |
| `PROSJEKTLOGG.md` | Prosjektleder + Tech Lead | Kronologisk logg over beslutninger. |
| `HANDOFF.md` | Alle | Aktiv arbeidskø. Du skriver når du leverer videre, du leser når du åpner en samtale. |
| `API-KONTRAKT.md` | Backend/Fullstack + Tech Lead | Grensesnitt mellom frontend og data-lag. |
| `DESIGN-TOKENS.md` | UX/UI-designer | Farger, typografi, spacing. |
| `DATAKILDER.md` | Data/Innhold (ev. Backend) | KOSTRA-tabeller, lisens, oppdateringskadens. |
| `agents/` | — | Systempromptene. |

## Hvorfor denne strukturen

- **Asynkron handoff.** Hver agent starter med å lese `HANDOFF.md` → vet umiddelbart hva de skal gjøre.
- **Én sannhetskilde per domene.** API-kontrakt ligger ett sted. Ikke to.
- **Kort kontekst å lese.** Alle filer holdes under ~200 linjer. Detaljer hører hjemme i kode, PR-er eller egne underdokumenter.
- **Vegard blir ikke mellommann.** Agentene henter kontekst fra filer, ikke fra Vegards hukommelse.

## Regler for alle agenter

1. Les /team/-filene FØR du begynner på en oppgave.
2. Oppdater `HANDOFF.md` når du leverer videre.
3. Logg beslutninger i `PROSJEKTLOGG.md` når de påvirker andre.
4. Språk: norsk i all kommunikasjon.
5. Ingen merge til `main` uten Vegards eksplisitte godkjenning.
