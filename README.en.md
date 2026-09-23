<div align="center">

<p>
  <a href="README.md"><img src="docs/langues/fr-off.png" alt="Lire cette page en français" width="150" /></a>
  <img src="docs/langues/en-on.png" alt="English, page shown" width="150" />
</p>

<img src="docs/en/banniere.png" alt="BodyCount, an encrypted offline personal journal on Android" width="100%">

</div>

**An encrypted personal journal, offline, on Android.**

> **Work in progress.** The app runs on a real device and every screen is there, but a few things are still to wire in. The roadmap is further down.

A personal tracking app that talks to no server. Everything lives in an encrypted SQLite file on the phone, behind a fingerprint that does not unlock a screen but the key itself, and nothing leaves unless you explicitly ask for a backup, which is encrypted too.

What drew me to the project was the constraint: building something useful on sensitive data **without** a backend, without an account, without telemetry. Every design decision follows from that, including the map, which draws France from geometry shipped inside the app rather than fetching tiles.

<img src="docs/en/sections/s01.png" alt="01 Features" width="100%">

<img src="docs/en/schemas/fonctionnalites.png" alt="Biometric lock: the fingerprint does not unlock a screen, it loads the key. Directory: photos, a dated notebook, free tags, gender and role, ratings out of five. Statistics: the year total, the month by month rhythm, the podium and the split by role. Map of France: the real geometry of the country, coastlines and islands included, embedded in the app. Calendar: every encounter on a single axis, grouped by month. Private gallery: each photo is encrypted on its own, invisible to the phone gallery. Encrypted export: an archive protected by your passphrase. Three screen formats: phone, cover screen and unfolded screen." width="100%">

<img src="docs/en/sections/s02.png" alt="02 The screens" width="100%">

<img src="docs/en/schemas/ecrans.png" alt="Lock: the first screen, and the only one until the key is loaded. Directory: the grid of people, search, five sortings, filter by city. Person: the photo on top folding away as you scroll, tags, the notebook, the encounters. Stats: the year total, the rhythm in twelve bars, the podium, the split by role as a ring. Map: France drawn from its real geometry, the ranking of places, the faces seen in the main city. Calendar: every encounter grouped by month. Forms: create a person, record an encounter, write a note, manage tags and photos. Settings: auto-lock delay, hiding in the task switcher, encrypted export, demo set, full wipe." width="100%">

<img src="docs/en/schemas/captures.png" alt="Four screens of the app. The map: cities merged into numbered discs over Brittany, France drawn by the app itself, the ranking of places below. The calendar: September 2026 in seven columns, busy days carry a disc and up to three signs, the 23rd in gold because the night earned something. The legend: what each sign means, sorted by family, money, rating, who, rhythm. Settings: the fingerprint at opening, hiding in the task switcher, auto-lock, and what stays on the phone." width="100%">

These four show no face, which is exactly why they are the ones here: the repository's demo set is made of portraits that have no business on a public page. They are, incidentally, the only files of the project kept out of the repository.

<img src="docs/en/sections/s03.png" alt="03 The stack" width="100%">

<img src="docs/en/schemas/stack.png" alt="Flutter 3.x the framework in Dart. sqflite_sqlcipher for SQLite encrypted by SQLCipher. cryptography for AES-GCM, HKDF and PBKDF2. flutter_secure_storage for the master key in the Android Keystore. local_auth for the fingerprint that unlocks the key. flutter_riverpod for state and invalidation after writes. go_router for navigation and the lock guard. image_picker for photos encrypted the moment they arrive. path_provider for the private folders. archive and share_plus for the backup. uuid for vault file names. intl for dates." width="100%">

Requires the Flutter 3.x SDK and an Android device or emulator.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

For an installable build, `flutter build apk --release --split-per-abi`. Splitting by architecture is not a nicety: SQLCipher ships one native library per ABI, and without the split the APK carries a third more weight for nothing.

<img src="docs/en/sections/s04.png" alt="04 Architecture" width="100%">

Five layers, and one rule: a layer never knows the one above it. A screen does not see SQLite, a repository does not see Riverpod, and nothing reads a vault file without going through the keyring.

<img src="docs/en/schemas/couches.png" alt="Screens: only read providers, only write through repositories, no SQL. Providers: Riverpod, a write invalidates everything that depends on it in one call. Repositories: the only place where SQL is written, one grouped query rather than N+1. Security: keyring, photo vault, lock, nothing bypasses them to read a file. Disk: encrypted SQLite, and a photo folder where every file is encrypted too." width="100%">

Six tables, schema v5. `personnes` is the hub: everything attached to a person leaves with them, and it is the schema that guarantees this, not a hand written deletion loop.

<img src="docs/en/schemas/modele.png" alt="Six tables, schema v5. personnes holds first name, age, city, gender, role, source, phone and address. rencontres holds date, place, a rating in half points out of ten and the amount earned in cents, attached to a person on cascade. notes holds free dated text, attached to a person and optionally to an encounter. photos holds a path in the vault, same attachment. etiquettes holds a unique normalised key, linked to people and encounters through two join tables." width="100%">

<img src="docs/en/schemas/arborescence.png" alt="Tree of lib: main.dart the entry point, app.dart the app its theme and the auto-lock, config theme routing and screen formats, domaine the models, donnees the encrypted schema the repositories and the statistics including coordonnees.dart and geometrie_france.dart, security keyring photo vault lock and screen guard, providers state in Riverpod, ecrans the ten screens, widgets the reusable components including the map, utils images encrypted backup and dates." width="100%">

<img src="docs/en/sections/s05.png" alt="05 Encryption" width="100%">

The fingerprint does not unlock a screen: it loads the master key from the Keystore. Until it has been given, the database is an unreadable file and so are the photos. Two keys are derived from it by HKDF, one for SQLCipher, one for the photos, and neither exists in memory before that.

<img src="docs/en/schemas/chiffrement.svg" alt="The fingerprint loads the master key from the Android Keystore. HKDF-SHA256 derives two keys from it: the SQLCipher password that opens the encrypted journal, and the AES-GCM key that opens the photo vault." width="100%">

Each photo is its own file, encrypted with AES-GCM, named by a UUID that says nothing about its contents. An exported backup follows the same principle, except that its key comes from your passphrase rather than the Keystore: without it, the archive reads back nowhere, including on the phone that produced it.

<img src="docs/en/schemas/formats.png" alt="A photo in the vault: magic BCX1 on 4 bytes, nonce on 12 bytes, AES-GCM encrypted content of variable length, authentication tag on 16 bytes. Key derived from the keyring by HKDF, file name a UUID. An exported backup: magic BCEX1 on 5 bytes, salt on 16 bytes, nonce on 12 bytes, encrypted content, tag on 16 bytes. Key derived from the passphrase by PBKDF2-HMAC-SHA256, 210,000 rounds, salt renewed on every export." width="100%">

The lock closes after a spell without a gesture on screen, or on returning from the background, after a configurable delay. It can also be switched off entirely in the settings: encryption stays, but the key then loads without proof of identity, and the screen says so before accepting. The keys are forgotten then, and their bytes overwritten before being released rather than left to the garbage collector. The task switcher preview is blanked, screenshots are blocked, and Android's automatic backup is refused: it would copy the encrypted database onto servers that are not yours.

<img src="docs/en/sections/s06.png" alt="06 The map, without tiles" width="100%">

A tile map would send a server, on every drag of a finger, the exact list of places being looked at. For an app whose whole promise is that nothing leaves the phone, that was the one thing not to do. So France ships with the app.

<img src="docs/en/schemas/carte.png" alt="Open data: the coastline and department boundaries as GeoJSON, 1.2 MB of text. Packing: each point on four bytes, quantised to 1/2000th of a degree or about fifty metres, 45,853 points for 180 KB. Framing: the view fits the cities present, with a minimum frame so enough coastline always shows. Drawing: the land is painted once and handed to the compositor, only the pins and the pulses are repainted." width="100%">

The map pinches to zoom up to twenty times, drags to pan, and the scale bar regraduates itself. It opens framed on the cities making up two thirds of the encounters, so on the real centre of activity rather than the whole country.

No pin is moved by a single pixel: at country scale, nudging a point by forty points moves it a hundred kilometres. When two cities are too close to sit side by side, they merge into one bubble carrying the sum, which splits as soon as you get close enough. Vannes and Auray are seventeen kilometres apart: no clever placement changes that, it is geography.

At high magnification only the outlines touching the window are drawn. Paying for all forty-five thousand points every frame dropped the display to a few frames per second, and the coastal glow, which was a mask blur, forced the engine to render the country into a separate layer before blurring it.

Cities come from a coordinate table that ships with the app as well, covering France and a few nearby capitals. A city missing from that table is not dropped somewhere at random: it is listed under the map, with its count. Inventing a position would be worse than admitting there isn't one.

<img src="docs/en/sections/s07.png" alt="07 The calendar" width="100%">

The screen used to be called « Timeline », and that is what it was: one long list, newest first. It answered « when was that » provided you scrolled to the right date, which stops making sense past a few dozen entries.

A month fits in seven columns. Busy nights, empty weeks and streaks read at a glance, without counting. An empty day is just a dimmed number; a busy one carries a disc, golden when the night earned something. Tap it to see only that day in the list below.

Under each day, up to three signs say what it had of note, rarest first: the year's best amount before the hundred euros, the hundred euros before a plain banknote, the month's best rating before a five out of five. Twenty-five signs in all, every one derived from what the app already records, none to enter by hand. A legend reachable from the header states exactly what triggers each: not « a good night » but « a five out of five rating », so you know what to enter if you want to see one appear.

Always six weeks on screen, even when the month only fills five: a grid whose height depends on the month makes the whole screen jump as you leaf through it.

<img src="docs/en/sections/s08.png" alt="08 Privacy model" width="100%">

<img src="docs/en/schemas/confidentialite.png" alt="What is true: no network request, no account, no analytics. The database is encrypted by SQLCipher, its key lives in the Keystore and is only loaded after the fingerprint. Every photo is encrypted with AES-GCM and never shows in the phone gallery. The task switcher preview is blanked, screenshots blocked, Android backup refused. What is not: once the app is open everything is readable on screen, the fingerprint protects access not your shoulder. An exported backup travels, it is encrypted by your passphrase which is worth what you make it worth. Losing the phone means losing the data, the key is copied nowhere. The code has not been audited by a third party." width="100%">

<img src="docs/en/schemas/palette.png" alt="Palette: primary violet #A855F7, accent fuchsia #D946EF, background #0B0616, surface #150C28, cards #1A1030, text #F6F2FF." width="100%">

<img src="docs/en/sections/s09.png" alt="09 Roadmap" width="100%">

<img src="docs/en/schemas/feuille-de-route.png" alt="Restore from a file: the encrypted export exists, the file picker to read it back is still to wire in. Tests: on the repositories, the schema migration and the encryption. Own typefaces: Syne and Manrope, to embed in the assets. Search by tag: the repository can filter on them, the screen does not offer it yet. Edit an encounter: they can be created and deleted, not yet edited. Cities outside France: the embedded table covers France and a few capitals, beyond that the city is listed under the map." width="100%">

<img src="docs/en/sections/s10.png" alt="10 A word of warning" width="100%">

This repository is a personal project, not a security product. The encryption rests on proven primitives and on Android's Keystore, but the assembly itself has been reviewed by nobody other than me. If you plan to put data in it whose leak would cost you something, read the code first, or don't.

The demo set looks for its faces in `assets/demo/`, which is not part of the repository. Without them the eighteen people are still created, simply without a photo: the generator copes with every missing image.

---

<sub>None of the images on this page come out of a drawing tool: they are HTML pages captured by Chrome, plus one animated SVG. The scripts live in <a href="docs/tools/">docs/tools</a>, and <code>bash docs/tools/tout.sh</code> rebuilds them all, in both languages.</sub>
