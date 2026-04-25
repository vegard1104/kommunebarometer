# C9: KMD inntektssystem (grønne hefter)

> **Status:** Skeleton + utredning. Forutsetning for A2 (behovsjustering — rapportens "største svakhet i dagens versjon").

## Hva er dette

Inntektssystemet for kommunesektoren er en av de viktigste finansieringsmekanismene i norsk forvaltning:

- **Rammetilskudd**: Basis-/utgiftsutjevning, særskilt fordeling, Nord-Norge-tilskudd, småkommuner-tilskudd, distriktstilskudd, vekstkommune-tilskudd, storbytilskudd, regionsentertilskudd.
- **Utgiftsutjevning**: kompenserer for forskjeller i utgiftsbehov mellom kommuner. Dette er nøkkelen til behovsjustering i Kommunebarometer 2.0.

## Datakilder (manuell innhenting)

KMD publiserer dataene i de såkalte **grønne heftene**:

- **"Inntektssystemet for kommuner og fylkeskommuner"** — årlig publikasjon, distribueres som Excel-vedlegg på regjeringen.no.
- URL-mønster: `https://www.regjeringen.no/contentassets/{ID}/inntektssystemet-XX.xlsx` der `XX` er årstall.
- Excel-arket inneholder utgiftsbehovsindeks per kommune (1.000 = landsgjennomsnitt).

## Framtidig integrasjon

1. **Manuell nedlasting** av siste grønne hefte (årlig prosess, 1. januar).
2. **Excel-parsing** med SheetJS (allerede inne i v1) for å hente utgiftsbehovsindeks per kommune.
3. **Lagring** i `data/utgiftsbehov-{år}.json` med struktur `{ kommunenummer: { utgiftsbehov: 1.085, sektorvekt: {...} } }`.
4. **Bruk** i A2 (behovsjustering): KOSTRA-tall × (1 / utgiftsbehov) for å gi sammenlignbare verdier.

## HANDOFF — manuell oppgave

Vegard / Backend må:

1. Laste ned siste grønne hefte fra regjeringen.no.
2. Identifisere kolonner for utgiftsbehov per kommune (varierer mellom årstall).
3. Bygge JSON-fila i `data/`-mappa.
4. Oppdatere A2-implementasjonen til å bruke fila.

Estimert arbeid: 2-3 dager innkluding validering mot KS publiserte tall.

## Referanser

- [Inntektssystemet for kommunene](https://www.regjeringen.no/no/tema/kommuner-og-regioner/kommuneokonomi/inntektssystemet-for-kommuner-og-fylkeskommuner/id551623/)
- [TBU — Teknisk beregningsutvalg](https://www.regjeringen.no/no/dep/kdd/org/styrer-rad-og-utvalg/det-tekniske-beregningsutvalg-for-kommune/id417616/)
- KS sine ASSS-rapporter for kontroll (utvalgte storkommuner)
