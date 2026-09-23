#!/bin/bash
# Le bouton de téléchargement de la section « Installer ».
#
# Une image et non un vrai bouton : GitHub retire le CSS des README. Elle
# est posée dans un lien vers le dernier APK des Releases, dont l'adresse
# ne change jamais d'une version à l'autre. Seul le texte du bouton suit
# la version, lue dans pubspec.yaml, et la taille, lue sur l'APK s'il a
# été construit.
#
# Le bouton est opaque et seuls ses coins arrondis sont transparents :
# GitHub rend les README sur blanc comme sur noir.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/langue.sh"
mkdir -p "$D/html$SUF" "$D/png$SUF"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
B="$(cd "$D" && pwd -W 2>/dev/null || pwd)"
R="$D/../.."

VERSION="$(grep -m1 '^version:' "$R/pubspec.yaml" | sed 's/version: *//; s/+.*//')"
APK="$R/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk"
TAILLE=""
if [ -f "$APK" ]; then
  MO=$(( ($(wc -c < "$APK") + 524288) / 1048576 ))
  TAILLE=" · $MO $(t 'Mo' 'MB')"
fi

W=720; H=132
cat > "$D/html$SUF/telecharger.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:transparent}
.w{width:${W}px;height:${H}px;display:flex;align-items:center;gap:22px;padding:0 30px 0 22px;
   border-radius:18px;border:1.5px solid #3B2152;
   background:linear-gradient(100deg,#1A0F26 0%,#120B1C 55%,#0F0A17 100%)}
.i{width:84px;height:84px;border-radius:22px;overflow:hidden;flex-shrink:0;
   box-shadow:0 10px 28px -8px rgba(217,70,239,.55)}
.i img{width:100%;height:100%;object-fit:cover}
.t{flex:1;display:flex;flex-direction:column;gap:9px}
.t b{font-family:Syne,sans-serif;font-weight:800;font-size:25px;letter-spacing:.6px;color:#F0F4F8;
     white-space:nowrap}
.t span{font-family:'JetBrains Mono',monospace;font-size:14px;color:#9AA5B1;letter-spacing:.3px}
.f{width:58px;height:58px;border-radius:16px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
   background:linear-gradient(135deg,#A855F7,#D946EF)}
</style></head><body><div class="w">
  <div class="i"><img src="file:///$B/src-icone.png"></div>
  <div class="t">
    <b>$(t 'Télécharger BodyCount' 'Download BodyCount')</b>
    <span>v$VERSION · Android 7+ · arm64$TAILLE</span>
  </div>
  <div class="f"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#12071F"
       stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 4v12"/><path d="M6 11l6 6 6-6"/><path d="M5 21h14"/></svg></div>
</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 \
  --force-device-scale-factor=2 --default-background-color=00000000 --window-size=$W,$H \
  --screenshot="$B/png$SUF/telecharger.png" "file:///$B/html$SUF/telecharger.html" >/dev/null 2>&1
echo "  telecharger.png  v$VERSION$TAILLE"
