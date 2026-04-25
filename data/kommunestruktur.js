// B2: Dynamisk kommuneinndeling via SSB Klass changes-API
//
// Erstatter hardkodet MERGERS-tabell i index.html ved å hente
// strukturelle endringer (sammenslåinger, navnebytter) dynamisk
// fra Klass-API klassifikasjon 131. Cacher i localStorage.
//
// Status: SKELETON. Klar for full integrasjon når MERGERS-erstatning
// gjøres som egen refaktor. Eksponerer samme datastruktur som dagens
// MERGERS / MERGERS_REVERSE for drop-in-bruk.
//
// Bruk:
//   const km = new Kommunestruktur();
//   await km.last();
//   km.MERGERS;          // { '5054': { name: 'Indre Fosen', ... } }
//   km.MERGERS_REVERSE;  // { '1624': { parentCode: '5054', ... } }
//
// Krav:
//   - vercel.json med rewrite /api/klass/:path* → data.ssb.no/api/klass/v1/:path*
//   - localStorage tilgjengelig (faller tilbake til memory-only ellers)

(function (root) {
  const CACHE_KEY = 'kb_kommunestruktur_v1';
  const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dager

  function klassBase() {
    return (location.protocol === 'file:' || location.hostname === '')
      ? 'https://data.ssb.no/api/klass/v1/'
      : '/api/klass/';
  }

  class Kommunestruktur {
    constructor() {
      this.MERGERS = {};
      this.MERGERS_REVERSE = {};
      this.AKTUELL_LISTE = [];
      this._loaded = false;
    }

    async last(options = {}) {
      const tvang = !!options.tvang;
      if (!tvang) {
        const cached = this._lesCache();
        if (cached) {
          Object.assign(this, cached);
          this._loaded = true;
          return;
        }
      }
      const today = new Date().toISOString().slice(0, 10);

      // 1. Hent aktuell kommuneliste
      const aktuellUrl = `${klassBase()}classifications/131/codesAt?date=${today}&language=nb`;
      const aktuellRes = await fetch(aktuellUrl);
      if (!aktuellRes.ok) throw new Error(`Klass aktuell HTTP ${aktuellRes.status}`);
      const aktuellData = await aktuellRes.json();
      this.AKTUELL_LISTE = (aktuellData.codes || [])
        .filter(c => /^\d{4}$/.test(c.code))
        .map(c => ({ code: c.code, name: c.name || '' }));

      // 2. Hent strukturelle endringer fra et historisk vinduspunkt (2018 dekker
      // de fleste reformer i v1-bruksområdet). Vegard kan utvide om nødvendig.
      const fra = '2018-01-01';
      const til = today;
      const changesUrl = `${klassBase()}classifications/131/changes.json?from=${fra}&to=${til}&language=nb`;
      const changesRes = await fetch(changesUrl);
      if (!changesRes.ok) throw new Error(`Klass changes HTTP ${changesRes.status}`);
      const changesData = await changesRes.json();
      const changes = changesData.codeChanges || [];

      // Bygg MERGERS: for hver målkode, samle alle kildekoder.
      // ChangeOccurred angir når sammenslåingen skjedde.
      const byTarget = {};
      for (const ch of changes) {
        const target = ch.newCode;
        const source = ch.oldCode;
        if (!target || !source || target === source) continue;
        if (!byTarget[target]) byTarget[target] = { components: [], earliestYear: null };
        byTarget[target].components.push({ code: source, name: ch.oldName || '' });
        const yr = (ch.changeOccurred || '').slice(0, 4);
        if (yr && (!byTarget[target].earliestYear || yr < byTarget[target].earliestYear)) {
          byTarget[target].earliestYear = yr;
        }
      }
      // Berik med navn fra aktuell-listen
      const navnByCode = {};
      for (const k of this.AKTUELL_LISTE) navnByCode[k.code] = k.name;
      this.MERGERS = {};
      for (const [target, info] of Object.entries(byTarget)) {
        if (!navnByCode[target]) continue; // hopp over endringer som ikke peker mot eksisterende kommune
        this.MERGERS[target] = {
          name: navnByCode[target] || target,
          year: parseInt(info.earliestYear, 10) || null,
          components: info.components
        };
      }
      // Reverse-map for raskt oppslag fra historisk kode
      this.MERGERS_REVERSE = {};
      for (const [pCode, m] of Object.entries(this.MERGERS)) {
        for (const c of m.components) {
          this.MERGERS_REVERSE[c.code] = {
            parentCode: pCode,
            parentName: m.name,
            year: m.year,
            name: c.name,
            siblings: m.components.filter(s => s.code !== c.code)
          };
        }
      }
      this._loaded = true;
      this._skrivCache();
    }

    _lesCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || !obj.cachedAt || Date.now() - obj.cachedAt > CACHE_TTL_MS) return null;
        return obj.data;
      } catch (_) {
        return null;
      }
    }

    _skrivCache() {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          cachedAt: Date.now(),
          data: {
            MERGERS: this.MERGERS,
            MERGERS_REVERSE: this.MERGERS_REVERSE,
            AKTUELL_LISTE: this.AKTUELL_LISTE
          }
        }));
      } catch (_) { /* localStorage full eller blokkert */ }
    }
  }

  root.Kommunestruktur = Kommunestruktur;
})(typeof window !== 'undefined' ? window : globalThis);
