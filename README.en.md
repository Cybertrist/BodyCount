<div align="center">

<p>
  <a href="README.md"><img src="docs/langues/fr-off.png" alt="Lire cette page en français" width="150" /></a>
  <img src="docs/langues/en-on.png" alt="English, page shown" width="150" />
</p>

<img src="docs/en/banniere.png" alt="BodyCount, an encrypted offline personal journal on Android" width="100%">
<br><br>

</div>

I wanted one place to keep what surrounds my encounters: a photo, a few notes about the person, a verdict on the night, tags to remember them by, an address, sometimes what it earned. Highly sensitive information, which has no business in the phone's contacts or in an app that would send it to a server, and which you still want to find in two seconds, neatly sorted, with statistics that make something of it.

Nothing out there did both: keep all of it properly organised, and keep it to yourself. That is where BodyCount comes from. Everything lives in an encrypted database on the phone, behind a fingerprint that does not unlock a screen but the key itself. No server, no account, no telemetry: nothing leaves, except a backup you explicitly ask for, encrypted as well by a passphrase.

Every design decision follows from that constraint, down to the map, which draws France and its 34,836 communes from data shipped inside the app rather than fetching tiles from the internet.

<img src="docs/en/sections/s01.png" alt="01 Features" width="100%">

<img src="docs/en/schemas/fonctionnalites.png" alt="Biometric lock: the fingerprint does not unlock a screen, it loads the key. Directory: photos, a dated notebook, free tags, gender and role, ratings out of five. Statistics: the year total, the month by month rhythm, the podium and the split by role. Map of France: the real geometry of the country and its 34,836 communes, embedded; even misspelt, a village lands in its place. Calendar: the month in seven columns, with signs under each day. Private gallery: photos and videos, each encrypted on its own, opening full screen. Full backup: people, photos and videos in one file protected by a passphrase, restored at no risk. What it earns: an amount per encounter. Everything is editable: nothing you enter is final. Address and directions: the only gesture that leaves the phone. Three screen formats: phone, cover screen and unfolded screen." width="100%">

<img src="docs/en/sections/s02.png" alt="02 The screens" width="100%">

The app is designed first for the passport format, the cover screen of a Galaxy Z Fold: wide and short. That is where it gets used every day, so it carries the full sheet. The faces come from the repository's demo set, generated portraits: nobody real.

<img src="docs/en/schemas/captures-passeport.png" alt="Twelve screens in passport format. Launch: the icon on the app's background. Loading: a ring draws around the logo while the name rises. Lock: the logo has slid into place, the fingerprint button waits. Directory: three columns of people with photos, sortings, cities and tags. Person: Enzo's photo full size, his tags, his encounters. Notebook and gallery: dated notes, a photo and a video. Viewer: the video playing, with the download button. Exact point: the map around Auray with nearby communes and the pin. Statistics: the year total and the podium. Map: Brittany and the clustered cities. Calendar: September in seven columns. Settings: the lock, the backup, restore." width="100%">

On launch, Android puts the icon in the centre; the app picks it up at the same spot, draws a ring around it, raises its name, then slides the logo and title to their exact place on the lock screen. You cannot tell where one ends and the other begins. The fingerprint prompt only comes once the animation is over.

On a regular 16:9 phone, the layout drops to two columns and moves search below the title:

<img src="docs/en/schemas/captures-telephone.png" alt="Four screens on a 16:9 phone: the lock, the directory in two columns, Enzo's page with its chips on two lines, and the map." width="100%">

And on the unfolded 4:3 screen, navigation becomes a rail on the left and the directory goes to four columns:

<img src="docs/en/schemas/captures-tablette.png" alt="Three screens on a large 4:3 screen: the directory in four columns with every filter on one line, the map with the ranking and the faces seen in Vannes, and Enzo's page with the photo across the full width." width="100%">

The same screen on its side is 1200 points wide. The person page then splits into two panes, the photo on the left at full height:

<img src="docs/en/schemas/captures-paysage.png" alt="Four screens on a large screen held sideways: the directory in four columns next to the rail, Enzo's page in two panes with the photo on the left and the encounters on the right, the statistics with the podium centred, and the map of Brittany above the city ranking." width="100%">

The palette follows the logo's gradient, from violet to fuchsia, on near-black backgrounds.

<img src="docs/en/schemas/palette.png" alt="Palette: primary violet #A855F7, accent fuchsia #D946EF, background #0B0616, surface #150C28, cards #1A1030, text #F6F2FF." width="100%">

<img src="docs/en/sections/s03.png" alt="03 The stack" width="100%">

<img src="docs/en/schemas/stack.png" alt="Flutter 3.x the framework in Dart. sqflite_sqlcipher for SQLite encrypted by SQLCipher. cryptography for photo AES-GCM, HKDF and PBKDF2. javax.crypto for native AES-GCM on videos and backups. flutter_secure_storage for the master key in the Android Keystore. local_auth for the fingerprint that unlocks the key. flutter_riverpod for state and invalidation after writes. go_router for navigation and the lock guard. image_picker for photos and videos encrypted the moment they arrive. video_player for playback. path_provider for the private folders. archive for reading back the old backup format. uuid for vault file names. intl for dates. url_launcher for directions and calls. Chakra Petch for titles." width="100%">

Requires the Flutter 3.x SDK and an Android device or emulator. The project follows the Flutter 3.47 template: Gradle 9.3, Android Gradle Plugin 9.1 and Kotlin 2.4, compiled by the Android plugin itself.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run
```

For an installable build, `flutter build apk --release --split-per-abi`. Splitting by architecture is not a nicety: SQLCipher ships one native library per ABI, and without the split the APK carries a third more weight for nothing. The release build is signed with the key named by `android/key.properties`, which git ignores; without that file, the debug key is used.

A few lines of Kotlin in `MainActivity` replace two packages. `cryptography_flutter` installed itself as the implementation of all cryptography, key derivation included, and Android refused the empty HMAC key of an unsalted extraction: the database would no longer open. `share_plus` 13 would have required a major version of `flutter_secure_storage`, where the master key lives. The activity therefore carries native AES-GCM, the file picker, sharing, saving to the gallery, reading a video's duration and one of its frames, and re-encoding it with Media3.

<img src="docs/en/sections/s04.png" alt="04 Architecture" width="100%">

Five layers, and one rule: a layer never knows the one above it. A screen does not see SQLite, a repository does not see Riverpod, and nothing reads a vault file without going through the keyring.

<img src="docs/en/schemas/couches.png" alt="Screens: only read providers, only write through repositories, no SQL. Providers: Riverpod, a write invalidates everything that depends on it in one call. Repositories: the only place where SQL is written, one grouped query rather than N+1. Security: keyring, photo vault, lock, nothing bypasses them to read a file. Disk: encrypted SQLite, and a photo folder where every file is encrypted too." width="100%">

On unlock, the directory, the cities and the statistics ask for the database at the same instant. The database keeps the future of its opening, and they all await it. That was not the case at first: each started its own, one closed the other's connection while checking the key, and the other, taking the database for plain, copied it over and erased the file. The app then ran on two files, the person screen writing to one and the directory reading the other, which showed as a city that refused to change. A database is now only judged plain by its header, and one that lost its version number in the process is repaired on launch.

<img src="docs/en/schemas/ouverture.svg" alt="Three screens ask for the database at the same instant, on unlock. They all wait for the same opening, which opens a single encrypted file. Before the fix, each started its own, and the app ended up with two connections to two different files." width="100%">

Six tables, schema v7. `personnes` is the hub: everything attached to a person leaves with them, and it is the schema that guarantees this, not a hand written deletion loop. Videos live in the photos table, with a type, a duration and a thumbnail: they sit in the same place on the person, leave with it, and are kept in the same vault.

<img src="docs/en/schemas/modele.png" alt="Six tables, schema v7. personnes holds first name, age, city, gender, role, source, phone and address. rencontres holds date, place, a rating in half points out of ten and the amount earned in cents, attached to a person on cascade. notes holds free dated text, attached to a person and optionally to an encounter. photos holds a path in the vault, photo or video, and a video's duration and thumbnail, same attachment. etiquettes holds a unique normalised key, linked to people and encounters through two join tables." width="100%">

<img src="docs/en/schemas/arborescence.png" alt="Tree of lib: main.dart the entry point, app.dart the app its theme and the auto-lock, config theme routing and screen formats, domaine the models, donnees the encrypted schema the repositories and the statistics including base.dart for the single opening and migrations, coordonnees.dart for the communes and geometrie_france.dart, security keyring photo and video vaults lock and screen guard including flux_chiffre.dart and aes_natif.dart, providers state in Riverpod, ecrans the screens including calendrier.dart and visionneuse.dart, widgets the reusable components including the map, utils media streamed backup file picker and dates." width="100%">

<img src="docs/en/sections/s05.png" alt="05 Encryption" width="100%">

The fingerprint does not unlock a screen: it loads the master key from the Keystore. Until it has been given, the database is an unreadable file, and so are the photos and videos. Two keys are derived from it by HKDF, one for SQLCipher, one for the vault, and neither exists in memory before that.

<img src="docs/en/schemas/chiffrement.svg" alt="The fingerprint loads the master key from the Android Keystore. HKDF-SHA256 derives two keys from it: the SQLCipher password that opens the encrypted journal, and the AES-GCM key that opens the photo and video vault." width="100%">

Each photo is its own file, encrypted with AES-GCM in one block, named by a UUID that says nothing about its contents. A video follows the same principle, in chunks: the next section says why. An exported backup uses the same chunked stream, except that its key comes from your passphrase rather than the Keystore: without it, the file reads back nowhere, including on the phone that produced it.

<img src="docs/en/schemas/formats.png" alt="A photo in the vault: magic BCX1 on 4 bytes, nonce on 12 bytes, AES-GCM content, tag on 16 bytes, encrypted in one block. A video in the vault: magic BCV1 on 4 bytes then encrypted chunks of up to one megabyte, same key as photos. An exported backup: magic BCEX2 on 5 bytes, salt on 16 bytes, then encrypted chunks carrying the JSON and each media, key drawn from the passphrase by PBKDF2-HMAC-SHA256 in 210,000 rounds. One chunk of the stream: length on 4 bytes, nonce on 12, up to one megabyte of ciphertext, tag on 16, and as associated data authenticated but not written, its rank and whether it is the last." width="100%">

The lock closes after a spell without a gesture on screen, or on returning from the background, after a configurable delay. It waits for work in progress: a backup, a restore or a long video being encrypted involve no finger on the glass, and the system file picker sends the app to the background. It can also be switched off entirely in the settings: encryption stays, but the key then loads without proof of identity, and the screen says so before accepting. On lock, the keys are forgotten, and their bytes overwritten before being released rather than left to the garbage collector. The task switcher preview is blanked, screenshots are blocked, and Android's automatic backup is refused: it would copy the encrypted database onto servers that are not yours.

<img src="docs/en/sections/s06.png" alt="06 Videos and backups" width="100%">

A video weighs a hundred photos. Encrypting it in one block meant holding it whole in memory, and a backup carrying videos had to hold all of them at once. Both therefore go through a stream encrypted in one megabyte chunks, written and read back on disk.

<img src="docs/en/schemas/flux.svg" alt="A video is cut into one megabyte chunks. Each is encrypted on its own, with its nonce and tag, and authenticates its rank and whether it is the last. Two swapped chunks do not read back: reading is refused." width="100%">

Each chunk authenticates its rank and whether it is the last, without writing them: they go into the tag computation. Swapping two chunks, removing one or cutting the end of the file makes reading fail instead of returning a truncated video without a word. AES goes through Android's encryption, which uses the processor's instructions: in pure Dart, a hundred megabytes took half a minute.

A phone films in 1080p or 4K at bitrates meant for a big screen. On import, a heavy video is re-encoded by Media3 on the hardware encoder: H.264, 720 points on the short side, 2.5 Mb/s. A 20 MB video ends up around 3. The lighter version is only kept if it saves at least a tenth.

<img src="docs/en/schemas/allegement.svg" alt="A 20 MB video shot in 1080p is re-encoded by Media3 on the phone encoder: H.264, 720 points on the short side, 2.5 Mb/s. It comes out at 3 MB and enters the vault, encrypted in chunks. The lighter version is only kept if it saves at least a tenth." width="100%">

To be played, a video is decrypted into the app's private cache, because the system player needs a file. The copy is erased when the player closes, on lock, and on the next launch if the app was killed mid-playback. A button in the viewer saves a photo or video to the phone's gallery, under Pictures or Movies, in a BodyCount folder: in the clear, since that is the whole point of the gesture, and the message says so.

A restore touches nothing before it has checked everything. The file is read twice: the first time to decrypt each chunk and drop it, the second to store the media under new names. A wrong passphrase stops at the first chunk, a damaged byte at its own, and in both cases the people on the phone are intact.

<img src="docs/en/schemas/restauration.svg" alt="Restoring reads the backup twice. On the first pass, each chunk is decrypted and checked, then dropped. On the second, the media enter the vault. The people are only replaced at the very end: until then, nothing was touched." width="100%">

Export offers to save the file to a folder before sharing it: with videos, a backup quickly exceeds what most apps accept. Sharing goes through a temporary URI limited to the backups folder alone. When the last backup is more than a month old, or there never was one, a banner says so at the top of the directory. Backups in the old format, a ZIP encrypted in one block, still read back.

<img src="docs/en/sections/s07.png" alt="07 The map, without tiles" width="100%">

A tile map would send a server, on every drag of a finger, the exact list of places being looked at. For an app whose whole promise is that nothing leaves the phone, that was the one thing not to do. So France ships with the app.

<img src="docs/en/schemas/carte.png" alt="Open data: the coastline and department boundaries as GeoJSON, 1.2 MB of text. Packing: each point on four bytes, quantised to 1/2000th of a degree or about fifty metres, 45,853 points for 180 KB. Framing: the view fits the cities present, with a minimum frame so enough coastline always shows. Drawing: the land is painted once and handed to the compositor, only the pins and the pulses are repainted." width="100%">

The map pinches to zoom up to twenty times, drags to pan, and the scale bar regraduates itself. It opens framed on the cities making up two thirds of the encounters, so on the real centre of activity rather than the whole country.

No pin is moved by a single pixel: at country scale, nudging a point by forty points moves it a hundred kilometres. When two cities are too close to sit side by side, they merge into one bubble carrying the sum, which splits as soon as you get close enough. Vannes and Auray are seventeen kilometres apart: no clever placement changes that, it is geography.

Cities come from the official register of French communes, shipped with the app as well: all 34,836 communes of mainland France and Corsica, from the smallest village to Paris, 420 KB once compressed in the APK. `tool/communes.mjs` rebuilds it from geo.api.gouv.fr; it is the only part of the project that touches the network, and it runs on the developer's machine, not the phone.

<img src="docs/en/schemas/villes.svg" alt="A typed city goes through four steps: the exact name, a start of name, a typo of one or two letters, a city name followed by an area. The first that answers wins, and the most populous commune at each step. Locmariaquer, Plougastel, Locmariaqer and Vannes centre land in France; London stays off the map, in the ranking of places." width="100%">

Everything in France gets placed. The exact name first, ignoring accents, hyphens and « St »; then a start of name, « Plougastel » for Plougastel-Daoulas; then a typo of one or two letters; then a commune name followed by a neighbourhood. At each step the most populous wins, and a department in brackets, « Saint-Denis (11) », settles namesakes. The tolerance stops at cities: « chez lui » is not a village one letter away, and an encounter place that is not a city counts for the person's city. Places abroad stay off the map, which only draws France, but appear in the ranking of places.

An encounter can also be placed by hand, at an exact point. Without tiles there are no streets to show: nearby communes, with their names, serve as landmarks. Enough to drop a pin « between Arradon and Séné », which shows on the map of places once you zoom in.

<img src="docs/en/sections/s08.png" alt="08 The calendar" width="100%">

The question you ask most is not « how many » but « when »: which night was it, how long ago, was that a good stretch. A chronological list answers badly past a few dozen entries: you have to scroll and count.

The calendar answers at a glance. A month fits in seven columns: busy nights, empty weeks and streaks read without counting. An empty day is just a dimmed number; a busy one carries a disc, golden when the night earned something. Tap it to see only that day in the list below.

Under each day, up to three signs say what it had of note, rarest first: the year's best amount before the hundred euros, the hundred euros before a plain banknote, the month's best rating before a five out of five. Twenty-five signs in all, every one derived from what the app already records, none to enter by hand. A legend reachable from the header states exactly what triggers each: not « a good night » but « a five out of five rating », so you know what to enter if you want to see one appear.

Always six weeks on screen, even when the month only fills five: a grid whose height depends on the month makes the whole screen jump as you leaf through it.

<img src="docs/en/sections/s09.png" alt="09 Privacy model" width="100%">

<img src="docs/en/schemas/confidentialite.png" alt="What is true: no network request, no account, no analytics. The database is encrypted by SQLCipher, its key lives in the Keystore and is only loaded after the fingerprint. Every photo and video is encrypted with AES-GCM and never shows in the phone gallery. The task switcher preview is blanked, screenshots blocked, Android backup refused. A restore checks the whole backup before erasing anything. What is false: once the app is open everything is readable on screen, the fingerprint protects access not your shoulder. An exported backup travels, it is worth what your passphrase is worth. Losing the phone means losing the data, the key is copied nowhere. The fingerprint can be switched off in the settings. To be played, a video is decrypted into the private cache for as long as it plays." width="100%">

<img src="docs/en/sections/s10.png" alt="10 The tests" width="100%">

What breaks silently is what touches the disk: opening the database, its migrations, encryption, backups. Yet SQLCipher, the Keystore and native AES only exist on Android. The tests therefore run on an emulator, against the real libraries, rather than against stand-ins that would pass where the app fails. Six of them drive the whole app, by finger, from one screen to the next.

```bash
flutter test integration_test -d emulator-5554
```

They destroy the data and the key of the app they target: run them on an emulator, never on the phone holding the real journal.

<img src="docs/en/schemas/tests.png" alt="Database: eight simultaneous openings give one connection, a write reads back everywhere, a database without a version is repaired not destroyed. Encrypted stream: round trip from zero bytes to three megabytes, truncated swapped or one byte changed refused, native reads Dart back and the reverse. Backup: everything comes back, and a wrong passphrase, a damaged or foreign file move nothing. Vault and communes: a video reads back identical, a village, a typo, a namesake placed, London and chez lui not. Screen journeys: the whole app driven by finger, from the changing city to the backup reminder. On device: the twenty-four tests run on an emulator." width="100%">

They paid off on their first run. The data tests found a backup end marker written on eleven bytes and read on one: no restore would have gone through. The screen tests found a row of figures overflowing its fixed height on the person page.

<img src="docs/en/sections/s11.png" alt="11 Roadmap" width="100%">

<img src="docs/en/schemas/feuille-de-route.png" alt="Done: French communes, full-size photos and videos, full backup and restore, exact point, backup reminder, lighter videos, animated launch, release key, twenty-four tests. Automatic backup: an encrypted export dropped by itself into a chosen folder every week. Outside review: an outside look at the encryption would be worth more than any feature." width="100%">

<img src="docs/en/sections/s12.png" alt="12 A word of warning" width="100%">

This repository is a personal project, not a security product. The encryption rests on proven primitives and on Android's Keystore, but the assembly itself has been reviewed by nobody other than me. If you plan to put data in it whose leak would cost you something, read the code first, or don't.

The demo set looks for its faces in `assets/demo/`, which is not part of the repository. Without them the eighteen people are still created, simply without a photo: the generator copes with every missing image.

<img src="docs/en/sections/s13.png" alt="13 Licence and author" width="100%">

BodyCount is designed and built by **Tristan Joncour** ([@Cybertrist](https://github.com/Cybertrist)), a cyber defence engineering student at ENSIBS, for his own use first: it is the app he wanted on his phone, and it did not exist.

The code is released under the [MIT](LICENSE) licence: free to read, reuse and modify, as long as the copyright notice stays. The geometry of France and the register of communes come from open data; the Chakra Petch typeface is under the SIL Open Font licence; the fingerprint icon in the diagrams comes from Material Design, under the Apache 2.0 licence.

---

<sub>None of the images on this page come out of a drawing tool: they are HTML pages captured by Chrome, plus six animated SVGs. The screenshots come from an emulator driven by script, trimmed of their bars by <code>rogner.js</code>. Everything lives in <a href="docs/tools/">docs/tools</a>, and <code>bash docs/tools/tout.sh</code> rebuilds it all, in both languages, social preview included.</sub>
