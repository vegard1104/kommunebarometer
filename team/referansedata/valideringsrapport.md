# Valideringsrapport — KOSTRA-tall mot Excel-referanse

**Generert:** 2026-04-25T18:28:46.443Z
**Kommune:** Lørenskog (kommunenummer 3222, Akershus 2024-)
**Årstall validert:** 2024, 2025
**Toleranse:** 0.5% relativt avvik
**Excel-fil:** `team/referansedata/Lorenskog_KOSTRA_2025_nokkeltall.xlsx`

## Sammendrag

- ✓ OK: **4**
- ✗ Avvik: **0**
- ⚠ Mangler/feil: **9**

## Resultater per indikator og år

| Indikator | År | Excel | SSB | Avvik | Status | SSB-tabell | Merknad |
|---|---|---|---|---|---|---|---|
| Innbyggere per 1.1. | 2024 | 50013.00 | – | – | SSB-FEIL: HTTP 400 | 11342 | Folkemengde 1.1 |
| Innbyggere per 1.1. | 2025 | 51511.00 | – | – | SSB-FEIL: HTTP 400 | 11342 | Folkemengde 1.1 |
| Frie inntekter per innbygger | 2024 | 63135.00 | 63135.00 | 0.00 | ✓ OK | 12134 |  |
| Frie inntekter per innbygger | 2025 | 69604.00 | 69604.00 | 0.00 | ✓ OK | 12134 |  |
| Netto driftsresultat i prosent av brutto driftsinntekter | 2024 | 0.20 | 0.20 | 0.00 | ✓ OK | 12134 |  |
| Netto driftsresultat i prosent av brutto driftsinntekter | 2025 | 4.00 | 4.00 | 0.00 | ✓ OK | 12134 |  |
| ? | ? | – | – | – | EXCEL-RAD MANGLER | 12134 |  |
| ? | ? | – | – | – | EXCEL-RAD MANGLER | 12134 |  |
| ? | ? | – | – | – | EXCEL-RAD MANGLER | 12134 |  |
| Andel barn 1-5 år i barnehage | 2024 | 94.30 | – | – | SSB-VERDI MANGLER | 12379 | ContentsCode må verifiseres mot 12379-metadata |
| Andel barn 1-5 år i barnehage | 2025 | 94.00 | – | – | SSB-VERDI MANGLER | 12379 | ContentsCode må verifiseres mot 12379-metadata |
| Grunnskolepoeng | 2024 | 42.40 | – | – | SSB-VERDI MANGLER | – | Ikke i KOSTRA — krever Udir Statistikkbank (rapport C3, ikke implementert) |
| Grunnskolepoeng | 2025 | 42.70 | – | – | SSB-VERDI MANGLER | – | Ikke i KOSTRA — krever Udir Statistikkbank (rapport C3, ikke implementert) |

## Excel-indikatorer detektert (alle 14)

- **Innbyggere per 1.1.** (antall): 2024=50013, 2025=51511, landet=5627400
- **Fødte per 1000 innbyggere** (per 1000): 2024=11.2, 2025=12.5, landet=9.8
- **Andel med innvandrerbakgrunn** (%): 2024=40.1, 2025=41.6, landet=21.8
- **Andel uføretrygdede 18-66 år** (%): 2024=7.2, 2025=7, landet=10.2
- **Frie inntekter per innbygger** (kr): 2024=63135, 2025=69604, landet=78932
- **Netto driftsresultat** (%): 2024=0.2, 2025=4, landet=2.2
- **Langsiktig gjeld (ekskl. pensj.) i % av br. driftsinnt.** (%): 2024=174.2, 2025=171.5, landet=114.2
- **Netto renteeksponering i % av br. driftsinnt.** (%): 2024=118.3, 2025=116.4, landet=48.2
- **Fri egenkapital drift i % av br. driftsinnt.** (%): 2024=9, 2025=11.3, landet=11.3
- **Netto drifts­utgifter grunnskole i % av tot. netto drift** (%): 2024=26.5, 2025=25.8, landet=21.8
- **Netto drifts­utgifter barnehage i % av tot. netto drift** (%): 2024=17.9, 2025=18.9, landet=14.4
- **Andel barn 1-5 år i barnehage** (%): 2024=94.3, 2025=94, landet=94.5
- **Årsverk helse/omsorg per 10 000 innbygger** (årsverk): 2024=193.3, 2025=198.4, landet=325.1
- **Andel brukerrettede årsverk m/helsefaglig utd.** (%): 2024=76.1, 2025=75, landet=72.4
- **Grunnskolepoeng (gjennomsnitt)** (poeng): 2024=42.4, 2025=42.7, landet=42.2
- **Grunnskole** (): 2024=17582, 2025=17671, landet=18710
- **Pleie og omsorg (ekskl. kommunehelse)** (): 2024=21461, 2025=21367, landet=27759
- **Barnehage** (): 2024=9647, 2025=10555, landet=12087
- **Barnevern** (): 2024=2155, 2025=2139, landet=3196
- **Sosialsektor (samlet)** (): 2024=5296, 2025=5232, landet=5638
- **Kommunehelse (funksj. 232+233+241)** (): 2024=4267, 2025=4459, landet=5056
- **Administrasjon, kommune** (): 2024=3985, 2025=4247, landet=5458

## Indikator-mapping mot SSB-tabeller

Mapping er manuelt slått opp i SSB Statistikkbanken. 8 indikatorer er forsøkt mappet; 6 har full SSB-ekvivalent.

**Indikatorer uten direkte SSB-ekvivalent:**
- Andel barn 1-5 år i barnehage: ContentsCode må verifiseres mot 12379-metadata
- Grunnskolepoeng: Ikke i KOSTRA — krever Udir Statistikkbank (rapport C3, ikke implementert)

## Tolking av avvik

Avvik over 0.5% kan ha flere årsaker:
1. **SSB har revidert tall** etter Excel-fila ble produsert (16. mars 2026 — foreløpige tall).
2. **Feil ContentsCode** i kart-tabellen — verifiser mot SSB-metadata.
3. **Foreløpige vs reviderte tall** — Excel kan ha foreløpige (15. mars), SSB-API kan ha oppdaterte tall.
4. **Konsern-tall vs kommunekassa** — KOSTRA publiserer begge; Excel velger ofte konsern.

Hver enkelt avvikende indikator skal åpnes som HANDOFF-rad for utredning.
