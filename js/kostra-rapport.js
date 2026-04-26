// kostra-rapport.js — felles modul for KOSTRA-rapport-stil dypdykk.
// Brukes av sektor.html for å hente per-funksjon-tall fra SSB tabell 12362,
// beregne snitt/median/rang, og produsere data for visning + Excel-eksport.
//
// IIFE/window-eksponering for å fungere uten bundler.
(function (root) {
  'use strict';

  // SSB API-base (samme proxy-mønster som index.html og sektor.html).
  const API_BASE = (location.protocol === 'file:' || location.hostname === '')
    ? 'https://data.ssb.no/api/pxwebapi/v2/tables/'
    : '/api/ssb/tables/';

  const TABELL_HOVEDDATA = '12362';
  const INDIKATOR_BELOP_INNBYGGER = 'KOSbelopinnbygge0000';
  const ART_NETTO = 'AGD2';            // netto driftsutgift
  const ART_KORR_BRUTTO = 'AGD4';      // korrigert brutto driftsutgift
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 time

  function cacheNøkkel(år, art) {
    return `kostra_12362_${år}_${art}`;
  }

  function lesCache(nøkkel) {
    try {
      const raw = sessionStorage.getItem(nøkkel);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.cachedAt) return null;
      if (Date.now() - obj.cachedAt > CACHE_TTL_MS) return null;
      return obj.payload;
    } catch (_) { return null; }
  }

  function skrivCache(nøkkel, payload) {
    try {
      sessionStorage.setItem(nøkkel, JSON.stringify({ cachedAt: Date.now(), payload }));
    } catch (_) { /* sessionStorage kan være full eller blokkert */ }
  }

  // Henter alle kommuner × alle funksjoner × ett år × ett art-kode i porsjoner.
  // Returnerer { år, art, kommuner: { knr: { funksjon: verdi } } }.
  async function hentTabell12362(år, art, funksjoner) {
    if (!Array.isArray(funksjoner) || funksjoner.length === 0) {
      throw new Error('hentTabell12362: må ha minst én funksjon');
    }
    const cached = lesCache(cacheNøkkel(`${år}_${funksjoner.join(',')}`, art));
    if (cached) return cached;

    // Hent metadata for å finne dimensjonsnavn (KOKkommuneregion0000, KOKart0000, KOKfunksjon0000)
    const metaUrl = `${API_BASE}${TABELL_HOVEDDATA}/metadata?lang=no&outputFormat=json-px`;
    const meta = await fetch(metaUrl).then(r => {
      if (!r.ok) throw new Error(`Meta ${TABELL_HOVEDDATA}: HTTP ${r.status}`);
      return r.json();
    });

    const ids = meta.id || [];
    const regDim = ids.find(d => /region|kommune|fylke/i.test(d));
    const tidDim = ids.find(d => /^Tid$|tid/i.test(d));
    const conDim = ids.find(d => /contents/i.test(d));
    const artDim = ids.find(d => /art/i.test(d));
    const funDim = ids.find(d => /funksjon/i.test(d));
    if (!regDim || !tidDim || !conDim || !artDim || !funDim) {
      throw new Error(`Manglende dim 12362: ${ids.join(',')}`);
    }

    // Porsjoner av maks 50 funksjoner per kall (SSB-grense på URL-lengde)
    const porsjoner = [];
    for (let i = 0; i < funksjoner.length; i += 50) {
      porsjoner.push(funksjoner.slice(i, i + 50));
    }

    const samlet = {};
    for (const porsjon of porsjoner) {
      const usp = new URLSearchParams();
      usp.set('lang', 'no');
      usp.set('format', 'json-stat2');
      usp.append(`valueCodes[${regDim}]`, '*');
      usp.append(`valueCodes[${tidDim}]`, String(år));
      usp.append(`valueCodes[${conDim}]`, INDIKATOR_BELOP_INNBYGGER);
      usp.append(`valueCodes[${artDim}]`, art);
      for (const f of porsjon) {
        usp.append(`valueCodes[${funDim}]`, String(f));
      }

      const dataUrl = `${API_BASE}${TABELL_HOVEDDATA}/data?${usp.toString()}`;
      const ds = await fetch(dataUrl).then(r => {
        if (!r.ok) throw new Error(`Data 12362: HTTP ${r.status}`);
        return r.json();
      });
      const parsed = parseJsonStatPerFunksjon(ds, regDim, tidDim, funDim);
      // Slå sammen porsjoner inn i samlet
      for (const [knr, verdier] of Object.entries(parsed)) {
        samlet[knr] = Object.assign(samlet[knr] || {}, verdier);
      }
    }

    // Filtrer bort regionale aggregater — kun firesifrede kommunenumre.
    const kommuner = {};
    for (const [knr, v] of Object.entries(samlet)) {
      if (/^\d{4}$/.test(knr)) kommuner[knr] = v;
    }

    const resultat = { år, art, kommuner };
    skrivCache(cacheNøkkel(`${år}_${funksjoner.join(',')}`, art), resultat);
    return resultat;
  }

  // Forenklet parser for jsonstat2-respons med region/tid/funksjon-dimensjoner.
  // Returnerer { knr: { funksjon: verdi } }.
  function parseJsonStatPerFunksjon(ds, regDim, tidDim, funDim) {
    const ids = ds.id || [];
    const sizes = ds.size || [];
    const dims = ds.dimension || {};
    const values = ds.value || [];

    const regKeys = Object.keys(dims[regDim].category.index)
      .sort((a, b) => dims[regDim].category.index[a] - dims[regDim].category.index[b]);
    const funKeys = Object.keys(dims[funDim].category.index)
      .sort((a, b) => dims[funDim].category.index[a] - dims[funDim].category.index[b]);
    const tidKeys = Object.keys(dims[tidDim].category.index).sort();

    const strides = [];
    let s = 1;
    for (let i = ids.length - 1; i >= 0; i--) {
      strides[i] = s;
      s *= sizes[i];
    }

    const defaultLookup = {};
    for (const d of ids) {
      if (d !== regDim && d !== tidDim && d !== funDim) {
        const first = Object.entries(dims[d].category.index).sort((a, b) => a[1] - b[1])[0][0];
        defaultLookup[d] = first;
      }
    }

    const valArr = Array.isArray(values) ? values : (() => {
      const arr = new Array(sizes.reduce((a, b) => a * b, 1)).fill(null);
      for (const [k, v] of Object.entries(values)) arr[+k] = v;
      return arr;
    })();

    function idx(lookup) {
      let o = 0;
      for (let i = 0; i < ids.length; i++) {
        const d = ids[i];
        o += dims[d].category.index[lookup[d]] * strides[i];
      }
      return o;
    }

    const resultat = {};
    // Bruker siste år i tidKeys (forventer at vi alltid sender ett år, men er robust).
    const tidValg = tidKeys[tidKeys.length - 1];
    for (const r of regKeys) {
      const innhold = {};
      for (const f of funKeys) {
        const lookup = { ...defaultLookup, [regDim]: r, [tidDim]: tidValg, [funDim]: f };
        const v = valArr[idx(lookup)];
        if (v !== null && v !== undefined && !isNaN(v)) {
          innhold[f] = +v;
        }
      }
      if (Object.keys(innhold).length > 0) resultat[r] = innhold;
    }
    return resultat;
  }

  // ---- Pakke 11: Per-bruker / per-målgruppe-tabeller ----
  //
  // Per-bruker IKKE behovskorrigeres (dobbeltnormalisering — kostnaden er
  // allerede normalisert mot bruker-tellet). Per-målgruppe (per innb 1-5,
  // 6-15) får mild korrigering — flagg som forbehold.

  const PER_BRUKER_KONFIG = {
    'barnehage': {
      tabell: '13502',
      indikatorer: [
        { kode: 'KOSutg020000', navn: 'Netto driftsutg. per innbygger 1-5 år', type: 'per-malgruppe', kanKorrigeres: true },
        { kode: 'KOSkorrtidkomm0000', navn: 'Korrigerte oppholdstimer i kommunale barnehager per barn', type: 'per-bruker', kanKorrigeres: false },
        { kode: 'KOSutgtidkomm0000', navn: 'Brutto driftsutgift per oppholdstime, kommunal barnehage', type: 'per-bruker', kanKorrigeres: false }
      ]
    },
    'grunnskole': {
      tabell: '12235',
      indikatorer: [
        { kode: 'KOSregnind20000', navn: 'Netto driftsutg. per innbygger 6-15 år', type: 'per-malgruppe', kanKorrigeres: true },
        { kode: 'KOSKBDUperelev0000', navn: 'Brutto driftsutgift per elev (F202)', type: 'per-bruker', kanKorrigeres: false },
        { kode: 'KOSKBDUperskyss0000', navn: 'Brutto driftsutgift skoleskyss per elev (F223)', type: 'per-bruker', kanKorrigeres: false }
      ]
    },
    'pleie-omsorg': {
      tabell: '12209',
      indikatorer: [
        { kode: 'KOSBDU253261oppd0000', navn: 'Korrigerte brutto driftsutg. institusjon, per oppholdsdøgn', type: 'per-bruker', kanKorrigeres: false },
        { kode: 'KOSaarsvbrukerom0000', navn: 'Årsverk per bruker av omsorgstjenester', type: 'per-bruker', kanKorrigeres: false },
        { kode: 'KOSBDU253261inst0000', navn: 'Korrigerte brutto driftsutg. per institusjonsplass', type: 'per-bruker', kanKorrigeres: false }
      ]
    }
  };

  // Henter per-bruker-data for én sektor og ett år. Returnerer:
  //   { sektor, år, indikatorer: [{ kode, navn, type, kanKorrigeres, verdier: { knr: tall } }] }
  async function hentPerBrukerData(sektorId, år) {
    const konfig = PER_BRUKER_KONFIG[sektorId];
    if (!konfig) return null;

    const cacheKey = `kostra_perbruker_${sektorId}_${år}`;
    const cached = lesCache(cacheKey);
    if (cached) return cached;

    const tabell = konfig.tabell;
    const koder = konfig.indikatorer.map(i => i.kode);

    // Hent metadata for å finne dimensjons-navn
    const metaUrl = `${API_BASE}${tabell}/metadata?lang=no&outputFormat=json-px`;
    const meta = await fetch(metaUrl).then(r => {
      if (!r.ok) throw new Error(`Meta ${tabell}: HTTP ${r.status}`);
      return r.json();
    });

    const ids = meta.id || [];
    const regDim = ids.find(d => /region|kommune|fylke/i.test(d));
    const tidDim = ids.find(d => /^Tid$|tid/i.test(d));
    const conDim = ids.find(d => /contents/i.test(d));
    if (!regDim || !tidDim || !conDim) {
      throw new Error(`Manglende dim ${tabell}: ${ids.join(',')}`);
    }

    const usp = new URLSearchParams();
    usp.set('lang', 'no');
    usp.set('format', 'json-stat2');
    usp.append(`valueCodes[${regDim}]`, '*');
    usp.append(`valueCodes[${tidDim}]`, String(år));
    for (const k of koder) usp.append(`valueCodes[${conDim}]`, k);

    const dataUrl = `${API_BASE}${tabell}/data?${usp.toString()}`;
    const ds = await fetch(dataUrl).then(r => {
      if (!r.ok) throw new Error(`Data ${tabell}: HTTP ${r.status}`);
      return r.json();
    });

    const indikatorer = konfig.indikatorer.map(ind => ({
      ...ind,
      verdier: parseEnIndikator(ds, ind.kode, regDim, tidDim, conDim)
    }));

    const resultat = { sektor: sektorId, år, tabell, indikatorer };
    skrivCache(cacheKey, resultat);
    return resultat;
  }

  // Parser ett spesifikt contents-kode-verdi per kommune fra jsonstat2.
  function parseEnIndikator(ds, kode, regDim, tidDim, conDim) {
    const ids = ds.id || [];
    const sizes = ds.size || [];
    const dims = ds.dimension || {};
    const values = ds.value || [];

    if (!dims[conDim].category.index[kode]) return {};

    const regKeys = Object.keys(dims[regDim].category.index)
      .sort((a, b) => dims[regDim].category.index[a] - dims[regDim].category.index[b]);
    const tidKeys = Object.keys(dims[tidDim].category.index).sort();
    const tidValg = tidKeys[tidKeys.length - 1];

    const strides = [];
    let s = 1;
    for (let i = ids.length - 1; i >= 0; i--) {
      strides[i] = s;
      s *= sizes[i];
    }
    const defaultLookup = {};
    for (const d of ids) {
      if (d !== regDim && d !== tidDim && d !== conDim) {
        const first = Object.entries(dims[d].category.index).sort((a, b) => a[1] - b[1])[0][0];
        defaultLookup[d] = first;
      }
    }
    const valArr = Array.isArray(values) ? values : (() => {
      const arr = new Array(sizes.reduce((a, b) => a * b, 1)).fill(null);
      for (const [k, v] of Object.entries(values)) arr[+k] = v;
      return arr;
    })();
    function idx(lookup) {
      let o = 0;
      for (let i = 0; i < ids.length; i++) {
        const d = ids[i];
        o += dims[d].category.index[lookup[d]] * strides[i];
      }
      return o;
    }

    const verdier = {};
    for (const r of regKeys) {
      if (!/^\d{4}$/.test(r)) continue;
      const lookup = { ...defaultLookup, [regDim]: r, [tidDim]: tidValg, [conDim]: kode };
      const v = valArr[idx(lookup)];
      if (v !== null && v !== undefined && !isNaN(v)) verdier[r] = +v;
    }
    return verdier;
  }

  // ---- Pakke 12: Snitt + median + rang + behovskorrigering ----

  // Tar { knr: verdi } og returnerer { snitt, median, antallRangert, rangertListe }.
  // rang #1 = LAVEST verdi (følger Excel-rapport-konvensjonen for kostnader).
  function beregnRangering(kommunerMedVerdier) {
    const par = Object.entries(kommunerMedVerdier)
      .filter(([_, v]) => typeof v === 'number' && !isNaN(v));
    const verdier = par.map(([_, v]) => v);
    if (verdier.length === 0) {
      return { snitt: null, median: null, antallRangert: 0, rangertListe: [] };
    }
    const snitt = verdier.reduce((a, b) => a + b, 0) / verdier.length;
    const sortert = [...verdier].sort((a, b) => a - b);
    const median = sortert.length % 2 === 0
      ? (sortert[sortert.length / 2 - 1] + sortert[sortert.length / 2]) / 2
      : sortert[(sortert.length - 1) / 2];
    // Sortert stigende: rang 1 = lavest verdi
    const sortertPar = [...par].sort((a, b) => a[1] - b[1]);
    const rangertListe = sortertPar.map(([knr, v], i) => ({ knr, verdi: v, rang: i + 1 }));
    return {
      snitt: +snitt.toFixed(1),
      median: +median.toFixed(1),
      antallRangert: verdier.length,
      rangertListe
    };
  }

  // Slår opp én kommunes rang fra rangertListe.
  function rangFraListe(rangertListe, knr) {
    const treff = rangertListe.find(r => r.knr === knr);
    return treff ? { verdi: treff.verdi, rang: treff.rang, totalAntall: rangertListe.length } : null;
  }

  // Behovskorrigerer en verdi: råverdi / sektorindeks.
  // Returnerer null hvis sektorindeks mangler eller er 0.
  function behovskorrigertVerdi(verdi, sektorindeks) {
    if (verdi == null || isNaN(verdi)) return null;
    if (!sektorindeks || sektorindeks <= 0) return null;
    return +(verdi / sektorindeks).toFixed(1);
  }

  // Beregner rang basert på behovskorrigerte verdier per kommune.
  // Krever at vi vet sektorindeks per kommune.
  // sektorindekserPerKommune: { knr: sektorindeks }
  // kommunerMedVerdier: { knr: råverdi }
  function behovskorrigertRangering(kommunerMedVerdier, sektorindekserPerKommune) {
    const korrigert = {};
    for (const [knr, verdi] of Object.entries(kommunerMedVerdier)) {
      const dki = sektorindekserPerKommune[knr];
      const k = behovskorrigertVerdi(verdi, dki);
      if (k != null) korrigert[knr] = k;
    }
    return beregnRangering(korrigert);
  }

  // Henter sektor-DKI fra dki-{år}.json for én sektor og alle kommuner.
  // Returnerer { knr: sektorindeks } der sektorindeks = k.[felt] eller k.samlet eller k (tall).
  async function hentSektorindekser(år, dkiFelt) {
    const fil = ['2024', '2025', '2026'].includes(String(år)) ? år : '2025';
    const r = await fetch(`/data/dki-${fil}.json`, { cache: 'force-cache' });
    if (!r.ok) return {};
    const data = await r.json();
    const ut = {};
    for (const [knr, k] of Object.entries(data.kommuner || {})) {
      if (typeof k === 'number') ut[knr] = k;
      else ut[knr] = k?.[dkiFelt] ?? k?.samlet ?? null;
    }
    return ut;
  }

  // Eksponer på window.KostraRapport
  root.KostraRapport = {
    hentTabell12362,
    parseJsonStatPerFunksjon,
    hentPerBrukerData,
    parseEnIndikator,
    PER_BRUKER_KONFIG,
    beregnRangering,
    rangFraListe,
    behovskorrigertVerdi,
    behovskorrigertRangering,
    hentSektorindekser,
    API_BASE,
    TABELL_HOVEDDATA,
    INDIKATOR_BELOP_INNBYGGER,
    ART_NETTO,
    ART_KORR_BRUTTO
  };
})(window);
