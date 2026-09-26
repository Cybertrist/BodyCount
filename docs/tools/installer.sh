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
pose "png$SUF/telecharger.png" telecharger.png
pose "png$SUF/telecharger-demo.png" telecharger-demo.png
for i in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15; do
  pose "sec$SUF/r-bodycount-$i.png" "sections/s$i.png"
done

# Toutes les figures du README sont désormais des SVG animés, écrits
# directement dans docs/schemas par anime.js : rien d'autre à poser ici.

if [ "$LG" != en ]; then
  mkdir -p "$DEST/langues"
  for k in fr-on fr-off en-on en-off; do pose "langues/$k.png" "langues/$k.png"; done
fi
echo "  $n images posées dans ${DEST#../}"
