#!/bin/bash
# Recopie dans docs/ les images que figures.sh vient de rendre.
# LANGUE=fr (défaut) pose dans docs/, LANGUE=en dans docs/en/.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; cd "$D"
source "$D/langue.sh"
DEST=".."; [ "$LG" = en ] && DEST="../en"
mkdir -p "$DEST/sections" "$DEST/schemas"
n=0
pose () { [ -f "$1" ] || { echo "  manquant : $1"; return; }; cp "$1" "$DEST/$2"; n=$((n+1)); }

pose "png$SUF/f-bodycount.png" banniere.png
for i in 01 02 03 04 05; do pose "sec$SUF/r-bodycount-$i.png" "sections/s$i.png"; done
pose "grid$SUF/bc-feat.png"    schemas/fonctionnalites.png
pose "grid$SUF/bc-stack.png"   schemas/stack.png
pose "grid$SUF/bc-route.png"   schemas/feuille-de-route.png
pose "tree$SUF/bodycount.png"  schemas/arborescence.png
pose "flow$SUF/bc-privacy.png" schemas/confidentialite.png
pose "flow$SUF/bc-palette.png" schemas/palette.png

if [ "$LG" != en ]; then
  mkdir -p "$DEST/langues"
  for k in fr-on fr-off en-on en-off; do pose "langues/$k.png" "langues/$k.png"; done
fi
echo "  $n images posées dans ${DEST#../}"
