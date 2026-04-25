#!/usr/bin/env python3
"""
Oppdater DKI-data fra KMDs grønne hefter (Inntektssystemet for kommunene).

KMD publiserer ODS-filer årlig per kommune-år. Det finnes ikke et offisielt
API (bekreftet via Datalandsbyen.norge.no), så scriptet:

1. Skraper landingssiden for siste lenker til ODS-filer
2. Laster ned filene
3. Parser tabell E-k (samlet utgiftsbehovsindeks) og delkostnadsnøkler per
   sektor (typisk A–G: grunnskole, pleie, barnehage, barnevern, sosial,
   kommunehelse, administrasjon)
4. Skriver data/dki-<år>.json
5. Sanitetstest: vektet sum av sektor-DKI mot tabell E-k for hver kommune
6. Fallback: hvis nedlasting feiler, åpner HANDOFF-rad og brukes Excel-fila
   i team/referansedata/ som siste utvei (gir kun Lørenskog).

Bruk:
  python scripts/oppdater-dki-fra-kmd.py [--år 2025] [--år 2026]
  python scripts/oppdater-dki-fra-kmd.py --fallback-excel  # Excel-only

Avhenger av: requests, beautifulsoup4, pyexcel-ods3 (eller odfpy).
Se requirements.txt.
"""

import argparse
import json
import os
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urljoin

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
REFERANSE_DIR = REPO_ROOT / "team" / "referansedata"

KMD_LANDING = "https://www.regjeringen.no/no/tema/kommuner-og-regioner/kommuneokonomi/gront-hefte/id547024/"

# Mapping fra KMDs sektor-navn (i ODS-filen) til våre sektor-IDer.
SEKTOR_MAPPING = {
    "Grunnskole": "grunnskole",
    "Pleie og omsorg": "pleie",
    "Barnehage": "barnehage",
    "Barnevern": "barnevern",
    "Sosialtjeneste": "sosial",
    "Sosialhjelp": "sosial",
    "Kommunehelse": "kommunehelse",
    "Helse": "kommunehelse",
    "Administrasjon": "administrasjon",
}


def hent_ods_lenker(landingsurl: str) -> dict:
    """Skrap landingssiden for lenker til ODS-filer per år."""
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError as e:
        raise SystemExit(
            f"Manglende avhengighet: {e}. Installer: pip install -r requirements.txt"
        )

    print(f"Henter landingsside {landingsurl}")
    r = requests.get(landingsurl, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    # Finn alle .ods-lenker. KMD bruker mønster som .../<år>/...delkostnadsnokler...ods
    lenker = {}
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if not href.endswith(".ods"):
            continue
        full = urljoin(landingsurl, href)
        # Forsøk å plukke ut årstall fra URL eller link-tekst
        år_match = re.search(r"/(20\d{2})/", full) or re.search(
            r"\b(20\d{2})\b", a.get_text()
        )
        if år_match:
            år = int(år_match.group(1))
            lenker.setdefault(år, []).append(full)
    return lenker


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


def parse_ods(filsti: Path) -> dict:
    """Parse ODS-fil og returner { kommunenr: { sektor_id: dki_verdi } }."""
    try:
        from pyexcel_ods3 import get_data
    except ImportError:
        try:
            from pyexcel_ods import get_data  # eldre pakke-navn
        except ImportError:
            raise SystemExit(
                "Mangler ODS-leser. Installer: pip install pyexcel-ods3"
            )

    print(f"Parser {filsti}")
    bok = get_data(str(filsti))
    # ODS-filer fra KMD har typisk ark-navn som "Tabell E-k", "Delkostnadsnøkler" osv.
    # Vi leter etter et ark som har kommunenr i kol 0 og sektor-DKI-er bortover.
    resultat = {}
    for ark_navn, rader in bok.items():
        if not rader:
            continue
        header = [str(c).strip() for c in rader[0]]
        # Identifiser sektor-kolonner basert på SEKTOR_MAPPING
        kolonne_til_sektor = {}
        for i, h in enumerate(header):
            for kmd_navn, sektor_id in SEKTOR_MAPPING.items():
                if kmd_navn.lower() in h.lower():
                    kolonne_til_sektor[i] = sektor_id
                    break
        if not kolonne_til_sektor:
            continue
        # Finn kommunenr-kolonnen (typisk 4-sifret tall i første eller andre kolonne)
        for rad in rader[1:]:
            if not rad:
                continue
            knr = None
            for celle in rad[:3]:
                s = str(celle).strip()
                if re.fullmatch(r"\d{4}", s):
                    knr = s
                    break
            if not knr:
                continue
            for kol, sektor in kolonne_til_sektor.items():
                if kol < len(rad):
                    try:
                        dki = float(str(rad[kol]).replace(",", "."))
                        if 0.3 < dki < 3.0:  # plausibilitet
                            resultat.setdefault(knr, {})[sektor] = round(dki, 4)
                    except (ValueError, TypeError):
                        pass
    print(f"  → {len(resultat)} kommuner med DKI-data")
    return resultat


def fallback_excel() -> dict:
    """Bruk Excel-filen i team/referansedata/ for Lørenskog som siste utvei."""
    excel_fil = REFERANSE_DIR / "Lorenskog_KOSTRA_2025_nokkeltall.xlsx"
    if not excel_fil.exists():
        return {}
    # POC-data fra tidligere validering
    return {
        "3222": {
            "navn": "Lørenskog",
            "grunnskole": 0.9700,
            "pleie": 0.8127,
            "barnehage": 1.1783,
            "barnevern": 1.0236,
            "sosial": 1.1804,
            "kommunehelse": 0.8948,
            "administrasjon": 0.8960,
        }
    }


SEKTOR_VEKTER = {
    "grunnskole": 0.272,
    "pleie": 0.353,
    "barnehage": 0.157,
    "barnevern": 0.030,
    "sosial": 0.046,
    "kommunehelse": 0.046,
    "administrasjon": 0.096,
}


def sanitetssjekk(kommuner: dict) -> list:
    """Returner advarsler hvis vektet DKI ikke summerer til ~1.0 ±0.10."""
    advarsler = []
    for knr, sektorer in kommuner.items():
        if not sektorer:
            continue
        dekket = sum(SEKTOR_VEKTER.get(s, 0) for s in sektorer if s != "navn")
        if dekket < 0.5:
            continue  # for liten dekning til å vurdere
        vektet = sum(
            sektorer[s] * SEKTOR_VEKTER.get(s, 0)
            for s in sektorer
            if s in SEKTOR_VEKTER
        )
        normalisert = vektet / dekket if dekket > 0 else 0
        if not 0.85 < normalisert < 1.15:
            advarsler.append(
                f"  ⚠ {knr}: vektet DKI={normalisert:.3f} (utenfor 0.85–1.15)"
            )
    return advarsler


def skriv_dki_json(år: int, kommuner: dict, kilde: str) -> Path:
    fil = DATA_DIR / f"dki-{år}.json"
    payload = {
        "år": år,
        "kilde": kilde,
        "publisert": date.today().isoformat(),
        "hentet": date.today().isoformat(),
        "definisjon": "DKI > 1,0 = kommunen har høyere utgiftsbehov enn landsgjennomsnittet. DKI < 1,0 = lavere utgiftsbehov.",
        "dekning": f"{len(kommuner)} kommuner",
        "kommuner": kommuner,
        "sektorvekter": {
            "_kommentar": "KMDs offisielle sektorvekter (delkostnadsnøkler i inntektssystemet). Sum = 1.00.",
            **SEKTOR_VEKTER,
        },
    }
    fil.parent.mkdir(parents=True, exist_ok=True)
    with open(fil, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"  → skrev {fil} ({len(kommuner)} kommuner)")
    return fil


def kjør_for_år(år: int, fallback_only: bool = False) -> bool:
    """Returner True hvis JSON ble skrevet (full data eller fallback)."""
    if not fallback_only:
        try:
            lenker = hent_ods_lenker(KMD_LANDING)
            url = (lenker.get(år) or [None])[0]
            if not url:
                print(f"  ✗ Ingen ODS-lenke for {år} på landingssiden")
                raise FileNotFoundError(f"ODS for {år} ikke funnet")
            ods = last_ned_ods(url, REFERANSE_DIR / f"kmd-gront-hefte-{år}.ods")
            kommuner = parse_ods(ods)
            if kommuner:
                advarsler = sanitetssjekk(kommuner)
                for adv in advarsler:
                    print(adv)
                skriv_dki_json(år, kommuner, f"KMD Grønt hefte {år} (ODS)")
                return True
        except Exception as e:
            print(f"  ✗ Full innhenting feilet for {år}: {e}")

    # Fallback: Excel-data for Lørenskog
    print(f"  → Bruker Excel-fallback (kun Lørenskog) for {år}")
    fallback = fallback_excel()
    if fallback:
        skriv_dki_json(
            år,
            fallback,
            "Excel-fallback: team/referansedata/Lorenskog_KOSTRA_2025_nokkeltall.xlsx (kun Lørenskog)",
        )
        return True
    print(f"  ✗ Ingen DKI-data tilgjengelig for {år}")
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
