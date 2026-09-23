#!/bin/bash
# L'image d'aperçu du dépôt, celle que GitHub montre quand le lien est
# partagé : 1280 x 640, la taille que GitHub recommande. Elle reprend la
# bannière, le logo à gauche et le nom, avec deux écrans de l'application
# à droite. En français seulement : GitHub n'en accepte qu'une.
#
# À déposer à la main dans Settings > General > Social preview : GitHub
# ne la lit pas depuis le dépôt.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
B="$(cd "$D" && pwd -W 2>/dev/null || pwd)"
mkdir -p "$D/html"

cat > "$D/html/social.html" <<HTML
<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:640px;overflow:hidden;background:#0A0410}
.w{position:relative;width:1280px;height:640px;overflow:hidden;
   background:radial-gradient(circle at 12% 30%,#2B1250 0,transparent 42%),
              radial-gradient(circle at 88% 90%,#3A1260 0,transparent 45%),#0A0410}
.w::after{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;
          background:linear-gradient(90deg,#E879F9,#7C3AED)}
.g{position:absolute;left:84px;top:0;bottom:0;width:560px;display:flex;flex-direction:column;justify-content:center}
.logo{width:132px;height:132px;border-radius:34px;overflow:hidden;
      box-shadow:0 0 70px 6px rgba(168,85,247,.45)}
.logo img{width:118%;height:118%;margin:-9%;display:block}
h1{margin-top:38px;font-family:Syne,sans-serif;font-weight:800;font-size:64px;line-height:1;
   letter-spacing:-1px;color:#F0F4F8}
h1 em{font-style:normal;color:#E879F9}
p{margin-top:22px;font-family:'Space Grotesk',sans-serif;font-size:25px;line-height:1.45;color:#A7B0BD}
.c{margin-top:30px;display:flex;gap:12px}
.c span{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:15px;letter-spacing:1.5px;
        color:#E879F9;padding:10px 16px;border-radius:9px;border:1.5px solid #4A2466;background:#1A0B26}
.e{position:absolute;top:70px;width:220px;border-radius:26px;overflow:hidden;
   border:1.5px solid #3A2A55;box-shadow:0 40px 80px -20px rgba(0,0,0,.8),0 0 60px -10px rgba(168,85,247,.35)}
.e img{width:100%;display:block}
.e1{left:770px;transform:rotate(-6deg);top:92px}
.e2{left:1010px;transform:rotate(5deg);top:58px}
</style></head><body><div class="w">
  <div class="g">
    <div class="logo"><img src="file:///$B/src-icone.png"></div>
    <h1>Body<em>Count</em></h1>
    <p>Photos, notes, lieux et rencontres,<br>chiffrés sur le téléphone. Rien ne sort.</p>
    <div class="c"><span>FLUTTER</span><span>SQLCIPHER</span><span>HORS LIGNE</span></div>
  </div>
  <div class="e e1"><img src="file:///$B/src-captures/passeport/fiche.jpg"></div>
  <div class="e e2"><img src="file:///$B/src-captures/passeport/carte.jpg"></div>
</div></body></html>
HTML

"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=15000 \
  --window-size=1280,640 --screenshot="$B/../social-preview.png" \
  "file:///$B/html/social.html" >/dev/null 2>&1
echo "  social-preview.png"
