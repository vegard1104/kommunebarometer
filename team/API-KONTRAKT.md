# API-kontrakt

Låst grensesnitt mellom frontend og backend/datalag. Backend (eller Fullstack) skriver. Frontend leser.
**Regel:** Ingen endring her uten at Tech Lead har godkjent. Endring krever også oppdatering av eventuelle consumers samme PR.

---

## Ekstern kilde: SSB PxWeb API v2

- **Proxy i vår app:** `/api/ssb/:path*` → `https://data.ssb.no/api/pxwebapi/v2/:path*`
- **Hvorfor proxy:** CORS og gir oss mulighet til å cache på Vercel edge senere.
- **Autentisering:** Ingen (offentlig åpent API).
- **Rate limit:** SSB har ikke publisert hard rate-limit, men hold responses gjerne på < 10 req/s per klient.

### Eksempel — hent KOSTRA-tabell

```
GET /api/ssb/tables/{tableId}/data?lang=no&valuecodes[KOKkommuneregion0000]=0301
```

(Backend/Fullstack: utvid med konkrete tabell-IDer dere lander på etter DATAKILDER.md er klar.)

---

## Datalast — alle kommuner

> **Forankret i AP-04-spike 2026-04-25** (branch `spike/ssb-alle-kommuner`, kjørt fra Node mot `data.ssb.no` direkte). Resultatfiler: `spike/results/*.json`.

### Mandatory selections per request mot tabell-data

SSB v2 PxWeb krever at **alle dimensjoner med "mandatory"-merking** har eksplisitte `valuecodes`. For typisk KOSTRA-tabell (eks. 12134) betyr det:

| Dimensjon | Eksempel-kode | Påkrevd? |
|---|---|---|
| `KOKkommuneregion0000` (region) | `0301` (Oslo) | Ja |
| `ContentsCode` (indikator) | `KOSAG110000` (Frie inntekter per innbygger) | Ja |
| `Tid` (år) | `2024` | Ja |

Mangler én av disse → `HTTP 400 "Missing selection for mandantory variable"`. Klienten må alltid spesifisere alle tre.

### Målte responstider (cold cache, fra Node i Norge → SSB Stockholm)

| Scenario | n | p50 | p95 | Merknad |
|---|---|---|---|---|
| 1 kommune × 1 indikator × 1 år | 30 | **620 ms** | 757 ms | Sekvensiell baseline |
| 3 kommuner i én batch | 1 | 776 ms | — | Smoke-test |
| 100 kommuner i én batch | 9 | 79–766 ms | — | Sweet-spot |
| 200 kommuner i én batch | 5 | 748 ms | 833 ms | Stabil |
| Klass-API (kommuneliste 2026) | 1 | 120 ms | — | Cacheable i uker |
| Tabell-metadata (12134) | 1 | 175 ms | — | Cacheable i mnd |

### Begrensninger

1. **Single batch for alle kommuner går ikke**: Tabell 12134 har 839 kommune-koder (historiske + nåværende). En URL med alle koder er **4365 tegn** — IIS-grensen treffer ved ~4000 og kaster `HTTP 404`. Maks ~700 kommune-koder per URL.
2. **Klass ≠ tabellens regions-liste**: Klass-API klassifikasjon 131 returnerte 358 kommune-koder (per 2026-01-01), men tabell 12134 har 839 (inkluderer historiske koder fra 2015-2025). For å unngå `400 "Non-existent value"`, hent regions-listen fra **tabellens egne metadata**, ikke fra Klass.
3. **Rate-limit slår inn raskt ved parallell trafikk**: ≥3 samtidige requests fra samme IP gir `HTTP 429` etter 4–6 vellykkede. SSB publiserer ikke harde grenser, men spike-data antyder ~2 req/s vedvarende, ~5 req/s i korte burst.
4. **Mange historiske koder har ikke data for siste år**: en sammenslått kommune fra 2020 har ikke data for 2024. Forvent `400 "Non-existent value"` for slike — håndter som "ingen data publisert".

### Anbefalt strategi for v2

**Prinsipp**: Aggressiv edge-cache + pre-compute. SSB-data oppdateres kun 2x/år (15. mars + 15. juni). En 24-timers cache er akseptabel for nesten alle scenarier.

| Scenario | Strategi | Forventet ytelse |
|---|---|---|
| **Single kommune-visning** | Direkte fetch per (tabell × år × kommune). Edge-cached. | ~620 ms cold, ~50 ms warm |
| **Sammenligning 5 kommuner** | 1 batch-request med 5 koder. Edge-cached. | ~700 ms cold, ~50 ms warm |
| **Topp-10, KOSTRA-gruppe-side, kart** | Pre-compute via Vercel cron 1x/døgn → lagre i Edge Config / KV → klient leser ferdig dataset | ~50 ms (ingen SSB-kall i request-path) |
| **Kommune-velger (357 navn)** | Klass-API, cache i 1 uke | ~120 ms cold, ~50 ms warm |

**Konkret Vercel-konfig (for AP-03 å implementere):**
```json
// vercel.json — utkast for s-maxage på SSB-proxy
"headers": [
  {
    "source": "/api/ssb/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "public, s-maxage=86400, stale-while-revalidate=604800" }
    ]
  }
]
```

`s-maxage=86400` (24 t edge-cache) + `stale-while-revalidate=604800` (1 uke) gir:
- Første bruker etter SSB-publisering tar 600 ms-treffet
- Resten får ~50 ms cached respons
- Hvis SSB er nede: vi serverer stale data opptil 1 uke gammel

**Batching-anbefaling for pre-compute-jobber:**
- batchSize: 100–200 kommune-koder per request
- concurrency: 1 (ren sekvensiell), evt. 2 med 300 ms throttle mellom batcher
- Forventet total tid for 839 kommuner × 1 indikator: **3–4 sekunder**
- For 12 sektorer × 9 indikatorer = 108 indikatorer: ~6–8 minutter total cron-tid

### Feilhåndtering

| Status | Tittel | Tolking | Klient-handling |
|---|---|---|---|
| 200 | OK | Data returneres | Parse, vis |
| 400 | Missing selection for mandantory variable | Mangler ContentsCode/Tid/region i query | Bug i kode — ikke runtime |
| 400 | Non-existent value | Ugyldig kommune-kode for det året | Vis "ingen data publisert" |
| 400 | Non-existent table | Ugyldig tabell-ID | Bug i kode |
| 404 | (HTML) | URL for lang (>~4000 tegn) ELLER tabell ikke funnet | Splitt batch i mindre |
| 429 | (tom) | Rate-limit | Exp. backoff: 1s, 2s, 4s. Maks 3 forsøk. |
| timeout | — | SSB henger | Vis "viser cached data fra {dato}", retry i bakgrunnen |

### Konsekvenser for AP-01 (arkitekturvalg)

1. **Edge-cache er kritisk** — uavhengig av framework. Vanlige SPA-løsninger uten edge-cache vil ha 600 ms-latency på hver kommune-bytte.
2. **Pre-compute er mest fleksibelt** — favoriserer arkitektur med build-steg eller cron-jobs (SSG, ISR, eller Vercel Functions).
3. **Vanilla HTML/JS er fortsatt levedyktig** for v2 så lenge vi legger pre-compute i Vercel Functions og cacher aggressivt — ingen krav om framework av ytelseshensyn.
4. **Klass-API må integreres separat** for å håndtere kommunesammenslåinger dynamisk (rapport-anbefaling B2). Egen cache-strategi (1 uke).

---

## Intern kontrakt

_(tom — legges inn når v2-arkitekturen er bestemt. For v1 går alt direkte fra frontend til SSB-proxy.)_

### Endpoint-mal (kopier og fyll inn)

```
GET /api/[navn]
Parametre:
  - param1 (string, required): ...
Respons (200):
  {
    "kommune": "0301",
    "score": 4.2,
    ...
  }
Feil:
  - 400: ugyldige parametre
  - 502: SSB svarte ikke
```
