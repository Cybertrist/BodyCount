<div align="center">

<p>
  <img src="docs/langues/fr-on.png" alt="Français, page affichée" width="150" />
  <a href="README.en.md"><img src="docs/langues/en-off.png" alt="Read this page in English" width="150" /></a>
</p>

<img src="docs/banniere.png" alt="BodyCount, journal personnel chiffré et hors ligne sur Android" width="100%">

</div>

**Journal personnel chiffré, hors ligne, sur Android.**

> **Projet en cours.** L'application tourne sur un appareil réel, tous les écrans sont là, mais il reste des choses à brancher. La feuille de route est plus bas.

Une application de suivi personnel qui ne parle à aucun serveur. Tout vit dans un SQLite chiffré sur le téléphone, derrière une empreinte qui ne déverrouille pas un écran mais la clé elle même, et n'en sort que si on demande explicitement une sauvegarde, chiffrée elle aussi.

Le projet m'intéressait surtout pour la contrainte : construire quelque chose d'utile sur des données sensibles **sans** backend, sans compte, sans télémétrie. Toute la conception découle de là, y compris la carte, qui dessine la France à partir d'une géométrie embarquée plutôt que d'aller chercher des tuiles.

<img src="docs/sections/s01.png" alt="01 Fonctionnalités" width="100%">

<img src="docs/schemas/fonctionnalites.png" alt="Verrouillage biométrique : l'empreinte ne déverrouille pas un écran, elle charge la clé. Répertoire : photos, carnet de notes daté, étiquettes libres, genre et rôle, notes sur cinq. Statistiques : le total de l'année, le rythme mois par mois, le podium et la répartition des rôles. Carte de France : la vraie géométrie du pays, côtes et îles comprises, embarquée dans l'application. Calendrier : toutes les rencontres sur un seul axe, regroupées par mois. Galerie privée : chaque photo est chiffrée à part, invisible de la galerie du téléphone. Export chiffré : une archive protégée par une phrase de passe. Trois formats d'écran : téléphone, écran de couverture et écran déplié." width="100%">

<img src="docs/sections/s02.png" alt="02 Les écrans" width="100%">

<img src="docs/schemas/ecrans.png" alt="Verrou : le premier écran, et le seul tant que la clé n'est pas chargée. Fiches : la grille des personnes, recherche, cinq tris, filtre par ville. Fiche : la photo en haut qui se replie au défilement, les étiquettes, le carnet, les rencontres. Stats : le total de l'année, le rythme en douze barres, le podium, la répartition des rôles en anneau. Carte : la France dessinée à partir de sa vraie géométrie, le classement des lieux, les visages vus dans la ville principale. Calendrier : toutes les rencontres groupées par mois. Formulaires : créer une fiche, enregistrer une rencontre, écrire une note, gérer les étiquettes et les photos. Réglages : délai de verrouillage, masquage dans le multitâche, export chiffré, jeu d'essai, effacement total." width="100%">

<img src="docs/schemas/captures.png" alt="Quatre écrans de l'application. La carte : les villes regroupées en pastilles chiffrées sur la Bretagne, la France tracée par l'application elle-même, le classement des lieux en dessous. Le calendrier : septembre 2026 sur sept colonnes, les jours occupés portent un disque et jusqu'à trois signes, le 23 en doré parce que la soirée a rapporté. La légende : ce que veut dire chaque signe, rangé par familles, argent, note, qui, rythme. Les réglages : l'empreinte à l'ouverture, le masquage dans le multitâche, le verrouillage automatique, et ce qui reste sur le téléphone." width="100%">

Ces quatre là ne montrent aucun visage, et c'est la raison pour laquelle ce sont ceux qui sont ici : le jeu d'essai du dépôt est fait de portraits qui n'ont rien à faire dans une page publique. Ils sont d'ailleurs les seuls fichiers du projet à rester hors du dépôt.

<img src="docs/sections/s03.png" alt="03 La stack" width="100%">

<img src="docs/schemas/stack.png" alt="Flutter 3.x le framework en Dart. sqflite_sqlcipher pour SQLite chiffré par SQLCipher. cryptography pour AES-GCM, HKDF et PBKDF2. flutter_secure_storage pour la clé maîtresse dans le Keystore Android. local_auth pour l'empreinte qui déverrouille la clé. flutter_riverpod pour l'état et l'invalidation après écriture. go_router pour la navigation et la garde du verrou. image_picker pour les photos chiffrées dès leur arrivée. path_provider pour les dossiers privés. archive et share_plus pour la sauvegarde. uuid pour le nom des fichiers du coffre. intl pour les dates." width="100%">

Nécessite le SDK Flutter 3.x et un appareil ou un émulateur Android.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

Pour une version installable, `flutter build apk --release --split-per-abi`. Le découpage par architecture n'est pas de la coquetterie : SQLCipher embarque une bibliothèque native par ABI, et sans lui l'APK pèse un tiers de plus pour rien.

<img src="docs/sections/s04.png" alt="04 Architecture" width="100%">

Cinq couches, et une règle : une couche ne connaît jamais celle du dessus. Un écran ne voit pas SQLite, un dépôt ne voit pas Riverpod, et rien ne lit un fichier du coffre sans passer par le trousseau.

<img src="docs/schemas/couches.png" alt="Écrans : ne lisent que des providers, n'écrivent que par des dépôts, aucun SQL. Providers : Riverpod, une écriture invalide tout ce qui en dépend d'un seul appel. Dépôts : le seul endroit où du SQL est écrit, une requête groupée plutôt que N+1. Sécurité : trousseau, coffre à photos, verrou, rien ne passe outre pour lire un fichier. Disque : SQLite chiffré, et un dossier de photos dont chaque fichier l'est aussi." width="100%">

Six tables, schéma v5. `personnes` est le pivot : tout ce qui s'y rattache part avec elle, et c'est le schéma qui le garantit, pas une boucle de suppression écrite à la main.

<img src="docs/schemas/modele.png" alt="Six tables, schéma v5. personnes porte prénom, âge, ville, genre, rôle, source, téléphone et adresse. rencontres porte date, lieu, note en demi-points sur dix et montant gagné en centimes, rattachée à une personne en cascade. notes porte un texte libre daté, rattachée à une personne et facultativement à une rencontre. photos porte un chemin dans le coffre, même rattachement. etiquettes porte une clé normalisée unique, reliée aux personnes et aux rencontres par deux tables de liaison." width="100%">

<img src="docs/schemas/arborescence.png" alt="Arborescence de lib : main.dart le point d'entrée, app.dart l'application son thème et le reverrouillage, config thème routage et formats d'écran, domaine les modèles, donnees le schéma chiffré les dépôts et les statistiques dont coordonnees.dart et geometrie_france.dart, security trousseau coffre à photos verrou et protection écran, providers l'état en Riverpod, ecrans les dix écrans, widgets les composants réutilisables dont la carte, utils images sauvegarde chiffrée et dates." width="100%">

<img src="docs/sections/s05.png" alt="05 Le chiffrement" width="100%">

L'empreinte ne déverrouille pas un écran : elle charge la clé maîtresse depuis le Keystore. Tant qu'elle n'a pas été donnée, la base est un fichier illisible et les photos aussi. Deux clés en sont dérivées par HKDF, l'une pour SQLCipher, l'autre pour les photos, et aucune n'existe en mémoire avant.

<img src="docs/schemas/chiffrement.svg" alt="L'empreinte charge la clé maîtresse depuis le Keystore Android. HKDF-SHA256 en dérive deux clés : le mot de passe SQLCipher qui ouvre le journal chiffré, et la clé AES-GCM qui ouvre le coffre à photos." width="100%">

Chaque photo est un fichier à part, chiffré en AES-GCM, nommé par un UUID qui ne dit rien de son contenu. Une sauvegarde exportée suit le même principe, sauf que sa clé vient de ta phrase de passe plutôt que du Keystore : sans elle, l'archive ne se relit nulle part, y compris sur le téléphone qui l'a produite.

<img src="docs/schemas/formats.png" alt="Une photo dans le coffre : marque BCX1 sur 4 octets, nonce sur 12 octets, contenu chiffré en AES-GCM de longueur variable, MAC d'authentification sur 16 octets. Clé dérivée du trousseau par HKDF, nom de fichier en UUID. Une sauvegarde exportée : marque BCEX1 sur 5 octets, sel sur 16 octets, nonce sur 12 octets, contenu chiffré, MAC sur 16 octets. Clé dérivée de la phrase de passe par PBKDF2-HMAC-SHA256, 210 000 tours, sel renouvelé à chaque export." width="100%">

Le verrou se referme sans geste à l'écran, ou au retour d'arrière-plan, après un délai réglable. Il se coupe aussi entièrement dans les réglages : le chiffrement reste, mais la clé se charge alors sans preuve d'identité, et l'écran le dit avant de l'accepter. Les clés sont alors oubliées, et leurs octets écrasés avant d'être lâchés plutôt que laissés au ramasse-miettes. L'aperçu du multitâche est masqué, les captures d'écran bloquées, et la sauvegarde automatique d'Android refusée : elle recopierait la base chiffrée sur des serveurs qui ne sont pas les tiens.

<img src="docs/sections/s06.png" alt="06 La carte, sans tuiles" width="100%">

Une carte à tuiles enverrait à un serveur, à chaque déplacement du doigt, la liste exacte des endroits regardés. Pour une application dont toute la promesse est que rien ne sort du téléphone, c'était la seule chose à ne pas faire. La France est donc embarquée.

<img src="docs/schemas/carte.png" alt="Données ouvertes : le trait de côte et les limites de départements en GeoJSON, 1,2 Mo de texte. Compactage : chaque point sur quatre octets, quantifié au 1/2000e de degré soit cinquante mètres, 45 853 points pour 180 Ko. Cadrage : la vue se cale sur les villes présentes, avec un cadre minimum pour qu'on voie toujours assez de côte. Dessin : la terre est peinte une fois et confiée au compositeur, seules les pastilles et les ondes sont redessinées." width="100%">

La carte se pince pour zoomer jusqu'à vingt fois, se traîne pour se déplacer, et la règle se regradue toute seule. Elle s'ouvre cadrée sur les villes qui font les deux tiers des rencontres, donc sur le vrai cœur d'activité plutôt que sur le pays entier.

Aucune pastille n'est déplacée d'un pixel : à l'échelle d'un pays, écarter un point de quarante points le déplace de cent kilomètres. Quand deux villes sont trop proches pour tenir côte à côte, elles se réunissent en une bulle qui porte la somme, et qui se scinde dès qu'on s'approche assez. Vannes et Auray sont à dix-sept kilomètres : aucun placement malin n'y change quoi que ce soit, c'est de la géographie.

À fort grossissement, seuls les contours qui touchent la fenêtre sont dessinés. Payer les quarante-cinq mille points à chaque image faisait tomber l'affichage à quelques images par seconde, et le halo de côte, qui était un flou de masque, obligeait le moteur à rendre le pays dans une couche à part avant de la flouter.

Les villes viennent du référentiel officiel des communes, embarqué lui aussi : les 34 836 communes de métropole et de Corse, du plus petit village à Paris, 420 Ko une fois compressées dans l'APK. `tool/communes.mjs` le reconstruit depuis geo.api.gouv.fr, c'est le seul endroit du projet qui touche au réseau, et il tourne sur la machine du développeur, pas sur le téléphone. Tout ce qui est en France est posé : une faute de frappe, un nom coupé ou suivi d'un quartier tombent sur la commune la plus proche par le nom, et un département entre parenthèses, « Saint-Denis (11) », départage les homonymes. Un lieu de rencontre qui n'est pas une ville, « chez lui », compte pour la ville de la fiche. L'étranger reste hors de la carte, qui ne dessine que la France.

<img src="docs/sections/s07.png" alt="07 Le calendrier" width="100%">

L'écran s'appelait « Frise », et c'en était une : une seule longue liste, du plus récent au plus ancien. Elle répondait à « c'était quand » à condition de défiler jusqu'à la bonne date, ce qui devient absurde passé quelques dizaines d'entrées.

Un mois tient sur sept colonnes. Les soirs pleins, les semaines vides et les séries se lisent d'un coup, sans compter. Un jour vide n'est qu'un chiffre effacé ; un jour plein porte un disque, doré quand la soirée a rapporté. On tape dessus pour n'avoir que lui dans la liste en dessous.

Sous chaque jour, jusqu'à trois signes disent ce qu'il a eu de remarquable, du plus rare au plus banal : le meilleur montant de l'année avant les cent euros, les cent euros avant un simple billet, la meilleure note du mois avant un cinq sur cinq. Vingt-cinq signes en tout, tous déduits de ce que l'application enregistre déjà, aucun à saisir en plus. Une légende accessible depuis l'en-tête dit précisément ce qui déclenche chacun : pas « une bonne soirée » mais « une note de cinq sur cinq », pour qu'on sache quoi saisir si on veut le voir apparaître.

Toujours six semaines affichées, même quand le mois n'en occupe que cinq : une grille dont la hauteur dépend du mois fait sauter tout l'écran quand on le feuillette.

<img src="docs/sections/s08.png" alt="08 Modèle de confidentialité" width="100%">

<img src="docs/schemas/confidentialite.png" alt="Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique. La base est chiffrée par SQLCipher, sa clé vit dans le Keystore et n'est chargée qu'après l'empreinte. Chaque photo est chiffrée en AES-GCM et reste absente de la galerie du téléphone. L'aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée. Ce qui ne l'est pas : une fois l'application ouverte tout est lisible à l'écran, l'empreinte protège l'accès pas ton épaule. Une sauvegarde exportée voyage, elle est chiffrée par ta phrase de passe qui vaut ce que tu la fais valoir. Perdre le téléphone c'est perdre les données, la clé ne se recopie nulle part. Le code n'a pas été audité par un tiers." width="100%">

<img src="docs/schemas/palette.png" alt="Palette : primaire violet #A855F7, accent fuchsia #D946EF, fond #0B0616, surface #150C28, cartes #1A1030, texte #F6F2FF." width="100%">

<img src="docs/sections/s09.png" alt="09 Feuille de route" width="100%">

<img src="docs/schemas/feuille-de-route.png" alt="Restauration depuis un fichier : l'export chiffré existe, le sélecteur de fichier pour le relire reste à brancher. Tests : sur les dépôts, la migration de schéma et le chiffrement. Polices propres : Syne et Manrope, à embarquer dans les assets. Recherche par étiquette : le dépôt sait filtrer dessus, l'écran ne le propose pas encore. Modifier une rencontre : on peut en créer et en supprimer, pas encore en reprendre une. Villes hors de France : la table embarquée couvre la France et quelques capitales, au delà la ville est listée sous la carte." width="100%">

<img src="docs/sections/s10.png" alt="10 Avertissement" width="100%">

Ce dépôt est un projet personnel, pas un produit de sécurité. Le chiffrement s'appuie sur des primitives éprouvées et sur le Keystore d'Android, mais l'assemblage, lui, n'a été relu par personne d'autre que moi. Si tu comptes y mettre des données dont la fuite te coûterait quelque chose, lis le code avant, ou ne le fais pas.

Le jeu d'essai attend ses visages dans `assets/demo/`, qui ne fait pas partie du dépôt. Sans eux les dix-huit fiches se créent quand même, simplement sans photo : le générateur se passe de chaque image absente.

---

<sub>Les images de cette page ne sortent d'aucun logiciel de dessin : ce sont des pages HTML que Chrome capture, et un SVG animé. Les scripts sont dans <a href="docs/tools/">docs/tools</a>, et <code>bash docs/tools/tout.sh</code> les refait toutes, dans les deux langues.</sub>
