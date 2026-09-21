<div align="center">

<img src="docs/banniere.png" alt="BodyCount, journal personnel chiffré et hors ligne sur Android" width="100%">

</div>

**Journal personnel chiffré, hors ligne, sur Android.**

> **Projet en cours.** L'application est fonctionnelle mais pas terminée, voir la feuille de route plus bas.

Une application de suivi personnel qui ne parle à aucun serveur. Tout vit dans un SQLite sur le téléphone, derrière une authentification biométrique, et n'en sort que si on demande explicitement un export.

Le projet m'intéressait surtout pour la contrainte : construire quelque chose d'utile sur des données sensibles **sans** backend, sans compte, sans télémétrie. Toute la conception découle de là.

<img src="docs/sections/s01.png" alt="01 Fonctionnalités" width="100%">

<img src="docs/schemas/fonctionnalites.png" alt="Verrouillage biométrique : empreinte ou reconnaissance faciale exigée à l'ouverture. Répertoire de contacts : photos, notes, étiquettes et évaluations, rangées localement. Statistiques : graphiques mensuels, répartitions, séries et classements. Carte des rencontres, sur fond OpenStreetMap. Frise chronologique : l'ensemble des entrées sur un seul axe de temps. Galerie privée : les photos vivent dans le stockage applicatif, invisibles de la galerie du téléphone. Export et import en JSON ou en ZIP. Aucun serveur : pas de compte, pas de télémétrie, pas une seule requête réseau." width="100%">

<img src="docs/sections/s02.png" alt="02 Stack" width="100%">

<img src="docs/schemas/stack.png" alt="Flutter 3.x en Dart pour une application Android native. sqflite pour SQLite local, la seule base du projet. Riverpod pour la gestion d'état. GoRouter pour la navigation entre écrans. fl_chart pour les graphiques des statistiques. flutter_map pour la carte, sur fond OpenStreetMap. local_auth pour l'authentification biométrique. Material 3 pour le design, en thème sombre. Poppins et Inter pour les titres et le corps de texte." width="100%">

<img src="docs/schemas/palette.png" alt="Palette de l'application : primaire #FF6B35, accent #E84530, fond #0A0A0A, surface #141414, cartes #1C1C1C, texte #F5F5F5." width="100%">

<img src="docs/schemas/arborescence.png" alt="Arborescence de lib. main.dart : le point d'entrée. app.dart : l'application et son thème. config : thème et routage. models : Contact, Encounter, Photo. database : les DAO SQLite. providers : l'état, en Riverpod. screens : les écrans. widgets : les composants réutilisables. utils : images, export, dates." width="100%">

Nécessite le SDK Flutter 3.x et un appareil ou un émulateur Android.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

<img src="docs/sections/s03.png" alt="03 Modèle de confidentialité" width="100%">

C'est le point central du projet, donc autant être précis sur ce qui est garanti et ce qui ne l'est pas.

<img src="docs/schemas/confidentialite.png" alt="Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique ; la base SQLite et les photos restent dans le répertoire privé de l'application ; les photos ne sont pas indexées par le MediaStore, donc absentes de la galerie ; l'ouverture exige une authentification biométrique. Ce qui ne l'est pas : sur un téléphone rooté le répertoire privé est lisible, la biométrie verrouille l'interface mais ne chiffre pas la base ; une sauvegarde Android automatique peut emporter les données hors de l'appareil si elle n'est pas désactivée ; un export JSON ou ZIP part en clair ; le chiffrement réel de la base par SQLCipher et le Keystore n'est pas encore en place." width="100%">

La distinction compte. Une application qui promet la confidentialité et livre seulement un verrou d'interface fait plus de mal qu'une application qui n'a rien promis.

<img src="docs/sections/s04.png" alt="04 Feuille de route" width="100%">

<img src="docs/schemas/feuille-de-route.png" alt="Chiffrement de la base : SQLCipher, clé dérivée du Keystore Android, déverrouillage lié à la biométrie, c'est la pièce qui manque le plus. Chiffrement des photos au repos, et pas seulement leur isolation dans le stockage applicatif. Sauvegarde Android désactivée par allowBackup false, qui peut aujourd'hui emporter la base hors de l'appareil. Export chiffré protégé par mot de passe, plutôt que du JSON en clair. Écrans à finir : les statistiques et la vue carte ne sont pas terminées. Tests sur les DAO et la logique d'export." width="100%">

<img src="docs/sections/s05.png" alt="05 Avertissement" width="100%">

L'application enregistre des données intimes concernant des personnes réelles, qui n'ont pas consenti à y figurer. Le RGPD prévoit une exemption pour les usages strictement personnels et domestiques, mais elle tombe dès que les données sont partagées. À utiliser avec discernement, et à ne pas diffuser.

---

<sub>Projet personnel · Tristan Joncour</sub>
