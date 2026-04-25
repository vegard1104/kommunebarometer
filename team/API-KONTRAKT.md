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
