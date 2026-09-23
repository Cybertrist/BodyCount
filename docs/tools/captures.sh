#!/bin/bash
# Planche de captures d'écran pour les READMEs.
#
# Les images sources sont des captures brutes d'un appareil virtuel
# (1080 x 2340), rangées dans src-captures/. Aucune ne montre de visage :
# ce sont les quatre écrans qui n'en affichent pas, et c'est voulu, le
# jeu d'essai du dépôt est fait de portraits qui n'ont rien à faire dans
# une page publique.
#
# Chaque vignette est rognée à la même fenêtre, le haut de l'écran, pour
# que les quatre tiennent dans une grille régulière. Le rognage se fait
# en CSS, sans toucher aux fichiers d'origine.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/langue.sh"
mkdir -p "$D/html$SUF" "$D/flow$SUF"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
B="$(cd "$D" && pwd -W 2>/dev/null || pwd)"

# La fenêtre retenue sur chaque capture, en pixels de l'appareil.
HAUT=1560
LARGE=1080

if [ "$LG" = en ]; then
  T1="The map"; S1="Cities, clustered, France drawn from the app"
  T2="The calendar"; S2="A month in seven columns, three signs a day"
  T3="The legend"; S3="What each sign means, and what triggers it"
  T4="Settings"; S4="The lock, the data, nothing else"
  NOTE="The app is French only, so are the screens."
else
  T1="La carte"; S1="Les villes regroupées, la France tracée par l'application"
  T2="Le calendrier"; S2="Un mois sur sept colonnes, trois signes par jour"
  T3="La légende"; S3="Ce que dit chaque signe, et ce qui le déclenche"
  T4="Les réglages"; S4="Le verrou, les données, rien d'autre"
  NOTE="Captures prises sur un appareil virtuel, avec le jeu d'essai."
fi

vignette () {
cat <<HTML
  <figure>
    <div class="ecran"><img src="file:///$B/src-captures/$1.png" alt="$2"></div>
    <figcaption><b>$2</b><span>$3</span></figcaption>
  </figure>
HTML
}

cat > "$D/html$SUF/bc-captures.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;background:#0D1117}
.w{width:1280px;padding:52px 60px 46px;background:#0D1117}
.g{display:grid;grid-template-columns:1fr 1fr;gap:34px 40px}
figure{display:flex;flex-direction:column;gap:14px}
/* La vignette : une fenêtre fixe, l'image calée en haut, donc rognée
   par le bas sans déformation. */
.ecran{width:100%;aspect-ratio:$LARGE / $HAUT;overflow:hidden;border-radius:14px;
       border:1px solid #232B36;background:#0A0510}
.ecran img{width:100%;display:block}
figcaption{display:flex;flex-direction:column;gap:5px;padding-left:2px}
figcaption b{font-family:Syne,sans-serif;font-weight:800;font-size:19px;letter-spacing:1.5px;
             text-transform:uppercase;color:#F0F4F8}
figcaption span{font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.5;color:#8A93A0}
.note{margin-top:34px;padding-top:20px;border-top:1px solid #1B222B;
      font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#6B7583;letter-spacing:.3px}
</style></head><body>
<div class="w">
  <div class="g">
$(vignette carte "$T1" "$S1")
$(vignette calendrier "$T2" "$S2")
$(vignette legende "$T3" "$S3")
$(vignette reglages "$T4" "$S4")
  </div>
  <p class="note">$NOTE</p>
</div></body></html>
HTML

"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=12000 \
  --force-device-scale-factor=2 --window-size=1280,1975 \
  --screenshot="$D/flow$SUF/bc-captures.png" \
  "file:///$B/html$SUF/bc-captures.html" >/dev/null 2>&1
echo "  bc-captures.png"
