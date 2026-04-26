# Verifisering — Runde 6 (Pakke A + B + C)

**Dato:** 2026-04-26
**Branch testet:** `test/alle-pakker-samlet` etter merger av Pakke A, B og C
**Innhold:**
- Pakke A: fjernet Lørenskog som default + tom-state + bevart kommune i sektor-tilbake-lenke
- Pakke B: rensing av samiske/kvensk dual-form i kommunenavn fra Klass-API
- Pakke C: ny portal-forside + flytt KOSTRA-dashboardet til `/kommunebarometer`

## Auto-verifiserbart (kjørt nå)

### A1. Hardkodet Lørenskog/3222 utenfor kommentarer

```bash
$ grep -nE '\bLørenskog\b|\b3222\b' index.html kommunebarometer.html sektor.html \
  | grep -vE 'eksempel|f\.eks|//|kommentar|Eks:'
# (ingen output)
```

**Resultat:** ✓ Ingen hardkodet kommune-default i kjøre-koden. Lørenskog finnes
fortsatt i kommentarer og i CODE_HISTORY-eksempler — det er korrekt
dokumentasjon, ikke fall-back.

### A2. Tom-state + DOM-struktur

- `<section id="velg-kommune-tomstate">` finnes i `kommunebarometer.html` ([kommunebarometer.html:433](kommunebarometer.html#L433))
- `<div id="kommune-resultat">` wrapper rest av dashboardet ([kommunebarometer.html:442](kommunebarometer.html#L442))
- `visTomState()` og `visKommuneResultat()` definert ([kommunebarometer.html:1818](kommunebarometer.html#L1818))
- `CURRENT_MUNI_CODE = null` initialisert
- Eksport-knapper i `_EKSPORT_KNAPPER` deaktiveres i tom-state

### A3. Sektor-dypdykkets tilbake-lenke

```bash
$ grep -nE 'href=.*kommunebarometer|href="/"' sektor.html
89:  <div class="crumb"><a href="/kommunebarometer" id="hjem-lenke">…
101:    Tilbake til <a href="/kommunebarometer">Kommunebarometer</a>
380:  <a href="/kommunebarometer" id="hjem-fra-tom">…
```

`byggHjemUrl()` ([sektor.html:322](sektor.html#L322)) bevarer `?kommune=&år=&mode=`. Tilbake-lenken settes via JS ved sideload.

### B1. Bokmål-rensing — live-test mot SSB Klass

```
Funnet 29 kommuner med dual-form i Klass
Alle 29 dual-form-kommuner renser til ren bokmål
```

Override-tabell `KOMMUNE_NAVN_BOKMAAL` dekker 29 kommuner pr. 2026-04-26
(0301 Oslo, 1826 Hattfjelldal, …, 5636 Nesseby). Heuristikk
(samisk-tegn-regex) som fallback for ukjente koder.

### B2. Test mot kjente navn

| Input | Resultat | Forventet |
|---|---|---|
| `Kárášjohka - Karasjok` | `Karasjok` | ✓ |
| `Oslo - Oslove` | `Oslo` | ✓ |
| `Dielddanuorri - Tjeldsund` | `Tjeldsund` | ✓ |
| `Guovdageaidnu - Kautokeino` | `Kautokeino` | ✓ |
| `Deatnu - Tana` | `Tana` | ✓ |
| `Lyngen - Ivgu - Yykeä` | `Lyngen` | ✓ |
| `Trondheim - Tråante` | `Trondheim` | ✓ |
| `Aurskog-Høland` | `Aurskog-Høland` | ✓ (uendret — ingen mellomrom rundt -) |
| `Sør-Trøndelag` | `Sør-Trøndelag` | ✓ |
| `Bø (Telemark)` | `Bø (Telemark)` | ✓ |
| `Bergen` | `Bergen` | ✓ |
| `null` / `''` | uendret | ✓ |

### C1. Vercel-rewrites

```bash
$ node -e 'const v=require("./vercel.json");for(const r of v.rewrites)console.log(r.source,"→",r.destination)'
/api/ssb/:path* → https://data.ssb.no/api/pxwebapi/v2/:path*
/api/klass/:path* → https://data.ssb.no/api/klass/v1/:path*
/kommunebarometer → /kommunebarometer.html
/kommunebarometer/sektor → /sektor.html
```

### C2. Filer på plass

- `index.html` (8.6 KB) — portal-forside, ingen Kommunebarometer-JS
- `kommunebarometer.html` (123 KB) — dashboardet (tidligere `index.html`)
- `sektor.html` (52 KB) — sektor-dypdykk, hjem-lenke peker til `/kommunebarometer`
- Hjelpe-sider (metodikk, sammenlign, politiker, vekt-justering): "Tilbake"-lenke peker til `/kommunebarometer`
- `vercel.json`: 4 rewrites totalt

### C3. Sektor-kort-lenker fra dashboard

`kommunebarometer.html:1965`: `const lenke = '/kommunebarometer/sektor?…'`. Klikk på
sektor-kort bruker rewrite-stien.

### C4. Syntax-sjekk JS

```bash
$ node -e 'parse alle inline scripts'
alle filer parser OK
```

### C5. Merge-bug-vakt etter alle 3 pakker

```
Sjekker funksjons-overlevelse i test/alle-pakker-samlet:kommunebarometer.html

OK: alle funksjoner fra fix/lorenskog-knr-3222:index.html er på plass
OK: alle funksjoner fra chore/datavalidering-mot-excel:index.html er på plass
OK: alle funksjoner fra feature/a2-dki-data:index.html er på plass
OK: alle funksjoner fra feature/a2-behovsjustert-visning:index.html er på plass
OK: alle funksjoner fra feature/sektor-dypdykk-alle-12:index.html er på plass
OK: alle funksjoner fra feature/forside-klikkbare-sektorer:index.html er på plass

Verifikasjon OK — ingen funksjonsdefinisjoner mangler.
```

---

## Krever manuell verifisering på Vercel-preview

Auto-verifikasjonen dekker ikke browser-rendering, mobile bredde,
Lighthouse-score, eller faktisk SSB-data-løp. Vegard må kjøre disse i
incognito mot test-preview. URL: <https://kommunebarometer-git-test-alle-pakker-samlet-vegard1104.vercel.app>
(eller den preview-URL Vercel returnerer).

### Sjekkliste (Pakke D)

| # | Test | Forventet |
|---|---|---|
| 1 | `/` (incognito) | Portal-forside med "Kommunedata" og 4 verktøy-kort. Ingen KOSTRA-data. |
| 2 | `/kommunebarometer` (uten `?kommune=`) | Tom-state "Velg en kommune for å starte" — IKKE Lørenskog. |
| 3 | `/kommunebarometer?kommune=4601` | Bergen-data lastes. Tittel "Bergen vs. landsgjennomsnitt – per sektor". Konsoll: `DKI 2025 lastet: 352 kommuner`, ingen ReferenceError. |
| 4 | Klikk sektor-kort på Bergen | URL blir `/kommunebarometer/sektor?id=…&kommune=Bergen&år=…&mode=…`. Sider laster. |
| 5 | Klikk "← Kommunebarometer" på dypdykket | Returnerer til `/kommunebarometer?kommune=Bergen…` — IKKE Lørenskog, IKKE portalen. |
| 6 | `/kommunebarometer?kommune=Karasjok` | Header viser "Karasjok" alene, IKKE "Kárášjohka - Karasjok". |
| 7 | `/kommunebarometer?kommune=Oslo` | Header viser "Oslo" alene, IKKE "Oslo - Oslove". |
| 8 | Topp 10-tabellen | Alle navn er rene bokmål (Tjeldsund, Tana, Kautokeino — ingen dual-form). |
| 9 | Mobil 375 px (devtools) | Portal og dashboard skal ikke ha horisontal scroll. |
| 10 | `/sektor.html` (direkte, uten `?kommune=`) | Banner "Ingen kommune valgt" + lenke til `/kommunebarometer`. |
| 11 | `/metodikk` "Tilbake"-lenke | Går til `/kommunebarometer` (ikke portal). |

### Spesielle obs

- Brukere som hadde gammel preview cached (DKI med 1 kommune fra Pakke 3a POC) kan fortsatt se feil verdi pga. `cache: 'force-cache'` i `loadDKI` — dette er rapportert som egen bug i forrige filsøkings-runde og ligger i HANDOFF-køen.
- Hvis en bruker har localStorage med `kb_muni_names` fra før Pakke B, kan dual-form-navn vise i topp 10-tabellen ved første sideload til neste re-fetch oppdaterer `MUNI_NAMES`. Lokal cache resettes automatisk når SSB-data-tabellen lastes.
- Filsøkings-rapporten fra forrige runde (DKI cache-mode-bug, Karasjok 5440-spec-feil osv.) ble loggført i PROSJEKTLOGG.md og påvirkes ikke av runde 6.

## Konklusjon

Alle auto-verifiserbare endepunkt er bekreftet. Kode-strukturen er
korrekt. Manuell preview-test gjenstår (Pakke D-sjekkliste over).
