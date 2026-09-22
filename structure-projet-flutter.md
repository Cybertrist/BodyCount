# Structure du projet Flutter : BodyCount

## Vue d'ensemble de l'architecture

```
mymeets/
├── android/                          # Config Android native
├── ios/                              # (non utilisé, mais généré par Flutter)
├── lib/
│   ├── main.dart                     # Point d'entrée, init DB, lancement app
│   ├── app.dart                      # MaterialApp, ThemeData, GoRouter
│   │
│   ├── config/
│   │   ├── theme.dart                # 🎨 Thème dark complet
│   │   │   - Couleur primaire : #FF6B35 (orange vif)
│   │   │   - Couleur accent : #E84530 (rouge-orangé)
│   │   │   - Background : #0A0A0A (noir profond)
│   │   │   - Surface : #141414
│   │   │   - Card : #1C1C1C
│   │   │   - Typo : Poppins titres, Inter body
│   │   │   - Coins arrondis : 16px
│   │   │
│   │   └── routes.dart               # 🧭 Configuration GoRouter
│   │       - /lock → LockScreen
│   │       - /home → DashboardScreen (tab 1)
│   │       - /contacts → ContactsListScreen (tab 2)
│   │       - /contacts/:id → ContactDetailScreen
│   │       - /contacts/new → ContactFormScreen
│   │       - /contacts/:id/edit → ContactFormScreen
│   │       - /contacts/:id/encounter/new → EncounterFormScreen
│   │       - /stats → StatsScreen (tab 3)
│   │       - /map → MapScreen (tab 4)
│   │       - /timeline → TimelineScreen
│   │       - /settings → SettingsScreen
│   │
│   ├── models/
│   │   ├── contact.dart
│   │   │   class Contact {
│   │   │     int? id
│   │   │     String pseudo
│   │   │     String? platform        // enum: grindr, scruff, tinder, autre
│   │   │     String? profileUrl
│   │   │     int? age
│   │   │     int? height             // cm
│   │   │     String? description
│   │   │     List<String> tags
│   │   │     String? mainPhotoPath
│   │   │     DateTime createdAt
│   │   │     DateTime updatedAt
│   │   │     // Méthodes : toMap(), fromMap(), copyWith()
│   │   │   }
│   │   │
│   │   ├── encounter.dart
│   │   │   class Encounter {
│   │   │     int? id
│   │   │     int contactId
│   │   │     DateTime date
│   │   │     String? locationName
│   │   │     double? latitude
│   │   │     double? longitude
│   │   │     String? notes
│   │   │     int rating               // 1-5
│   │   │     DateTime createdAt
│   │   │   }
│   │   │
│   │   └── photo.dart
│   │       class Photo {
│   │         int? id
│   │         int contactId
│   │         int? encounterId
│   │         String filePath
│   │         bool isMain
│   │         DateTime createdAt
│   │       }
│   │
│   ├── database/
│   │   ├── database_helper.dart       # 🗄️ Singleton SQLite
│   │   │   - initDatabase()
│   │   │   - onCreate() → CREATE TABLE contacts, encounters, photos
│   │   │   - onUpgrade() → migrations futures
│   │   │   - Version 1 du schéma
│   │   │
│   │   ├── contact_dao.dart           # CRUD Contact
│   │   │   - getAll(), getById(), search(), insert(), update(), delete()
│   │   │   - getWithEncounterCount() → pour la liste
│   │   │   - getTopContacts(limit) → pour les stats
│   │   │
│   │   ├── encounter_dao.dart         # CRUD Encounter
│   │   │   - getAll(), getByContact(), getByDateRange()
│   │   │   - getMonthlyCount(), getWeekdayCount()
│   │   │   - getWithLocation() → pour la carte
│   │   │   - insert(), update(), delete()
│   │   │
│   │   └── photo_dao.dart             # CRUD Photo
│   │       - getByContact(), getByEncounter()
│   │       - insert(), delete(), setAsMain()
│   │
│   ├── providers/                     # 📡 Riverpod providers
│   │   ├── auth_provider.dart         # État d'authentification
│   │   ├── contacts_provider.dart     # Liste contacts + filtres + recherche
│   │   ├── encounters_provider.dart   # Rencontres par contact
│   │   └── stats_provider.dart        # Calculs statistiques
│   │       - totalEncounters
│   │       - totalContacts
│   │       - monthlyData (12 mois)
│   │       - weekdayData
│   │       - ratingDistribution
│   │       - platformDistribution
│   │       - topContacts
│   │       - averageRating
│   │       - longestStreak
│   │       - bestMonth
│   │       - cumulativeData
│   │
│   ├── screens/
│   │   ├── lock_screen.dart           # 🔒 Authentification biométrique
│   │   │   - Appel local_auth
│   │   │   - Fallback PIN
│   │   │   - Animation logo
│   │   │
│   │   ├── home/
│   │   │   └── dashboard_screen.dart  # 🏠 Tableau de bord
│   │   │       - StatCards en haut (total, ce mois, moyenne)
│   │   │       - MonthlyBarChart
│   │   │       - RatingPieChart
│   │   │       - Carrousel "Récents"
│   │   │       - FAB "+"
│   │   │
│   │   ├── contacts/
│   │   │   ├── contacts_list_screen.dart  # 📋 Liste/Grille contacts
│   │   │   │   - SearchBar
│   │   │   │   - FilterChips (tags, rating, période)
│   │   │   │   - Toggle vue liste/grille
│   │   │   │   - ContactCard pour chaque entrée
│   │   │   │
│   │   │   ├── contact_detail_screen.dart # 👤 Fiche contact
│   │   │   │   - Hero animation photo
│   │   │   │   - Infos générales
│   │   │   │   - Tags
│   │   │   │   - Liste des rencontres (timeline)
│   │   │   │   - Galerie photos
│   │   │   │   - Boutons : modifier, supprimer, ajouter rencontre
│   │   │   │
│   │   │   └── contact_form_screen.dart   # ✏️ Formulaire création/édition
│   │   │       - Champs : pseudo, plateforme, lien, âge, taille, desc
│   │   │       - Sélection tags
│   │   │       - Ajout photo principale
│   │   │
│   │   ├── encounters/
│   │   │   └── encounter_form_screen.dart # 📝 Formulaire rencontre
│   │   │       - Date picker (français)
│   │   │       - Lieu (texte + option GPS)
│   │   │       - Notes (TextArea)
│   │   │       - Rating (étoiles interactives)
│   │   │       - Ajout photos
│   │   │       - Auto-complétion contact existant
│   │   │
│   │   ├── stats/
│   │   │   └── stats_screen.dart      # 📊 Statistiques complètes
│   │   │       - Sélecteur d'année
│   │   │       - Toutes les stat cards
│   │   │       - Tous les graphiques
│   │   │       - Top 5 contacts
│   │   │       - Records et streaks
│   │   │
│   │   ├── map/
│   │   │   └── map_screen.dart        # 🗺️ Carte des rencontres
│   │   │       - flutter_map + OpenStreetMap
│   │   │       - Marqueurs par rencontre
│   │   │       - Popup au clic : pseudo, date, rating
│   │   │       - Filtre par période
│   │   │
│   │   ├── timeline/
│   │   │   └── timeline_screen.dart   # 📅 Vue chronologique
│   │   │       - Feed scrollable
│   │   │       - Séparateurs par mois
│   │   │       - Mini-card par rencontre
│   │   │       - Lazy loading
│   │   │
│   │   └── settings/
│   │       └── settings_screen.dart   # ⚙️ Paramètres
│   │           - Toggle biométrie
│   │           - Export JSON / ZIP
│   │           - Import backup
│   │           - Supprimer données
│   │           - Version app
│   │
│   ├── widgets/                       # 🧩 Widgets réutilisables
│   │   ├── stat_card.dart             # Card avec icône, valeur, label
│   │   ├── contact_card.dart          # Card contact (liste + grille)
│   │   ├── encounter_tile.dart        # Ligne rencontre dans la timeline
│   │   ├── photo_grid.dart            # Grille photos avec ajout
│   │   ├── rating_stars.dart          # Widget étoiles (affichage + input)
│   │   ├── tag_chip.dart              # Chip pour les tags
│   │   ├── platform_icon.dart         # Icône par plateforme
│   │   │
│   │   ├── chart_widgets/
│   │   │   ├── monthly_bar_chart.dart     # Barres par mois
│   │   │   ├── rating_pie_chart.dart      # Répartition ratings
│   │   │   ├── platform_pie_chart.dart    # Répartition plateformes
│   │   │   ├── weekday_bar_chart.dart     # Barres par jour semaine
│   │   │   └── cumulative_line_chart.dart # Courbe cumulative
│   │   │
│   │   └── common/
│   │       ├── app_scaffold.dart      # Scaffold avec bottom nav
│   │       └── empty_state.dart       # Widget "rien à afficher"
│   │
│   └── utils/
│       ├── image_helper.dart          # 🖼️ Gestion images
│       │   - pickImage() → image_picker
│       │   - saveToPrivateStorage() → copie dans app dir
│       │   - generateThumbnail()
│       │   - deleteImage()
│       │
│       ├── export_helper.dart         # 📦 Export/Import
│       │   - exportToJson() → fichier .json
│       │   - exportToZip() → .zip avec JSON + photos
│       │   - importFromJson()
│       │   - importFromZip()
│       │
│       ├── date_formatter.dart        # 📅 Formatage dates FR
│       │   - formatDate() → "15 janvier 2025"
│       │   - formatDateTime() → "15 jan. 2025 à 21h30"
│       │   - timeAgo() → "il y a 3 jours"
│       │
│       └── constants.dart             # 📌 Constantes
│           - Liste des plateformes
│           - Tags prédéfinis
│           - Couleurs
│           - Dimensions
│
├── assets/
│   └── images/
│       └── logo.png                   # Logo de l'app
│
├── pubspec.yaml                       # Dépendances
├── analysis_options.yaml              # Règles lint
└── README.md
```

---

## Flux utilisateur principal

```
                    ┌─────────────┐
                    │ Lock Screen │
                    │ (biométrie) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
            ┌───────┤  Dashboard  ├───────┐
            │       │  (Accueil)  │       │
            │       └──────┬──────┘       │
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  Répertoire │ │  Stats   │ │    Carte    │
     │  (Contacts) │ │          │ │             │
     └──────┬──────┘ └──────────┘ └─────────────┘
            │
     ┌──────▼──────┐
     │   Fiche     │
     │  Contact    │
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  Formulaire │
     │  Rencontre  │
     └─────────────┘
```

---

## Bottom Navigation

| Index | Icône | Label | Écran |
|-------|-------|-------|-------|
| 0 | `Icons.dashboard_rounded` | Accueil | DashboardScreen |
| 1 | `Icons.people_rounded` | Répertoire | ContactsListScreen |
| 2 | `Icons.bar_chart_rounded` | Stats | StatsScreen |
| 3 | `Icons.map_rounded` | Carte | MapScreen |

---

## Palette de couleurs

```dart
// config/theme.dart
static const primary = Color(0xFFFF6B35);       // Orange vif, couleur principale
static const primaryDark = Color(0xFFE84530);    // Rouge-orangé, accents secondaires
static const accent = Color(0xFFFFAB76);         // Orange clair, highlights
static const background = Color(0xFF0A0A0A);     // Noir profond
static const surface = Color(0xFF141414);        // Surface relevée
static const card = Color(0xFF1C1C1C);           // Card background
static const cardBorder = Color(0xFF2A2A2A);     // Bordure subtile des cards
static const textPrimary = Color(0xFFF5F5F5);   // Texte principal, blanc cassé
static const textSecondary = Color(0xFF8A8A8A);  // Texte secondaire
static const star = Color(0xFFFF6B35);           // Étoiles rating = orange principal
static const success = Color(0xFF4CAF50);        // Vert succès
static const danger = Color(0xFFEF4444);         // Rouge danger/suppression

// Couleurs par plateforme
static const grindr = Color(0xFFFFD900);         // Jaune Grindr
static const scruff = Color(0xFFE85D04);         // Orange Scruff
static const tinder = Color(0xFFFE3C72);         // Rose Tinder
```

---

## Conseils pour Claude Code

1. **Commence par la base** : thème, routing, et bottom navigation fonctionnels
2. **Puis la DB** : crée les tables, teste les DAOs avec des données fictives
3. **Ensuite les écrans** : formulaire d'ajout → liste → détail → dashboard
4. **Les stats en dernier** : une fois qu'il y a des données à afficher
5. **Teste régulièrement** avec `flutter run`
6. **Gère les erreurs** : try/catch sur les opérations DB et fichiers
7. **Pense UX** : loading states, empty states, confirmations de suppression
