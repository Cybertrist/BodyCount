<div align="center">

<img src="docs/banniere.png" alt="BodyCount" width="100%">


**Journal personnel chiffré, hors ligne, sur Android.**

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?style=flat-square&logo=dart&logoColor=white)](https://dart.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Statut](https://img.shields.io/badge/Statut-en%20cours-D29922?style=flat-square)](#feuille-de-route)

</div>

---

> **Projet en cours.** L'application est fonctionnelle mais pas terminée, voir la [feuille de route](#feuille-de-route).

Une application de suivi personnel qui ne parle à aucun serveur. Tout vit dans un SQLite sur le téléphone, derrière une authentification biométrique, et n'en sort que si on demande explicitement un export.

Le projet m'intéressait surtout pour la contrainte : construire quelque chose d'utile sur des données sensibles **sans** backend, sans compte, sans télémétrie. Toute la conception découle de là.

## Fonctionnalités

- **Verrouillage biométrique** à l'ouverture : empreinte ou reconnaissance faciale
- **Répertoire de contacts** avec photos, notes, étiquettes et évaluations
- **Statistiques** : graphiques mensuels, répartitions, séries, classements
- **Carte** des rencontres, sur fond OpenStreetMap
- **Frise chronologique** de l'ensemble des entrées
- **Galerie privée** : les photos vivent dans le stockage applicatif, invisibles de la galerie du téléphone
- **Export / import** en JSON ou ZIP, pour garder la main sur ses données

## Stack

| Couche | Choix |
|:--|:--|
| Framework | Flutter 3.x (Dart) |
| Base | SQLite via `sqflite` |
| État | Riverpod |
| Navigation | GoRouter |
| Graphiques | `fl_chart` |
| Cartographie | `flutter_map` + OpenStreetMap |
| Biométrie | `local_auth` |
| Design | Material 3, thème sombre |

### Palette

| Élément | Couleur |
|:--|:--|
| Primaire | `#FF6B35` |
| Accent | `#E84530` |
| Fond | `#0A0A0A` |
| Surface | `#141414` |
| Cartes | `#1C1C1C` |
| Texte | `#F5F5F5` |

Typographie : **Poppins** pour les titres, **Inter** pour le corps.

## Démarrage

Nécessite le SDK Flutter 3.x et un appareil ou émulateur Android.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

## Structure

```
lib/
├── main.dart
├── app.dart
├── config/       Thème et routage
├── models/       Contact, Encounter, Photo
├── database/     DAO SQLite
├── providers/    État Riverpod
├── screens/      Écrans
├── widgets/      Composants réutilisables
└── utils/        Images, export, dates
```

## Modèle de confidentialité

C'est le point central du projet, donc autant être précis sur ce qui est garanti et ce qui ne l'est pas.

**Ce qui est vrai :**
- aucune requête réseau, aucun compte, aucune analytique ;
- la base SQLite et les photos restent dans le répertoire privé de l'application ;
- les photos ne sont pas indexées par le `MediaStore`, donc absentes de la galerie ;
- l'ouverture exige une authentification biométrique.

**Ce qui ne l'est pas :**
- sur un téléphone **rooté**, le répertoire privé de l'application est lisible. La biométrie verrouille l'interface, elle ne chiffre pas la base ;
- une sauvegarde Android automatique peut emporter les données hors de l'appareil si elle n'est pas désactivée ;
- un export JSON ou ZIP est en clair, c'est à vous de le stocker correctement.

Un chiffrement réel de la base (SQLCipher, clé dérivée du Keystore Android) est la suite logique et n'est pas encore en place.

## Feuille de route

Ce qui reste avant de considérer l'application finie :

- [ ] **Chiffrement de la base** : SQLCipher, clé dérivée du Keystore Android, déverrouillage lié à la biométrie
- [ ] **Chiffrement des photos** au repos, pas seulement leur isolation dans le stockage applicatif
- [ ] **Désactiver la sauvegarde Android automatique** (`allowBackup="false"`), qui peut aujourd'hui exfiltrer la base
- [ ] **Export chiffré** avec mot de passe, plutôt que du JSON en clair
- [ ] Finir les écrans de statistiques et la vue carte
- [ ] Tests sur les DAO et la logique d'export

## Avertissement

L'application enregistre des données intimes concernant des personnes réelles, qui n'ont pas consenti à y figurer. Le RGPD prévoit une exemption pour les usages strictement personnels et domestiques, mais elle tombe dès que les données sont partagées. À utiliser avec discernement, et à ne pas diffuser.

---

<sub>Projet personnel · Tristan Joncour</sub>
