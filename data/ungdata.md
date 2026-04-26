# C4: Ungdata-integrasjon

> **Status:** Skeleton + utredning. Ungdata mangler offentlig REST-API; krever manuell innhenting per kommune.

## Hva er Ungdata

Ungdata er Norges største ungdomsundersøkelse — gjennomføres hvert 3. år per kommune i regi av NOVA / OsloMet. Måler:
- Trivsel og psykisk helse
- Rusbruk
- Mobbing og krenkelser
- Familieforhold og venner
- Skolemiljø

Ungdata er **viktig kontekst** for KOSTRA-tallene innen oppvekst, helse, sosial og kultur.

## Datakilde

- [ungdata.no](https://ungdata.no) — kommunerapporter publiseres som PDF + datatabeller (Excel)
- Per-kommune-API ikke tilgjengelig per 2026-04
- NOVA/OsloMet eier dataene; sektor-tall publiseres som diagrammer i rapportene

## Foreslått implementasjon

1. **Manuell innhenting** av nøkkeltall fra Ungdata-rapporter per kommune (omtrent 50-100 kommuner per år, nye batch hver 3. år).
2. **JSON-struktur** `data/ungdata-{kommune}.json` med utvalgte indikatorer (trivsel, mobbing, rus).
3. **UI-integrasjon** i sektor-dypdykk for grunnskole + helse (D1).
4. **Personvern**: små kommuner får prikkete data — vi må respektere "for få observasjoner — ikke publisert".

## Alternative tilnærminger

- **Crowdsource** — la kommuner selv laste opp sine Ungdata-tall (krever moderering).
- **OCR av PDF-rapporter** — kostbar og fragil.
- **Direkte avtale med NOVA** — krever kontakt + evt. lisens.

## HANDOFF

Vegard / Backend må:
1. Avgjøre nivå av integrasjon (manuell innhenting per kommune vs. samarbeid med NOVA).
2. Hvis manuell: definere et minimumssett av nøkkeltall.

## Referanser

- [ungdata.no](https://ungdata.no)
- [NOVA/OsloMet om Ungdata](https://www.oslomet.no/om/nova/ungdata)
