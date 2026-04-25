// C3: Udir Statistikkbanken — skolefaglige resultater per kommune
//
// Endepunkt: https://api.udir-statistikkbanken.no/api/rest/v2/
// Åpent API. Indikatorer: Nasjonale prøver (5./8. trinn), Eksamen
// (10. trinn), Elevundersøkelsen (trivsel, mobbing), grunnskolepoeng.
//
// STATUS: Skeleton + foreløpig API-utforskning. Endelig endepunkt-
// struktur trenger validering — enten via dokumentasjon (om Udir har
// oppdatert sitt API i 2026) eller via egen mini-spike. Implementert
// som helpers + UI-stub som lenker til Udir Statistikkbanken.
//
// Personvern-prikking: små kommuner får "for få observasjoner — ikke
// publisert" for sensitive indikatorer. Vi viser dette eksplisitt.

(function (root) {
  // CORS-status til Udir-API er usikker. Bruker proxy via Vercel-rewrite
  // for å være på den sikre siden. Krever oppføring i vercel.json:
  //   { "source": "/api/udir/:path*",
  //     "destination": "https://api.udir-statistikkbanken.no/api/rest/v2/:path*" }
  const UDIR_BASE = (location.protocol === 'file:' || location.hostname === '')
    ? 'https://api.udir-statistikkbanken.no/api/rest/v2/'
    : '/api/udir/';

  const CACHE_KEY = 'kb_udir_v1_';
  const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

  // Generisk Udir-hent. Endelig query-struktur må valideres via egen mini-spike.
  // Forventet svar har en form med variabler + verdier.
  async function fetchUdir(query) {
    const cacheKey = JSON.stringify(query);
    const cached = readCache(cacheKey);
    if (cached) return cached;
    try {
      const url = `${UDIR_BASE}query`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(query)
      });
      if (!r.ok) throw new Error(`Udir HTTP ${r.status}`);
      const data = await r.json();
      writeCache(cacheKey, data);
      return data;
    } catch (e) {
      console.warn('Udir fetch feilet:', e.message);
      return null;
    }
  }

  // Wrapper: hent grunnskolepoeng for en kommune.
  async function fetchGrunnskolepoeng(kommunenummer, year = '2024-25') {
    if (!/^\d{4}$/.test(kommunenummer)) return null;
    const query = {
      tabellId: 11,        // Eksempel — må valideres mot Udirs faktiske tabell-IDer
      filtre: [
        { kode: 'Kommunenr', verdier: [kommunenummer] },
        { kode: 'Tid', verdier: [year] }
      ]
    };
    const data = await fetchUdir(query);
    return data;
  }

  // UI-stub: vis lenke til Udir Statistikkbanken for valgt kommune
  function lagUdirKort(kommunenummer) {
    const div = document.createElement('div');
    div.className = 'kort udir-kort';
    div.innerHTML = `
      <h3>Skolefaglige resultater (Udir)</h3>
      <p>Nasjonale prøver, eksamen 10. trinn, Elevundersøkelsen og grunnskolepoeng
      for kommunen. Personvern-prikking gjelder for små kommuner.</p>
      <a href="https://statistikkportalen.udir.no/" target="_blank" rel="noopener">
        Åpne Udir Statistikkbanken →
      </a>
      <p><small>Programmatisk integrasjon kommer — krever validering av Udir API v2-endepunkt-struktur.</small></p>
    `;
    return div;
  }

  root.kbUdir = { fetchUdir, fetchGrunnskolepoeng, lagUdirKort };
})(typeof window !== 'undefined' ? window : globalThis);
