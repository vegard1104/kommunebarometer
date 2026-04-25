# E2 + E3: Indikator-kvalitetsmerking og usikkerhetsintervall

> **Status:** Skeleton + spec. Avhenger av indikator-register (B1).

## Hvorfor

Rapport E2: Noen indikatorer er upålitelige for små kommuner (prikking, få observasjoner). Andre er solide. Dette må vises eller styre om indikatoren brukes i rangering.

Rapport E3: Rangering 17 vs 18 framstår som meningsfull, men forskjellen kan være innenfor støy. Vis konfidensintervall der mulig — marker "uklar forskjell" i stedet for falsk presisjon.

## E2 — Kvalitetsmerking

Hver indikator får et kvalitetsnivå (allerede definert i `data/indikator-register.json` som `kvalitet`-felt):

- **`hoy`** — solid grunnlag, full bredde av kommuner publisert. Bruker standard rangering.
- **`medium`** — brukbart, men kjent svakhet (f.eks. tolkning krever nyanse for små kommuner). Vises med advarselsikon.
- **`lav`** — upålitelig for små kommuner (< 1000 innbyggere) eller prikket data. Skjules eller degraderes i rangering.
- **`ikke_publisert`** — for små kommuner / personvern. Tilbakevisning: "—" med tooltip.

### UI-konvention

```html
<span class="indikator-verdi">
  <strong>4.2</strong>
  <span class="kvalitet-badge kvalitet-medium" title="Tolkes nyansert for små kommuner">⚠</span>
</span>
```

### CSS-tokens

```css
.kvalitet-badge.kvalitet-hoy { display: none; }      /* ingen badge for høy kvalitet */
.kvalitet-badge.kvalitet-medium { color: var(--warn); }
.kvalitet-badge.kvalitet-lav { color: var(--bad); }
```

## E3 — Usikkerhetsintervall

For statistiske indikatorer (særlig fra Udir, Ungdata) bør vi vise konfidensintervall basert på SSBs publiserte standardavvik. Eksempel:

> Andel elever med høy trivsel: **78,2 %** (CI: 75,1–81,3)

I rangerings-sammenheng: hvis kommune A's CI overlapper med kommune B's CI → marker som "uklar forskjell".

### Foreslått implementasjon

```js
// data/usikkerhet-helper.js (skeleton — ikke implementert ennå)
function konfidensintervall(verdi, n, p = 0.95) {
  // Wilson score interval for andeler
  // ...
}

function uklarForskjell(verdi1, ci1, verdi2, ci2) {
  return Math.max(ci1.low, ci2.low) <= Math.min(ci1.high, ci2.high);
}
```

### UI

I rangering-tabellen, plasseringer som ligger innenfor "uklar forskjell" vises med strek-prikk-fyll i stedet for hard rangering:

```
1. Kommune A — score 72,1 ●
2. Kommune B — score 71,8 ◐
3. Kommune C — score 71,5 ◐
4. Kommune D — score 65,2 ●
```

Indikator B og C er ikke statistisk signifikant forskjellig fra A.

## HANDOFF

1. **Frontend:** utvid `index.html`'s sektor-rendering til å vise kvalitet-badge fra indikator-registeret.
2. **Statistikk:** implementer `konfidensintervall()` for andeler (Wilson) og medianer (rangering-basert).
3. **Rangering:** modifiser `computeOverall()` til å returnere CI per kommune; bruk `uklarForskjell()` for visualisering.
4. **Testing:** validér mot SSB-dokumentasjon for indikatorer som har publisert standardavvik.

Estimert arbeid: 1-2 uker.
