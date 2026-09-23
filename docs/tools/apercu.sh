#!/bin/bash
# Ouvre les deux READMEs dans Chrome, tels que GitHub les affichera.
#
# Les figures se jugent les unes sous les autres, pas une par une : une
# grille trop haute ou un bandeau mal numéroté ne se voit qu'en défilant
# la page entière. Ce script pose donc un aperçu local, avec le fond
# sombre de GitHub et la même largeur de colonne.
#
#   bash docs/tools/apercu.sh          ouvre le français
#   bash docs/tools/apercu.sh en       ouvre l'anglais
#   bash docs/tools/apercu.sh fr png   en capture une image au lieu d'ouvrir
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RACINE="$(cd "$D/../.." && pwd)"
LG="${1:-fr}"
MODE="${2:-ouvrir}"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"

DOSSIER="docs"; [ "$LG" = en ] && DOSSIER="docs/en"
SORTIE="$D/apercu-$LG.html"
B="$(cd "$RACINE" && pwd -W 2>/dev/null || pwd)"

# L'ordre est celui du README. Un fichier manquant se voit : le cadre
# reste, avec son nom en rouge, plutôt que de disparaître en silence.
FIGURES=(
  "banniere.png|"
  "sections/s01.png|schemas/fonctionnalites.png"
  "sections/s02.png|schemas/ecrans.png"
  "|schemas/captures.png"
  "sections/s03.png|schemas/stack.png"
  "sections/s04.png|schemas/couches.png"
  "|schemas/modele.png"
  "|schemas/arborescence.png"
  "sections/s05.png|schemas/chiffrement.svg"
  "|schemas/formats.png"
  "sections/s06.png|schemas/carte.png"
  "sections/s07.png|"
  "sections/s08.png|schemas/confidentialite.png"
  "|schemas/palette.png"
  "sections/s09.png|schemas/feuille-de-route.png"
  "sections/s10.png|"
)

corps=""
for paire in "${FIGURES[@]}"; do
  IFS='|' read -r a b <<< "$paire"
  for img in "$a" "$b"; do
    [ -z "$img" ] && continue
    if [ -f "$RACINE/$DOSSIER/$img" ]; then
      corps+="<img src=\"file:///$B/$DOSSIER/$img\" alt=\"$img\">"
    else
      corps+="<div class=\"ko\">manquant : $DOSSIER/$img</div>"
    fi
  done
done

cat > "$SORTIE" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<title>BodyCount, aperçu $LG</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D1117;padding:40px 0 80px;font-family:system-ui,sans-serif}
.col{width:896px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
img{width:100%;display:block;border-radius:6px}
.ko{padding:22px;border:1px dashed #E2725F;border-radius:8px;color:#E2725F;
    font-family:ui-monospace,monospace;font-size:13px}
</style></head><body><div class="col">$corps</div></body></html>
HTML

if [ "$MODE" = png ]; then
  H="$("$CH" --headless=new --disable-gpu --virtual-time-budget=9000 --dump-dom \
        "file:///$(cd "$D" && pwd -W 2>/dev/null || pwd)/apercu-$LG.html" 2>/dev/null \
        | wc -c)"
  "$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=9000 \
    --screenshot="$D/apercu-$LG.png" --window-size=980,12000 \
    "file:///$(cd "$D" && pwd -W 2>/dev/null || pwd)/apercu-$LG.html" >/dev/null 2>&1
  echo "  apercu-$LG.png"
else
  echo "  $SORTIE"
  "$CH" "file:///$(cd "$D" && pwd -W 2>/dev/null || pwd)/apercu-$LG.html" >/dev/null 2>&1 &
fi
