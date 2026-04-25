# Datakilder — Kommunebarometer

Eies av **Data/Innhold-ansvarlig** (evt. Backend/Fullstack inntil rollen er fylt).
Hver kilde skal ha: hva det er, hvor det kommer fra, oppdateringskadens, lisens, ansvarlig for validering.

---

## SSB KOSTRA (primærkilde)

- **Hva:** Kommune-Stat-Rapportering. Tjenestedata fra alle norske kommuner.
- **Tilgang:** SSB PxWeb API v2 (`data.ssb.no/api/pxwebapi/v2`). Åpent, ingen nøkkel.
- **Oppdatering:** Foreløpige tall 15. mars, reviderte tall 15. juni hvert år (verifiser mot SSB-kalender).
- **Lisens:** Norsk Lisens for Offentlige Data (NLOD) — fri gjenbruk med kreditering.
- **Valideringsansvar:** Data/Innhold. Sjekk på vei inn: tallenes rimelighet, manglende kommuner etter kommunereform, feil i enheter (mill. vs tusen).

### Konkrete tabeller vi bruker (fylles inn)

| Tabell-ID | Tema | Hentet av | Sist validert |
|---|---|---|---|
| _(ikke fastsatt)_ | Helse og omsorg | | |
| _(ikke fastsatt)_ | Barnehage / skole | | |
| _(ikke fastsatt)_ | Økonomi / netto driftsresultat | | |

Prosjektleder + Data/Innhold fyller inn etter lesing av KOSTRA-dypdykk-rapporten.

---

## Kommunereform-mapping

Noen kommuner er slått sammen / delt siden 2020. Vi trenger en mapping slik at historikk henger på tvers av reform-året.

- **Kilde:** SSB Klass-API (`data.ssb.no/api/klass/v1`), klassifikasjon 131 (kommuneinndeling).
- **Ansvarlig:** Backend/Fullstack — bygg lookup-tabell én gang, oppdater når ny reform kommer.

---

## Andre mulige kilder (ikke tatt i bruk)

- **Helsedirektoratet:** Ventetidsdata, pasientforløp. Krever eget API-oppsett.
- **Utdanningsdirektoratet (GSI):** Grunnskolens informasjonssystem.
- **NAV statistikk:** Uføretrygd, sosialhjelp.

Legg inn begrunnelse og ansvarlig før en ny kilde tas i bruk.
