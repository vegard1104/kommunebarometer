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

# Branchene som skal sjekkes mot merge-branchen.
BRANCHES=(
  "fix/lorenskog-knr-3222"
  "chore/datavalidering-mot-excel"
  "feature/a2-dki-data"
  "feature/a2-behovsjustert-visning"
  "feature/sektor-dypdykk-alle-12"
  "feature/forside-klikkbare-sektorer"
)

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

if ! git show "$MERGE_BRANCH:index.html" > "$TMP" 2>/dev/null; then
  echo "FEIL: Fant ikke index.html på branch $MERGE_BRANCH"
  exit 2
fi

PROBLEMS=0

for branch in "${BRANCHES[@]}"; do
  if ! git show "$branch:index.html" > /dev/null 2>&1; then
    echo "Hopper over $branch (finnes ikke lokalt)"
    continue
  fi

  defs_branch=$(git show "$branch:index.html" \
    | grep -oE "function +[a-zA-Z_\$][a-zA-Z0-9_\$]+" \
    | sed 's/function *//' \
    | sort -u)

  defs_merge=$(grep -oE "function +[a-zA-Z_\$][a-zA-Z0-9_\$]+" "$TMP" \
    | sed 's/function *//' \
    | sort -u)

  missing=$(comm -23 <(echo "$defs_branch") <(echo "$defs_merge") || true)

  if [ -n "$missing" ]; then
    echo "TAPT i merge fra $branch:"
    echo "$missing" | sed 's/^/  - /'
    PROBLEMS=1
  else
    echo "OK: alle funksjoner fra $branch er på plass"
  fi
done

if [ $PROBLEMS -eq 0 ]; then
  echo ""
  echo "Verifikasjon OK — ingen funksjonsdefinisjoner mangler."
fi

exit $PROBLEMS
