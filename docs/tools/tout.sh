#!/bin/bash
# Refait toutes les images des deux READMEs, puis les repose.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "pastilles.sh"; bash "$D/pastilles.sh"
echo "social.sh"; bash "$D/social.sh"
for LG in fr en; do
  echo; echo "=== $LG ==="
  LANGUE=$LG bash "$D/figures.sh"
  LANGUE=$LG bash "$D/captures.sh"
  LANGUE=$LG node "$D/anime.js"
  LANGUE=$LG bash "$D/installer.sh"
done
