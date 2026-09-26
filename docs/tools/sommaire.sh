#!/bin/bash
# Le sommaire du README : le bandeau « 00 », puis une tuile par section,
# son icône, son numéro, son titre. Une image par tuile, pour que chacune
# soit un lien vers sa section : GitHub retire le HTML actif des README,
# mais garde les liens posés autour d'une image.
#
#   bash docs/tools/sommaire.sh            le français, dans docs/sommaire
#   LANGUE=en bash docs/tools/sommaire.sh  l'anglais, dans docs/en/sommaire
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/langue.sh"
source "$D/bandeaux.sh" >/dev/null 2>&1
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
B="$(cd "$D" && pwd -W 2>/dev/null || pwd)"
A="#E879F9"
DEST="$D/.."; [ "$LG" = en ] && DEST="$D/../en"
mkdir -p "$D/html$SUF" "$DEST/sommaire" "$DEST/sections"

# Le bandeau, du même gabarit que les autres sections.
sec bodycount "$A" "00" "$(t 'Sommaire' 'Contents')"
cp "$D/sec$SUF/r-bodycount-00.png" "$DEST/sections/s00.png"

# tuile <numéro> <icône Material> <titre>
tuile () {
cat > "$D/html$SUF/sommaire-$1.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&family=JetBrains+Mono:wght@500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,1,0&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:250px;height:64px;overflow:hidden;background:transparent}
.c{width:250px;height:64px;display:flex;align-items:center;gap:13px;padding:0 14px;
   background:#131A24;border:1px solid #1F2833;border-radius:14px}
.ic{font-family:'Material Symbols Rounded';font-size:22px;width:38px;height:38px;flex-shrink:0;border-radius:11px;
    display:flex;align-items:center;justify-content:center;color:$A;
    background:color-mix(in srgb,$A 10%,#131A24);border:1px solid color-mix(in srgb,$A 30%,#131A24);
    box-shadow:0 0 16px color-mix(in srgb,$A 16%,transparent)}
.n{font-family:'JetBrains Mono',monospace;font-size:11px;color:color-mix(in srgb,$A 70%,#131A24);letter-spacing:1px}
h3{font-family:'Space Grotesk',sans-serif;font-size:14.5px;font-weight:600;line-height:1.2;margin-top:2px;color:#F0F4F8}
</style></head><body>
<div class="c"><span class="ic">$2</span><div><div class="n">$1</div><h3>$3</h3></div></div>
</body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 \
  --force-device-scale-factor=2 --default-background-color=00000000 --window-size=250,64 \
  --screenshot="$B/html$SUF/sommaire-$1.png" "file:///$B/html$SUF/sommaire-$1.html" >/dev/null 2>&1
cp "$D/html$SUF/sommaire-$1.png" "$DEST/sommaire/$1.png"
}

tuile 01 auto_awesome "$(t 'Fonctionnalités' 'Features')"
tuile 02 smartphone "$(t 'Les écrans' 'The screens')"
tuile 03 download "$(t 'Installer' 'Install')"
tuile 04 layers "$(t 'La stack' 'The stack')"
tuile 05 account_tree "$(t 'Architecture' 'Architecture')"
tuile 06 lock "$(t 'Le chiffrement' 'Encryption')"
tuile 07 movie "$(t 'Vidéos et sauvegardes' 'Videos and backups')"
tuile 08 map "$(t 'La carte' 'The map')"
tuile 09 calendar_month "$(t 'Le calendrier' 'The calendar')"
tuile 10 shield "$(t 'Confidentialité' 'Privacy')"
tuile 11 task_alt "$(t 'Les tests' 'The tests')"
tuile 12 wifi_off "$(t 'Sans Internet' 'No Internet')"
tuile 13 warning "$(t 'Avertissement' 'A word of warning')"
tuile 14 history "$(t 'Les versions' 'Versions')"
tuile 15 gavel "$(t 'Licence' 'Licence')"
echo "  sommaire : bandeau et 15 tuiles ($LG)"
