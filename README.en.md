<div align="center">

<p>
  <a href="README.md"><img src="docs/langues/fr-off.png" alt="Lire cette page en français" width="150" /></a>
  <img src="docs/langues/en-on.png" alt="English, page shown" width="150" />
</p>

<img src="docs/en/banniere.png" alt="BodyCount, an encrypted offline personal journal on Android" width="100%">

</div>

**An encrypted personal journal, offline, on Android.**

> **Work in progress.** The app runs but is not finished, see the roadmap below.

A personal tracking app that talks to no server. Everything lives in a SQLite database on the phone, behind biometric authentication, and only leaves it if you explicitly ask for an export.

What drew me to the project was the constraint: building something useful on sensitive data **without** a backend, without an account, without telemetry. Every design decision follows from that.

<img src="docs/en/sections/s01.png" alt="01 Features" width="100%">

<img src="docs/en/schemas/fonctionnalites.png" alt="Biometric lock: fingerprint or face recognition required to open the app. Contact directory: photos, notes, tags and ratings, all stored locally. Statistics: monthly charts, breakdowns, streaks and rankings. Map of encounters, on an OpenStreetMap background. Timeline: every entry on a single time axis. Private gallery: the photos live in app storage, invisible to the phone gallery. Export and import as JSON or ZIP. No server: no account, no telemetry, not a single network request." width="100%">

<img src="docs/en/sections/s02.png" alt="02 Stack" width="100%">

<img src="docs/en/schemas/stack.png" alt="Flutter 3.x in Dart for a native Android app. sqflite for local SQLite, the only database in the project. Riverpod for state management. GoRouter for navigation between screens. fl_chart for the statistics charts. flutter_map for the map, on an OpenStreetMap background. local_auth for biometric authentication. Material 3 for the design, in dark theme. Poppins and Inter for headings and body text." width="100%">

<img src="docs/en/schemas/palette.png" alt="App palette: primary #FF6B35, accent #E84530, background #0A0A0A, surface #141414, cards #1C1C1C, text #F5F5F5." width="100%">

<img src="docs/en/schemas/arborescence.png" alt="Tree of lib. main.dart: the entry point. app.dart: the app and its theme. config: theme and routing. models: Contact, Encounter, Photo. database: the SQLite DAOs. providers: state, in Riverpod. screens: the screens. widgets: the reusable components. utils: images, export, dates." width="100%">

Requires the Flutter 3.x SDK and an Android device or emulator.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

<img src="docs/en/sections/s03.png" alt="03 Privacy model" width="100%">

This is the heart of the project, so it is worth being precise about what is guaranteed and what is not.

<img src="docs/en/schemas/confidentialite.png" alt="What is true: no network request, no account, no analytics; the SQLite database and the photos stay in the app private directory; the photos are not indexed by the MediaStore, so they never show in the gallery; opening the app requires biometric authentication. What is not: on a rooted phone the private directory is readable, biometrics lock the interface but do not encrypt the database; an automatic Android backup can carry the data off the device if it is not disabled; a JSON or ZIP export leaves in the clear; real database encryption through SQLCipher and the Keystore is not in place yet." width="100%">

The distinction matters. An app that promises privacy and delivers only an interface lock does more harm than an app that promised nothing.

<img src="docs/en/sections/s04.png" alt="04 Roadmap" width="100%">

<img src="docs/en/schemas/feuille-de-route.png" alt="Database encryption: SQLCipher, key derived from the Android Keystore, unlocking tied to biometrics, this is the piece that is missed most. Photo encryption at rest, and not merely their isolation inside app storage. Android backup disabled through allowBackup false, which today can carry the database off the device. Encrypted export, password protected, rather than plain JSON. Screens to finish: the statistics and the map view are not done. Tests on the DAOs and the export logic." width="100%">

<img src="docs/en/sections/s05.png" alt="05 A word of warning" width="100%">

The app records intimate data about real people, who have not consented to appearing in it. The GDPR provides an exemption for strictly personal and household use, but that exemption falls away the moment the data is shared. Use it with judgement, and do not distribute it.

---

<sub>Personal project · Tristan Joncour</sub>
