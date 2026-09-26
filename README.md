<div align="center">

<p>
  <img src="docs/langues/fr-on.png" alt="Français, page affichée" width="150" />
  <a href="README.en.md"><img src="docs/langues/en-off.png" alt="Read this page in English" width="150" /></a>
</p>

<img src="docs/banniere.png" alt="BodyCount, journal personnel chiffré et hors ligne sur Android" width="100%">
<br><br>

</div>

Je voulais un endroit où garder ce qui entoure mes rencontres : une photo, quelques notes sur la personne, un avis sur la soirée, des étiquettes pour m'en souvenir, une adresse, ce que ça a rapporté parfois. Des informations très sensibles, qui n'ont rien à faire dans les contacts du téléphone ni dans une application qui les enverrait sur un serveur, et qu'on veut pourtant retrouver en deux secondes, classées proprement, avec des statistiques qui en tirent quelque chose.

Rien de ce qui existait ne faisait les deux : garder tout ça bien rangé, et le garder pour soi. BodyCount est né de là. Tout vit dans une base chiffrée sur le téléphone, derrière une empreinte qui ne déverrouille pas un écran mais la clé elle même. Pas de serveur, pas de compte, pas de télémétrie : rien ne sort, sauf une sauvegarde qu'on demande explicitement, chiffrée elle aussi par une phrase de passe.

Toute la conception découle de cette contrainte, jusqu'à la carte, qui dessine la France et ses 34 836 communes à partir de données embarquées plutôt que d'aller chercher des tuiles sur internet.

<img src="docs/sections/s00.png" alt="00 Sommaire" width="100%">

<p align="center">
<a href="#fonctionnalites"><img src="docs/sommaire/01.png" alt="01 Fonctionnalités" width="31%"></a>
<a href="#ecrans"><img src="docs/sommaire/02.png" alt="02 Les écrans" width="31%"></a>
<a href="#installer"><img src="docs/sommaire/03.png" alt="03 Installer" width="31%"></a>
<br>
<a href="#stack"><img src="docs/sommaire/04.png" alt="04 La stack" width="31%"></a>
<a href="#architecture"><img src="docs/sommaire/05.png" alt="05 Architecture" width="31%"></a>
<a href="#chiffrement"><img src="docs/sommaire/06.png" alt="06 Le chiffrement" width="31%"></a>
<br>
<a href="#videos"><img src="docs/sommaire/07.png" alt="07 Vidéos et sauvegardes" width="31%"></a>
<a href="#carte"><img src="docs/sommaire/08.png" alt="08 La carte" width="31%"></a>
<a href="#calendrier"><img src="docs/sommaire/09.png" alt="09 Le calendrier" width="31%"></a>
<br>
<a href="#confidentialite"><img src="docs/sommaire/10.png" alt="10 Confidentialité" width="31%"></a>
<a href="#tests"><img src="docs/sommaire/11.png" alt="11 Les tests" width="31%"></a>
<a href="#sans-internet"><img src="docs/sommaire/12.png" alt="12 Sans Internet" width="31%"></a>
<br>
<a href="#avertissement"><img src="docs/sommaire/13.png" alt="13 Avertissement" width="31%"></a>
<a href="#versions"><img src="docs/sommaire/14.png" alt="14 Les versions" width="31%"></a>
<a href="#licence"><img src="docs/sommaire/15.png" alt="15 Licence" width="31%"></a>
</p>

<a id="fonctionnalites"></a>
<img src="docs/sections/s01.png" alt="01 Fonctionnalités" width="100%">

<img src="docs/schemas/fonctionnalites.svg" alt="Les fonctionnalités de BodyCount, en onze écrans animés, chacun avec son mécanisme. Verrouillage biométrique : l’empreinte scannée, la clé sort du Keystore, HKDF en tire la clé de la base et celle du coffre, et le répertoire se remplit. Répertoire : « vann » tapé dans la recherche, la requête se réécrit à chaque lettre et passe de 18 à 7 fiches, les cartes glissent, puis Mieux notés les réordonne. Statistiques : les 78 rencontres de l’année tombent chacune dans son mois, les barres montent, +136 % face à 2025, le podium se range. Carte de France : la vraie côte lue dans france.bin, les villes tombent en pastilles avec leurs ondes et leurs navettes, et un pincement sépare la bulle de 65 en Vannes 61 et Auray 4. Calendrier : les jours pleins prennent leur disque et leurs signes, on touche le 23 et ses six signes passent au tri, trois restent. Galerie privée : une photo choisie dans le sélecteur passe au coffre, se brouille, chiffrée en AES-GCM, la copie est effacée, rien dans la galerie du téléphone, puis déchiffrée en mémoire pour la visionneuse. Sauvegarde : la phrase de passe, PBKDF2 en 210 000 tours, puis le fichier BCEX2 qui s’écrit morceau par morceau. Ce que ça rapporte : sept soirées payées sur 78 s’allument, 750 € au total, 107,14 € de moyenne sur les seules payées. Tout se reprend : une rencontre rouverte, sa note corrigée, une suppression demandée puis annulée. Adresse et itinéraire : seule l’adresse passe la porte, vers l’appli de cartes choisie, qui trace l’itinéraire dans le vrai golfe du Morbihan. Trois formats d’écran : le même répertoire en 2, 3 puis 4 colonnes. Et rien ne sort : pas de serveur, pas de compte, pas de télémétrie." width="100%">

<a id="ecrans"></a>
<img src="docs/sections/s02.png" alt="02 Les écrans" width="100%">

L'application est pensée d'abord pour le format passeport, l'écran de couverture d'un Galaxy Z Fold : large et court. C'est là qu'elle sert tous les jours, et c'est lui qui porte la planche complète. Les visages sont ceux du jeu d'essai, des portraits générés : personne de réel.

<img src="docs/schemas/captures-passeport.svg" alt="Douze écrans au format passeport, l’écran de couverture du Fold. Lancement : l’icône sur le fond de l’application. Chargement : un anneau se trace autour du logo pendant que le nom monte. Verrou : le logo a glissé à sa place, le bouton d’empreinte attend. Répertoire : trois colonnes de fiches avec photo, tris, villes et étiquettes. Fiche : la photo d’Enzo en grand, ses étiquettes, ses rencontres. Carnet et galerie : les notes datées, une photo et une vidéo. Visionneuse : la vidéo en lecture, avec le bouton de téléchargement. Point précis : la carte autour d’Auray avec les communes voisines et l’épingle. Statistiques : le total de l’année et le podium. Carte : la Bretagne et les villes regroupées. Calendrier : septembre sur sept colonnes. Réglages : le verrou, la sauvegarde, la restauration." width="100%">

Au lancement, Android pose l'icône au centre ; l'application la reprend au même endroit, trace un anneau autour, fait monter son nom, puis fait glisser le logo et le titre jusqu'à leur place exacte sur l'écran d'ouverture. On ne voit pas où l'un s'arrête et où l'autre commence. La demande d'empreinte n'arrive qu'une fois l'animation terminée.

Sur un téléphone classique en 16/9, la mise en page passe à deux colonnes et range la recherche sous le titre :

<img src="docs/schemas/captures-telephone.svg" alt="Quatre écrans sur un téléphone 16/9 : le verrou, le répertoire en deux colonnes, la fiche d’Enzo avec ses pastilles sur deux lignes, et la carte." width="100%">

Et sur l'écran déplié, en 4/3, la navigation devient un rail à gauche et le répertoire passe à quatre colonnes :

<img src="docs/schemas/captures-tablette.svg" alt="Trois écrans sur grand écran 4/3 : le répertoire en quatre colonnes avec tous les filtres sur une ligne, la carte avec le classement et les visages vus à Vannes, et la fiche d’Enzo avec la photo sur toute la largeur." width="100%">

Le même écran couché passe à 1200 points de large. La fiche se partage alors en deux volets, la photo à gauche sur toute la hauteur :

<img src="docs/schemas/captures-paysage.svg" alt="Quatre écrans sur grand écran tenu à l’horizontale : le répertoire en quatre colonnes à côté du rail, la fiche d’Enzo en deux volets avec la photo à gauche et les rencontres à droite, les statistiques avec le podium centré, et la carte de la Bretagne au dessus du classement des villes." width="100%">

Le répertoire se filtre pendant qu'on tape : chaque lettre refait une seule requête sur la base chiffrée, qui cherche dans le prénom, la ville et les étiquettes. Les pastilles de ville et d'étiquette s'ajoutent à la recherche au lieu de la remplacer, et un tri ne change que l'ordre de cette même requête.

<img src="docs/schemas/repertoire.svg" alt="Chercher et trier le répertoire. On tape « emb » dans le champ Nom, ville, étiquette : à chaque lettre la requête est refaite, et le mot est cherché dans le prénom, la ville et les étiquettes de la fiche. À « e », les 18 fiches restent ; à « em », Emma et les quatre fiches qui portent Embrasse bien ; à « emb », ces quatre seules. On efface, on touche la pastille Vannes : la ville doit être exactement Vannes, 7 fiches. Puis les tris : Mieux notés range par note moyenne, Plus vues par nombre de rencontres, A à Z par prénom sans tenir compte des majuscules, et à égalité le prénom départage. La rangée de pastilles porte les quatre tris, les quatre villes qui comptent le plus de fiches et les huit étiquettes les plus portées. Les filtres se cumulent, une étiquette se compare par sa clé sans accents ni majuscules, et tout repart à vide au déverrouillage." width="100%">

Noter une rencontre prend six champs, tous facultatifs sauf la date, déjà réglée à maintenant. La note se donne par demi-point en touchant la moitié d'une étoile, et un montant laissé vide veut dire rien, pas une fois à zéro euro. À l'enregistrement, une seule fonction, `rafraichir()`, fait relire la fiche, le rang, le répertoire, les statistiques, le calendrier et la carte : aucun écran ne garde un chiffre périmé.

<img src="docs/schemas/rencontre.svg" alt="Noter une rencontre. Depuis la fiche d’Enzo, Nouvelle rencontre ouvre le formulaire : la date et l’heure sont déjà à maintenant, le lieu se tape, Auray, avec un point sur la carte si l’on veut ; le montant reste vide pour rien, ici 50 € ; la note se donne par demi-point en touchant la moitié d’une étoile, 4,5 sur 5 ; les étiquettes Chez lui et Toute la nuit décrivent cette fois-là ; une note part au carnet, datée et liée à la rencontre. Enregistrer appelle rafraichir(), qui fait relire la fiche (8 fois, note 3,9), le rang (N°12 devient N°11), le répertoire, les statistiques de l’année, le calendrier, la carte et le carnet. Une rencontre se reprend ou se supprime ; supprimée, elle quitte les statistiques, la carte et le calendrier, ses notes restent." width="100%">

Chaque chiffre de l'écran des statistiques sort d'une requête SQL, pas d'une boucle dans l'appli : la base renvoie douze entiers pour les douze barres, pas toutes les rencontres. La moyenne de ce que ça a rapporté ne compte que les soirées payées, et une année sans précédent n'affiche pas de pourcentage plutôt que de diviser par zéro. Le total, les gains et les mois suivent l'année choisie ; le podium et les rôles portent sur toutes les fiches.

<img src="docs/schemas/statistiques.svg" alt="L’écran des statistiques et d’où sortent ses chiffres. Au total : 78 rencontres en 2026 contre 33 en 2025, soit +136 %, avec 18 personnes comptées une fois chacune. Les mieux notés : la moyenne des notes, divisée par deux pour tenir sur cinq, puis le nombre de fois ; Noa J. à 4,9, Gabriel T. et Ibrahim D. à 4,8, départagés par la moyenne exacte ; le podium vaut pour toutes les années. Ce que ça a rapporté : 750 € sur 7 soirées payées des 78, soit 107,14 € en moyenne, la moyenne ne comptant que les soirées payées. Par mois : chaque rencontre rangée dans son mois, septembre en tête avec 18 fois. Répartition : 18 fiches rangées par rôle, 8 versatiles, 6 actifs, 4 passifs, comptées en personnes et non en rencontres. Tout est calculé en SQL dans la base chiffrée." width="100%">

La palette reprend le dégradé du logo, du violet au fuchsia, sur des fonds presque noirs.

<img src="docs/schemas/palette.svg" alt="La palette de BodyCount, sur la fiche d’Enzo. Chaque couleur s’allume à son tour et un trait la relie à ce qui la porte. Fond #0B0616, le sol, un noir qui tire au violet. Arête #261A45, le bord des cartes. Carte #1A1030, le fond d’une rencontre. Texte #F6F2FF, le prénom et les chiffres. Texte second #9B8CB8, les intitulés. Texte tertiaire #7D6E99, l’heure et le lieu. Violet primaire #A855F7, les liens et le début du dégradé. Fuchsia #D946EF, la fin du dégradé sur le bouton Nouvelle rencontre. Étoile #C084FC, les notes. Vert #1ED760, le rang N°12. Or #FDE68A, les 50 € d’une soirée. Surface #150C28, la boîte de dialogue qui s’ouvre. Rouge #F87171, le seul rouge de l’appli, sur Supprimer." width="100%">

<a id="installer"></a>
<img src="docs/sections/s03.png" alt="03 Installer" width="100%">

L'APK se trouve dans les [Releases](https://github.com/Cybertrist/BodyCount/releases/latest) du dépôt, et non dans le code : un binaire de près de trente mégaoctets versionné avec les sources resterait dans l'historique pour toujours, et chaque clone le traînerait, une fois par version. Les deux liens ci-dessous mènent toujours à la dernière.

Il y a deux applications, et elles s'installent côte à côte. **BodyCount**, la vraie, démarre vide et n'attend que tes fiches. **BodyCount démo** est une application à part, remplie des dix-huit fiches du jeu d'essai, avec leurs photos, leurs rencontres et leurs carnets : de quoi tout parcourir sans rien saisir. Elle s'ouvre sans empreinte et laisse passer les captures d'écran, le verrou se rallume dans ses réglages.

<p align="center">
  <a href="https://github.com/Cybertrist/BodyCount/releases/latest/download/BodyCount.apk"><img src="docs/telecharger.png" alt="Télécharger BodyCount, version complète, Android 7 ou plus, arm64" width="400"></a>
  <a href="https://github.com/Cybertrist/BodyCount/releases/latest/download/BodyCount-demo.apk"><img src="docs/telecharger-demo.png" alt="Essayer la démo de BodyCount, remplie de dix-huit fiches d'essai" width="400"></a>
</p>

Il demande Android 7 ou plus sur un processeur 64 bits, soit tout téléphone de ces dernières années. Comme il ne passe pas par le Play Store, Android fera autoriser l'installation depuis l'application qui l'ouvre, le navigateur ou le gestionnaire de fichiers.

Pour une application qui gardera ce genre de données, deux vérifications valent la minute qu'elles prennent. L'empreinte du fichier doit être celle publiée avec la version :

```bash
sha256sum BodyCount.apk BodyCount-demo.apk
# 6fd713f7036788d57fe95d8a6f9a27f030374d7c9264f9d8e83d0cfbce569bd4  BodyCount.apk
# e2bdd13500aa165746168fde9b5319c3df97f41ae81b96408de12f0be28235f2  BodyCount-demo.apk
```

Et le certificat qui le signe doit être celui-ci, le même pour toutes les versions. Android refuse une mise à jour signée d'une autre clé, ce qui écarte aussi un APK retouché en chemin :

```bash
apksigner verify --print-certs BodyCount.apk
# SHA-256 : ac09674e066658991aeb60f02e1386423b5e14dede4bd6c844f542785fef86d1
```

La démo est signée de la même clé.

La vraie application ne contient pas le jeu d'essai : ni les dix-huit profils, ni leurs visages, ni la ligne des réglages qui les crée. Seule la démo les embarque, et comme son identifiant est différent, elle ne lit ni n'écrit jamais la base de la vraie.

<a id="stack"></a>
<img src="docs/sections/s04.png" alt="04 La stack" width="100%">

<img src="docs/schemas/stack.svg" alt="La stack de BodyCount, paquet par paquet, là où chacun travaille. Flutter en Dart 3.11 dessine chaque écran. Ouvrir : local_auth laisse Android vérifier l’empreinte, flutter_secure_storage sort la clé gardée par le Keystore, cryptography en tire deux clés par HKDF, go_router garde les écrans derrière le verrou. Parcourir : sqflite_sqlcipher ouvre la base chiffrée dans un dossier donné par path_provider, flutter_riverpod tient l’état et le relit après chaque écriture, et les grands titres sont en Chakra Petch, embarquée. Ajouter une photo : image_picker la rend, cryptography la chiffre en AES-GCM, uuid lui donne un nom sans rapport avec elle. Ajouter une vidéo : media3-transformer l’allège en Kotlin, javax.crypto la chiffre par morceaux avec l’AES matériel, video_player la rejoue. Aller le voir : intl écrit les dates, url_launcher passe l’itinéraire à l’appli de cartes. Sauvegarder : cryptography tire la clé de la phrase par PBKDF2, javax.crypto écrit le flux, archive relit encore l’ancien format. Aucun paquet réseau dans la liste." width="100%">

Nécessite le SDK Flutter 3.x et un appareil ou un émulateur Android. Le projet suit le modèle de Flutter 3.47 : Gradle 9.3, le plugin Android 9.1 et Kotlin 2.4, compilé par le plugin Android lui-même.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run --flavor complete
```

Pour une version installable, `flutter build apk --release --split-per-abi --flavor complete`, et pour la démo `--flavor demo --dart-define=DEMO=true`. Chaque construction nomme sa variante, `flutter run` aussi : `flutter run --flavor complete`. Le découpage par architecture n'est pas de la coquetterie : SQLCipher embarque une bibliothèque native par ABI, et sans lui l'APK pèse un tiers de plus pour rien. La version de publication est signée de la clé que désigne `android/key.properties`, ignoré par git ; sans ce fichier, c'est la clé de débogage.

Quelques lignes de Kotlin dans `MainActivity` remplacent deux paquets. `cryptography_flutter` s'installait comme implémentation de toute la cryptographie, dérivation de clé comprise, et Android refusait la clé HMAC vide d'une extraction sans sel : la base ne s'ouvrait plus. `share_plus` 13 aurait exigé une version majeure de `flutter_secure_storage`, là où vit la clé maîtresse. L'activité porte donc l'AES-GCM natif, le sélecteur de fichiers, le partage, l'enregistrement dans la galerie, la lecture de la durée et d'une image d'une vidéo, et son réencodage par Media3.

<a id="architecture"></a>
<img src="docs/sections/s05.png" alt="05 Architecture" width="100%">

Cinq couches, et une règle : une couche ne connaît jamais celle du dessus. Un écran ne voit pas SQLite, un dépôt ne voit pas Riverpod, et rien ne lit un fichier du coffre sans passer par le trousseau.

<img src="docs/schemas/couches.svg" alt="Les cinq couches de BodyCount, traversées par un toucher sur Enregistrer. Le formulaire d’une rencontre d’Enzo est rempli : Auray, 4,5 sur 5, Chez lui et Toute la nuit. À la descente, une carte « rencontre » tombe de couche en couche : l’écran appelle directement depotRencontres.creer et enjambe les providers ; le dépôt, seul endroit où s’écrit du SQL, fait l’INSERT, puis les étiquettes et la note au carnet ; la sécurité prête la connexion ouverte avec la clé tirée de bodycount/db/v1 ; sur le disque, une page de bodycount.db change et se chiffre avant d’être écrite. À la remontée, l’écran appelle rafraichir, qui invalide d’un seul appel douze providers, du répertoire aux étiquettes d’Enzo ; ils relisent par les dépôts, en requêtes groupées, sur la même connexion, et les valeurs remontent jusqu’à la fiche, qui revient à jour : 8 fois, 3,9, la rencontre du 26 septembre en tête. Écrire descend, relire remonte, et aucun écran n’écrit de SQL." width="100%">

Au déverrouillage, le répertoire, les villes et les statistiques demandent la base au même instant. La base garde le futur de son ouverture, et tous l'attendent. Ce n'était pas le cas au départ : chacun lançait la sienne, l'une fermait la connexion de l'autre en vérifiant la clé, et l'autre, croyant la base en clair, la recopiait en effaçant le fichier. L'application tournait ensuite sur deux fichiers, la fiche écrivait dans l'un et le répertoire lisait l'autre, ce qui se voyait comme une ville qui refusait de changer. Une base n'est plus jugée en clair que sur son en-tête, et celle qui aurait perdu son numéro de version dans l'affaire se répare au lancement.

<img src="docs/schemas/ouverture.svg" alt="Une seule ouverture de la base. Au déverrouillage, le répertoire, les villes et les statistiques demandent la base au même instant. Avant la correction, chacun lançait sa propre ouverture : la deuxième vérifiait la clé et fermait au passage la connexion de la première, qui échouait, croyait la base en clair et la recopiait en effaçant le fichier. L’application tournait alors sur deux fichiers : la fiche d’Enzo enregistrait Auray dans la copie, et le répertoire, qui lisait l’ancien, le montrait toujours à Vannes. Après la correction, la base garde le futur de son ouverture : la première demande la lance, les deux autres attendent la même, et tout le monde lit et écrit dans un seul fichier chiffré ; Auray s’affiche aussitôt. Une base n’est jugée en clair que sur son en-tête, celle qui a perdu son numéro de version repasse par les migrations jusqu’au schéma v7, et une ouverture ratée s’oublie pour que la suivante retente." width="100%">

Sept tables, schéma v7 : cinq, et deux tables de liaison pour les étiquettes. `personnes` est le pivot : tout ce qui s'y rattache part avec elle, et c'est le schéma qui le garantit, pas une boucle de suppression écrite à la main. Les vidéos vivent dans la table des photos, avec un type, une durée et une vignette : elles sont au même endroit de la fiche, partent avec elle et se rangent dans le même coffre.

<img src="docs/schemas/modele.svg" alt="Le modèle de données de BodyCount, schéma v7, dans la base chiffrée. Sept tables : personnes, rencontres, notes, photos, etiquettes, et deux tables de liaison, personne_etiquettes et rencontre_etiquettes. Rencontres, notes, photos et liaisons pointent vers personnes en ON DELETE CASCADE ; notes et photos pointent vers rencontres en ON DELETE SET NULL. La fiche d’Enzo P. se range : une ligne dans personnes, sept rencontres, quatre liens vers des étiquettes partagées, les étiquettes du soir, trois notes, une photo et une vidéo dont les fichiers chiffrés vivent dans le coffre, hors de la base. Puis on reprend la rencontre du 14 septembre et on la supprime : ses étiquettes du soir partent par CASCADE, la note écrite ce soir-là reste, son lien simplement défait par SET NULL, et rien d’autre ne bouge. Les clés étrangères ne jouent que parce que PRAGMA foreign_keys = ON est posé à chaque ouverture ; une étiquette est unique par sa clé et sa portée ; note et montant sont des entiers." width="100%">

<img src="docs/schemas/arborescence.svg" alt="L’arborescence de lib, 59 fichiers Dart et 18 523 lignes, qui se déplie dossier par dossier, avec sous l’arbre le poids de chaque dossier. À la racine, main.dart, le point d’entrée qui lance la lecture des communes, et app.dart, l’application, son thème et le reverrouillage ; au lancement, tout mène au verrou. config : la palette, les trois formats d’écran du Fold, le routage dont la seule porte est le verrou, le jeu d’essai et la démo. domaine : les modèles, une fiche, une rencontre avec sa note en demi-points et son montant, une étiquette et sa clé, une note du carnet. donnees : base.dart pour l’ouverture unique et le schéma v7, depots.dart le seul SQL de l’appli, les statistiques en SQL, les 34 836 communes et la géométrie de la France. ecrans : le répertoire, la fiche, le formulaire d’une rencontre, les statistiques, la carte, le calendrier et les autres. providers : l’état en Riverpod, rafraichir() et les douze providers qu’il invalide, l’empreinte et lock(), les réglages. security : la clé maîtresse et HKDF, les coffres des photos et des vidéos, le flux par morceaux, la protection de l’écran. utils : la sauvegarde et la restauration, les médias, le sélecteur de fichiers, les dates. widgets : la carte de France, la carte du répertoire, les étoiles, la barre du bas. À droite, un écran de l’application pour chaque dossier : le verrou, le répertoire en deux puis trois colonnes, le formulaire d’une rencontre, les statistiques, le calendrier, la fiche d’Enzo qui passe à 8 fois, l’empreinte qui ouvre la base, l’export chiffré, et la vraie carte de Bretagne." width="100%">

<a id="chiffrement"></a>
<img src="docs/sections/s06.png" alt="06 Le chiffrement" width="100%">

L'empreinte ne déverrouille pas un écran : c'est elle qui fait entrer la clé maîtresse en mémoire. Cette clé de 32 octets, tirée au hasard au premier lancement, dort dans des préférences chiffrées par le Keystore d'Android ; tant qu'Android n'a pas reconnu ton doigt ou ton code, la base, les photos et les vidéos ne sont que du bruit sur le disque. Deux clés en sont dérivées par HKDF, chacune par sa propre étiquette, l'une pour SQLCipher, l'autre pour le coffre, et aucune n'existe en mémoire avant.

<img src="docs/schemas/chiffrement.svg" alt="D’où viennent les clés de BodyCount. On touche le capteur de l’écran de verrou, Android demande l’empreinte ou le code du téléphone et la vérifie lui-même. Alors seulement, la clé maîtresse de 32 octets, tirée au hasard au premier lancement et rangée dans des préférences chiffrées par le Keystore, entre en mémoire. HKDF-SHA256 en dérive deux clés par deux étiquettes : bodycount/db/v1 donne le mot de passe SQLCipher de la base, bodycount/photos/v1 la clé AES-256-GCM du coffre des photos et des vidéos. Le répertoire se remplit : les prénoms quand la base s’ouvre, les visages qui se déchiffrent quand le coffre s’ouvre, puis la fiche d’Enzo, sa grande photo et sa galerie, déchiffrées en mémoire. Au verrouillage, les clés sont oubliées : sur le disque, sans l’empreinte, bodycount.db, les fichiers .bcx du coffre et la clé rangée ne sont que du bruit. Effacer la clé du Keystore suffit à rendre tout illisible, pour tout le monde." width="100%">

Chaque photo est un fichier à part, chiffré en AES-GCM d'un seul bloc, nommé par un UUID qui ne dit rien de son contenu. Une vidéo suit le même principe, en morceaux : la section suivante dit pourquoi. Une sauvegarde exportée utilise le même flux par morceaux, mais sa clé vient de ta phrase de passe plutôt que du Keystore : sans elle, le fichier ne se relit nulle part, y compris sur le téléphone qui l'a produit.

<img src="docs/schemas/formats.svg" alt="Les formats de fichier de BodyCount, comme dans un éditeur hexadécimal. Une photo du coffre : la marque BCX1 sur 4 octets, un nonce de 12 octets tiré au hasard, la photo entière chiffrée d’un bloc en AES-256-GCM, puis un MAC de 16 octets, soit 4 + 12 + 184 288 + 16 octets ; son nom est un UUID qui ne dit rien de la personne. Une vidéo : la marque BCV1, puis des morceaux, chacun fait d’une longueur sur 4 octets, 00 10 00 00 pour un mégaoctet, d’un nonce neuf de 12 octets, d’un mégaoctet chiffré au plus et d’un MAC de 16 octets ; même clé et même extension que les photos. Une sauvegarde : la marque BCEX2 sur 5 octets, un sel de 16 octets en clair pour que PBKDF2 refasse la clé depuis la phrase de passe, puis le même flux par morceaux ; une fois déchiffré, il porte des entrées faites d’un genre sur 1 octet, de la longueur du nom sur 2, du nom, donnees.json en premier, de la taille sur 8 et du contenu, puis les photos et les vidéos, et un octet nul pour finir. Un morceau vu de près : 4 + 12 + 1 048 576 + 16 octets sur le disque, et 9 de plus authentifiés sans être écrits, son rang sur 8 octets et le fait d’être le dernier sur 1 ; déplacer ou couper un morceau change ces valeurs, et la lecture s’arrête au morceau touché." width="100%">

Le verrou se referme sans geste à l'écran, ou au retour d'arrière-plan, après un délai réglable. Il attend la fin d'un travail en cours : une sauvegarde, une restauration ou une longue vidéo qui se chiffre ne se touchent pas du doigt, et le sélecteur de fichiers du système passe l'application en arrière-plan. Il se coupe aussi entièrement dans les réglages : le chiffrement reste, mais la clé se charge alors sans preuve d'identité, et l'écran le dit avant de l'accepter. Au verrouillage, les clés sont oubliées, et leurs octets écrasés avant d'être lâchés plutôt que laissés au ramasse-miettes. L'aperçu du multitâche est masqué, les captures d'écran bloquées, et la sauvegarde automatique d'Android refusée : elle recopierait la base chiffrée sur des serveurs qui ne sont pas les tiens.

<img src="docs/schemas/verrou.svg" alt="Le verrou de BodyCount. Au toucher du capteur, l’empreinte charge la clé maîtresse depuis le Keystore, la base s’ouvre et le répertoire apparaît. Chaque toucher relance un compte à rebours de 45 secondes, réglable à 15 s, 2 ou 5 minutes. Dans le multitâche, l’aperçu de l’application reste noir et les captures sont bloquées. En arrière-plan, l’heure est notée ; au retour, si le délai est dépassé, la clé, la connexion à la base, les photos déchiffrées et les vidéos en lecture sont effacées de la mémoire, et l’empreinte est redemandée. Une sauvegarde, une restauration ou une vidéo qui se chiffre retiennent le verrou." width="100%">

<a id="videos"></a>
<img src="docs/sections/s07.png" alt="07 Vidéos et sauvegardes" width="100%">

Une photo ou une vidéo n'entre jamais en clair dans BodyCount. La copie que rend le sélecteur d'Android est chiffrée dans le coffre de l'application, puis effacée, et rien n'apparaît dans la galerie du téléphone. Pour l'afficher, la photo est déchiffrée en mémoire et la vidéo dans le cache privé, le temps de la lecture. Seul le bouton de téléchargement en pose une copie en clair dans la galerie, et seulement si tu le demandes.

<img src="docs/schemas/coffre.svg" alt="Le coffre des photos et des vidéos. Sur la fiche d’Enzo, Photos et vidéos, puis Ajouter : le sélecteur d’Android rend une photo et une vidéo en copies temporaires, en clair. La photo entre au coffre chiffrée d’un seul bloc en AES-GCM ; la vidéo laisse d’abord sa durée et une image, qui devient sa vignette chiffrée, puis est allégée et chiffrée par morceaux. Chaque original est effacé, et rien n’apparaît dans la galerie du téléphone. Dans la visionneuse, la photo est déchiffrée en mémoire vive ; la vidéo est déchiffrée dans le cache privé le temps de la lecture, puis effacée à la fermeture. Le bouton de téléchargement en pose une copie en clair dans Films › BodyCount, seulement sur demande. Un fichier modifié d’un octet est refusé, et au verrouillage le cache des photos et les copies de lecture disparaissent." width="100%">

Une vidéo pèse cent fois une photo. La chiffrer d'un bloc demandait de la tenir entière en mémoire, et une sauvegarde qui l'emportait devait tenir en mémoire toutes les vidéos à la fois. Les deux passent donc par un flux chiffré par morceaux d'un mégaoctet, écrit et relu sur le disque.

<img src="docs/schemas/flux.svg" alt="Le flux chiffré par morceaux. Une vidéo d’Enzo de 6,4 Mo entre au coffre un mégaoctet à la fois : chaque tranche passe par un tampon d’un mégaoctet au plus, puis par AES-GCM natif avec la clé du coffre et un nonce neuf, et s’écrit dans le fichier BCV1, précédée de sa longueur et de son nonce, suivie de son étiquette. Chaque morceau authentifie aussi, sans l’écrire, son rang et le fait d’être le dernier ; le dernier, même vide, n’est écrit qu’à la fermeture. À la lecture, les sept étiquettes sont vérifiées et la vidéo se déchiffre dans le cache privé. Puis trois attaques : deux morceaux intervertis, et le morceau 2 est refusé ; la fin coupée, et le morceau 5, qui passe pour le dernier sans l’être, est refusé ; un octet changé dans le morceau 4, refusé. Chaque fois, la visionneuse affiche Vidéo illisible au lieu d’un contenu amputé." width="100%">

Chaque morceau authentifie son rang et le fait d'être le dernier, sans les écrire : ils entrent dans le calcul de l'étiquette. Intervertir deux morceaux, en retirer un ou couper la fin du fichier fait échouer la lecture au lieu de rendre une vidéo amputée sans rien dire. L'AES passe par le chiffrement d'Android, qui utilise les instructions du processeur : en Dart pur, cent mégaoctets prenaient une demi-minute.

Un téléphone filme en 1080p ou en 4K à des débits pensés pour un grand écran. À l'import, une vidéo lourde est réencodée par Media3 sur l'encodeur du téléphone : H.264, 720 points sur le petit côté, 2,5 Mb/s, le son tel quel. Une vidéo de 20 Mo en pèse environ 3. Réencoder dégrade toujours un peu : une vidéo déjà légère n'est pas touchée, et la version allégée n'est gardée que si elle gagne au moins un dixième. Si l'encodeur échoue, c'est l'original qui entre au coffre.

<img src="docs/schemas/allegement.svg" alt="L’allègement d’une vidéo à l’import. Dans la galerie d’Enzo, trois vidéos sont ajoutées, et l’écran dit « Chiffrement de la vidéo, 1 sur 3 », puis « Allègement de la vidéo » avec son pourcentage. La première, filmée au téléphone en 1080 x 1920 à 16 Mb/s, pèse 20 Mo : Media3 la réencode sur l’encodeur du téléphone, en H.264, 720 points sur le petit côté, 2,5 Mb/s, le son tel quel. Elle ressort à 3 Mo, sous le seuil de 90 % : l’allégée entre au coffre et l’original est effacé. La deuxième, déjà compressée à 2,7 Mb/s, pèse 8 Mo ; réencodée, elle en fait encore 7,6, au-dessus du seuil de 7,2 : l’allégée est effacée et l’original entre. La troisième, 720 x 1280 à 3 Mb/s, est déjà sous les deux limites, 720 points et 4 Mb/s : elle entre sans passer par l’encodeur. Si l’encodeur échoue, sa sortie est effacée et l’original entre. Au total, 33 Mo choisis, 16 Mo au coffre, chaque vidéo chiffrée par morceaux." width="100%">

Pour être lue, une vidéo est déchiffrée dans le cache privé de l'application, parce que le lecteur du système a besoin d'un fichier. La copie est effacée à la fermeture du lecteur, au verrouillage, et au lancement suivant si l'application a été tuée en pleine lecture. Un bouton de la visionneuse range une photo ou une vidéo dans la galerie du téléphone, sous Images ou Films, dossier BodyCount : en clair, puisque c'est tout l'objet du geste, et le message le rappelle.

Une sauvegarde est chiffrée par une phrase de passe, pas par la clé du téléphone : elle se relit donc sur un autre appareil. La phrase passe par PBKDF2 en 210 000 tours, puis le fichier s'écrit en flux, les fiches d'abord, puis chaque photo et chaque vidéo, sorties du coffre et rechiffrées aussitôt, sans jamais toucher le disque en clair. Une fois le fichier posé où tu veux, la date est notée et le rappel du répertoire se tait pendant un mois.

<img src="docs/schemas/sauvegarde.svg" alt="Exporter une sauvegarde. Le répertoire rappelle que la dernière date de 38 jours ; Sauvegarder mène aux réglages, puis à Exporter, chiffré. La phrase de passe, huit caractères au moins, passe par PBKDF2-HMAC-SHA256 en 210 000 tours avec un sel de 16 octets tiré au hasard, et donne une clé AES-256. Le fichier s’écrit en flux dans le cache privé : la marque BCEX2 et le sel en clair, puis donnees.json avec les fiches, puis chaque photo et chaque vidéo, sorties du coffre et rechiffrées aussitôt par morceaux d’un mégaoctet, et un octet nul pour finir. Sauvegarde prête : on l’enregistre dans Téléchargements par le sélecteur du système, la copie du cache est effacée, et la date notée fait taire le rappel pendant 30 jours. « Plus tard » le fait taire une semaine. Le verrou attend pendant l’export, et la restauration vérifie tout avant de toucher à quoi que ce soit." width="100%">

Une restauration ne touche à rien avant d'avoir tout vérifié. Le fichier est lu deux fois : la première pour déchiffrer chaque morceau et le jeter, la seconde pour ranger les médias sous de nouveaux noms, à côté des anciens. Les fiches ne sont remplacées qu'à la toute fin. Une phrase fausse s'arrête au premier morceau, un octet abîmé au sien, et une coupure en route n'efface que les fichiers qu'elle venait d'ajouter : dans tous les cas, les fiches du téléphone sont intactes.

<img src="docs/schemas/restauration.svg" alt="Restaurer une sauvegarde. Dans les réglages, Restaurer une sauvegarde prévient que tout sera remplacé, mais que rien ne change tant qu’elle n’a pas été lue et vérifiée en entier. Le sélecteur du système donne le fichier, puis la phrase choisie à l’export refait la clé par PBKDF2. Le fichier est lu deux fois : au premier passage, chaque morceau est déchiffré, son étiquette vérifiée, puis il est jeté ; au second, les photos et les vidéos entrent au coffre sous de nouveaux noms, à côté des anciennes, et donnees.json est gardé pour la fin. Pendant tout ce temps, les 12 fiches du téléphone sont intactes. Seulement alors elles sont remplacées par les 18 de la sauvegarde, les anciens fichiers du coffre sont effacés, et le répertoire est relu. Une autre fois, avec une phrase fausse, le premier morceau refuse de se déchiffrer : la restauration s’arrête net et rien n’a bougé. Un octet abîmé arrête le premier passage ; une coupure au second n’efface que les nouveaux fichiers. Le verrou attend, et la copie du fichier est toujours effacée." width="100%">

L'export propose d'enregistrer le fichier dans un dossier avant de le partager : avec des vidéos, une sauvegarde dépasse vite ce que la plupart des applications acceptent. Le partage passe par une URI temporaire limitée au seul dossier des sauvegardes. Quand la dernière sauvegarde a plus d'un mois, ou qu'il n'y en a jamais eu, un bandeau le dit en haut du répertoire. Les sauvegardes de l'ancien format, un ZIP chiffré d'un bloc, se relisent toujours.

<a id="carte"></a>
<img src="docs/sections/s08.png" alt="08 La carte, sans tuiles" width="100%">

Une carte à tuiles enverrait à un serveur, à chaque déplacement du doigt, la liste exacte des endroits regardés. Pour une application dont toute la promesse est que rien ne sort du téléphone, c'était la seule chose à ne pas faire. La France est donc embarquée.

<img src="docs/schemas/fabrication.svg" alt="La fabrication du fond de carte de BodyCount. Au départ, un GeoJSON de données ouvertes : 1,2 Mo de texte pour le trait de côte et les limites des départements, chaque point écrit en une vingtaine de caractères. Chaque longitude et chaque latitude est ramenée au 1/2000e de degré depuis (−6°, 41°), une cinquantaine de mètres, et tient sur un entier de seize bits : quatre octets par point, une erreur qui ne se voit pas sur un téléphone. Le fichier france.bin en sort : la marque FRA1, deux couches, 160 anneaux de côte et 117 de départements, 45 853 points, 184 536 octets, embarqués dans l’APK et décodés une fois par lancement. À l’ouverture de l’écran Carte, la vue se cadre sur la ville principale et ses voisines jusqu’aux deux tiers des rencontres, avec un plancher et une marge. La terre est un dessin à part, peint une fois et isolé des ondes et des navettes qui bougent en continu ; au pincement, le zoom passe par une matrice sans reconstruire le moindre chemin. Pas une requête réseau : aucune tuile, aucune police, les 34 836 communes embarquées elles aussi." width="100%">

La carte s'ouvre serrée sur tes villes, pas sur toutes : on part de la principale et on s'élargit jusqu'aux deux tiers des rencontres. Deux villes trop proches pour tenir côte à côte deviennent une seule bulle, qui porte la somme ; les disques ne bougent jamais, c'est en s'approchant qu'elles se séparent.

<img src="docs/schemas/carte.svg" alt="L’écran Carte de BodyCount. La vue s’ouvre serrée sur tes villes : de la principale, de proche en proche, jusqu’aux deux tiers des rencontres, ici Vannes, Auray et Lorient, soit 4,3×. La terre monte, les villes tombent en pastilles qui portent leur nombre, les plus grosses d’abord, avec deux ondes sur Vannes et une navette vers chaque autre ville. Vannes et Auray, trop proches à cette échelle, forment une seule bulle de 65. Un pincement sur le golfe approche jusqu’à 9,6× : la bulle se sépare en Vannes 61 et Auray 4, et les points posés à la main apparaissent. Le bouton du zoom ramène la vue d’ouverture. Plus bas, le classement des villes en barres, puis les visages vus à Vannes. Aucune tuile n’est chargée : aucun serveur ne sait quel coin de la carte tu regardes. Le point précis d’une rencontre se pose à la main, les communes voisines servant de repère." width="100%">

La carte se pince pour zoomer jusqu'à vingt fois, se traîne pour se déplacer, et la règle se regradue toute seule. Elle s'ouvre cadrée sur les villes qui font les deux tiers des rencontres, donc sur le vrai cœur d'activité plutôt que sur le pays entier.

Aucune pastille n'est déplacée d'un pixel : à l'échelle d'un pays, écarter un point de quarante points le déplace de cent kilomètres. Quand deux villes sont trop proches pour tenir côte à côte, elles se réunissent en une bulle qui porte la somme, et qui se scinde dès qu'on s'approche assez. Vannes et Auray sont à dix-sept kilomètres : aucun placement malin n'y change quoi que ce soit, c'est de la géographie.

Les villes viennent du référentiel officiel des communes, embarqué lui aussi : les 34 836 communes de métropole et de Corse, du plus petit village à Paris, 420 Ko une fois compressées dans l'APK. `tool/communes.mjs` le reconstruit depuis geo.api.gouv.fr ; c'est le seul endroit du projet qui touche au réseau, et il tourne sur la machine du développeur, pas sur le téléphone. Le point précis s'ouvre déjà centré sur la commune où tombe le lieu tapé.

<img src="docs/schemas/villes.svg" alt="Une ville tapée et la commune où elle tombe. Dans le formulaire d’une rencontre, le lieu se tape, puis Placer sur la carte ouvre le point précis centré sur la commune trouvée parmi les 34 836 du référentiel, rangées de la plus peuplée à la moins peuplée. La saisie devient une clé, en minuscules, sans accents, tirets ni espaces, puis passe quatre essais dans l’ordre, et le premier qui répond l’emporte. Locmariaquer : le nom exact. Plougastel : un début de nom, Plougastel-Daoulas ; avec Plou seulement, Plouzané, plus peuplée, passerait avant. Locmariaqer : une faute de frappe, une lettre d’écart, deux tolérées dès huit lettres. Vannes centre : un nom de commune qui ouvre la saisie, le plus long l’emporte, Vannes plutôt que Vanne en Haute-Saône. Londres est dans la table des villes étrangères : elle n’est jamais approchée, sans quoi elle tomberait à Ondres, dans les Landes, et le point précis s’ouvre sur toute la France. Un département entre parenthèses départage les homonymes, Saint-Denis (11) ; « St » devient « saint » ; et pour le classement, seul un nom exact fait d’un lieu une ville." width="100%">

Tout ce qui est en France est posé. Le nom exact d'abord, en ignorant accents, tirets et « St » ; puis un début de nom, « Plougastel » pour Plougastel-Daoulas ; puis une faute d'une ou deux lettres ; puis un nom de commune suivi d'un quartier. À chaque étape la plus peuplée l'emporte, et un département entre parenthèses, « Saint-Denis (11) », départage les homonymes. La tolérance s'arrête aux villes : « chez lui » n'est pas un village à une lettre près, et un lieu de rencontre qui n'est pas une ville compte pour la ville de la fiche. L'étranger reste hors de la carte, qui ne dessine que la France, mais figure dans le classement des lieux.

Une rencontre peut aussi se poser à la main, à un point précis. Sans tuiles, il n'y a pas de rues à montrer : ce sont les communes voisines, avec leur nom, qui servent de repère. De quoi poser un point « entre Arradon et Séné », qui apparaît sur la carte des lieux une fois qu'on s'est approché.

<a id="calendrier"></a>
<img src="docs/sections/s09.png" alt="09 Le calendrier" width="100%">

La question qu'on se pose le plus souvent n'est pas « combien », mais « quand » : c'était quel soir, il y a combien de temps, est-ce que ça a été une bonne période. Une liste chronologique y répond mal passé quelques dizaines d'entrées : il faut défiler et compter.

Le calendrier y répond d'un coup d'œil. Un mois tient sur sept colonnes : les soirs pleins, les semaines vides et les séries se lisent sans compter. Un jour vide n'est qu'un chiffre effacé ; un jour plein porte un disque, doré quand la soirée a rapporté. On tape dessus pour n'avoir que lui dans la liste en dessous.

Sous chaque jour, jusqu'à trois signes disent ce qu'il a eu de remarquable, du plus rare au plus banal : le meilleur montant de l'année avant les cent euros, les cent euros avant un simple billet, la meilleure note du mois avant un cinq sur cinq. Vingt-cinq signes en tout, tous déduits de ce que l'application enregistre déjà, aucun à saisir en plus. Une légende accessible depuis l'en-tête dit précisément ce qui déclenche chacun : pas « une bonne soirée » mais « une note de cinq sur cinq », pour qu'on sache quoi saisir si on veut le voir apparaître.

<img src="docs/schemas/calendrier.svg" alt="Le calendrier de BodyCount. Septembre 2026 se remplit sur sept colonnes : un jour vide n’est qu’un chiffre effacé, un jour plein porte un disque violet, doré quand la soirée a rapporté. Sous chaque disque, trois signes au plus. On touche le 23 : il se cercle de blanc et la liste ne montre plus que lui. Ses six signes, première fois, montant, meilleure note du mois, toute la nuit, chez lui, passif, sont triés par rareté : les trois premiers restent sous le jour, les deux premiers sur la ligne de la liste. La légende, ouverte par le point d’interrogation, donne les vingt-cinq signes en sept familles, argent, note, qui, rythme, heure, lieu et rôle, tous déduits de ce qui est déjà saisi. Puis août s’affiche, toujours sur six semaines, et un toucher sur 2025 ouvre décembre, son dernier mois plein." width="100%">

Un jour peut mériter bien plus de trois signes : le 23 en a six. Ils passent au tri, du plus rare au plus banal, et seuls les trois premiers tiennent sous le disque, les deux premiers sur la ligne de la liste. Le reste n'est pas perdu, il n'a simplement pas la place.

Toujours six semaines affichées, même quand le mois n'en occupe que cinq : une grille dont la hauteur dépend du mois fait sauter tout l'écran quand on le feuillette.

<a id="confidentialite"></a>
<img src="docs/sections/s10.png" alt="10 Modèle de confidentialité" width="100%">

<img src="docs/schemas/confidentialite.svg" alt="Le modèle de confidentialité de BodyCount, en deux colonnes. Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique, Android refuse toute connexion faute de permission INTERNET. La base est chiffrée par SQLCipher, sa clé vit dans le Keystore et n’est chargée qu’après l’empreinte. Chaque photo et chaque vidéo est chiffrée en AES-GCM et reste absente de la galerie du téléphone. L’aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée. Une restauration vérifie toute la sauvegarde avant d’effacer quoi que ce soit. Ce qui ne l’est pas : une fois l’application ouverte, tout est lisible à l’écran, l’empreinte protège l’accès, pas ton épaule. Une sauvegarde exportée voyage, elle vaut ce que vaut ta phrase de passe. Perdre le téléphone, c’est perdre les données, la clé ne se recopie nulle part. L’empreinte se coupe dans les réglages, et la clé se charge alors sans rien demander. Pour être lue, une vidéo est déchiffrée dans le cache privé le temps de la lecture." width="100%">

<a id="tests"></a>
<img src="docs/sections/s11.png" alt="11 Les tests" width="100%">

Ce qui se casse sans bruit est ce qui touche au disque : l'ouverture de la base, ses migrations, le chiffrement, la sauvegarde. Or SQLCipher, le Keystore et l'AES natif n'existent que sur Android. Les tests tournent donc sur un émulateur, avec les vraies bibliothèques, et non contre des imitations qui passeraient là où l'application échoue. Six d'entre eux pilotent l'application entière, au doigt, d'un écran à l'autre.

```bash
flutter test integration_test -d emulator-5554 --flavor complete
```

Ils détruisent les données et la clé de l'application qu'ils visent : à lancer sur un émulateur, jamais sur le téléphone qui porte le vrai journal.

<img src="docs/schemas/tests.svg" alt="Les tests de BodyCount, qui tournent. flutter test integration_test sur l’émulateur : Base, quatre tests, dont les ouvertures simultanées qui partagent une seule connexion et la base sans numéro de version réparée, pas détruite ; Flux chiffré, huit tests, des allers-retours de 0 octet à trois mégaoctets, le natif et le Dart qui se relisent, un fichier tronqué, deux morceaux intervertis et un octet modifié refusés ; Coffre des vidéos, une vidéo qui se relit à l’identique ; Sauvegarde, quatre tests, tout revient, et une mauvaise phrase, une sauvegarde abîmée ou un fichier étranger ne touchent à rien ; Communes, un village, une faute, un homonyme. Pendant ce temps, rien à l’écran : tout se passe sous le capot, avec le vrai SQLCipher et le vrai Keystore. Puis six parcours pilotent l’application au doigt : la ville de Nathan passe de Londres à Locmariaquer, l’étiquette Musclé ne laisse que Kelyan, la recherche « barb » ne laisse qu’Adam, la photo d’Ibrahim s’ouvre en grand avec son bouton pour la galerie, la carte range Arradon et l’agenda montre le mois, le rappel de sauvegarde se montre puis se tait. 24 tests passés. Enfin, sur la machine, sans émulateur, les sept tests de la recherche des communes." width="100%">

Ils ont servi dès leur première exécution. Ceux des données ont trouvé une marque de fin de sauvegarde écrite sur onze octets et lue sur un : aucune restauration n'aurait abouti. Ceux des écrans ont trouvé une rangée de chiffres qui débordait de sa hauteur fixe sur la fiche.

<a id="sans-internet"></a>
<img src="docs/sections/s12.png" alt="12 Sans Internet" width="100%">

« Aucune requête réseau » s'écrit facilement. Ici, ce n'est pas une promesse du code mais une règle d'Android : l'application ne demande pas la permission `INTERNET`, et sans elle le système refuse d'ouvrir la moindre connexion. Un bug, une bibliothèque trop bavarde, une dépendance piégée à la prochaine mise à jour : tout se heurte au même mur, qui n'est pas dans l'application et qu'elle ne peut pas franchir.

Ça se vérifie sur l'APK lui-même, sans lire une ligne de code :

```bash
aapt2 dump permissions app-arm64-v8a-release.apk
```

La liste est courte : l'empreinte, sous son nom actuel et son ancien, puis `WAKE_LOCK` et `ACCESS_NETWORK_STATE`, qu'ajoutent des bibliothèques. La première empêche le téléphone de s'endormir en plein travail, la seconde dit si le réseau est là, sans permettre de s'en servir.

Restent quatre sorties, et aucune ne s'ouvre seule. Chacune attend un doigt, et passe la main à une autre application, qui répond ensuite de ce qu'elle en fait :

<img src="docs/schemas/reseau.svg" alt="BodyCount ne demande pas la permission INTERNET : Android refuse d’ouvrir la moindre connexion. Les tuiles de carte, les polices, la mesure d’audience ou les rapports de plantage que d’autres applications envoient d’elles-mêmes s’écraseraient sur ce mur, et Internet n’est jamais atteint. Il reste quatre portes, chacune sur un toucher, qui passent la main à une autre application : Y aller donne l’adresse à l’appli de cartes choisie par geo:, Appeler donne le numéro au composeur par tel:, Exporter pose la sauvegarde chiffrée dans le dossier choisi par le sélecteur du système, et Télécharger range une copie en clair de la photo dans Images › BodyCount. Le manifeste n’écrit qu’une permission, l’empreinte ; la France est embarquée, la police aussi, et la sauvegarde d’Android est refusée." width="100%">

La dernière est la seule à laisser une trace en clair : une photo téléchargée devient une photo comme les autres, visible de la galerie et de tout ce qui la lit. C'est le prix de « je veux la garder ailleurs », et l'application ne le paie qu'à la demande.

<a id="avertissement"></a>
<img src="docs/sections/s13.png" alt="13 Avertissement" width="100%">

Ce dépôt est un projet personnel, pas un produit de sécurité. Le chiffrement s'appuie sur des primitives éprouvées et sur le Keystore d'Android, mais l'assemblage, lui, n'a été relu par personne d'autre que moi. Si tu comptes y mettre des données dont la fuite te coûterait quelque chose, lis le code avant, ou ne le fais pas.

Le jeu d'essai n'existe que dans la démo, et dans une version de travail compilée avec `--dart-define=ESSAIS=true`. Ses visages, des portraits générés qui ne représentent personne, ne font pas partie du dépôt : pour construire la démo, ils se posent dans `assets/demo/` ; pour une version de travail, sur le téléphone, avec `adb push assets/demo/. /sdcard/Android/data/com.bodycount.bodycount/files/demo/`. Sans eux les dix-huit fiches se créent quand même, simplement sans photo : le générateur se passe de chaque image absente.

<a id="versions"></a>
<img src="docs/sections/s14.png" alt="14 Les versions" width="100%">

<img src="docs/schemas/versions.svg" alt="Les versions de BodyCount, empilées l’une sur l’autre : chacune tombe sur la précédente, comme elle s’installe. En bas, le socle ne bouge pas : tes données, fiches, rencontres, carnets, photos et vidéos du coffre, et la clé de signature, la même pour toutes, dont le fil monte sceller chaque version. 1.0.0, mercredi 23 septembre 2026 : la première version, répertoire, statistiques, carte et calendrier, galerie chiffrée, sauvegarde et restauration, sans jeu d’essai. 1.1.0, samedi 26 septembre : la démo, une seconde application, BodyCount démo, d’identifiant .demo, qui se pose à côté de la pile avec ses dix-huit fiches d’essai, sans toucher la vraie. 1.1.0 par-dessus 1.0.0 : rien de perdu. Elle reste allumée, avec ses 24 tests au vert." width="100%">

Chaque Release, avec ses notes et ses empreintes SHA-256 : [github.com/Cybertrist/BodyCount/releases](https://github.com/Cybertrist/BodyCount/releases).

<a id="licence"></a>
<img src="docs/sections/s15.png" alt="15 Licence et auteur" width="100%">

BodyCount est conçu et développé par **Tristan Joncour** ([@Cybertrist](https://github.com/Cybertrist)), élève ingénieur en cyberdéfense à l'ENSIBS, pour son propre usage d'abord : c'est l'application qu'il voulait avoir sur son téléphone, et qui n'existait pas.

Le code est publié sous licence [MIT](LICENSE) : libre de le lire, de le reprendre et de le modifier, à condition de garder la mention de copyright. La géométrie de la France et le référentiel des communes viennent de données ouvertes ; la police Chakra Petch est sous licence SIL Open Font ; l'icône d'empreinte des schémas vient de Material Design, sous licence Apache 2.0.

---

<sub>Les images de cette page ne sortent d'aucun logiciel de dessin : ce sont des pages HTML que Chrome capture, et six SVG animés. Les captures d'écran viennent d'un émulateur piloté par script, rognées de leurs barres par <code>rogner.js</code>. Tout est dans <a href="docs/tools/">docs/tools</a>, et <code>bash docs/tools/tout.sh</code> refait tout, dans les deux langues, aperçu social compris.</sub>
