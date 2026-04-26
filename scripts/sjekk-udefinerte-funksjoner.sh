#!/bin/bash
# Bruk: ./scripts/sjekk-udefinerte-funksjoner.sh <merge-branch>
# Returnerer 0 hvis OK, 1 hvis funksjoner mangler.
#
# Sjekker at ingen funksjonsdefinisjoner fra kilde-branchene har falt ut
# av merge-branchen sin index.html. Bakgrunn: tidligere merge tapte 14
# funksjonsdefinisjoner i konfliktoppløsninger mens kallene stod igjen
# slik at hele siden krasjet med ReferenceError.

set -e
MERGE_BRANCH="${1:-test/alle-pakker-samlet}"

# Branchene som skal sjekkes mot merge-branchen. Hver oppføring er
# "<branch>:<fil>" — fila som skal sammenlignes med merge-branchen sin fil
# av samme navn. Etter Pakke C (runde 6) ble dashboard-koden flyttet fra
# index.html til kommunebarometer.html.
BRANCHES=(
  "fix/lorenskog-knr-3222:index.html"
  "chore/datavalidering-mot-excel:index.html"
  "feature/a2-dki-data:index.html"
  "feature/a2-behovsjustert-visning:index.html"
  "feature/sektor-dypdykk-alle-12:index.html"
  "feature/forside-klikkbare-sektorer:index.html"
)

# Velg riktig dashboard-fil i merge-branchen (kommunebarometer.html etter
# Pakke C, ellers index.html).
DASH_FIL="kommunebarometer.html"
if ! git show "$MERGE_BRANCH:$DASH_FIL" > /dev/null 2>&1; then
  DASH_FIL="index.html"
fi

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

if ! git show "$MERGE_BRANCH:$DASH_FIL" > "$TMP" 2>/dev/null; then
  echo "FEIL: Fant verken kommunebarometer.html eller index.html på branch $MERGE_BRANCH"
  exit 2
fi

echo "Sjekker funksjons-overlevelse i $MERGE_BRANCH:$DASH_FIL"
echo ""

PROBLEMS=0

for entry in "${BRANCHES[@]}"; do
  branch="${entry%%:*}"
  fil="${entry##*:}"

  if ! git show "$branch:$fil" > /dev/null 2>&1; then
    echo "Hopper over $branch (finnes ikke lokalt)"
    continue
  fi

  defs_branch=$(git show "$branch:$fil" \
    | grep -oE "function +[a-zA-Z_\$][a-zA-Z0-9_\$]+" \
    | sed 's/function *//' \
    | sort -u)

  defs_merge=$(grep -oE "function +[a-zA-Z_\$][a-zA-Z0-9_\$]+" "$TMP" \
    | sed 's/function *//' \
    | sort -u)

  missing=$(comm -23 <(echo "$defs_branch") <(echo "$defs_merge") || true)

  if [ -n "$missing" ]; then
    echo "TAPT i merge fra $branch:$fil → $MERGE_BRANCH:$DASH_FIL:"
    echo "$missing" | sed 's/^/  - /'
    PROBLEMS=1
  else
    echo "OK: alle funksjoner fra $branch:$fil er på plass"
  fi
done

if [ $PROBLEMS -eq 0 ]; then
  echo ""
  echo "Verifikasjon OK — ingen funksjonsdefinisjoner mangler."
fi

exit $PROBLEMS
