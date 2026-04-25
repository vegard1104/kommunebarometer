// A2: Behovsjusterte tall (utgiftsbehovsindeks)
//
// "Den største svakheten i dagens versjon" ifølge 2.0-rapporten:
// kommuner sammenlignes uten korrigering for utgiftsbehov (alder, geografi).
// Som rådmann eller økonomisjef har du ikke tillit til rangering uten
// behovsjustering.
//
// Avhenger av C9 (KMD inntektssystem) — utgiftsbehovsindeks per kommune
// fra grønne hefter. Status: skeleton venter på data/utgiftsbehov-{år}.json.

(function (root) {
  // Last utgiftsbehovsindeks fra JSON-fil. Returnerer
  // { kommunenummer: { utgiftsbehov: 1.085, sektorvekt: {...} } }.
  // 1.000 = landsgjennomsnitt; 1.085 betyr 8,5 % høyere behov.
  let UTGIFTSBEHOV = null;

  async function loadUtgiftsbehov(year) {
    if (UTGIFTSBEHOV) return UTGIFTSBEHOV;
    try {
      const r = await fetch(`/data/utgiftsbehov-${year || 2025}.json`, { cache: 'force-cache' });
      if (!r.ok) {
        console.info('A2: utgiftsbehov-data ikke tilgjengelig — krever manuell innhenting via C9');
        UTGIFTSBEHOV = {};
        return UTGIFTSBEHOV;
      }
      UTGIFTSBEHOV = await r.json();
      return UTGIFTSBEHOV;
    } catch (e) {
      UTGIFTSBEHOV = {};
      return UTGIFTSBEHOV;
    }
  }

  // Justér en KOSTRA-verdi mot landsgjennomsnitt-utgiftsbehov.
  // verdiPerInnbygger × (1 / utgiftsbehov) = behovsjustert.
  // Hvis utgiftsbehov mangler returneres rå-verdi (uendret).
  function justert(verdi, kommunenummer, sektor) {
    if (!UTGIFTSBEHOV || !UTGIFTSBEHOV[kommunenummer]) return verdi;
    const data = UTGIFTSBEHOV[kommunenummer];
    const factor = (data.sektorvekt && data.sektorvekt[sektor]) || data.utgiftsbehov || 1;
    if (!factor || factor === 1) return verdi;
    return verdi / factor;
  }

  // Bygg toggle-knapp som lar bruker bytte mellom råtall og justert.
  // Brukes på sektor-kort eller indikator-detaljvisning.
  function lagToggle(currentMode, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'a2-toggle';
    wrap.innerHTML = `
      <button type="button" class="a2-tab ${currentMode === 'rå' ? 'aktiv' : ''}" data-mode="rå">Råtall</button>
      <button type="button" class="a2-tab ${currentMode === 'justert' ? 'aktiv' : ''}" data-mode="justert">Behovsjustert</button>
    `;
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.a2-tab');
      if (btn) onChange(btn.getAttribute('data-mode'));
    });
    return wrap;
  }

  root.kbBehovsjustering = { loadUtgiftsbehov, justert, lagToggle };
})(typeof window !== 'undefined' ? window : globalThis);
