// C2: Folkehelseprofilen (Helsedirektoratet, overtatt fra FHI 2024)
//
// STATUS: Skeleton + utredning. Folkehelseprofilen publiseres primært
// som PDF per kommune + datafiler i SSB Statistikkbanken (Helsestatistikk
// hovedtabell 11342 og lignende). Et offentlig REST-API på samme nivå
// som SSB PxWeb finnes ikke per 2026-04 — egen HANDOFF-rad åpnet for
// å undersøke API-tilgang via Helsedirektoratet eller alternative kanaler
// (kommunehelsa.no, FHI Statistikkbank).
//
// Inntil videre dekker denne fila:
//   - SSB Statistikkbank-tabell 11342 (folkehelse-nøkkeltall) som
//     foreløpig proxy for folkehelse-data — bruker eksisterende
//     /api/ssb/-rewrite slik at vi får edge-cache gratis.
//   - Stub-funksjoner som vil bli utvidet når Helsedirektoratets
//     API-strategi er avklart.

(function (root) {
  const SSB_API = (location.protocol === 'file:' || location.hostname === '')
    ? 'https://data.ssb.no/api/pxwebapi/v2/tables/'
    : '/api/ssb/tables/';

  // Tabell 11342: Personer 16 år og eldre, etter helse, kjønn, alder. Begrenset
  // utvalg, men gir en føler. Mer data: SSB tema "Helse" / Helsedirektoratet
  // Folkehelseprofil-PDFer.
  const FOLKEHELSE_TABELL = '11342';

  async function fetchFolkehelse(kommunenummer, year = '2023') {
    if (!/^\d{4}$/.test(kommunenummer)) return null;
    const cacheKey = `kb_folkehelse_${kommunenummer}_${year}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    // Foreløpig: returner placeholder. Full implementasjon krever:
    // 1. Avklaring av om Helsedirektoratet eksponerer programmatisk API
    //    (per 2026-04 ser dette ut til å mangle — folkehelseprofilen er PDF)
    // 2. Alternativt: bruke SSB tabell 11342 + andre helse-tabeller
    //    (krever sektor-spesifikke ContentsCode-valg)
    // 3. Eller scrape kommunehelsa.no for nøkkeltall (mindre robust)
    const stub = {
      kommunenummer,
      year,
      kilde: 'placeholder — full integrasjon venter Helsedirektoratet API-strategi',
      indikatorer: {}
    };
    try { sessionStorage.setItem(cacheKey, JSON.stringify(stub)); } catch (_) {}
    return stub;
  }

  // Viser placeholder i UI til full implementasjon er på plass.
  function lagFolkehelseKort(kommunenummer) {
    const div = document.createElement('div');
    div.className = 'kort folkehelse-kort';
    div.innerHTML = `
      <h3>Folkehelseprofil</h3>
      <p>Folkehelseprofilen publiseres av Helsedirektoratet som PDF per kommune.
      Klikk lenken for å se profilen for denne kommunen.</p>
      <a href="https://www.helsedirektoratet.no/folkehelseprofiler" target="_blank" rel="noopener">
        Åpne Folkehelseprofilen hos Helsedirektoratet →
      </a>
      <p><small>Programmatisk API for nøkkeltall planlagt — venter på avklaring fra Helsedirektoratet.</small></p>
    `;
    return div;
  }

  root.kbFolkehelse = { fetchFolkehelse, lagFolkehelseKort };
})(typeof window !== 'undefined' ? window : globalThis);
