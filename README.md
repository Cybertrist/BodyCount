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

<img src="docs/sections/s01.png" alt="01 Fonctionnalités" width="100%">

<img src="docs/schemas/fonctionnalites.png" alt="Verrouillage biométrique : l'empreinte ne déverrouille pas un écran, elle charge la clé. Répertoire : photos, carnet de notes daté, étiquettes libres, genre et rôle, notes sur cinq. Statistiques : le total de l'année, le rythme mois par mois, le podium et la répartition des rôles. Carte de France : la vraie géométrie du pays et ses 34 836 communes, embarquées ; même mal orthographié, un village tombe à sa place. Calendrier : le mois en sept colonnes, avec des signes sous chaque jour. Galerie privée : photos et vidéos, chacune chiffrée à part, qui s'ouvrent en plein écran. Sauvegarde complète : fiches, photos et vidéos dans un fichier protégé par une phrase de passe, restaurable sans risque. Ce que ça rapporte : un montant par rencontre. Tout se reprend : rien de ce qui est saisi n'est définitif. Adresse et itinéraire : le seul geste qui sorte du téléphone. Trois formats d'écran : téléphone, écran de couverture et écran déplié." width="100%">

<img src="docs/sections/s02.png" alt="02 Les écrans" width="100%">

L'application est pensée d'abord pour le format passeport, l'écran de couverture d'un Galaxy Z Fold : large et court. C'est là qu'elle sert tous les jours, et c'est lui qui porte la planche complète. Les visages sont ceux du jeu d'essai, des portraits générés : personne de réel.

<img src="docs/schemas/captures-passeport.png" alt="Douze écrans au format passeport. Lancement : l'icône sur le fond de l'application. Chargement : un anneau se trace autour du logo pendant que le nom monte. Verrou : le logo a glissé à sa place, le bouton d'empreinte attend. Répertoire : trois colonnes de fiches avec photo, tris, villes et étiquettes. Fiche : la photo d'Enzo en grand, ses étiquettes, ses rencontres. Carnet et galerie : les notes datées, une photo et une vidéo. Visionneuse : la vidéo en lecture, avec le bouton de téléchargement. Point précis : la carte autour d'Auray avec les communes voisines et l'épingle. Statistiques : le total de l'année et le podium. Carte : la Bretagne et les villes regroupées. Calendrier : septembre sur sept colonnes. Réglages : le verrou, la sauvegarde, la restauration." width="100%">

Au lancement, Android pose l'icône au centre ; l'application la reprend au même endroit, trace un anneau autour, fait monter son nom, puis fait glisser le logo et le titre jusqu'à leur place exacte sur l'écran d'ouverture. On ne voit pas où l'un s'arrête et où l'autre commence. La demande d'empreinte n'arrive qu'une fois l'animation terminée.

Sur un téléphone classique en 16/9, la mise en page passe à deux colonnes et range la recherche sous le titre :

<img src="docs/schemas/captures-telephone.png" alt="Quatre écrans sur un téléphone 16/9 : le verrou, le répertoire en deux colonnes, la fiche d'Enzo avec ses pastilles sur deux lignes, et la carte." width="100%">

Et sur l'écran déplié, en 4/3, la navigation devient un rail à gauche et le répertoire passe à quatre colonnes :

<img src="docs/schemas/captures-tablette.png" alt="Trois écrans sur grand écran 4/3 : le répertoire en quatre colonnes avec tous les filtres sur une ligne, la carte avec le classement et les visages vus à Vannes, et la fiche d'Enzo avec la photo sur toute la largeur." width="100%">

Le même écran couché passe à 1200 points de large. La fiche se partage alors en deux volets, la photo à gauche sur toute la hauteur :

<img src="docs/schemas/captures-paysage.png" alt="Quatre écrans sur grand écran tenu à l'horizontale : le répertoire en quatre colonnes à côté du rail, la fiche d'Enzo en deux volets avec la photo à gauche et les rencontres à droite, les statistiques avec le podium centré, et la carte de la Bretagne au dessus du classement des villes." width="100%">

La palette reprend le dégradé du logo, du violet au fuchsia, sur des fonds presque noirs.

<img src="docs/schemas/palette.png" alt="Palette : primaire violet #A855F7, accent fuchsia #D946EF, fond #0B0616, surface #150C28, cartes #1A1030, texte #F6F2FF." width="100%">

<img src="docs/sections/s03.png" alt="03 Installer" width="100%">

L'APK se trouve dans les [Releases](https://github.com/Cybertrist/BodyCount/releases/latest) du dépôt, et non dans le code : un binaire de près de trente mégaoctets versionné avec les sources resterait dans l'historique pour toujours, et chaque clone le traînerait, une fois par version. Le lien ci-dessous mène toujours à la dernière.

<p align="center">
  <a href="https://github.com/Cybertrist/BodyCount/releases/latest/download/BodyCount.apk"><img src="docs/telecharger.png" alt="Télécharger BodyCount, dernière version, Android 7 ou plus, arm64" width="480"></a>
</p>

Il demande Android 7 ou plus sur un processeur 64 bits, soit tout téléphone de ces dernières années. Comme il ne passe pas par le Play Store, Android fera autoriser l'installation depuis l'application qui l'ouvre, le navigateur ou le gestionnaire de fichiers.

Pour une application qui gardera ce genre de données, deux vérifications valent la minute qu'elles prennent. L'empreinte du fichier doit être celle publiée avec la version :

```bash
sha256sum BodyCount.apk
```

Et le certificat qui le signe doit être celui-ci, le même pour toutes les versions. Android refuse une mise à jour signée d'une autre clé, ce qui écarte aussi un APK retouché en chemin :

```bash
apksigner verify --print-certs BodyCount.apk
# SHA-256 : ac09674e066658991aeb60f02e1386423b5e14dede4bd6c844f542785fef86d1
```

L'APK publié ne contient pas le jeu d'essai : ni les dix-huit profils, ni leurs visages, ni la ligne des réglages qui les crée.

<img src="docs/sections/s04.png" alt="04 La stack" width="100%">

<img src="docs/schemas/stack.png" alt="Flutter 3.x le framework en Dart. sqflite_sqlcipher pour SQLite chiffré par SQLCipher. cryptography pour AES-GCM des photos, HKDF et PBKDF2. javax.crypto pour l'AES-GCM natif des vidéos et des sauvegardes. flutter_secure_storage pour la clé maîtresse dans le Keystore Android. local_auth pour l'empreinte qui déverrouille la clé. flutter_riverpod pour l'état et l'invalidation après écriture. go_router pour la navigation et la garde du verrou. image_picker pour les photos et vidéos chiffrées dès leur arrivée. video_player pour la lecture. path_provider pour les dossiers privés. archive pour relire l'ancien format de sauvegarde. uuid pour le nom des fichiers du coffre. intl pour les dates. url_launcher pour l'itinéraire et l'appel. Chakra Petch pour les titres." width="100%">

Nécessite le SDK Flutter 3.x et un appareil ou un émulateur Android. Le projet suit le modèle de Flutter 3.47 : Gradle 9.3, le plugin Android 9.1 et Kotlin 2.4, compilé par le plugin Android lui-même.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

Pour une version installable, `flutter build apk --release --split-per-abi`. Le découpage par architecture n'est pas de la coquetterie : SQLCipher embarque une bibliothèque native par ABI, et sans lui l'APK pèse un tiers de plus pour rien. La version de publication est signée par la clé que désigne `android/key.properties`, ignoré par git ; sans ce fichier, c'est la clé de débogage.

Quelques lignes de Kotlin dans `MainActivity` remplacent deux paquets. `cryptography_flutter` s'installait comme implémentation de toute la cryptographie, dérivation de clé comprise, et Android refusait la clé HMAC vide d'une extraction sans sel : la base ne s'ouvrait plus. `share_plus` 13 aurait exigé une version majeure de `flutter_secure_storage`, là où vit la clé maîtresse. L'activité porte donc l'AES-GCM natif, le sélecteur de fichiers, le partage, l'enregistrement dans la galerie, la lecture de la durée et d'une image d'une vidéo, et son réencodage par Media3.

<img src="docs/sections/s05.png" alt="05 Architecture" width="100%">

Cinq couches, et une règle : une couche ne connaît jamais celle du dessus. Un écran ne voit pas SQLite, un dépôt ne voit pas Riverpod, et rien ne lit un fichier du coffre sans passer par le trousseau.

<img src="docs/schemas/couches.png" alt="Écrans : ne lisent que des providers, n'écrivent que par des dépôts, aucun SQL. Providers : Riverpod, une écriture invalide tout ce qui en dépend d'un seul appel. Dépôts : le seul endroit où du SQL est écrit, une requête groupée plutôt que N+1. Sécurité : trousseau, coffre à photos, verrou, rien ne passe outre pour lire un fichier. Disque : SQLite chiffré, et un dossier de photos dont chaque fichier l'est aussi." width="100%">

Au déverrouillage, le répertoire, les villes et les statistiques demandent la base au même instant. La base garde le futur de son ouverture, et tous l'attendent. Ce n'était pas le cas au départ : chacun lançait la sienne, l'une fermait la connexion de l'autre en vérifiant la clé, et l'autre, croyant la base en clair, la recopiait en effaçant le fichier. L'application tournait ensuite sur deux fichiers, la fiche écrivait dans l'un et le répertoire lisait l'autre, ce qui se voyait comme une ville qui refusait de changer. Une base n'est plus jugée en clair que sur son en-tête, et celle qui aurait perdu son numéro de version dans l'affaire se répare au lancement.

<img src="docs/schemas/ouverture.svg" alt="Trois écrans demandent la base au même instant, au déverrouillage. Ils attendent tous la même ouverture, qui ouvre un seul fichier chiffré. Avant la correction, chacun lançait la sienne, et l'application finissait avec deux connexions sur deux fichiers différents." width="100%">

Six tables, schéma v7. `personnes` est le pivot : tout ce qui s'y rattache part avec elle, et c'est le schéma qui le garantit, pas une boucle de suppression écrite à la main. Les vidéos vivent dans la table des photos, avec un type, une durée et une vignette : elles sont au même endroit de la fiche, partent avec elle et se rangent dans le même coffre.

<img src="docs/schemas/modele.png" alt="Six tables, schéma v7. personnes porte prénom, âge, ville, genre, rôle, source, téléphone et adresse. rencontres porte date, lieu, note en demi-points sur dix et montant gagné en centimes, rattachée à une personne en cascade. notes porte un texte libre daté, rattachée à une personne et facultativement à une rencontre. photos porte un chemin dans le coffre, photo ou vidéo, et la durée et la vignette d'une vidéo, même rattachement. etiquettes porte une clé normalisée unique, reliée aux personnes et aux rencontres par deux tables de liaison." width="100%">

<img src="docs/schemas/arborescence.png" alt="Arborescence de lib : main.dart le point d'entrée, app.dart l'application son thème et le reverrouillage, config thème routage et formats d'écran, domaine les modèles, donnees le schéma chiffré les dépôts et les statistiques dont base.dart pour l'ouverture unique et les migrations, coordonnees.dart pour les communes et geometrie_france.dart, security trousseau coffres photo et vidéo verrou et protection écran dont flux_chiffre.dart et aes_natif.dart, providers l'état en Riverpod, ecrans les écrans dont calendrier.dart et visionneuse.dart, widgets les composants réutilisables dont la carte, utils médias sauvegarde en flux sélecteur de fichiers et dates." width="100%">

<img src="docs/sections/s06.png" alt="06 Le chiffrement" width="100%">

L'empreinte ne déverrouille pas un écran : elle charge la clé maîtresse depuis le Keystore. Tant qu'elle n'a pas été donnée, la base est un fichier illisible, les photos et les vidéos aussi. Deux clés en sont dérivées par HKDF, l'une pour SQLCipher, l'autre pour le coffre, et aucune n'existe en mémoire avant.

<img src="docs/schemas/chiffrement.svg" alt="L'empreinte charge la clé maîtresse depuis le Keystore Android. HKDF-SHA256 en dérive deux clés : le mot de passe SQLCipher qui ouvre le journal chiffré, et la clé AES-GCM qui ouvre le coffre des photos et des vidéos." width="100%">

Chaque photo est un fichier à part, chiffré en AES-GCM d'un seul bloc, nommé par un UUID qui ne dit rien de son contenu. Une vidéo suit le même principe, en morceaux : la section suivante dit pourquoi. Une sauvegarde exportée utilise le même flux par morceaux, mais sa clé vient de ta phrase de passe plutôt que du Keystore : sans elle, le fichier ne se relit nulle part, y compris sur le téléphone qui l'a produit.

<img src="docs/schemas/formats.png" alt="Une photo dans le coffre : marque BCX1 sur 4 octets, nonce sur 12 octets, contenu chiffré en AES-GCM, MAC sur 16 octets, chiffrée d'un bloc. Une vidéo dans le coffre : marque BCV1 sur 4 octets puis des morceaux chiffrés d'un mégaoctet au plus, même clé que les photos. Une sauvegarde exportée : marque BCEX2 sur 5 octets, sel sur 16 octets, puis des morceaux chiffrés portant le JSON et chaque média, clé tirée de la phrase de passe par PBKDF2-HMAC-SHA256 en 210 000 tours. Un morceau du flux : longueur sur 4 octets, nonce sur 12, chiffré d'un mégaoctet au plus, MAC sur 16, et en données associées authentifiées mais non écrites, son rang et le fait d'être le dernier." width="100%">

Le verrou se referme sans geste à l'écran, ou au retour d'arrière-plan, après un délai réglable. Il attend la fin d'un travail en cours : une sauvegarde, une restauration ou une longue vidéo qui se chiffre ne se touchent pas du doigt, et le sélecteur de fichiers du système passe l'application en arrière-plan. Il se coupe aussi entièrement dans les réglages : le chiffrement reste, mais la clé se charge alors sans preuve d'identité, et l'écran le dit avant de l'accepter. Au verrouillage, les clés sont oubliées, et leurs octets écrasés avant d'être lâchés plutôt que laissés au ramasse-miettes. L'aperçu du multitâche est masqué, les captures d'écran bloquées, et la sauvegarde automatique d'Android refusée : elle recopierait la base chiffrée sur des serveurs qui ne sont pas les tiens.

<img src="docs/sections/s07.png" alt="07 Vidéos et sauvegardes" width="100%">

Une vidéo pèse cent fois une photo. La chiffrer d'un bloc demandait de la tenir entière en mémoire, et une sauvegarde qui l'emportait devait tenir en mémoire toutes les vidéos à la fois. Les deux passent donc par un flux chiffré par morceaux d'un mégaoctet, écrit et relu sur le disque.

<img src="docs/schemas/flux.svg" alt="Une vidéo est découpée en morceaux d'un mégaoctet. Chacun est chiffré à part, avec son nonce et son étiquette, et authentifie son rang et le fait d'être le dernier. Deux morceaux intervertis ne se relisent pas : la lecture est refusée." width="100%">

Chaque morceau authentifie son rang et le fait d'être le dernier, sans les écrire : ils entrent dans le calcul de l'étiquette. Intervertir deux morceaux, en retirer un ou couper la fin du fichier fait échouer la lecture au lieu de rendre une vidéo amputée sans rien dire. L'AES passe par le chiffrement d'Android, qui utilise les instructions du processeur : en Dart pur, cent mégaoctets prenaient une demi-minute.

Un téléphone filme en 1080p ou en 4K à des débits pensés pour un grand écran. À l'import, une vidéo lourde est réencodée par Media3 sur l'encodeur matériel : H.264, 720 points sur le petit côté, 2,5 Mb/s. Une vidéo de 20 Mo en pèse environ 3. Elle n'est gardée allégée que si elle gagne au moins un dixième.

<img src="docs/schemas/allegement.svg" alt="Une vidéo de 20 Mo filmée en 1080p est réencodée par Media3 sur l'encodeur du téléphone : H.264, 720 points sur le petit côté, 2,5 Mb/s. Elle ressort à 3 Mo et entre au coffre, chiffrée par morceaux. La version allégée n'est gardée que si elle gagne au moins un dixième." width="100%">

Pour être lue, une vidéo est déchiffrée dans le cache privé de l'application, parce que le lecteur du système a besoin d'un fichier. La copie est effacée à la fermeture du lecteur, au verrouillage, et au lancement suivant si l'application a été tuée en pleine lecture. Un bouton de la visionneuse range une photo ou une vidéo dans la galerie du téléphone, sous Images ou Films, dossier BodyCount : en clair, puisque c'est tout l'objet du geste, et le message le rappelle.

Une restauration ne touche à rien avant d'avoir tout vérifié. Le fichier est lu deux fois : la première pour déchiffrer chaque morceau et le jeter, la seconde pour ranger les médias sous de nouveaux noms. Une phrase fausse s'arrête au premier morceau, un octet abîmé au sien, et dans les deux cas les fiches du téléphone sont intactes.

<img src="docs/schemas/restauration.svg" alt="La restauration lit la sauvegarde deux fois. Au premier passage, chaque morceau est déchiffré et vérifié, puis jeté. Au second, les médias entrent dans le coffre. Les fiches ne sont remplacées qu'à la fin : jusque-là, rien n'a été touché." width="100%">

L'export propose d'enregistrer le fichier dans un dossier avant de le partager : avec des vidéos, une sauvegarde dépasse vite ce que la plupart des applications acceptent. Le partage passe par une URI temporaire limitée au seul dossier des sauvegardes. Quand la dernière sauvegarde a plus d'un mois, ou qu'il n'y en a jamais eu, un bandeau le dit en haut du répertoire. Les sauvegardes de l'ancien format, un ZIP chiffré d'un bloc, se relisent toujours.

<img src="docs/sections/s08.png" alt="08 La carte, sans tuiles" width="100%">

Une carte à tuiles enverrait à un serveur, à chaque déplacement du doigt, la liste exacte des endroits regardés. Pour une application dont toute la promesse est que rien ne sort du téléphone, c'était la seule chose à ne pas faire. La France est donc embarquée.

<img src="docs/schemas/carte.png" alt="Données ouvertes : le trait de côte et les limites de départements en GeoJSON, 1,2 Mo de texte. Compactage : chaque point sur quatre octets, quantifié au 1/2000e de degré soit cinquante mètres, 45 853 points pour 180 Ko. Cadrage : la vue se cale sur les villes présentes, avec un cadre minimum pour qu'on voie toujours assez de côte. Dessin : la terre est peinte une fois et confiée au compositeur, seules les pastilles et les ondes sont redessinées." width="100%">

La carte se pince pour zoomer jusqu'à vingt fois, se traîne pour se déplacer, et la règle se regradue toute seule. Elle s'ouvre cadrée sur les villes qui font les deux tiers des rencontres, donc sur le vrai cœur d'activité plutôt que sur le pays entier.

Aucune pastille n'est déplacée d'un pixel : à l'échelle d'un pays, écarter un point de quarante points le déplace de cent kilomètres. Quand deux villes sont trop proches pour tenir côte à côte, elles se réunissent en une bulle qui porte la somme, et qui se scinde dès qu'on s'approche assez. Vannes et Auray sont à dix-sept kilomètres : aucun placement malin n'y change quoi que ce soit, c'est de la géographie.

Les villes viennent du référentiel officiel des communes, embarqué lui aussi : les 34 836 communes de métropole et de Corse, du plus petit village à Paris, 420 Ko une fois compressées dans l'APK. `tool/communes.mjs` le reconstruit depuis geo.api.gouv.fr ; c'est le seul endroit du projet qui touche au réseau, et il tourne sur la machine du développeur, pas sur le téléphone.

<img src="docs/schemas/villes.svg" alt="Une ville saisie passe par quatre étapes : le nom exact, un début de nom, une faute de frappe d'une ou deux lettres, un nom de ville suivi d'un quartier. La première qui répond l'emporte, et la commune la plus peuplée à chaque étape. Locmariaquer, Plougastel, Locmariaqer et Vannes centre tombent en France ; Londres reste hors de la carte, dans le classement des lieux." width="100%">

Tout ce qui est en France est posé. Le nom exact d'abord, en ignorant accents, tirets et « St » ; puis un début de nom, « Plougastel » pour Plougastel-Daoulas ; puis une faute d'une ou deux lettres ; puis un nom de commune suivi d'un quartier. À chaque étape la plus peuplée l'emporte, et un département entre parenthèses, « Saint-Denis (11) », départage les homonymes. La tolérance s'arrête aux villes : « chez lui » n'est pas un village à une lettre près, et un lieu de rencontre qui n'est pas une ville compte pour la ville de la fiche. L'étranger reste hors de la carte, qui ne dessine que la France, mais figure dans le classement des lieux.

Une rencontre peut aussi se poser à la main, à un point précis. Sans tuiles, il n'y a pas de rues à montrer : ce sont les communes voisines, avec leur nom, qui servent de repère. De quoi poser un point « entre Arradon et Séné », qui apparaît sur la carte des lieux une fois qu'on s'est approché.

<img src="docs/sections/s09.png" alt="09 Le calendrier" width="100%">

La question qu'on se pose le plus souvent n'est pas « combien », mais « quand » : c'était quel soir, il y a combien de temps, est-ce que ça a été une bonne période. Une liste chronologique y répond mal passé quelques dizaines d'entrées : il faut défiler et compter.

Le calendrier y répond d'un coup d'œil. Un mois tient sur sept colonnes : les soirs pleins, les semaines vides et les séries se lisent sans compter. Un jour vide n'est qu'un chiffre effacé ; un jour plein porte un disque, doré quand la soirée a rapporté. On tape dessus pour n'avoir que lui dans la liste en dessous.

Sous chaque jour, jusqu'à trois signes disent ce qu'il a eu de remarquable, du plus rare au plus banal : le meilleur montant de l'année avant les cent euros, les cent euros avant un simple billet, la meilleure note du mois avant un cinq sur cinq. Vingt-cinq signes en tout, tous déduits de ce que l'application enregistre déjà, aucun à saisir en plus. Une légende accessible depuis l'en-tête dit précisément ce qui déclenche chacun : pas « une bonne soirée » mais « une note de cinq sur cinq », pour qu'on sache quoi saisir si on veut le voir apparaître.

Toujours six semaines affichées, même quand le mois n'en occupe que cinq : une grille dont la hauteur dépend du mois fait sauter tout l'écran quand on le feuillette.

<img src="docs/sections/s10.png" alt="10 Modèle de confidentialité" width="100%">

<img src="docs/schemas/confidentialite.png" alt="Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique. La base est chiffrée par SQLCipher, sa clé vit dans le Keystore et n'est chargée qu'après l'empreinte. Chaque photo et chaque vidéo est chiffrée en AES-GCM et reste absente de la galerie du téléphone. L'aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée. Une restauration vérifie toute la sauvegarde avant d'effacer quoi que ce soit. Ce qui ne l'est pas : une fois l'application ouverte tout est lisible à l'écran, l'empreinte protège l'accès pas ton épaule. Une sauvegarde exportée voyage, elle vaut ce que vaut ta phrase de passe. Perdre le téléphone c'est perdre les données, la clé ne se recopie nulle part. L'empreinte se coupe dans les réglages. Pour être lue, une vidéo est déchiffrée dans le cache privé le temps de la lecture." width="100%">

<img src="docs/sections/s11.png" alt="11 Les tests" width="100%">

Ce qui se casse sans bruit est ce qui touche au disque : l'ouverture de la base, ses migrations, le chiffrement, la sauvegarde. Or SQLCipher, le Keystore et l'AES natif n'existent que sur Android. Les tests tournent donc sur un émulateur, avec les vraies bibliothèques, et non contre des imitations qui passeraient là où l'application échoue. Six d'entre eux pilotent l'application entière, au doigt, d'un écran à l'autre.

```bash
flutter test integration_test -d emulator-5554
```

Ils détruisent les données et la clé de l'application qu'ils visent : à lancer sur un émulateur, jamais sur le téléphone qui porte le vrai journal.

<img src="docs/schemas/tests.png" alt="Base : huit ouvertures simultanées rendent une seule connexion, une écriture se relit partout, une base sans version est réparée pas détruite. Flux chiffré : aller-retour de zéro octet à trois mégaoctets, tronqué interverti ou modifié d'un octet refusé, le natif relit le Dart et l'inverse. Sauvegarde : tout revient, et une phrase fausse, un fichier abîmé ou étranger ne font rien bouger. Coffre et communes : une vidéo se relit à l'identique, un village, une faute, un homonyme placés, Londres et chez lui non. Parcours d'écrans : l'application entière pilotée au doigt, de la ville qui change au rappel de sauvegarde. Sur appareil : les vingt-quatre tests tournent sur un émulateur." width="100%">

Ils ont servi dès leur première exécution. Ceux des données ont trouvé une marque de fin de sauvegarde écrite sur onze octets et lue sur un : aucune restauration n'aurait abouti. Ceux des écrans ont trouvé une rangée de chiffres qui débordait de sa hauteur fixe sur la fiche.

<img src="docs/sections/s12.png" alt="12 Sans Internet" width="100%">

« Aucune requête réseau » s'écrit facilement. Ici, ce n'est pas une promesse du code mais une règle d'Android : l'application ne demande pas la permission `INTERNET`, et sans elle le système refuse d'ouvrir la moindre connexion. Un bug, une bibliothèque trop bavarde, une dépendance piégée à la prochaine mise à jour : tout se heurte au même mur, qui n'est pas dans l'application et qu'elle ne peut pas franchir.

Ça se vérifie sur l'APK lui-même, sans lire une ligne de code :

```bash
aapt2 dump permissions app-arm64-v8a-release.apk
```

La liste est courte : l'empreinte, sous son nom actuel et son ancien, puis `WAKE_LOCK` et `ACCESS_NETWORK_STATE`, qu'ajoutent des bibliothèques. La première empêche le téléphone de s'endormir en plein travail, la seconde dit si le réseau est là, sans permettre de s'en servir.

Restent quatre sorties, et aucune ne s'ouvre seule. Chacune attend un doigt, et passe la main à une autre application, qui répond ensuite de ce qu'elle en fait :

<img src="docs/schemas/reseau.svg" alt="BodyCount ne demande pas la permission INTERNET : chaque tentative de connexion s'écrase sur un mur tenu par Android, et Internet n'est jamais atteint. Il ne reste que quatre sorties, qui s'ouvrent chacune sur un toucher et passent la main à une autre application : l'adresse vers l'appli de cartes, le numéro vers le téléphone, la sauvegarde chiffrée là où tu la poses, et une copie en clair vers la galerie." width="100%">

La dernière est la seule à laisser une trace en clair : une photo téléchargée devient une photo comme les autres, visible de la galerie et de tout ce qui la lit. C'est le prix de « je veux la garder ailleurs », et l'application ne le paie qu'à la demande.

<img src="docs/sections/s13.png" alt="13 Avertissement" width="100%">

Ce dépôt est un projet personnel, pas un produit de sécurité. Le chiffrement s'appuie sur des primitives éprouvées et sur le Keystore d'Android, mais l'assemblage, lui, n'a été relu par personne d'autre que moi. Si tu comptes y mettre des données dont la fuite te coûterait quelque chose, lis le code avant, ou ne le fais pas.

Le jeu d'essai n'existe que dans une version de travail, compilée avec `--dart-define=ESSAIS=true`. Ses visages ne font pas partie du dépôt : ils se posent sur le téléphone, dans le dossier propre à l'application, avec `adb push assets/demo/. /sdcard/Android/data/com.bodycount.bodycount/files/demo/`. Sans eux les dix-huit fiches se créent quand même, simplement sans photo : le générateur se passe de chaque image absente.

<img src="docs/sections/s14.png" alt="14 Licence et auteur" width="100%">

BodyCount est conçu et développé par **Tristan Joncour** ([@Cybertrist](https://github.com/Cybertrist)), élève ingénieur en cyberdéfense à l'ENSIBS, pour son propre usage d'abord : c'est l'application qu'il voulait avoir sur son téléphone, et qui n'existait pas.

Le code est publié sous licence [MIT](LICENSE) : libre de le lire, de le reprendre et de le modifier, à condition de garder la mention de copyright. La géométrie de la France et le référentiel des communes viennent de données ouvertes ; la police Chakra Petch est sous licence SIL Open Font ; l'icône d'empreinte des schémas vient de Material Design, sous licence Apache 2.0.

---

<sub>Les images de cette page ne sortent d'aucun logiciel de dessin : ce sont des pages HTML que Chrome capture, et six SVG animés. Les captures d'écran viennent d'un émulateur piloté par script, rognées de leurs barres par <code>rogner.js</code>. Tout est dans <a href="docs/tools/">docs/tools</a>, et <code>bash docs/tools/tout.sh</code> refait tout, dans les deux langues, aperçu social compris.</sub>
