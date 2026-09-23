#!/bin/bash
# Les planches de captures d'écran des READMEs, une par format.
#
# Les images sources sont dans src-captures/<format>/, déjà rognées de la
# barre d'état et de la barre de navigation par rogner.js, réduites et en
# JPEG. Le format passeport, l'écran de couverture du Fold, est celui de
# tous les jours : il porte la planche complète. Le téléphone en 16/9, la
# tablette en 4/3 et la même tablette couchée ne montrent que ce qui
# change d'un format à l'autre.
#
# Les visages sont ceux du jeu d'essai : des portraits générés, personne
# de réel.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/langue.sh"
mkdir -p "$D/html$SUF" "$D/flow$SUF"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
B="$(cd "$D" && pwd -W 2>/dev/null || pwd)"

# Une vignette : l'écran entier, un titre, une ligne.
vig () {
cat <<HTML
  <figure>
    <div class="ecran"><img src="file:///$B/src-captures/$1.jpg"></div>
    <figcaption><b>$2</b><span>$3</span></figcaption>
  </figure>
HTML
}

# planche <nom> <colonnes> <largeur de page> <titre> <note> <vignettes...>
planche () {
local nom="$1" cols="$2" titre="$3" note="$4"; shift 4
cat > "$D/html$SUF/$nom.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;background:#0D1117}
.w{width:1280px;padding:40px 56px 38px;background:#0D1117}
.t{display:flex;align-items:baseline;gap:14px;margin-bottom:26px}
.t b{font-family:Syne,sans-serif;font-weight:800;font-size:15px;letter-spacing:3px;
     text-transform:uppercase;color:#E879F9}
.t span{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#6B7583}
.g{display:grid;grid-template-columns:repeat($cols,1fr);gap:30px 24px}
figure{display:flex;flex-direction:column;gap:12px}
.ecran{border-radius:16px;overflow:hidden;border:1px solid #232B36;background:#0A0510;
       box-shadow:0 18px 40px -22px rgba(168,85,247,.45)}
.ecran img{width:100%;display:block}
figcaption{display:flex;flex-direction:column;gap:4px;padding-left:2px}
figcaption b{font-family:Syne,sans-serif;font-weight:800;font-size:15px;letter-spacing:1.2px;
             text-transform:uppercase;color:#F0F4F8}
figcaption span{font-family:'Space Grotesk',sans-serif;font-size:13px;line-height:1.45;color:#8A93A0}
</style></head><body>
<div class="w">
  <div class="t"><b>$titre</b><span>$note</span></div>
  <div class="g">
$(for v in "$@"; do IFS='|' read -r f ti tx <<< "$v"; vig "$f" "$ti" "$tx"; done)
  </div>
</div>
<script>window.addEventListener("load",()=>document.fonts.ready.then(()=>{
  document.title="H"+Math.ceil(document.querySelector(".w").getBoundingClientRect().height);}));
</script></body></html>
HTML
local H
H="$("$CH" --headless=new --disable-gpu --virtual-time-budget=30000 --dump-dom \
      "file:///$B/html$SUF/$nom.html" 2>/dev/null | grep -o '<title>H[0-9]*' | grep -o '[0-9]*' | head -1)"
[ -z "$H" ] && { echo "  ECHEC mesure : $nom" >&2; return 1; }
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=30000 \
  --force-device-scale-factor=2 --window-size=1280,$H \
  --screenshot="$B/flow$SUF/$nom.png" "file:///$B/html$SUF/$nom.html" >/dev/null 2>&1
echo "  $nom.png  ${H}px"
}

planche bc-passeport 4 \
  "$(t 'Format passeport' 'Passport format')" \
  "$(t "l'écran de couverture du Fold, 460 × 727 points" 'the Fold cover screen, 460 × 727 points')" \
  "passeport/lancement-1|$(t 'Lancement' 'Launch')|$(t "L'icône d'Android, sur le fond de l'application." "Android's icon, on the app's background.")" \
  "passeport/lancement-2|$(t 'Chargement' 'Loading')|$(t "L'anneau se trace, le nom monte, les communes se lisent." 'The ring draws, the name rises, the communes load.')" \
  "passeport/verrou|$(t 'Verrou' 'Lock')|$(t "Le logo a glissé à sa place. L'empreinte charge la clé." 'The logo slid into place. The fingerprint loads the key.')" \
  "passeport/repertoire|$(t 'Répertoire' 'Directory')|$(t 'Trois colonnes, les tris, les villes et les étiquettes.' 'Three columns, sortings, cities and tags.')" \
  "passeport/fiche|$(t 'Fiche' 'Person')|$(t 'La photo se touche pour s&#39;ouvrir en grand.' 'Tap the photo to open it full size.')" \
  "passeport/fiche-galerie|$(t 'Carnet et galerie' 'Notebook and gallery')|$(t 'Les notes datées, les photos et les vidéos.' 'Dated notes, photos and videos.')" \
  "passeport/visionneuse|$(t 'Visionneuse' 'Viewer')|$(t 'La vidéo déchiffrée le temps de la lecture, et le téléchargement.' 'The video decrypted while it plays, and the download.')" \
  "passeport/point|$(t 'Point précis' 'Exact point')|$(t 'Les communes voisines comme repères, sans aucune tuile.' 'Nearby communes as landmarks, without a single tile.')" \
  "passeport/stats|$(t 'Statistiques' 'Statistics')|$(t 'Le total, l&#39;écart avec l&#39;an passé, le podium.' 'The total, the gap with last year, the podium.')" \
  "passeport/carte|$(t 'Carte' 'Map')|$(t 'La France embarquée, les villes à leur place.' 'France embedded, cities in their place.')" \
  "passeport/agenda|$(t 'Calendrier' 'Calendar')|$(t 'Un mois sur sept colonnes, trois signes par jour.' 'A month in seven columns, three signs a day.')" \
  "passeport/reglages|$(t 'Réglages' 'Settings')|$(t 'Le verrou, la sauvegarde et sa date, la restauration.' 'The lock, the backup and its date, restore.')"

planche bc-telephone 4 \
  "$(t 'Téléphone, 16/9' 'Phone, 16:9')" \
  "$(t '390 points de large : deux colonnes, les en-têtes sur deux lignes' '390 points wide: two columns, headers on two lines')" \
  "169/verrou|$(t 'Verrou' 'Lock')|$(t 'Plus de hauteur, plus d&#39;air.' 'More height, more air.')" \
  "169/repertoire|$(t 'Répertoire' 'Directory')|$(t 'Deux colonnes, la recherche sous le titre.' 'Two columns, search below the title.')" \
  "169/fiche|$(t 'Fiche' 'Person')|$(t 'Les pastilles passent à la ligne.' 'The chips wrap.')" \
  "169/carte|$(t 'Carte' 'Map')|$(t 'La même carte, plus étroite.' 'The same map, narrower.')"

planche bc-tablette 3 \
  "$(t 'Grand écran, 4/3' 'Large screen, 4:3')" \
  "$(t "l'écran déplié, 900 × 1200 points : le rail à gauche" 'the unfolded screen, 900 × 1200 points: the rail on the left')" \
  "43/repertoire|$(t 'Répertoire' 'Directory')|$(t 'Quatre colonnes, tous les filtres sur une ligne.' 'Four columns, every filter on one line.')" \
  "43/carte|$(t 'Carte' 'Map')|$(t 'La carte, le classement et les visages vus à Vannes.' 'The map, the ranking and the faces seen in Vannes.')" \
  "43/fiche|$(t 'Fiche' 'Person')|$(t 'La photo prend la largeur.' 'The photo takes the width.')"

planche bc-paysage 2 \
  "$(t 'Grand écran couché, 4/3' 'Large screen on its side, 4:3')" \
  "$(t "l'écran déplié tenu à l'horizontale, 1200 × 900 points" 'the unfolded screen held sideways, 1200 × 900 points')" \
  "34/repertoire|$(t 'Répertoire' 'Directory')|$(t 'Le rail à gauche, quatre colonnes de cartes plus grandes.' 'The rail on the left, four columns of larger cards.')" \
  "34/fiche|$(t 'Fiche' 'Person')|$(t 'Deux volets : la photo sur toute la hauteur, la fiche qui défile à côté.' 'Two panes: the photo full height, the page scrolling beside it.')" \
  "34/stats|$(t 'Statistiques' 'Statistics')|$(t 'Le podium garde sa taille de podium au milieu de la largeur.' 'The podium keeps a podium size in the middle of the width.')" \
  "34/carte|$(t 'Carte' 'Map')|$(t 'La Bretagne entière d&#39;un coup d&#39;œil, le classement dessous.' 'All of Brittany at a glance, the ranking below.')"
