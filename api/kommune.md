# D7: REST-API for Kommunebarometer

> **Status:** Skeleton + spec. Implementasjon krever Vercel serverless functions.

## Hvorfor

2.0-rapportens D7-anbefaling: økonomisjefer vil dra tallene inn i Power BI / Excel. Et åpent REST-API støtter B2B-spor (gratis bruk; eventuell abonnementsmodell senere for varsling/SLA).

## Endepunkter (foreslått)

```
GET /api/v1/kommune/{kode}
```
Returnerer alle sektor-scorer for én kommune for siste tilgjengelige år.

```
GET /api/v1/kommune/{kode}/sektor/{sektor-id}
```
Returnerer detaljerte indikator-verdier for én sektor (jf. indikator-register B1).

```
GET /api/v1/kommune/{kode}/historikk?år=2020,2021,2022,2023,2024
```
Tidsserie for samlet score og sektor-scorer.

```
GET /api/v1/topp10?år=2024
```
Topp-10 kommuner samlet.

```
GET /api/v1/kostra-gruppe/{gruppe-id}
```
Alle medlemmer av en KOSTRA-gruppe + beste/dårligste per sektor.

## Implementasjon

Vercel serverless functions i `api/`-mappa:

```
api/
  v1/
    kommune/
      [kode].js              ← henter sektor-scorer for én kommune
      [kode]/
        sektor/
          [sektor].js
        historikk.js
    topp10.js
    kostra-gruppe/
      [id].js
```

Hver function:
1. Validerer parametre (kommune-kode 4 sifre, sektor-id i hvitliste).
2. Henter SSB-data via eksisterende `/api/ssb/`-rewrite (gjenbruker edge-cache).
3. Beregner score med samme algoritme som `index.html`.
4. Returnerer JSON med `Cache-Control: public, s-maxage=86400`.

## Spec-detaljer

- **Autentisering:** Ingen for v1 (offentlige data, NLOD-lisens). Rate-limit via Vercel kantfunksjon (100 req/min per IP).
- **Format:** JSON kun. Ingen XML.
- **Versjonering:** `/api/v1/`. Brytende endringer → `/api/v2/`.
- **CORS:** Åpent (`Access-Control-Allow-Origin: *`).
- **Dokumentasjon:** OpenAPI 3.0-spec på `/api/v1/openapi.json`.

## Foreslått struktur per response

```json
{
  "kommune": "3222",
  "navn": "Lørenskog",
  "år": 2024,
  "samlet": { "score": 67.4, "rang": 42, "av": 357 },
  "sektorer": {
    "grunnskole": { "score": 71.2, "rang": 89, "av": 357 },
    "pleie": { "score": 65.0, "rang": 112, "av": 357 }
  },
  "kilde": { "ssb": "...", "metodikk": "https://..." },
  "lisens": "NLOD 2.0"
}
```

## HANDOFF

Implementasjon krever:
1. Migrasjon av compute-logikk fra `index.html` til delt JS-modul (kan kjøres i Node).
2. Vercel serverless functions (gratis-tier dekker ~100k requests/mnd).
3. OpenAPI-spec dokumentasjon.
4. Klient-bibliotek på sikt (npm-pakke, R-pakke, Python-pakke).

Estimert arbeid: 2-3 uker for første fungerende versjon.
