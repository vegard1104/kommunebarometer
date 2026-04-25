// C7: Brønnøysund Enhetsregisteret — næringsstruktur per kommune
//
// Bruker BRREG sitt åpne API (https://data.brreg.no/enhetsregisteret/api/).
// Endepunktet /enheter støtter ?kommunenummer=XXXX&size=20 og returnerer
// virksomheter med NACE-kode (SN2007 næringsklassifikasjon).
//
// Status: SKELETON. Henter topp-N virksomheter per kommune og aggregerer
// til topp-NACE. Full integrasjon i index.html (eget kort i kommune-
// dashboard) gjøres som egen PR.
//
// Cacher i localStorage med 7-dagers TTL.

(function (root) {
  const CACHE_KEY = 'kb_brreg_v1_';
  const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  function brregBase() {
    // BRREG støtter CORS direkte; ingen proxy nødvendig.
    return 'https://data.brreg.no/enhetsregisteret/api/enheter';
  }

  function readCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_KEY + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.cachedAt || Date.now() - obj.cachedAt > CACHE_TTL_MS) return null;
      return obj.payload;
    } catch (_) { return null; }
  }
  function writeCache(key, payload) {
    try { localStorage.setItem(CACHE_KEY + key, JSON.stringify({ cachedAt: Date.now(), payload })); } catch (_) {}
  }

  // Hent topp-N virksomheter (etter ansatte) for en kommune.
  // Returnerer [{ navn, organisasjonsnummer, nace, naceTekst, ansatte }, ...].
  async function fetchVirksomheter(kommunenummer, size = 50) {
    if (!/^\d{4}$/.test(kommunenummer)) return [];
    const cacheKey = `virk_${kommunenummer}_${size}`;
    const cached = readCache(cacheKey);
    if (cached) return cached;
    const url = `${brregBase()}?kommunenummer=${kommunenummer}&size=${size}&sort=antallAnsatte,desc`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`BRREG HTTP ${r.status}`);
    const data = await r.json();
    const enheter = (data?._embedded?.enheter || []).map(e => ({
      navn: e.navn || '',
      organisasjonsnummer: e.organisasjonsnummer || '',
      ansatte: e.antallAnsatte || 0,
      nace: e.naeringskode1?.kode || '',
      naceTekst: e.naeringskode1?.beskrivelse || ''
    }));
    writeCache(cacheKey, enheter);
    return enheter;
  }

  // Aggregér virksomhetslisten til topp-NACE-bransjer (etter sysselsetting).
  function topNaceBransjer(virksomheter, n = 5) {
    const byNace = {};
    for (const v of virksomheter) {
      // Bruker NACE 2-siffer (hovednæring) for aggregering
      const k2 = (v.nace || '').slice(0, 2);
      if (!k2) continue;
      if (!byNace[k2]) byNace[k2] = { kode: k2, navn: v.naceTekst || `NACE ${k2}`, ansatte: 0, antall: 0 };
      byNace[k2].ansatte += v.ansatte;
      byNace[k2].antall += 1;
    }
    return Object.values(byNace)
      .sort((a, b) => b.ansatte - a.ansatte)
      .slice(0, n);
  }

  root.kbBrreg = { fetchVirksomheter, topNaceBransjer };
})(typeof window !== 'undefined' ? window : globalThis);
