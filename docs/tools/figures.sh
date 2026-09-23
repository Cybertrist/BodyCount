#!/bin/bash
# Toutes les figures des deux READMEs.
#
# C'est le seul fichier à ouvrir pour changer un texte. Les gabarits
# vivent à côté : cartes.sh pour la bannière, bandeaux.sh pour les titres
# de section, grille.sh pour les grilles, arbre.sh pour l'arborescence,
# sequence.sh pour les enchaînements. Les figures qui n'entrent dans
# aucun gabarit ont leur propre HTML, en bas de ce fichier.
#
# Chaque texte porte ses deux langues, t <français> <anglais>. L'anglais
# n'est pas un calque : une tournure qui claque en français tombe à plat
# traduite mot à mot, alors elle est réécrite.
D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$D/cartes.sh"   >/dev/null 2>&1
source "$D/bandeaux.sh" >/dev/null 2>&1
source "$D/grille.sh"   >/dev/null 2>&1
source "$D/arbre.sh"    >/dev/null 2>&1
source "$D/sequence.sh" >/dev/null 2>&1
mkdir -p "$D/flow$SUF"

A="#E879F9"

# ----------------------------------------------------------- la bannière
ban bodycount "$A" "#7C3AED" "#0A0410" \
"<div class='crop'><img src='$ICONE'></div>" \
'Body<em>Count</em>' \
"$(t 'Journal personnel chiffré, hors ligne, sur Android.' 'An encrypted personal journal, offline, on Android.')" \
"$(t 'Aucun serveur, aucun compte, aucune télémétrie.' 'No server, no account, no telemetry.')" \
"$(P 'FLUTTER' 'SQLCIPHER' "$(t 'BIOMÉTRIE' 'BIOMETRICS')")" \
'MOBILE' ""

# ------------------------------------------------ les bandeaux de section
rep bodycount "$A" \
"$(t 'Fonctionnalités' 'Features')" \
"$(t 'Les écrans' 'The screens')" \
"$(t 'Installer' 'Install')" \
"$(t 'La stack' 'The stack')" \
"$(t 'Architecture' 'Architecture')" \
"$(t 'Le chiffrement' 'Encryption')" \
"$(t 'Vidéos et sauvegardes' 'Videos and backups')" \
"$(t 'La carte, sans tuiles' 'The map, without tiles')" \
"$(t 'Le calendrier' 'The calendar')" \
"$(t 'Modèle de confidentialité' 'Privacy model')" \
"$(t 'Les tests' 'The tests')" \
"$(t 'Sans Internet' 'No Internet')" \
"$(t 'Avertissement' 'A word of warning')" \
"$(t 'Licence et auteur' 'Licence and author')"

# ------------------------------------------------------ les fonctionnalités
grid bc-feat "$A" 2 \
"$(t 'Verrouillage biométrique' 'Biometric lock')|$(t "L'empreinte ne déverrouille pas un écran, elle charge la clé. Sans elle, la base reste illisible." 'The fingerprint does not unlock a screen, it loads the key. Without it, the database stays unreadable.')" \
"$(t 'Répertoire' 'Directory')|$(t 'Photos, carnet de notes daté, étiquettes libres, genre et rôle, notes sur cinq.' 'Photos, a dated notebook, free tags, gender and role, ratings out of five.')" \
"$(t 'Statistiques' 'Statistics')|$(t "Le total de l'année, le rythme mois par mois, le podium et la répartition des rôles." 'The year total, the month by month rhythm, the podium and the split by role.')" \
"$(t 'Carte de France' 'Map of France')|$(t 'La vraie géométrie du pays et ses 34 836 communes, embarquées dans l&#39;application. Même mal orthographié, un village tombe à sa place.' 'The real geometry of the country and its 34,836 communes, embedded in the app. Even misspelt, a village lands in its place.')" \
"$(t 'Calendrier' 'Calendar')|$(t 'Le mois en sept colonnes, et sous chaque jour des signes qui disent ce qu&#39;il a eu de remarquable.' 'The month in seven columns, with signs under each day telling what it had of note.')" \
"$(t 'Galerie privée' 'Private gallery')|$(t 'Photos et vidéos, chacune chiffrée à part, invisibles de la galerie du téléphone. Elles s&#39;ouvrent en plein écran, se pincent, se lisent.' 'Photos and videos, each encrypted on its own, invisible to the phone gallery. They open full screen, pinch, play.')" \
"$(t 'Sauvegarde complète' 'Full backup')|$(t 'Fiches, photos et vidéos dans un fichier protégé par ta phrase de passe, qui se restaure sans rien risquer : tout est vérifié avant d&#39;effacer.' 'People, photos and videos in one file protected by your passphrase, restored at no risk: everything is checked before anything is erased.')" \
"$(t 'Ce que ça rapporte' 'What it earns')|$(t 'Un montant par rencontre, en centimes entiers, avec le total et la moyenne de l&#39;année.' 'An amount per encounter, in whole cents, with the year total and average.')" \
"$(t 'Tout se reprend' 'Everything is editable')|$(t 'Fiche, rencontre, note, étiquette, photo : rien de ce qui est saisi n&#39;est définitif.' 'Person, encounter, note, tag, photo: nothing you enter is final.')" \
"$(t 'Adresse et itinéraire' 'Address and directions')|$(t 'Le seul geste qui sorte du téléphone, et seulement quand on appuie dessus.' 'The only gesture that leaves the phone, and only when you press it.')" \
"$(t 'Trois formats d écran' 'Three screen formats')|$(t 'Téléphone, écran de couverture et écran déplié : la mise en page suit, elle n&#39;est pas étirée.' 'Phone, cover screen and unfolded screen: the layout follows, it is not stretched.')"

# --------------------------------------------------------------- les écrans
grid bc-ecrans "$A" 2 \
"$(t 'Verrou' 'Lock')|$(t "Le premier écran, et le seul tant que la clé n&#39;est pas chargée. Il dit pourquoi l&#39;empreinte est demandée, et ce qui se passe si le téléphone n&#39;en a aucune d&#39;enregistrée." 'The first screen, and the only one until the key is loaded. It says why the fingerprint is asked for, and what happens if the phone has none enrolled.')" \
"$(t 'Fiches' 'Directory')|$(t 'La grille des personnes. Recherche sur le nom, la ville et les étiquettes, quatre tris, filtres par ville et par étiquette. Chaque carte porte la photo, le nombre de fois et la moyenne.' 'The grid of people. Search on name, city and tags, four sortings, filters by city and by tag. Each card carries the photo, the number of times and the average.')" \
"$(t 'Fiche' 'Person')|$(t 'La photo en haut, qui se replie au défilement et s&#39;ouvre en grand au toucher. Dessous : étiquettes, carnet daté, liste des soirs, galerie. Chaque ligne se rouvre pour être corrigée ou effacée.' 'The photo on top, folding away as you scroll and opening full size on a tap. Below: tags, dated notebook, list of nights, gallery. Every row reopens to be fixed or deleted.')" \
"$(t 'Visionneuse' 'Viewer')|$(t 'Photos et vidéos en plein écran. On glisse de l&#39;une à l&#39;autre, on pince ou on touche deux fois pour zoomer, une vidéo se met en pause au toucher.' 'Photos and videos full screen. Swipe from one to the next, pinch or double tap to zoom, tap a video to pause it.')" \
"$(t 'Stats' 'Stats')|$(t "Le total de l&#39;année et son écart avec la précédente, ce que ça a rapporté, le rythme en douze barres, le podium, et la répartition actif, passif, versatile en anneau." 'The year total and its gap with the previous one, what it earned, the rhythm in twelve bars, the podium, and the active, passive, versatile split as a ring.')" \
"$(t 'Carte' 'Map')|$(t 'La France dessinée à partir de sa vraie géométrie, les villes à leur place, et le classement des lieux. Se pince pour zoomer, se traîne pour se déplacer.' 'France drawn from its real geometry, cities in their true place, and the ranking of places. Pinch to zoom, drag to pan.')" \
"$(t 'Agenda' 'Calendar')|$(t 'Un calendrier mensuel : un jour vide est un chiffre effacé, un jour plein porte un disque, doré s&#39;il a rapporté. On tape sur un jour pour n&#39;avoir que lui.' 'A monthly calendar: an empty day is a dimmed number, a busy one carries a disc, golden if it earned. Tap a day to see only that day.')" \
"$(t 'Légende' 'Legend')|$(t 'Ce que déclenche chacun des vingt-cinq signes du calendrier, dit précisément : pas « une bonne soirée » mais « une note de cinq sur cinq ».' 'What triggers each of the twenty-five calendar signs, stated precisely: not « a good night » but « a five out of five rating ».')" \
"$(t 'Formulaires' 'Forms')|$(t 'Créer ou reprendre une fiche, enregistrer une rencontre, écrire une note, gérer les étiquettes, les photos et les vidéos. Chaque écrit passe par un dépôt, jamais par du SQL dispersé.' 'Create or edit a person, record an encounter, write a note, manage tags, photos and videos. Every write goes through a repository, never through scattered SQL.')" \
"$(t 'Réglages' 'Settings')|$(t 'L&#39;empreinte qu&#39;on peut couper, le délai de verrouillage, le masquage dans le multitâche, l&#39;export et la restauration, un jeu d&#39;essai, et l&#39;effacement total.' 'The fingerprint you can switch off, the auto-lock delay, hiding in the task switcher, export and restore, a demo set, and the full wipe.')"

# ----------------------------------------------------------------- la stack
grid bc-stack "$A" 3 \
"Flutter 3.x|$(t "Le framework, en Dart, pour une application Android native." 'The framework, in Dart, for a native Android app.')" \
"sqflite_sqlcipher|$(t 'SQLite chiffré par SQLCipher, la seule base du projet.' 'SQLite encrypted by SQLCipher, the only database in the project.')" \
"cryptography|$(t 'AES-GCM pour les photos, HKDF et PBKDF2 pour les clés.' 'AES-GCM for photos, HKDF and PBKDF2 for the keys.')" \
"javax.crypto|$(t 'AES-GCM natif pour les vidéos et les sauvegardes, par deux appels Kotlin.' 'Native AES-GCM for videos and backups, through two Kotlin calls.')" \
"flutter_secure_storage|$(t 'La clé maîtresse, rangée dans le Keystore Android.' 'The master key, kept in the Android Keystore.')" \
"local_auth|$(t "L'empreinte, qui déverrouille la clé." 'The fingerprint, which unlocks the key.')" \
"flutter_riverpod|$(t "La gestion d'état, et l'invalidation après écriture." 'State management, and invalidation after writes.')" \
"go_router|$(t 'La navigation, et la garde qui ramène au verrou.' 'Navigation, and the guard that sends you back to the lock.')" \
"image_picker|$(t 'Photos et vidéos, chiffrées dès leur arrivée dans le coffre.' 'Photos and videos, encrypted the moment they reach the vault.')" \
"video_player|$(t 'La lecture, depuis une copie du cache privé effacée à la fermeture.' 'Playback, from a private cache copy erased on close.')" \
"path_provider|$(t 'Les dossiers privés de l&#39;application, hors de portée des autres.' 'The app private folders, out of reach of other apps.')" \
"archive|$(t "Relire les sauvegardes de l'ancien format, faites en ZIP." 'Reading back backups in the old format, made as ZIP.')" \
"uuid|$(t 'Le nom des fichiers du coffre, qui ne dit rien de leur contenu.' 'The names of vault files, which say nothing about their contents.')" \
"intl|$(t 'Les dates en français, sans les écrire à la main.' 'Dates in French, without writing them by hand.')" \
"url_launcher|$(t 'L&#39;itinéraire et l&#39;appel, confiés aux applications du téléphone.' 'Directions and calls, handed to the phone own apps.')" \
"Chakra Petch|$(t 'La police des titres, embarquée sous licence SIL Open Font.' 'The title typeface, embedded under the SIL Open Font licence.')"

# -------------------------------------------------------- la feuille de route
# ---------------------------------------------------------- l'arborescence
treefig bodycount "$A" "lib/" \
"1|main.dart|$(t "Le point d'entrée." 'The entry point.')" \
"1|app.dart|$(t "L'application, son thème et le reverrouillage." 'The app, its theme and the auto-lock.')" \
"1|config/|$(t 'Thème, routage, formats d écran.' 'Theme, routing, screen formats.')" \
"1|domaine/|<code>Personne</code>, <code>Rencontre</code>, <code>Etiquette</code>, <code>Note</code>, <code>Photo</code>." \
"1|donnees/|$(t 'Le schéma chiffré, les dépôts, les statistiques.' 'The encrypted schema, the repositories, the statistics.')" \
"2|base.dart|$(t 'Une seule ouverture, les migrations, la réparation.' 'A single opening, the migrations, the repair.')" \
"2|coordonnees.dart|$(t 'Les communes, et la recherche qui pardonne les fautes.' 'The communes, and the search that forgives typos.')" \
"2|geometrie_france.dart|$(t 'Le décodeur du fond de carte.' 'The base map decoder.')" \
"1|security/|$(t 'Trousseau, coffres photo et vidéo, verrou, protection écran.' 'Keyring, photo and video vaults, lock, screen guard.')" \
"2|flux_chiffre.dart|$(t 'Le chiffrement par morceaux, pour ce qui ne tient pas en mémoire.' 'Chunked encryption, for what does not fit in memory.')" \
"2|aes_natif.dart|$(t 'AES-GCM par le chiffrement d&#39;Android.' 'AES-GCM through Android encryption.')" \
"1|providers/|$(t "L'état, en Riverpod." 'State, in Riverpod.')" \
"1|ecrans/|$(t 'Les écrans, et le calcul des signes du calendrier.' 'The screens, and the calendar signs.')" \
"2|calendrier.dart|$(t 'Le mois, et la liste dessous.' 'The month, and the list below.')" \
"2|visionneuse.dart|$(t 'Photos et vidéos en plein écran.' 'Photos and videos full screen.')" \
"1|widgets/|$(t 'Les composants réutilisables, dont la carte.' 'The reusable components, including the map.')" \
"1|utils/|$(t 'Médias, sauvegarde en flux, sélecteur de fichiers, dates.' 'Media, streamed backup, file picker, dates.')"

# ------------------------------------------------------ comment la carte est faite
seqfig bc-carte "$A" \
"$(t 'Données ouvertes' 'Open data')|$(t 'Le trait de côte et les limites de départements, en GeoJSON. 1,2 Mo de texte.' 'The coastline and department boundaries, as GeoJSON. 1.2 MB of text.')" \
"$(t 'Compactage' 'Packing')|$(t 'Chaque point sur quatre octets, quantifié au 1/2000e de degré, soit cinquante mètres. 45 853 points, 180 Ko.' 'Each point on four bytes, quantised to 1/2000th of a degree, about fifty metres. 45,853 points, 180 KB.')" \
"$(t 'Cadrage' 'Framing')|$(t 'La vue se cale sur tes villes, avec un cadre minimum pour qu&#39;on voie toujours assez de côte.' 'The view fits your cities, with a minimum frame so enough coastline always shows.')" \
"$(t 'Dessin' 'Drawing')|$(t 'Le chemin est bâti une fois, le zoom passe par une matrice. Reconstruire 45 000 points à chaque image tomberait à dix images par seconde.' 'The path is built once, the zoom goes through a matrix. Rebuilding 45,000 points each frame would drop to ten frames per second.')"

# ----------------------------- le modèle de confidentialité, en deux colonnes
V1="$(t 'Aucune requête réseau, aucun compte, aucune analytique.' 'No network request, no account, no analytics.')"
V2="$(t "La base est chiffrée par SQLCipher. Sa clé vit dans le Keystore et n'est chargée qu'après l'empreinte, quand celle ci est active." 'The database is encrypted by SQLCipher. Its key lives in the Keystore and is only loaded after the fingerprint, when that is switched on.')"
V3="$(t 'Chaque photo et chaque vidéo est chiffrée en AES-GCM, et reste absente de la galerie du téléphone.' 'Every photo and video is encrypted with AES-GCM, and never shows in the phone gallery.')"
V4="$(t "L'aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée." 'The task switcher preview is blanked, screenshots blocked, Android backup refused.')"
F1="$(t "Une fois l'application ouverte, tout est lisible à l'écran. L'empreinte protège l'accès, pas ton épaule." 'Once the app is open, everything is readable on screen. The fingerprint protects access, not your shoulder.')"
F2="$(t 'Une sauvegarde exportée voyage. Elle est chiffrée par ta phrase de passe, qui vaut ce que tu la fais valoir.' 'An exported backup travels. It is encrypted by your passphrase, which is worth what you make it worth.')"
F3="$(t "Perdre le téléphone, c'est perdre les données : la clé ne se recopie nulle part." 'Losing the phone means losing the data: the key is copied nowhere.')"
F4="$(t "L'empreinte se coupe dans les réglages. Le chiffrement reste, mais la clé se charge alors sans preuve d'identité." 'The fingerprint can be switched off in the settings. Encryption stays, but the key then loads without proof of identity.')"
V5="$(t 'Une restauration vérifie toute la sauvegarde avant d&#39;effacer quoi que ce soit : une phrase fausse ou un fichier abîmé ne touchent à rien.' 'A restore checks the whole backup before erasing anything: a wrong passphrase or a damaged file touch nothing.')"
F5="$(t 'Pour être lue, une vidéo est déchiffrée dans le cache privé de l&#39;application, le temps de la lecture. La copie part à la fermeture et au verrouillage.' 'To be played, a video is decrypted into the app private cache for as long as it plays. The copy goes on close and on lock.')"
TV="$(t 'Ce qui est <span>vrai</span>' 'What is <span>true</span>')"
TF="$(t "Ce qui ne l'est <span>pas</span>" 'What is <span>false</span>')"
OK='<i><svg viewBox="0 0 16 16" fill="none"><path d="M3 8.3l3.4 3.4L13 5" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>'
KO='<i><svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#E2725F" stroke-width="2" stroke-linecap="round"/></svg></i>'

cat > "$D/html$SUF/s-bc-privacy.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:384px;overflow:hidden;background:#0D1117}
.w{width:1280px;height:384px;background:#0D1117;display:flex;gap:30px;padding:26px 56px}
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
  <div class="l">$OK<p>$V5</p></div>
</div>

<div class="p ko">
  <h3>$TF</h3>
  <div class="l">$KO<p>$F1</p></div>
  <div class="l">$KO<p>$F2</p></div>
  <div class="l">$KO<p>$F3</p></div>
  <div class="l">$KO<p>$F4</p></div>
  <div class="l">$KO<p>$F5</p></div>
</div>

</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=11000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-privacy.png" --window-size=1280,384 "file:///$B/html$SUF/s-bc-privacy.html" >/dev/null 2>&1
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
  <div class="s"><div class="sw" style="background:#A855F7"></div><div class="tx"><span class="n">$P1</span><span class="h">#A855F7</span></div></div>
  <div class="s"><div class="sw" style="background:#D946EF"></div><div class="tx"><span class="n">$P2</span><span class="h">#D946EF</span></div></div>
  <div class="s"><div class="sw" style="background:#0B0616"></div><div class="tx"><span class="n">$P3</span><span class="h">#0B0616</span></div></div>
  <div class="s"><div class="sw" style="background:#150C28"></div><div class="tx"><span class="n">$P4</span><span class="h">#150C28</span></div></div>
  <div class="s"><div class="sw" style="background:#1A1030"></div><div class="tx"><span class="n">$P5</span><span class="h">#1A1030</span></div></div>
  <div class="s"><div class="sw" style="background:#F6F2FF"></div><div class="tx"><span class="n">$P6</span><span class="h">#F6F2FF</span></div></div>
</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-palette.png" --window-size=1280,190 "file:///$B/html$SUF/s-bc-palette.html" >/dev/null 2>&1
echo "  bc-palette.png"

# ------------------------------------------------------- les couches du code
# Cinq bandes empilées, de l'écran jusqu'au disque. Une grille ne rendrait
# pas l'ordre : ici ce qui est en bas ne connaît pas ce qui est au dessus.
C1T="$(t 'Écrans' 'Screens')"
C1D="$(t 'Ne lisent que des providers, n&#39;écrivent que par des dépôts. Aucun SQL.' 'Only read providers, only write through repositories. No SQL.')"
C2T="$(t 'Providers' 'Providers')"
C2D="$(t 'Riverpod. Une écriture invalide tout ce qui en dépend, d&#39;un seul appel.' 'Riverpod. A write invalidates everything that depends on it, in one call.')"
C3T="$(t 'Dépôts' 'Repositories')"
C3D="$(t 'Le seul endroit où du SQL est écrit. Une requête groupée plutôt que N+1.' 'The only place where SQL is written. One grouped query rather than N+1.')"
C4T="$(t 'Sécurité' 'Security')"
C4D="$(t 'Trousseau, coffre à photos, verrou. Rien ne passe outre pour lire un fichier.' 'Keyring, photo vault, lock. Nothing bypasses them to read a file.')"
C5T="$(t 'Disque' 'Disk')"
C5D="$(t 'SQLite chiffré, et un dossier de photos dont chaque fichier l&#39;est aussi.' 'Encrypted SQLite, and a photo folder where every file is encrypted too.')"

cat > "$D/html$SUF/s-bc-couches.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@400&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:404px;overflow:hidden;background:#0D1117}
.w{width:1280px;height:404px;background:#0D1117;padding:24px 56px;display:flex;flex-direction:column;gap:9px}
.c{flex:1;background:#131A24;border:1px solid #1F2833;border-radius:12px;
   display:flex;align-items:center;gap:22px;padding:0 24px;position:relative;overflow:hidden}
.c::after{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:$A;opacity:.85}
.c .n{font-family:'JetBrains Mono',monospace;font-size:12px;color:#5C6A7A;width:26px;flex-shrink:0}
.c h3{font-family:Syne,sans-serif;font-weight:800;font-size:17px;color:#F0F4F8;width:168px;flex-shrink:0}
.c p{font-family:'Space Grotesk',sans-serif;font-size:14px;line-height:1.45;color:#96A3B2}
.c:nth-child(2)::after{opacity:.68}.c:nth-child(3)::after{opacity:.52}
.c:nth-child(4)::after{opacity:.38}.c:nth-child(5)::after{opacity:.24}
</style></head><body><div class="w">
  <div class="c"><span class="n">01</span><h3>$C1T</h3><p>$C1D</p></div>
  <div class="c"><span class="n">02</span><h3>$C2T</h3><p>$C2D</p></div>
  <div class="c"><span class="n">03</span><h3>$C3T</h3><p>$C3D</p></div>
  <div class="c"><span class="n">04</span><h3>$C4T</h3><p>$C4D</p></div>
  <div class="c"><span class="n">05</span><h3>$C5T</h3><p>$C5D</p></div>
</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-couches.png" --window-size=1280,404 "file:///$B/html$SUF/s-bc-couches.html" >/dev/null 2>&1
echo "  bc-couches.png"

# --------------------------------------------------------- le modèle de données
# Les six tables et leurs clés étrangères. La figure est dessinée en SVG
# plutôt qu'en boîtes CSS : ce qu'on veut lire ici, ce sont les liens, et
# une grille ne sait pas tracer une ligne d'un bloc à l'autre.
MT="$(t 'six tables, schéma v7' 'six tables, schema v7')"
MP="$(t 'prénom, âge, ville, genre, rôle,' 'first name, age, city, gender, role,')"
MP2="$(t 'source, téléphone, adresse' 'source, phone, address')"
MR="$(t 'date, lieu, note en demi-points,' 'date, place, rating in half points,')"
MR2="$(t 'montant gagné en centimes' 'amount earned in cents')"
MN="$(t 'texte libre, daté' 'free text, dated')"
MPH="$(t 'chemin dans le coffre, photo ou vidéo,' 'path in the vault, photo or video,')"
MPH2="$(t 'durée et vignette d&#39;une vidéo' 'duration and thumbnail of a video')"
ME="$(t 'clé normalisée, unique' 'normalised key, unique')"
MC="$(t 'en cascade' 'on cascade')"
MNUL="$(t 'facultatif' 'optional')"
MFIN="$(t "Supprimer une fiche emporte tout ce qui s'y rattache. C'est le schéma qui le garantit, pas le code." 'Deleting a person takes everything attached to it. The schema guarantees this, not the code.')"

boite () { # x y l h titre ligne1 ligne2
cat <<SVG
  <rect x="$1" y="$2" width="$3" height="$4" rx="11" fill="#131A24" stroke="#1F2833"/>
  <rect x="$1" y="$(($2+12))" width="3" height="$(($4-24))" rx="1.5" fill="$A" opacity=".8"/>
  <text x="$(($1+19))" y="$(($2+31))" class="tt">$5</text>
  <text x="$(($1+19))" y="$(($2+52))" class="td">$6</text>
  <text x="$(($1+19))" y="$(($2+69))" class="td">$7</text>
SVG
}

cat > "$D/html$SUF/s-bc-modele.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:452px;overflow:hidden;background:#0D1117}
svg{display:block}
.hd{font-family:'JetBrains Mono',monospace;font-size:11.5px;fill:#5C6A7A;letter-spacing:1.3px;
    text-transform:uppercase}
.tt{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13.5px;fill:$A}
.td{font-family:'Space Grotesk',sans-serif;font-size:12px;fill:#8B99A8}
.lb{font-family:'JetBrains Mono',monospace;font-size:10.5px;fill:#6E7B8A}
.ft{font-family:'Space Grotesk',sans-serif;font-size:12.5px;fill:#5C6A7A}
.ln{stroke:#2F3A47;stroke-width:1.7;fill:none;stroke-linecap:round}
</style></head><body>
<svg width="1280" height="452" viewBox="0 0 1280 452" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="452" fill="#0D1117"/>
  <text x="56" y="38" class="hd">$MT</text>

  <!-- personnes vers rencontres, notes et photos -->
  <path class="ln" d="M300 214 C 370 214 380 96 450 96"/>
  <path class="ln" d="M300 214 H 450"/>
  <path class="ln" d="M300 214 C 370 214 380 332 450 332"/>
  <!-- notes et photos peuvent aussi viser une rencontre, ou aucune -->
  <path class="ln" style="stroke-dasharray:5 5" d="M575 172 V 138"/>
  <path class="ln" style="stroke-dasharray:5 5" d="M700 332 C 752 332 752 118 700 118"/>
  <!-- les deux tables de liaison vers les étiquettes -->
  <path class="ln" d="M700 76 C 810 76 810 214 890 214"/>
  <path class="ln" d="M180 262 V 408 H 1015 V 256"/>

  <g fill="#2F3A47">
    <circle cx="300" cy="214" r="3.2"/>
    <circle cx="180" cy="262" r="3.2"/>
  </g>

$(boite 60 172 240 84 "personnes" "$MP" "$MP2")
$(boite 450 54 250 84 "rencontres" "$MR" "$MR2")
$(boite 450 172 250 84 "notes" "$MN" "")
$(boite 450 290 250 84 "photos" "$MPH" "$MPH2")
$(boite 890 172 250 84 "etiquettes" "$ME" "")

  <text x="352" y="152" class="lb">1 - n, $MC</text>
  <text x="588" y="160" class="lb">$MNUL</text>
  <text x="706" y="356" class="lb">$MNUL</text>
  <text x="796" y="142" class="lb">rencontre_etiquettes</text>
  <text x="560" y="401" class="lb">personne_etiquettes</text>
  <text x="56" y="440" class="ft">$MFIN</text>
</svg>
</body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-modele.png" --window-size=1280,452 "file:///$B/html$SUF/s-bc-modele.html" >/dev/null 2>&1
echo "  bc-modele.png"

# ------------------------------------------------- les formats de fichier
# Le coffre à photos, le coffre à vidéos et la sauvegarde exportée, octet
# par octet. Une phrase décrirait mal ce qu'un ruban montre d'un coup
# d'oeil. Les deux derniers partagent le même flux chiffré par morceaux,
# détaillé sur le dernier ruban.
FT1="$(t 'Une photo dans le coffre' 'A photo in the vault')"
FT2="$(t 'Une vidéo dans le coffre' 'A video in the vault')"
FT3="$(t 'Une sauvegarde exportée' 'An exported backup')"
FT4="$(t 'Un morceau du flux' 'One chunk of the stream')"
FD1="$(t 'Chiffrée d&#39;un bloc : une photo tient en mémoire. Clé dérivée du trousseau par HKDF, nom de fichier en UUID.' 'Encrypted in one block: a photo fits in memory. Key derived from the keyring by HKDF, file name as a UUID.')"
FD2="$(t 'Même clé que les photos, mais en flux : la vidéo ne passe jamais en mémoire d&#39;un bloc.' 'Same key as photos, but streamed: the video never sits in memory whole.')"
FD3="$(t 'Clé tirée de ta phrase de passe par PBKDF2-HMAC-SHA256, 210 000 tours, sel neuf à chaque export. Le flux porte le JSON puis chaque média, et se termine par un octet nul.' 'Key drawn from your passphrase by PBKDF2-HMAC-SHA256, 210,000 rounds, fresh salt on every export. The stream carries the JSON then each media, and ends on a zero byte.')"
FD4="$(t 'Chaque morceau authentifie son rang et le fait d&#39;être le dernier : intervertir, retirer ou couper fait échouer la lecture.' 'Each chunk authenticates its rank and whether it is the last: swapping, removing or cutting makes reading fail.')"
O="$(t 'octets' 'bytes')"
FL_C="$(t 'longueur variable' 'variable length')"
FL_M="$(t 'morceaux chiffrés' 'encrypted chunks')"
FL_1="$(t 'jusqu&#39;à 1 Mo' 'up to 1 MB')"
FL_R="$(t 'rang, dernier' 'rank, last')"
FL_A="$(t 'authentifié, non écrit' 'authenticated, not written')"

cat > "$D/html$SUF/s-bc-formats.html" <<HTML
<!doctype html><html lang="$LG"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Space+Grotesk:wght@400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1280px;height:716px;overflow:hidden;background:#0D1117}
.w{width:1280px;height:716px;background:#0D1117;padding:26px 56px;display:flex;flex-direction:column;gap:14px}
.b{background:#131A24;border:1px solid #1F2833;border-radius:13px;padding:17px 24px;flex:1;
   display:flex;flex-direction:column;gap:11px}
.b.m{border-color:#3A2A55}
h3{font-family:Syne,sans-serif;font-weight:800;font-size:16.5px;color:#F0F4F8}
.rb{display:flex;gap:4px;height:48px}
.seg{border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
     border:1px solid rgba(255,255,255,.07)}
.seg b{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12.5px;color:#F0F4F8}
.seg span{font-family:'Space Grotesk',sans-serif;font-size:10.5px;color:rgba(255,255,255,.5)}
.seg.fl{background:repeating-linear-gradient(90deg,#4C2A84 0 118px,#0D1117 118px 122px)}
.seg.fl .lb{background:#4C2A84;flex:1;align-self:center;padding:0 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
.seg.ad{border:1.5px dashed #6B4A9A;background:transparent}
.p{font-family:'Space Grotesk',sans-serif;font-size:13px;line-height:1.45;color:#8B99A8}
</style></head><body><div class="w">

  <div class="b">
    <h3>$FT1</h3>
    <div class="rb">
      <div class="seg" style="width:120px;background:#2B1A4E"><b>BCX1</b><span>4 $O</span></div>
      <div class="seg" style="width:150px;background:#3A2166"><b>nonce</b><span>12 $O</span></div>
      <div class="seg" style="flex:1;background:#4C2A84"><b>AES-GCM</b><span>$FL_C</span></div>
      <div class="seg" style="width:160px;background:#63348F"><b>MAC</b><span>16 $O</span></div>
    </div>
    <p class="p">$FD1</p>
  </div>

  <div class="b">
    <h3>$FT2</h3>
    <div class="rb">
      <div class="seg" style="width:120px;background:#2B1A4E"><b>BCV1</b><span>4 $O</span></div>
      <div class="seg fl" style="flex:1"><div class="lb"><b>$FL_M</b><span>$FL_1</span></div></div>
    </div>
    <p class="p">$FD2</p>
  </div>

  <div class="b">
    <h3>$FT3</h3>
    <div class="rb">
      <div class="seg" style="width:120px;background:#2B1A4E"><b>BCEX2</b><span>5 $O</span></div>
      <div class="seg" style="width:150px;background:#38205F"><b>sel</b><span>16 $O</span></div>
      <div class="seg fl" style="flex:1"><div class="lb"><b>$FL_M</b><span>JSON, photos, $(t 'vidéos' 'videos')</span></div></div>
    </div>
    <p class="p">$FD3</p>
  </div>

  <div class="b m">
    <h3>$FT4</h3>
    <div class="rb">
      <div class="seg" style="width:150px;background:#2B1A4E"><b>$(t 'longueur' 'length')</b><span>4 $O</span></div>
      <div class="seg" style="width:150px;background:#3A2166"><b>nonce</b><span>12 $O</span></div>
      <div class="seg" style="flex:1;background:#4C2A84"><b>AES-GCM</b><span>$FL_1</span></div>
      <div class="seg" style="width:150px;background:#63348F"><b>MAC</b><span>16 $O</span></div>
      <div class="seg ad" style="width:190px"><b>$FL_R</b><span>$FL_A</span></div>
    </div>
    <p class="p">$FD4</p>
  </div>

</div></body></html>
HTML
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=10000 --force-device-scale-factor=2 \
  --screenshot="$B/flow$SUF/bc-formats.png" --window-size=1280,716 "file:///$B/html$SUF/s-bc-formats.html" >/dev/null 2>&1
echo "  bc-formats.png"

# ---------------------------------------------------------------- les tests

grid bc-tests "$A" 3 \
"$(t 'Base' 'Database')|$(t 'Huit ouvertures simultanées rendent une seule connexion. Une écriture se relit partout. Une base sans version est réparée, pas détruite.' 'Eight simultaneous openings give one connection. A write reads back everywhere. A database without a version is repaired, not destroyed.')" \
"$(t 'Flux chiffré' 'Encrypted stream')|$(t 'Aller-retour de zéro octet à trois mégaoctets. Tronqué, interverti ou modifié d&#39;un octet : refusé. Le natif relit le Dart, et l&#39;inverse.' 'Round trip from zero bytes to three megabytes. Truncated, swapped or one byte changed: refused. Native reads Dart back, and the reverse.')" \
"$(t 'Sauvegarde' 'Backup')|$(t 'Tout revient, fiche, étiquettes, rencontre, photo, vidéo et vignette. Phrase fausse, fichier abîmé, fichier étranger : rien ne bouge.' 'Everything comes back, person, tags, encounter, photo, video and thumbnail. Wrong passphrase, damaged file, foreign file: nothing moves.')" \
"$(t 'Coffre et communes' 'Vault and communes')|$(t 'Une vidéo se relit à l&#39;identique. Un village, une faute, un homonyme : placés. Londres et « chez lui » : non.' 'A video reads back identical. A village, a typo, a namesake: placed. London and « chez lui »: not.')" \
"$(t 'Parcours d&#39;écrans' 'Screen journeys')|$(t 'L&#39;application entière, pilotée au doigt : changer une ville et la voir au répertoire, filtrer, chercher, ouvrir une photo, la carte, l&#39;agenda, le rappel.' 'The whole app, driven by finger: change a city and see it in the directory, filter, search, open a photo, the map, the calendar, the reminder.')" \
"$(t 'Sur appareil' 'On device')|$(t 'SQLCipher, le Keystore et l&#39;AES natif n&#39;existent que sur Android : les vingt-quatre tests tournent sur un émulateur.' 'SQLCipher, the Keystore and native AES only exist on Android: the twenty-four tests run on an emulator.')"
