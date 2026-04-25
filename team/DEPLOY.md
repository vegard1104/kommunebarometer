# Deploy — Kommunebarometer

Eies av **Release Manager**. Beskriver hvordan kode flyter fra lokal endring til produksjon, og hvordan vi ruller tilbake hvis noe brekker.

> **Status 2026-04-25:** Dokumentet skrevet av Claude Code i Pakke 2 (AP-03). Vercel-koblingen er forutsatt eksisterende (Vegard satte den opp før team-arbeidet startet) — verifisering må Vegard gjøre selv, jf. seksjon "Vegards sjekkpunkter" nedenfor. Ingen Vercel-konto-aksess er gitt til Claude Code.

---

## 1. Repo-oppsett

- **Remote:** `https://github.com/vegard1104/kommunebarometer.git`
- **Default branch:** `main`
- **Eier:** vegard1104 (privat repo)
- **Lisens:** ikke spesifisert (vurderes når v2 publiseres bredt)

### GitHub-defaults som skal være på plass

Disse må Vegard verifisere i Settings:

- [ ] **Default branch = `main`** (Settings → Branches)
- [ ] **Branch protection på `main`:**
  - [ ] Require a pull request before merging
  - [ ] Require status checks to pass (Vercel preview-deploy må være OK)
  - [ ] Require linear history (anbefalt — gjør rebase enklere)
  - [ ] Restrict who can push to matching branches: kun deg selv som admin (forhindrer at agenter kan pushe direkte)
- [ ] **Auto-delete merged branches** (Settings → General → Pull Requests) — holder branch-listen ren

`gh` CLI er ikke installert i Claude Code-miljøet, så Claude kan ikke sjekke disse selv. **Du må verifisere manuelt før neste merge.**

---

## 2. Branch-strategi

| Prefiks | Bruk | Eksempel |
|---|---|---|
| `feature/` | Ny brukerrettet funksjonalitet | `feature/kommune-velger` |
| `fix/` | Bugfix uten ny funksjonalitet | `fix/radar-mobile-overflow` |
| `chore/` | Vedlikehold, ikke-funksjonelt | `chore/repo-og-vercel-hygiene` |
| `docs/` | Dokumentasjon, ADR-er, README | `docs/adr-001-v2-arkitektur` |
| `design/` | Design-tokens, wireframes, visuelle endringer | `design/tokens-fargesvaksynt` |
| `spike/` | Eksperiment, kasta etter at funn er dokumentert | `spike/ssb-alle-kommuner` |

**Regler:**
1. **Aldri commit direkte til `main`.** Bruk alltid en branch + PR.
2. **Én branch = én PR = én konkret endring.** Ikke bland scope.
3. **Branch-navnet skal beskrive intensjonen.** `chore/2026-04-25-misc` er forbudt.
4. **Norsk språk** i commit-meldinger og PR-beskrivelser. Kode-kommentarer på norsk der det er plass.

---

## 3. Deploy-flyt

```
[lokal endring]
       ↓ git push
[GitHub branch]
       ↓ Vercel auto
[Preview-deploy: <branch>-vegard1104.vercel.app]
       ↓ Vegard reviewer + tester preview
[Pull Request mot main]
       ↓ Vegard merger
[main → Vercel produksjons-deploy]
       ↓ ~2 min build
[kommunebarometer.vercel.app]
```

### Preview-deploy

- Hver PR får automatisk en preview-URL fra Vercel (vises som status check i PR-en).
- Preview-URL har samme rewrites som produksjon (`/api/ssb/*` → SSB).
- Bruk preview til å validere visuelle endringer og å teste mot ekte SSB-data.
- Preview-deploys er kun tilgjengelige for personer med tilgang til Vercel-prosjektet.

### Produksjons-deploy

- Trigget når `main` får ny commit (kun via merge av PR).
- Build tar ~30 sekunder (statisk site, ingen build-steg per nå).
- Post-merge er endringen live umiddelbart — det finnes ikke noe staging-mellomledd.

---

## 4. Rollback

Hvis produksjon brekker etter en merge:

### Alternativ 1 — Vercel UI (raskest, ~10 sekunder)
1. Gå til https://vercel.com/vegard1104/kommunebarometer/deployments
2. Finn forrige fungerende produksjons-deploy (den merket `Production` med tidligere timestamp)
3. Klikk de tre prikker → **Promote to Production**

Dette ruller tilbake til kompilert artifakt — Git er uendret. Bruk dette når brann er løs.

### Alternativ 2 — Git revert (mer korrekt, krever ny PR)
```bash
git checkout main
git pull
git revert <commit-sha>
git push origin main  # FEIL — main er protected, må gå via branch + PR
```

Riktig flyt:
```bash
git checkout -b fix/revert-<problem>
git revert <commit-sha>
git push -u origin fix/revert-<problem>
# Åpne PR og merge straks (etter rask review)
```

### Alternativ 3 — git reset (destruktivt, kun ved ekstrem nød)
**Bruk ikke uten å varsle.** Force-push til `main` er blokkert av branch-protection — og bør være det.

---

## 5. Vercel-konfigurasjon

### Forventet oppsett

- **Project:** `kommunebarometer` på Vercel-konto `vegard1104`
- **Linked Git repo:** `vegard1104/kommunebarometer` (GitHub)
- **Production branch:** `main`
- **Framework preset:** Other (statisk site, ingen build-kommando)
- **Build command:** _(tom)_
- **Output directory:** _(tom — repo-rot serveres direkte)_

### Anbefalt endring i `vercel.json` (fra AP-04-spike, 2026-04-25)

Spike-resultatene viser at SSB-respons har p50=620ms cold. Edge-cache er kritisk for brukeropplevelsen siden SSB kun oppdaterer 2× per år (15. mars og 15. juni).

**Foreslått oppdatering** (Vegard kan inkludere eller utsette):
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/api/ssb/:path*", "destination": "https://data.ssb.no/api/pxwebapi/v2/:path*" }
  ],
  "headers": [
    {
      "source": "/api/ssb/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, s-maxage=86400, stale-while-revalidate=604800" }
      ]
    }
  ]
}
```

Effekt:
- Vercel Edge cache holder respons i 24 t (`s-maxage=86400`)
- Stale-while-revalidate gir bruker rask respons i 1 uke selv om cache er expired (regenererer i bakgrunnen)
- Hvis SSB er nede: vi serverer stale data opptil 1 uke gammel
- Cache invalideres automatisk hvis URL-et endres (ulike `valuecodes` får ulike cache-entries)

**Ikke inkludert i denne PR-en** for å holde scope rent — Vegard tar avgjørelsen om når/hvordan.

---

## 6. Vegards sjekkpunkter (manuelle)

Disse kan kun gjøres med Vegard-tilgang og er forutsatt utført før vi går videre med v2-implementasjon:

- [ ] **GitHub branch-protection på `main`** er aktivert (jf. seksjon 1)
- [ ] **Vercel-prosjektet er kobla til GitHub-repoet**
  - Gå til https://vercel.com/dashboard → velg `kommunebarometer`
  - Settings → Git → bekreft "Connected Git Repository: vegard1104/kommunebarometer"
- [ ] **Preview-deploy fungerer på en åpen PR**
  - Åpne en av de fire PR-ene som ligger åpne (Pakke 0–3)
  - Sjekk at Vercel-status-check vises i bunnen av PR-en
  - Klikk preview-URL og verifiser at siden laster med live SSB-data
- [ ] **Produksjons-URL er hva vi forventer** (kommunebarometer.vercel.app eller egen domene?)
- [ ] **Ingen miljøvariabler er nødvendig** for v1 (alt er statisk + offentlig SSB-API). Verifiser at Vercel ikke har noen `VERCEL_TOKEN`-aktige hemmeligheter satt unødvendig.
- [ ] **Konto-grensen** (Hobby vs Pro) — vi er antakelig på Hobby (gratis). Spike-arbeidet kommer ikke i nærheten av Hobby-grensene (100 GB bandwidth/mnd, unlimited deploys), men hvis prosjektet vokser bør vi vurdere Pro-konto for å unngå tjeneste-pause.

---

## 7. Filhygiene

### `.gitattributes`

`* text=auto eol=lf` — lagrer alle tekstfiler med LF i repo, normaliserer på checkout. Eliminerer CRLF/LF-warnings på Windows-utviklere. Binærfiler (.docx, .xlsx, bilder) er eksplisitt markert.

### `.gitignore`

Inneholder:
- `.claude/` — Claude Code-worktrees (lokal kun)
- `.env*` (unntatt `.env.example`) — hemmeligheter
- `node_modules/`, `dist/`, `.next/`, `.vercel/` — fremtidige build-artefakter
- OS- og editor-spesifikke filer

### Hva som IKKE skal i repo

- Hemmeligheter (API-nøkler, tokens) — vi har ingen per nå, men hvis det kommer: bruk Vercel Environment Variables.
- Genererte filer (build, dist) — ikke lag dem manuelt.
- Personopplysninger eller eksterne datasett uten tydelig lisens.

---

## 8. Endringslogg

| Dato | Endring | PR/branch |
|---|---|---|
| 2026-04-25 | Dokument opprettet av Claude Code i Pakke 2. `.gitattributes` lagt til. `.gitignore` utvidet. Vercel cache-anbefaling lagt inn som forslag (ikke implementert). | `chore/repo-og-vercel-hygiene` |
