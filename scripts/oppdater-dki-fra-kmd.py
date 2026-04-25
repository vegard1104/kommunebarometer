#!/usr/bin/env python3
"""
Oppdater DKI-data fra KMDs grønne hefter (Inntektssystemet for kommunene).

KMD publiserer ODS-filer årlig på regjeringen.no. Det finnes ikke et offisielt
API (bekreftet via Datalandsbyen.norge.no), så scriptet:

1. Skraper landingssiden gront-hefte/id547024 for ODS-lenker per år
2. Foretrekker tabell A-k (utgiftsutjamning) som inneholder "Indeks berekna
   utgiftsbehov" (samlet DKI) per kommune
3. Parser ODS via pyexcel-ods3
4. Skriver data/dki-<år>.json med samlet DKI per kommune
5. Behold Lørenskog-Excel-data for sektor-spesifikke DKI'er (POC, kun denne
   ene kommunen — sektor-spesifikke DKI'er for alle krever F-k Kriteriedata
   + KMDs delkostnadsnøkler-formler, noe som er åpen HANDOFF for fase 2)

VIKTIG: Tabell A-k inneholder kun SAMLET DKI, ikke sektor-spesifikt. Det betyr
at behovsjustering for de fleste kommuner skalerer alle sektorer uniformt.
For Lørenskog beholdes detaljert per-sektor DKI fra Excel-fila.

Bruk:
  python scripts/oppdater-dki-fra-kmd.py [--år 2025] [--år 2026]
  python scripts/oppdater-dki-fra-kmd.py --fallback-excel  # Excel-only

Avhenger av: requests, pyexcel-ods3 (eller odfpy). Se requirements.txt.
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urljoin

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
REFERANSE_DIR = REPO_ROOT / "team" / "referansedata"

KMD_LANDING = "https://www.regjeringen.no/no/tema/kommuner-og-regioner/kommuneokonomi/gront-hefte/id547024/"

# Lørenskog (3222) får detaljert sektor-DKI fra Excel-fila. Andre kommuner
# bruker samlet DKI fra A-k uniformt på alle sektorer.
LORENSKOG_DETALJERT = {
    "navn": "Lørenskog",
    "grunnskole": 0.9700,
    "pleie": 0.8127,
    "barnehage": 1.1783,
    "barnevern": 1.0236,
    "sosial": 1.1804,
    "kommunehelse": 0.8948,
    "administrasjon": 0.8960,
}

# KMDs offisielle sektorvekter (delkostnadsnøkler i inntektssystemet).
SEKTOR_VEKTER = {
    "grunnskole": 0.272,
    "pleie": 0.353,
    "barnehage": 0.157,
    "barnevern": 0.030,
    "sosial": 0.046,
    "kommunehelse": 0.046,
    "administrasjon": 0.096,
}

# Sektor-IDene vi skriver DKI for hver kommune.
ALLE_SEKTORER = list(SEKTOR_VEKTER.keys())


def hent_alle_ods_lenker(landingsurl: str) -> list:
    """Skrap landingssiden for alle .ods-lenker."""
    try:
        import requests
    except ImportError as e:
        raise SystemExit(
            f"Manglende avhengighet: {e}. Installer: pip install -r scripts/requirements.txt"
        )

    print(f"Henter landingsside {landingsurl}")
    r = requests.get(landingsurl, timeout=30)
    r.raise_for_status()
    html = r.text
    print(f"  HTML: {len(html)} bytes")

    # Match alle .ods-lenker
    lenker = []
    for m in re.finditer(r'<a[^>]+href="([^"]+\.ods)"[^>]*>([^<]*)</a>', html, re.IGNORECASE):
        href = m.group(1)
        if href.startswith("/"):
            href = "https://www.regjeringen.no" + href
        lenker.append({"url": href, "tekst": m.group(2).strip()})
    print(f"  Funnet {len(lenker)} .ods-lenker totalt")
    return lenker


def velg_tabell_a_k(lenker: list, år: int) -> str:
    """Finn URL til tabell A-k (utgiftsutjamning) for gitt år.

    KMD bruker mønstre som:
      .../<år>/kom-ods/tabell-a-k-utgiftsutjamning-for-kommunane-<år>.ods   (2026)
      .../<år>/kommuner/tabell-a-k-<år>-utgiftsutjamning-for-kommunane.ods  (2025)
    """
    år_str = str(år)
    kandidater = [
        l for l in lenker
        if år_str in l["url"]
        and re.search(r"tabell.{0,3}a.k", l["url"], re.IGNORECASE)
        and "utgiftsutjamning" in l["url"].lower()
        and "fykom" not in l["url"].lower()  # ekskluder fylkeskommune-tabeller
    ]
    if not kandidater:
        # Fallback: hvilken som helst tabell-a-k for kommunane
        kandidater = [
            l for l in lenker
            if år_str in l["url"]
            and re.search(r"tabell.{0,3}a.k", l["url"], re.IGNORECASE)
            and "fykom" not in l["url"].lower()
        ]
    if not kandidater:
        return None
    print(f"  → Valgte: {kandidater[0]['url']}")
    return kandidater[0]["url"]


def last_ned_ods(url: str, mål: Path) -> Path:
    import requests
    print(f"Laster ned {url}")
    r = requests.get(url, timeout=60, stream=True)
    r.raise_for_status()
    mål.parent.mkdir(parents=True, exist_ok=True)
    with open(mål, "wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)
    print(f"  → {mål} ({mål.stat().st_size} bytes)")
    return mål


def parse_a_k(filsti: Path) -> dict:
    """Parse tabell A-k og returner { kommunenr: samlet_dki }.

    Format observert i 2026-versjonen:
      Rad 0: header ("Kommune", "Indeks berekna utgiftsbehov", ...)
      Rad 1-2: under-headers
      Rad 4+: data, første kolonne "<knr> <navn>", andre kolonne DKI-verdien.
    """
    try:
        from pyexcel_ods3 import get_data
    except ImportError:
        try:
            from pyexcel_ods import get_data
        except ImportError:
            raise SystemExit(
                "Mangler ODS-leser. Installer: pip install pyexcel-ods3"
            )

    print(f"Parser {filsti}")
    bok = get_data(str(filsti))
    resultat = {}
    for ark_navn, rader in bok.items():
        if not rader:
            continue
        # Finn kolonnen som inneholder "indeks" + "utgiftsbehov" i header
        dki_kol = None
        for i, header in enumerate(rader[:3]):
            for j, celle in enumerate(header):
                tekst = str(celle).lower()
                if "indeks" in tekst and "utgiftsbehov" in tekst:
                    dki_kol = j
                    print(f"  DKI-kolonne funnet i rad {i}, kolonne {j}: '{celle}'")
                    break
            if dki_kol is not None:
                break
        if dki_kol is None:
            print(f"  ⚠ Fant ikke DKI-kolonne i ark '{ark_navn}'")
            continue

        # Parse rader: første celle "<knr> <navn>", DKI-kolonnen som tall
        for rad in rader:
            if not rad or len(rad) <= dki_kol:
                continue
            første = str(rad[0]).strip()
            knr_match = re.match(r"^(\d{4})\b", første)
            if not knr_match:
                continue
            knr = knr_match.group(1)
            try:
                dki = float(str(rad[dki_kol]).replace(",", "."))
                if 0.5 < dki < 2.0:
                    resultat[knr] = round(dki, 4)
            except (ValueError, TypeError):
                pass
        break  # bare første ark som har DKI-kolonne

    print(f"  → {len(resultat)} kommuner med samlet DKI")
    return resultat


def bygg_kommune_dki(samlet_dki: dict) -> dict:
    """Bygg kommuner-strukturen til dki-<år>.json.

    For Lørenskog (3222): bruk detaljert sektor-DKI fra Excel.
    For andre kommuner: anvend samlet DKI uniformt på alle sektorer (begrensning).
    """
    kommuner = {}
    for knr, dki in samlet_dki.items():
        if knr == "3222":
            # Lørenskog: detaljert
            kommuner[knr] = {**LORENSKOG_DETALJERT, "samlet": dki}
        else:
            # Andre kommuner: uniform DKI på alle sektorer
            kommuner[knr] = {sektor: dki for sektor in ALLE_SEKTORER}
            kommuner[knr]["samlet"] = dki
    return kommuner


def fallback_excel() -> dict:
    """Excel-fallback: kun Lørenskog (POC)."""
    return {"3222": {**LORENSKOG_DETALJERT, "samlet": 0.9479}}


def sanitetssjekk(kommuner: dict) -> list:
    """Returner advarsler hvis vektet DKI ikke summerer til ~1.0 ±0.15."""
    advarsler = []
    for knr, sektorer in kommuner.items():
        if not sektorer or not isinstance(sektorer, dict):
            continue
        # Beregn vektet DKI fra sektor-feltene
        dekket = 0
        vektet = 0
        for sektor, vekt in SEKTOR_VEKTER.items():
            if sektor in sektorer and isinstance(sektorer[sektor], (int, float)):
                dekket += vekt
                vektet += sektorer[sektor] * vekt
        if dekket < 0.5:
            continue
        normalisert = vektet / dekket
        if not 0.6 < normalisert < 1.5:  # vid grense for kommuner med ekstreme indekser
            advarsler.append(
                f"  ⚠ {knr}: vektet DKI={normalisert:.3f} (utenfor 0.6–1.5)"
            )
    return advarsler


def skriv_dki_json(år: int, kommuner: dict, kilde: str, dekning: str) -> Path:
    fil = DATA_DIR / f"dki-{år}.json"
    payload = {
        "år": år,
        "kilde": kilde,
        "publisert": date.today().isoformat(),
        "hentet": date.today().isoformat(),
        "definisjon": (
            "DKI > 1,0 = kommunen har høyere utgiftsbehov enn landsgjennomsnittet "
            "(eldre/dyrere befolkning). DKI < 1,0 = lavere utgiftsbehov."
        ),
        "merknad": (
            "Tabell A-k fra KMD inneholder kun SAMLET DKI per kommune. Sektor-"
            "spesifikke DKI'er (grunnskole, pleie, barnehage osv) er kun tilgjengelige "
            "for Lørenskog (3222) som POC fra Excel-referansen. Andre kommuner får "
            "samlet DKI anvendt uniformt på alle sektorer. Sektor-spesifikke verdier "
            "for alle 357 kommuner krever parsing av F-k Kriteriedata + KMDs "
            "delkostnadsnøkler-formler — åpen HANDOFF for fase 2."
        ),
        "dekning": dekning,
        "kommuner": kommuner,
        "sektorvekter": {
            "_kommentar": "KMDs offisielle sektorvekter (delkostnadsnøkler). Sum = 1.00.",
            **SEKTOR_VEKTER,
        },
    }
    fil.parent.mkdir(parents=True, exist_ok=True)
    with open(fil, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"  → skrev {fil} ({len(kommuner)} kommuner)")
    return fil


def kjør_for_år(år: int, fallback_only: bool = False) -> bool:
    if not fallback_only:
        try:
            lenker = hent_alle_ods_lenker(KMD_LANDING)
            url = velg_tabell_a_k(lenker, år)
            if not url:
                print(f"  ✗ Tabell A-k for {år} ikke funnet")
                raise FileNotFoundError(f"A-k for {år}")
            ods = last_ned_ods(url, REFERANSE_DIR / f"kmd-tabell-a-k-{år}.ods")
            samlet = parse_a_k(ods)
            if not samlet:
                raise RuntimeError("Ingen DKI-data parset fra A-k")
            kommuner = bygg_kommune_dki(samlet)
            advarsler = sanitetssjekk(kommuner)
            if advarsler:
                print("Sanitetssjekk-advarsler:")
                for adv in advarsler[:10]:
                    print(adv)
                if len(advarsler) > 10:
                    print(f"  ... og {len(advarsler) - 10} til")
            skriv_dki_json(
                år, kommuner,
                f"KMD Grønt hefte {år} — Tabell A-k (Utgiftsutjamning), samlet DKI per kommune",
                f"{len(kommuner)} kommuner (samlet DKI; Lørenskog detaljert)",
            )
            return True
        except Exception as e:
            print(f"  ✗ Full innhenting feilet for {år}: {e}")

    print(f"  → Bruker Excel-fallback for {år} (kun Lørenskog)")
    fallback = fallback_excel()
    if fallback:
        skriv_dki_json(
            år, fallback,
            f"Excel-fallback ({år}): kun Lørenskog (3222)",
            "1 kommune (Lørenskog POC)",
        )
        return True
    return False


def main():
    ap = argparse.ArgumentParser(description="Oppdater DKI-data fra KMDs grønne hefter")
    ap.add_argument("--år", type=int, action="append", help="År som skal oppdateres (kan repeteres)")
    ap.add_argument("--fallback-excel", action="store_true", help="Skip nedlasting, bruk kun Excel-fallback")
    args = ap.parse_args()

    årliste = args.år or [2025, 2026]
    print(f"Oppdaterer DKI for år: {årliste}")

    suksess = 0
    for år in årliste:
        print(f"\n=== {år} ===")
        if kjør_for_år(år, fallback_only=args.fallback_excel):
            suksess += 1

    print(f"\nFerdig. {suksess} av {len(årliste)} år oppdatert.")
    sys.exit(0 if suksess == len(årliste) else 1)


if __name__ == "__main__":
    main()
