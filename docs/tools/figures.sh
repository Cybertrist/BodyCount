#!/bin/bash
# Toutes les figures du README : la bannière, les cinq bandeaux de section,
# trois grilles, l'arborescence, le modèle de confidentialité et la palette.
#
# Les deux dernières ne passent pas par un gabarit : elles ont leur propre
# HTML, en bas de ce fichier.
#
# Chaque texte porte ses deux langues, t <français> <anglais>. L'anglais
# n'est pas un calque : une tournure qui claque en français tombe à plat
# traduite mot à mot, alors elle est réécrite.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/cartes.sh"   >/dev/null 2>&1
source "$D/bandeaux.sh" >/dev/null 2>&1
source "$D/grille.sh"   >/dev/null 2>&1
source "$D/arbre.sh"    >/dev/null 2>&1
mkdir -p "$D/flow$SUF"

A="#E879F9"

# ----------------------------------------------------------- la bannière
ban bodycount "$A" "#7C3AED" "#0A0410" \
"<div class='crop'><img src='$ICONE'></div>" \
'Body<em>Count</em>' \
"$(t 'Journal personnel chiffré, hors ligne, sur Android.' 'An encrypted personal journal, offline, on Android.')" \
"$(t 'Aucun serveur, aucun compte, aucune télémétrie.' 'No server, no account, no telemetry.')" \
"$(P 'FLUTTER' 'SQLITE' "$(t 'BIOMÉTRIE' 'BIOMETRICS')")" \
'MOBILE' ""

# ------------------------------------------------ les bandeaux de section
rep bodycount "$A" \
"$(t 'Fonctionnalités' 'Features')" \
"$(t 'Stack' 'Stack')" \
"$(t 'Modèle de confidentialité' 'Privacy model')" \
"$(t 'Feuille de route' 'Roadmap')" \
"$(t 'Avertissement' 'A word of warning')"

# ------------------------------------------------------ les fonctionnalités
grid bc-feat "$A" 2 \
"$(t 'Verrouillage biométrique' 'Biometric lock')|$(t "Empreinte ou reconnaissance faciale exigée à l'ouverture de l'application." 'Fingerprint or face recognition required to open the app.')" \
"$(t 'Répertoire de contacts' 'Contact directory')|$(t 'Photos, notes, étiquettes et évaluations, rangées localement.' 'Photos, notes, tags and ratings, all stored locally.')" \
"$(t 'Statistiques' 'Statistics')|$(t 'Graphiques mensuels, répartitions, séries et classements.' 'Monthly charts, breakdowns, streaks and rankings.')" \
"$(t 'Carte des rencontres' 'Map of encounters')|$(t 'Sur fond OpenStreetMap, rendu par <code>flutter_map</code>.' 'On an OpenStreetMap background, rendered by <code>flutter_map</code>.')" \
"$(t 'Frise chronologique' 'Timeline')|$(t "L'ensemble des entrées sur un seul axe de temps." 'Every entry on a single time axis.')" \
"$(t 'Galerie privée' 'Private gallery')|$(t "Les photos vivent dans le stockage applicatif, invisibles de la galerie du téléphone." 'The photos live in app storage, invisible to the phone gallery.')" \
"$(t 'Export et import' 'Export and import')|$(t 'En JSON ou en ZIP, pour garder la main sur ses données.' 'As JSON or ZIP, to keep a hold on your own data.')" \
"$(t 'Aucun serveur' 'No server')|$(t 'Pas de compte, pas de télémétrie, pas une seule requête réseau.' 'No account, no telemetry, not a single network request.')"

# ------------------------------------------------------------- la stack
grid bc-stack "$A" 3 \
"Flutter 3.x|$(t "Le framework, en Dart, pour une application Android native." 'The framework, in Dart, for a native Android app.')" \
"sqflite|$(t 'SQLite local, la seule base du projet.' 'Local SQLite, the only database in the project.')" \
"Riverpod|$(t "La gestion d'état." 'State management.')" \
"GoRouter|$(t 'La navigation entre écrans.' 'Navigation between screens.')" \
"fl_chart|$(t 'Les graphiques des statistiques.' 'The statistics charts.')" \
"flutter_map|$(t 'La carte, sur fond OpenStreetMap.' 'The map, on an OpenStreetMap background.')" \
"local_auth|$(t "L'authentification biométrique." 'Biometric authentication.')" \
"Material 3|$(t 'Le design, en thème sombre.' 'The design, in dark theme.')" \
"Poppins &amp; Inter|$(t 'Les titres et le corps de texte.' 'Headings and body text.')"

# -------------------------------------------------------- la feuille de route
grid bc-route "$A" 2 \
"$(t 'Chiffrement de la base' 'Database encryption')|$(t "SQLCipher, clé dérivée du Keystore Android, déverrouillage lié à la biométrie. C'est la pièce qui manque le plus." 'SQLCipher, key derived from the Android Keystore, unlocking tied to biometrics. This is the piece that is missed most.')" \
"$(t 'Chiffrement des photos' 'Photo encryption')|$(t 'Au repos, et pas seulement leur isolation dans le stockage applicatif.' 'At rest, and not merely their isolation inside app storage.')" \
"$(t 'Sauvegarde Android désactivée' 'Android backup disabled')|$(t "<code>allowBackup=\"false\"</code>, qui peut aujourd'hui emporter la base hors de l'appareil." '<code>allowBackup=\"false\"</code>, which today can carry the database off the device.')" \
"$(t 'Export chiffré' 'Encrypted export')|$(t 'Protégé par mot de passe, plutôt que du JSON en clair.' 'Password protected, rather than plain JSON.')" \
"$(t 'Écrans à finir' 'Screens to finish')|$(t 'Les statistiques et la vue carte ne sont pas terminées.' 'The statistics and the map view are not done.')" \
"Tests|$(t "Sur les DAO et la logique d'export." 'On the DAOs and the export logic.')"

# ---------------------------------------------------------- l'arborescence
treefig bodycount "$A" "lib/" \
"1|main.dart|$(t "Le point d'entrée." 'The entry point.')" \
"1|app.dart|$(t "L'application et son thème." 'The app and its theme.')" \
"1|config/|$(t 'Thème et routage.' 'Theme and routing.')" \
"1|models/|<code>Contact</code>, <code>Encounter</code>, <code>Photo</code>." \
"1|database/|$(t 'Les DAO SQLite.' 'The SQLite DAOs.')" \
"1|providers/|$(t "L'état, en Riverpod." 'State, in Riverpod.')" \
"1|screens/|$(t 'Les écrans.' 'The screens.')" \
"1|widgets/|$(t 'Les composants réutilisables.' 'The reusable components.')" \
"1|utils/|$(t 'Images, export, dates.' 'Images, export, dates.')"

# ----------------------------- le modèle de confidentialité, en deux colonnes
V1="$(t 'Aucune requête réseau, aucun compte, aucune analytique.' 'No network request, no account, no analytics.')"
V2="$(t "La base SQLite et les photos restent dans le répertoire privé de l'application." 'The SQLite database and the photos stay in the app private directory.')"
V3="$(t 'Les photos ne sont pas indexées par le <code>MediaStore</code>, donc absentes de la galerie.' 'The photos are not indexed by the <code>MediaStore</code>, so they never show in the gallery.')"
V4="$(t "L'ouverture exige une authentification biométrique." 'Opening the app requires biometric authentication.')"
F1="$(t 'Sur un téléphone rooté, le répertoire privé est lisible. La biométrie verrouille l&#39;interface, elle ne chiffre pas la base.' 'On a rooted phone, the private directory is readable. Biometrics lock the interface, they do not encrypt the database.')"
F2="$(t "Une sauvegarde Android automatique peut emporter les données hors de l'appareil si elle n'est pas désactivée." 'An automatic Android backup can carry the data off the device if it is not disabled.')"
F3="$(t "Un export JSON ou ZIP part en clair. C'est à vous de le ranger correctement." 'A JSON or ZIP export leaves in the clear. Storing it properly is on you.')"
F4="$(t "Le chiffrement réel de la base, par SQLCipher et le Keystore, n'est pas encore en place." 'Real database encryption, through SQLCipher and the Keystore, is not in place yet.')"
TV="$(t 'Ce qui est <span>vrai</span>' 'What is <span>true</span>')"
TF="$(t "Ce qui ne l'est <span>pas</span>" 'What is <span>not</span>')"
OK='<i><svg viewBox="0 0 16 16" fill="none"><path d="M3 8.3l3.4 3.4L13 5" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>'
KO='<i><svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#E2725F" stroke-width="2" stroke-linecap="round"/></svg></i>'

cat > "$D/html$SUF/s-bc-privacy.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:340px;overflow:hidden;background:#0D1117}
.w{width:1280px;height:340px;background:#0D1117;display:flex;gap:30px;padding:26px 56px}
.p{flex:1;background:#131A24;border:1px solid #1F2833;border-radius:13px;padding:20px 24px;
   display:flex;flex-direction:column;gap:11px;position:relative;overflow:hidden}
.p::after{content:"";position:absolute;left:0;top:20px;bottom:20px;width:3px;border-radius:0 3px 3px 0}
.ok::after{background:#4ADE80}.ko::after{background:#E2725F}
h3{font-family:Syne,sans-serif;font-weight:800;font-size:18px;color:#F0F4F8;margin-bottom:3px}
.ok h3 span{color:#4ADE80}.ko h3 span{color:#E2725F}
.l{display:flex;align-items:flex-start;gap:11px}
.l i{width:16px;height:16px;flex-shrink:0;margin-top:3px}
.l p{font-family:'Space Grotesk',sans-serif;font-size:13.5px;line-height:1.45;color:#96A3B2}
code{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#C3CCD7}
</style></head><body><div class="w">

<div class="p ok">
  <h3>$TV</h3>
  <div class="l">$OK<p>$V1</p></div>
  <div class="l">$OK<p>$V2</p></div>
  <div class="l">$OK<p>$V3</p></div>
  <div class="l">$OK<p>$V4</p></div>
</div>

<div class="p ko">
  <h3>$TF</h3>
  <div class="l">$KO<p>$F1</p></div>
  <div class="l">$KO<p>$F2</p></div>
  <div class="l">$KO<p>$F3</p></div>
  <div class="l">$KO<p>$F4</p></div>
</div>

</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=11000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-privacy.png" --window-size=1280,340 "file:///$B/html$SUF/s-bc-privacy.html" >/dev/null 2>&1
echo "  bc-privacy.png"

# --------------------------------------------------------------- la palette
P1="$(t 'Primaire' 'Primary')"; P2="$(t 'Accent' 'Accent')"; P3="$(t 'Fond' 'Background')"
P4="$(t 'Surface' 'Surface')";  P5="$(t 'Cartes' 'Cards')";  P6="$(t 'Texte' 'Text')"

cat > "$D/html$SUF/s-bc-palette.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:190px;overflow:hidden;background:#0D1117}
.w{width:1280px;height:190px;background:#0D1117;display:flex;gap:14px;padding:26px 56px}
.s{flex:1;background:#131A24;border:1px solid #1F2833;border-radius:11px;overflow:hidden;
   display:flex;flex-direction:column}
.sw{height:56px}
.tx{padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.n{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;color:#E6EDF5}
.h{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#6E7B8A;letter-spacing:.6px}
</style></head><body><div class="w">
  <div class="s"><div class="sw" style="background:#FF6B35"></div><div class="tx"><span class="n">$P1</span><span class="h">#FF6B35</span></div></div>
  <div class="s"><div class="sw" style="background:#E84530"></div><div class="tx"><span class="n">$P2</span><span class="h">#E84530</span></div></div>
  <div class="s"><div class="sw" style="background:#0A0A0A"></div><div class="tx"><span class="n">$P3</span><span class="h">#0A0A0A</span></div></div>
  <div class="s"><div class="sw" style="background:#141414"></div><div class="tx"><span class="n">$P4</span><span class="h">#141414</span></div></div>
  <div class="s"><div class="sw" style="background:#1C1C1C"></div><div class="tx"><span class="n">$P5</span><span class="h">#1C1C1C</span></div></div>
  <div class="s"><div class="sw" style="background:#F5F5F5"></div><div class="tx"><span class="n">$P6</span><span class="h">#F5F5F5</span></div></div>
</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-palette.png" --window-size=1280,190 "file:///$B/html$SUF/s-bc-palette.html" >/dev/null 2>&1
echo "  bc-palette.png"
