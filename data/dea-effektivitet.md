# C8: DEA-effektivitetsanalyse fra SØF (Senter for økonomisk forskning)

> **Status:** Skeleton + utredning. SØFs Data Envelopment Analysis publiseres årlig på regjeringen.no som CSV-vedlegg.

## Hva er DEA

Data Envelopment Analysis er en lineær-programmerings-metode som beregner relativ effektivitet mellom enheter (her: kommuner) gitt input (kostnader) og output (tjenestevolum). En kommune får score 1.0 om den ligger på "effektivitetsfronten" og lavere ellers.

SØF beregner DEA for tre kjernesektorer årlig:
- Barnehage
- Grunnskole
- Pleie og omsorg

Resultatet brukes i regjeringens **kommuneproposisjon** og er offentlig autoritativt.

## Datakilde

- URL-mønster: `https://www.regjeringen.no/contentassets/{ID}/sof-effektivitet-{år}.xlsx` eller .csv
- Tabell-struktur: kommunenummer, sektor, effektivitet (0.0–1.0)

## Foreslått implementasjon

1. Last ned siste DEA-rapport fra regjeringen.no (årlig 1. mai).
2. Konverter til `data/dea-{år}.json`: `{ kommunenummer: { barnehage: 0.87, grunnskole: 0.93, pleie: 0.79 } }`.
3. Vis effektivitets-score som ekstra kolonne i sektor-kort (under sektor-rangeringen).
4. Klikk-tooltip forklarer at 0.87 betyr "kunne produsert samme tjeneste med 13 % lavere ressursbruk i teorien".

## HANDOFF

Vegard / Backend må:
1. Følge regjeringen.no for ny SØF-rapport (april/mai).
2. Konvertere til JSON.
3. Frontend integrerer med eksisterende sektor-kort.

## Referanser

- [SØF-rapporter](https://samforsk.no/publikasjoner/)
- [Effektivitetsanalysen — regjeringen.no](https://www.regjeringen.no/no/tema/kommuner-og-regioner/kommunedata/effektivitetsanalyse/id518765/)
