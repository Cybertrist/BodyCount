# Prompt pour Claude Code — Application "BodyCount"

## Contexte

Crée une application mobile Android avec **Flutter (Dart)** appelée **BodyCount**. C'est un répertoire personnel et privé de rencontres avec des fonctionnalités de statistiques avancées. L'app doit être moderne, fluide, avec un design sombre et punchy : fond noir profond avec des accents orange vif (#FF6B35). L'ambiance doit être jeune, directe, un peu provocante mais clean dans le design.

---

## Stack technique

- **Framework** : Flutter 3.x (Dart)
- **Base de données locale** : SQLite via `sqflite` + `path_provider`
- **State management** : Riverpod (ou Provider)
- **Navigation** : GoRouter
- **UI** : Material Design 3, thème sombre personnalisé
- **Graphiques/Stats** : `fl_chart`
- **Carte** : `flutter_map` + OpenStreetMap (gratuit, pas besoin d'API key)
- **Sécurité** : `local_auth` (biométrie empreinte/Face)
- **Stockage images** : dossier privé app (`getApplicationDocumentsDirectory`) — les images ne doivent PAS apparaître dans la galerie du téléphone
- **Date picker** : support français (intl)

---

## Fonctionnalités détaillées

### 1. Écran de verrouillage (Lock Screen)
- Au lancement, demander l'authentification biométrique (empreinte digitale ou face)
- Si biométrie indisponible, fallback sur PIN à 4 chiffres
- L'app doit se re-verrouiller quand elle passe en arrière-plan

### 2. Dashboard / Accueil
- Résumé rapide : nombre total de rencontres, rencontre la plus récente, moyenne par mois
- Graphique en barres : nombre de rencontres par mois (12 derniers mois)
- Graphique circulaire : répartition par évaluation (1-5 étoiles)
- Accès rapide aux dernières fiches ajoutées (carrousel horizontal)
- Bouton FAB "+" pour ajouter une nouvelle rencontre

### 3. Répertoire / Annuaire (Liste des contacts)
- Liste scrollable avec photo miniature, pseudo, date de dernière rencontre, évaluation (étoiles)
- Barre de recherche en haut
- Filtres : par évaluation, par période, par tags/catégories
- Tri : par date (récent/ancien), par nom, par évaluation
- Vue grille (galerie) ou vue liste (toggle)

### 4. Fiche Contact (Détail)
- **En-tête** : Photo principale grande, pseudo, âge (optionnel)
- **Infos générales** :
  - Pseudo / prénom
  - Plateforme d'origine (Grindr, Scruff, Tinder, autre — dropdown)
  - Lien vers profil (URL, ouvrable dans le navigateur)
  - Âge, taille, description physique (champs optionnels)
  - Tags personnalisés (ex: "régulier", "one-shot", "à revoir", etc.)
- **Historique des rencontres** : liste des dates avec pour chacune :
  - Date et heure
  - Lieu (texte libre + coordonnées GPS optionnelles pour la carte)
  - Notes / commentaire sur la rencontre
  - Évaluation (1 à 5 étoiles)
- **Galerie photos** : grille de photos associées à ce contact
  - Ajout depuis la galerie du téléphone ou appareil photo
  - Visualisation plein écran avec swipe
  - Les photos sont copiées dans le stockage privé de l'app
- **Actions** : modifier, supprimer (avec confirmation), partager la fiche (export texte uniquement, sans photos)

### 5. Ajout / Édition de rencontre
- Formulaire en étapes ou scroll unique
- Champs : pseudo, plateforme, lien, date, lieu, notes, évaluation, tags, photos
- Auto-complétion du pseudo si contact existant (pour ajouter une nouvelle rencontre à un contact déjà répertorié)
- Possibilité d'ajouter plusieurs photos d'un coup

### 6. Statistiques avancées
- **Vue stats complète** accessible depuis la bottom nav :
  - Nombre total de rencontres (all time)
  - Nombre de personnes différentes
  - Graphique barres : rencontres par mois (sélecteur d'année)
  - Graphique barres : rencontres par jour de la semaine
  - Graphique ligne : évolution cumulative dans le temps
  - Évaluation moyenne globale
  - Top 5 des contacts les plus rencontrés
  - Répartition par plateforme (pie chart)
  - Streak : plus longue série de jours consécutifs avec rencontre
  - Record : mois avec le plus de rencontres
- Les stats doivent être visuelles et animées

### 7. Carte des rencontres
- Carte OpenStreetMap affichant des marqueurs pour chaque rencontre ayant un lieu renseigné
- Clic sur un marqueur → popup avec pseudo, date, évaluation
- Possibilité de filtrer par période

### 8. Timeline / Historique
- Vue chronologique (type feed/journal)
- Chaque entrée montre : date, photo miniature, pseudo, lieu, extrait de la note
- Scroll infini avec lazy loading
- Filtre par année/mois

### 9. Paramètres
- Activer/désactiver biométrie
- Exporter les données (JSON, sans photos ou avec photos en ZIP)
- Importer des données (JSON)
- Supprimer toutes les données (avec double confirmation)
- À propos / version

---

## Design & UI/UX

- **Thème** : Dark mode obligatoire, fond noir profond (#0A0A0A) avec accents orange vif (#FF6B35). Touches de rouge-orangé (#E84530) pour les éléments secondaires. Pas de gris fade — contraste fort.
- **Typo** : Google Fonts — Poppins (titres bold) + Inter (body)
- **Cards** avec coins arrondis (16px), fond légèrement relevé (#141414), bordures subtiles
- **Animations** : transitions fluides entre les pages (Hero animations pour les photos), animations sur les graphiques, micro-animations sur les boutons
- **Bottom Navigation** : 4 onglets — Accueil (Dashboard), Répertoire, Stats, Carte — avec icônes orange quand actif
- **Design responsive** : s'adapter aux différentes tailles d'écran Android
- **Icônes** : Material Symbols Rounded
- **Vibe générale** : jeune, moderne, un peu provocant mais propre. Penser Grindr × Spotify en termes de polish

---

## Structure du projet

```
lib/
├── main.dart
├── app.dart                          # MaterialApp, thème, routing
├── config/
│   ├── theme.dart                    # Thème dark, couleurs, typo
│   └── routes.dart                   # GoRouter config
├── models/
│   ├── contact.dart                  # Modèle Contact
│   ├── encounter.dart                # Modèle Rencontre
│   └── photo.dart                    # Modèle Photo
├── database/
│   ├── database_helper.dart          # Init SQLite, migrations
│   ├── contact_dao.dart              # CRUD contacts
│   ├── encounter_dao.dart            # CRUD rencontres
│   └── photo_dao.dart                # CRUD photos
├── providers/
│   ├── contacts_provider.dart
│   ├── encounters_provider.dart
│   ├── stats_provider.dart
│   └── auth_provider.dart
├── screens/
│   ├── lock_screen.dart
│   ├── home/
│   │   └── dashboard_screen.dart
│   ├── contacts/
│   │   ├── contacts_list_screen.dart
│   │   ├── contact_detail_screen.dart
│   │   └── contact_form_screen.dart
│   ├── encounters/
│   │   └── encounter_form_screen.dart
│   ├── stats/
│   │   └── stats_screen.dart
│   ├── map/
│   │   └── map_screen.dart
│   ├── timeline/
│   │   └── timeline_screen.dart
│   └── settings/
│       └── settings_screen.dart
├── widgets/
│   ├── stat_card.dart
│   ├── contact_card.dart
│   ├── encounter_tile.dart
│   ├── photo_grid.dart
│   ├── rating_stars.dart
│   ├── tag_chip.dart
│   ├── chart_widgets/
│   │   ├── monthly_bar_chart.dart
│   │   ├── rating_pie_chart.dart
│   │   ├── platform_pie_chart.dart
│   │   ├── weekday_bar_chart.dart
│   │   └── cumulative_line_chart.dart
│   └── common/
│       ├── app_scaffold.dart
│       └── empty_state.dart
└── utils/
    ├── image_helper.dart             # Copie, compression, stockage privé
    ├── export_helper.dart            # Export/Import JSON/ZIP
    ├── date_formatter.dart           # Formatage dates FR
    └── constants.dart                # Constantes, enums
```

---

## Modèles de données (SQLite)

### Table `contacts`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER PK AUTO | ID unique |
| pseudo | TEXT NOT NULL | Pseudo ou prénom |
| platform | TEXT | grindr, scruff, tinder, autre |
| profile_url | TEXT | Lien vers le profil |
| age | INTEGER | Âge (optionnel) |
| height | INTEGER | Taille en cm (optionnel) |
| description | TEXT | Description physique |
| tags | TEXT | Tags séparés par virgules |
| main_photo_path | TEXT | Chemin vers la photo principale |
| created_at | TEXT | Date de création ISO 8601 |
| updated_at | TEXT | Dernière modification ISO 8601 |

### Table `encounters`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER PK AUTO | ID unique |
| contact_id | INTEGER FK | Référence au contact |
| date | TEXT NOT NULL | Date et heure ISO 8601 |
| location_name | TEXT | Nom du lieu (texte libre) |
| latitude | REAL | Latitude (optionnel) |
| longitude | REAL | Longitude (optionnel) |
| notes | TEXT | Commentaire libre |
| rating | INTEGER | Évaluation 1-5 |
| created_at | TEXT | Date de création |

### Table `photos`
| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER PK AUTO | ID unique |
| contact_id | INTEGER FK | Référence au contact |
| encounter_id | INTEGER FK | Référence à la rencontre (optionnel) |
| file_path | TEXT NOT NULL | Chemin dans le stockage privé |
| is_main | INTEGER | 1 si photo principale |
| created_at | TEXT | Date d'ajout |

---

## Consignes techniques importantes

1. **Sécurité** : Les images doivent être stockées dans le répertoire privé de l'app (`getApplicationDocumentsDirectory()`), jamais dans le stockage externe. Elles ne doivent pas apparaître dans la galerie Photos du téléphone.

2. **Performance** : Utiliser des miniatures (thumbnails) pour les listes et grilles. Charger les images en pleine résolution uniquement en vue plein écran.

3. **Internationalisation** : L'app est en français. Utiliser le package `intl` pour le formatage des dates en français.

4. **Pas de backend** : Tout est local. Pas de serveur, pas de cloud, pas de compte utilisateur.

5. **Export/Import** : L'export JSON doit inclure toutes les données. L'export ZIP doit inclure le JSON + toutes les photos. L'import doit pouvoir restaurer une sauvegarde complète.

6. **Code propre** : Séparer la logique métier, l'accès aux données, et l'UI. Commenter le code. Nommer les variables et fonctions de manière explicite.

---

## Packages Flutter à utiliser

```yaml
dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.3.0
  path_provider: ^2.1.0
  flutter_riverpod: ^2.4.0
  go_router: ^13.0.0
  fl_chart: ^0.66.0
  flutter_map: ^6.1.0
  latlong2: ^0.9.0
  local_auth: ^2.1.0
  image_picker: ^1.0.0
  photo_view: ^0.14.0
  intl: ^0.18.0
  path: ^1.8.0
  archive: ^3.4.0
  share_plus: ^7.0.0
  uuid: ^4.2.0
  google_fonts: ^6.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

---

## Pour commencer

1. Crée le projet Flutter avec `flutter create --org com.bodycount bodycount`
2. Configure le `pubspec.yaml` avec les dépendances ci-dessus
3. Implémente d'abord le thème et la navigation (bottom nav + routing)
4. Puis la base de données et les modèles
5. Ensuite les écrans un par un en commençant par le formulaire d'ajout et la liste des contacts
6. Puis le dashboard, les stats, la carte, et la timeline
7. Enfin le lock screen et les paramètres

Travaille de manière incrémentale. Après chaque fonctionnalité majeure, assure-toi que l'app compile et fonctionne.
