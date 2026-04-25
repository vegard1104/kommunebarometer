# Behovsjustering (A2) — hva justeres og hva justeres ikke

> Dette dokumentet skal flettes inn i `metodikk.html` når den branchen merges.

## Prinsipp

DKI (delkostnadsindeks) er et tall fra KMDs inntektssystem som beregner forventet utgiftsbehov per kommune relativt til landsgjennomsnittet:

- **DKI = 1,00** → kommunen forventes å ha samme utgiftsbehov som snittet.
- **DKI > 1,00** → høyere behov (eldre befolkning, spredt bosetting, demografi). Eks: en kommune med DKI 1,18 forventes å bruke 18% mer per innbygger.
- **DKI < 1,00** → lavere behov. Lørenskog har DKI 0,81 for pleie/omsorg = 19% lavere fordi befolkningen er yngre.

Behovsjustert verdi = `kostnad / DKI`. Kommuner med høyt forventet utgiftsbehov "tjener" på justeringen — deres rå kostnader sammenliknes mot et høyere referanseutgangspunkt.

## Hva BLIR behovsjustert

Kun ekte kostnadsindikatorer (kr per innbygger / per bruker) i sektorer som har DKI:

| Sektor | DKI-felt | Eksempel-indikator |
|---|---|---|
| Grunnskole | `grunnskole` | Netto driftsutgifter per elev |
| Pleie og omsorg | `pleie` | Korrigerte brutto driftsutgifter per innbygger 80+ |
| Helse | `kommunehelse` | Driftsutgifter per innbygger til helsestasjon |
| Barnehage | `barnehage` | Korrigerte brutto driftsutgifter per oppholdstime |
| Barnevern | `barnevern` | Brutto driftsutgifter per barn |
| Sosialtjeneste | `sosial` | Brutto driftsutgifter per mottaker |
| Økonomi | `administrasjon` | Frie inntekter per innbygger (proxy) |

Whitelist-regex i koden: `/netto driftsutgift|brutto driftsutgift|driftsutgift.*kr|kostnad.*kr|kroner per|kr per innbygger|kr per bruker|gjeld i prosent|gjeld ex|frie inntekter/i`.

## Hva BLIR IKKE behovsjustert

Resultatindikatorer skal beholde rå-verdiene fordi de måler kvalitet, dekning eller utfall — ikke ressursbruk:

- **Dekningsgrad** (Andel barn 1-5 år i barnehage, Andel innb. 80+ med plass i institusjon)
- **Lærertetthet, fagutdanning** (Andel ansatte med godkjent utdanning)
- **Brukerundersøkelser** (Brukertilfredshet, Bedrekommune-skala)
- **Skolefaglige resultater** (Grunnskolepoeng, Nasjonale prøver)
- **Trivsel/mobbing** (Elevundersøkelsen, Ungdata)
- **Ventetid, sykefravær, vannlekkasje, gjenvinning** (effektivitet, ikke kostnad)

Sektorer uten DKI: kultur, eiendom, vann/avløp/renovasjon, miljø/klima, saksbehandling. For disse vises rå-verdier uavhengig av modus.

## UI

- **Toggle øverst på siden:** "Rådata" / "Behovsjustert" som radio-knapp.
- **State persisterer:** URL-parameter `?mode=justert` + localStorage `kb_mode`.
- **DKI-badge på sektorkort:** vises kun i justert modus, fargekodet:
  - Grønn (DKI < 0,95): kommunen "tjener" mer enn 5% på justeringen
  - Rød (DKI > 1,05): kommunen "taper" mer enn 5%
  - Standard (0,95–1,05): liten justering
- **Tooltip på badge:** klartekst-forklaring ("Forventes å bruke X% mindre enn landsgjennomsnittet").
- **Re-beregning:** Toggle re-kjører `computeSectorScores` og `computeOverall` uten ny SSB-fetch — instant respons.

## Kilder

- DKI-tall: `data/dki-2025.json` (Lørenskog POC, fra Grønt hefte 2026)
- Sektorvekter: `data/dki-2025.json` (delkostnadsnøkler — sum 1,00)
- Originalkilde: Kommunal- og distriktsdepartementet (KMD), grønne hefter, publisert årlig på regjeringen.no
