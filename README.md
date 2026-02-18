# 🔥 BodyCount

> Personal encounter tracker & stats — your private black book, but smarter.

---

## 📱 About

**BodyCount** is a private Android app built with Flutter to track, organize, and analyze your hookup history. Think of it as a personal CRM for your love life — with stats, maps, and a timeline.

**100% local. No cloud. No account. Your data stays on your device.**

---

## ✨ Features

- **🔒 Biometric Lock** — Fingerprint / Face unlock at launch
- **📇 Contact Directory** — Full profiles: photos, notes, tags, links, ratings
- **📊 Advanced Stats** — Monthly charts, ratings breakdown, streaks, top contacts, platform distribution
- **🗺️ Encounter Map** — See where it all happened on an interactive map
- **📅 Timeline** — Chronological feed of all your encounters
- **📸 Private Gallery** — Photos stored in app-only storage (invisible to phone gallery)
- **📦 Export / Import** — Backup your data as JSON or ZIP

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Flutter 3.x (Dart) |
| Database | SQLite (sqflite) |
| State | Riverpod |
| Navigation | GoRouter |
| Charts | fl_chart |
| Maps | flutter_map + OpenStreetMap |
| Auth | local_auth (biometrics) |
| Design | Material Design 3, Dark theme |

---

## 🎨 Design

Dark theme with bold orange accents.

| Element | Color |
|---------|-------|
| Primary | `#FF6B35` 🟠 |
| Accent | `#E84530` 🔴 |
| Background | `#0A0A0A` ⚫ |
| Surface | `#141414` |
| Cards | `#1C1C1C` |
| Text | `#F5F5F5` |

Font: **Poppins** (headings) + **Inter** (body)

---

## 🚀 Getting Started

### Prerequisites

- Flutter SDK 3.x+
- Android Studio / VS Code
- An Android device or emulator

### Install

```bash
git clone https://github.com/YOUR_USERNAME/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

---

## 📁 Project Structure

```
lib/
├── main.dart
├── app.dart
├── config/          # Theme & routing
├── models/          # Contact, Encounter, Photo
├── database/        # SQLite DAOs
├── providers/       # Riverpod state management
├── screens/         # All app screens
├── widgets/         # Reusable UI components
└── utils/           # Helpers (images, export, dates)
```

---

## 🔐 Privacy

- All data stored locally on device only
- Photos saved in private app directory (not visible in phone gallery)
- Biometric authentication required
- No analytics, no tracking, no cloud sync
- Export your data anytime

---

## ⚠️ Disclaimer

This app is a personal project. It stores sensitive personal data — use responsibly and respect others' privacy and consent.

---

Built with 🔥 and Flutter
