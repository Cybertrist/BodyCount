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

<img src="docs/en/schemas/fonctionnalites.svg" alt="BodyCount’s features, in eleven animated screens, each with its mechanism. Biometric lock: the fingerprint scanned, the key leaves the Keystore, HKDF derives the database key and the vault key, and the people list fills in. People: “vann” typed in the search, the query is rewritten on every letter and goes from 18 to 7 people, the cards slide, then Top rated reorders them. Statistics: the year’s 78 encounters each fall into their month, the bars rise, +136% against 2025, the podium sorts itself. Map of France: the real coastline read from france.bin, the cities drop in as bubbles with their ripples and shuttles, and a pinch splits the 65 bubble into Vannes 61 and Auray 4. Calendar: busy days take their disc and their signs, the 23rd is touched and its six signs get sorted, three remain. Private gallery: a photo picked in the system picker goes into the vault, blurs, encrypted with AES-GCM, the copy is deleted, nothing in the phone’s gallery, then it is decrypted in memory for the viewer. Backup: the passphrase, PBKDF2 over 210,000 rounds, then the BCEX2 file written chunk by chunk. What it brings in: seven paid nights out of 78 light up, €750 in total, €107.14 on average over paid ones only. Nothing is final: an encounter reopened, its rating corrected, a deletion asked then cancelled. Address and route: only the address goes through the door, to the map app you pick, which draws the route in the real Gulf of Morbihan. Three screen sizes: the same people list in 2, 3 then 4 columns. And nothing leaves: no server, no account, no telemetry." width="100%">

<img src="docs/en/sections/s02.png" alt="02 The screens" width="100%">

The app is designed first for the passport format, the cover screen of a Galaxy Z Fold: wide and short. That is where it gets used every day, so it carries the full sheet. The faces come from the demo set, generated portraits: nobody real.

<img src="docs/en/schemas/captures-passeport.svg" alt="Twelve screens in passport format, the Fold cover screen. Launch: the icon on the app’s background. Loading: a ring draws around the logo while the name rises. Lock: the logo has slid into place, the fingerprint button waits. Directory: three columns of people with photos, sortings, cities and tags. Person: Enzo’s photo full size, his tags, his encounters. Notebook and gallery: dated notes, a photo and a video. Viewer: the video playing, with the download button. Exact point: the map around Auray with nearby communes and the pin. Statistics: the year total and the podium. Map: Brittany and the clustered cities. Calendar: September in seven columns. Settings: the lock, the backup, restore." width="100%">

On launch, Android puts the icon in the centre; the app picks it up at the same spot, draws a ring around it, raises its name, then slides the logo and title to their exact place on the lock screen. You cannot tell where one ends and the other begins. The fingerprint prompt only comes once the animation is over.

On a regular 16:9 phone, the layout drops to two columns and moves search below the title:

<img src="docs/en/schemas/captures-telephone.svg" alt="Four screens on a 16:9 phone: the lock, the directory in two columns, Enzo’s page with its chips on two lines, and the map." width="100%">

And on the unfolded 4:3 screen, navigation becomes a rail on the left and the directory goes to four columns:

<img src="docs/en/schemas/captures-tablette.svg" alt="Three screens on a large 4:3 screen: the directory in four columns with every filter on one line, the map with the ranking and the faces seen in Vannes, and Enzo’s page with the photo across the full width." width="100%">

The same screen on its side is 1200 points wide. The person page then splits into two panes, the photo on the left at full height:

<img src="docs/en/schemas/captures-paysage.svg" alt="Four screens on a large screen held sideways: the directory in four columns next to the rail, Enzo’s page in two panes with the photo on the left and the encounters on the right, the statistics with the podium centred, and the map of Brittany above the city ranking." width="100%">

The people list filters as you type: every letter reruns a single query on the encrypted database, looking in the first name, the city and the tags. City and tag chips add to the search instead of replacing it, and a sort only changes the order of that same query.

<img src="docs/en/schemas/repertoire.svg" alt="Searching and sorting the people list. Typing « emb » in the Name, city, tag field reruns the query on every letter, looking in the first name, the city and the tags of each card. At « e », all 18 people remain; at « em », Emma and the four people tagged Good kisser; at « emb », those four only. Clearing it and touching the Vannes chip keeps people whose city is exactly Vannes, 7 of them. Then the sorts: Top rated orders by average rating, Most seen by number of encounters, A to Z by first name ignoring case, and on a tie the first name decides. The row of chips holds the four sorts, the four cities with the most people and the eight most used tags. Filters add up, a tag is compared by its key without accents or case, and everything starts out empty on unlock." width="100%">

Logging an encounter takes six fields, all optional except the date, which is already set to now. The rating goes by half points, touching half a star, and an amount left empty means nothing, not a time worth zero euros. On save, a single function, `rafraichir()`, reloads the card, the rank, the people list, the statistics, the calendar and the map: no screen keeps a stale number.

<img src="docs/en/schemas/rencontre.svg" alt="Logging an encounter. From Enzo’s card, New encounter opens the form: the date and time are already set to now, the place is typed, Auray, with a pin on the map if you want; the amount stays empty for nothing, here €50; the rating is given in half points by touching half a star, 4.5 out of 5; the tags His place and All night describe that time; a note goes into the notebook, dated and tied to the encounter. Save calls rafraichir(), which reloads the card (8 times, rating 3.9), the rank (No. 12 becomes No. 11), the people list, the year’s statistics, the calendar, the map and the notebook. An encounter can be edited or deleted; once deleted, it leaves the statistics, the map and the calendar, its notes stay." width="100%">

Every figure on the stats screen comes from an SQL query, not a loop in the app: the database sends back twelve integers for the twelve bars, not every encounter. The average earnings only count paid nights, and a year with nothing before it shows no percentage rather than dividing by zero. Total, earnings and months follow the chosen year; the podium and roles cover every card.

<img src="docs/en/schemas/statistiques.svg" alt="The stats screen and where its figures come from. In total: 78 encounters in 2026 against 33 in 2025, or +136%, with 18 people each counted once. Top rated: the average score, halved to fit out of five, then the number of times; Noa J. at 4.9, Gabriel T. and Ibrahim D. at 4.8, split by the exact average; the podium covers every year. What it brought in: €750 over 7 paid nights out of 78, or €107.14 on average, the average only counting paid nights. By month: each encounter in its month, September first with 18 times. Breakdown: 18 cards sorted by role, 8 versatile, 6 top, 4 bottom, counted in people, not encounters. Everything is computed in SQL inside the encrypted database." width="100%">

The palette follows the logo's gradient, from violet to fuchsia, on near-black backgrounds.

<img src="docs/en/schemas/palette.svg" alt="The BodyCount palette, on Enzo’s card. Each colour lights up in turn and a line ties it to what carries it. Background #0B0616, the floor, a black leaning violet. Edge #261A45, card borders. Card #1A1030, the fill of an encounter. Text #F6F2FF, the name and figures. Secondary text #9B8CB8, the labels. Tertiary text #7D6E99, the time and place. Primary violet #A855F7, links and the start of the gradient. Fuchsia #D946EF, the end of the gradient on the New encounter button. Star #C084FC, ratings. Green #1ED760, the No. 12 rank. Gold #FDE68A, the €50 of a night out. Surface #150C28, the dialog that opens. Red #F87171, the app’s only red, on Delete." width="100%">

<img src="docs/en/sections/s03.png" alt="03 Install" width="100%">

The APK lives in the repository's [Releases](https://github.com/Cybertrist/BodyCount/releases/latest), not in the code: a binary of nearly thirty megabytes versioned with the sources would stay in the history forever, and every clone would drag it along, once per version. Both links below always lead to the latest one.

There are two apps, and they install side by side. **BodyCount**, the real one, starts empty and waits for your people. **BodyCount demo** is a separate app, filled with the eighteen people of the sample set, with their photos, their encounters and their notebooks: enough to go through everything without typing anything. It opens without a fingerprint and lets screenshots through; the lock can be switched back on in its settings.

<p align="center">
  <a href="https://github.com/Cybertrist/BodyCount/releases/latest/download/BodyCount.apk"><img src="docs/en/telecharger.png" alt="Download BodyCount, full version, Android 7 or later, arm64" width="400"></a>
  <a href="https://github.com/Cybertrist/BodyCount/releases/latest/download/BodyCount-demo.apk"><img src="docs/en/telecharger-demo.png" alt="Try the BodyCount demo, filled with eighteen sample people" width="400"></a>
</p>

It needs Android 7 or later on a 64-bit processor, which means any phone from recent years. Since it does not go through the Play Store, Android will ask you to allow installs from the app that opens it, the browser or the file manager.

For an app that will hold this kind of data, two checks are worth the minute they take. The file's fingerprint must match the one published with the release:

```bash
sha256sum BodyCount.apk BodyCount-demo.apk
# 6fd713f7036788d57fe95d8a6f9a27f030374d7c9264f9d8e83d0cfbce569bd4  BodyCount.apk
# e2bdd13500aa165746168fde9b5319c3df97f41ae81b96408de12f0be28235f2  BodyCount-demo.apk
```

And the certificate that signs it must be this one, the same for every version. Android refuses an update signed with another key, which also rules out an APK tampered with on the way:

```bash
apksigner verify --print-certs BodyCount.apk
# SHA-256: ac09674e066658991aeb60f02e1386423b5e14dede4bd6c844f542785fef86d1
```

The demo is signed with the same key.

The real app does not contain the sample set: not the eighteen people, not their faces, not the settings row that creates them. Only the demo carries them, and since its identifier is different, it never reads or writes the real app's database.

<img src="docs/en/sections/s04.png" alt="04 The stack" width="100%">

<img src="docs/en/schemas/stack.svg" alt="The BodyCount stack, package by package, where each one works. Flutter on Dart 3.11 draws every screen. Open: local_auth lets Android check the fingerprint, flutter_secure_storage takes out the key kept by the Keystore, cryptography derives two keys with HKDF, go_router keeps screens behind the lock. Browse: sqflite_sqlcipher opens the encrypted database in a folder given by path_provider, flutter_riverpod holds state and rereads it after every write, and the big titles are in Chakra Petch, bundled. Add a photo: image_picker hands it over, cryptography encrypts it with AES-GCM, uuid gives it a name unrelated to it. Add a video: media3-transformer shrinks it in Kotlin, javax.crypto encrypts it in chunks with hardware AES, video_player plays it back. Go and see him: intl writes the dates, url_launcher hands directions to the maps app. Back up: cryptography derives the key from the passphrase with PBKDF2, javax.crypto writes the stream, archive still reads the old format. No network package on the list." width="100%">

Requires the Flutter 3.x SDK and an Android device or emulator. The project follows the Flutter 3.47 template: Gradle 9.3, Android Gradle Plugin 9.1 and Kotlin 2.4, compiled by the Android plugin itself.

```bash
git clone https://github.com/Cybertrist/BodyCount.git
cd BodyCount
flutter pub get
flutter run --flavor complete
```

For an installable build, `flutter build apk --release --split-per-abi --flavor complete`, and for the demo `--flavor demo --dart-define=DEMO=true`. Every build names its variant, `flutter run` too: `flutter run --flavor complete`. Splitting by architecture is not a nicety: SQLCipher ships one native library per ABI, and without the split the APK carries a third more weight for nothing. The release build is signed with the key named by `android/key.properties`, which git ignores; without that file, the debug key is used.

A few lines of Kotlin in `MainActivity` replace two packages. `cryptography_flutter` installed itself as the implementation of all cryptography, key derivation included, and Android refused the empty HMAC key of an unsalted extraction: the database would no longer open. `share_plus` 13 would have required a major version of `flutter_secure_storage`, where the master key lives. The activity therefore carries native AES-GCM, the file picker, sharing, saving to the gallery, reading a video's duration and one of its frames, and re-encoding it with Media3.

<img src="docs/en/sections/s05.png" alt="05 Architecture" width="100%">

Five layers, and one rule: a layer never knows the one above it. A screen does not see SQLite, a repository does not see Riverpod, and nothing reads a vault file without going through the keyring.

<img src="docs/en/schemas/couches.svg" alt="The five layers of BodyCount, crossed by one tap on Save. The form for an encounter with Enzo is filled in: Auray, 4.5 out of 5, His place and All night. On the way down, an “encounter” card drops from layer to layer: the screen calls depotRencontres.creer directly and jumps over the providers; the repository, the only place SQL is written, runs the INSERT, then the tags and the notebook note; the security layer lends the connection opened with the key from bodycount/db/v1; on the disk, one page of bodycount.db changes and is encrypted before it is written. On the way up, the screen calls rafraichir, which invalidates twelve providers in a single call, from the people list to Enzo’s tags; they reread through the repositories, with grouped queries, on the same connection, and the values climb back to the card, which comes back up to date: 8 times, 3.9, the encounter of 26 September on top. Writing goes down, rereading goes up, and no screen writes SQL." width="100%">

On unlock, the directory, the cities and the statistics ask for the database at the same instant. The database keeps the future of its opening, and they all await it. That was not the case at first: each started its own, one closed the other's connection while checking the key, and the other, taking the database for plain, copied it over and erased the file. The app then ran on two files, the person screen writing to one and the directory reading the other, which showed as a city that refused to change. A database is now only judged plain by its header, and one that lost its version number in the process is repaired on launch.

<img src="docs/en/schemas/ouverture.svg" alt="A single database opening. On unlock, the people list, the cities and the statistics ask for the database at the same instant. Before the fix, each started its own opening: the second checked the key and closed the first one’s connection on the way; the first failed, took the database for plain and copied it, deleting the file. The app then ran on two files: Enzo’s card saved Auray into the copy, and the people list, reading the old one, still showed him in Vannes. After the fix, the database keeps the future of its opening: the first request starts it, the other two wait for the same one, and everyone reads and writes one encrypted file; Auray shows up right away. A database is only judged plain by its header, one that lost its version number goes back through the migrations up to schema v7, and a failed opening is dropped so the next one tries again." width="100%">

Seven tables, schema v7: five, plus two link tables for tags. `personnes` is the hub: everything attached to a person leaves with them, and it is the schema that guarantees this, not a hand written deletion loop. Videos live in the photos table, with a type, a duration and a thumbnail: they sit in the same place on the person, leave with it, and are kept in the same vault.

<img src="docs/en/schemas/modele.svg" alt="The BodyCount data model, schema v7, in the encrypted database. Seven tables: personnes, rencontres, notes, photos, etiquettes, and two link tables, personne_etiquettes and rencontre_etiquettes. Encounters, notes, photos and links point to personnes with ON DELETE CASCADE; notes and photos point to rencontres with ON DELETE SET NULL. Enzo P.’s card is stored: one row in personnes, seven encounters, four links to shared tags, the tags for each night, three notes, one photo and one video whose encrypted files live in the vault, outside the database. Then the 14 September encounter is opened and deleted: its tags for that night go by CASCADE, the note written that night stays, its link simply undone by SET NULL, and nothing else moves. Foreign keys only work because PRAGMA foreign_keys = ON is set on every open; a tag is unique by its key and scope; rating and amount are integers." width="100%">

<img src="docs/en/schemas/arborescence.svg" alt="The lib tree, 59 Dart files and 18,523 lines, unfolding folder by folder, with each folder’s weight under the tree. At the root, main.dart, the entry point that starts reading the towns, and app.dart, the app, its theme and relocking; at launch, everything leads to the lock. config: the palette, the Fold’s three screen shapes, routing whose only door is the lock, the sample data and the demo. domaine: the models, a card, an encounter with its half-point rating and its amount, a tag and its key, a notebook line. donnees: base.dart for the single opening and schema v7, depots.dart the app’s only SQL, statistics in SQL, the 34,836 towns and the geometry of France. ecrans: the people list, the card, the encounter form, the statistics, the map, the calendar and the rest. providers: Riverpod state, rafraichir() and the twelve providers it invalidates, the fingerprint and lock(), the settings. security: the master key and HKDF, the photo and video vaults, the chunked stream, screen protection. utils: backup and restore, media, the file picker, dates. widgets: the map of France, the people card, the stars, the bottom bar. On the right, one app screen per folder: the lock, the people list in two then three columns, the encounter form, the statistics, the calendar, Enzo’s card going to 8 times, the fingerprint opening the database, the encrypted export, and the real map of Brittany." width="100%">

<img src="docs/en/sections/s06.png" alt="06 Encryption" width="100%">

The fingerprint does not unlock a screen: it is what brings the master key into memory. That 32-byte key, drawn at random on first launch, sleeps in preferences encrypted by the Android Keystore; until Android has recognised your finger or your PIN, the database, the photos and the videos are just noise on the disk. Two keys are derived from it by HKDF, each with its own label, one for SQLCipher, the other for the vault, and neither exists in memory before.

<img src="docs/en/schemas/chiffrement.svg" alt="Where the BodyCount keys come from. You touch the sensor on the lock screen, Android asks for the fingerprint or the phone’s PIN and checks it itself. Only then does the 32-byte master key, drawn at random on first launch and kept in preferences encrypted by the Keystore, enter memory. HKDF-SHA256 derives two keys from it with two labels: bodycount/db/v1 gives the SQLCipher password of the database, bodycount/photos/v1 the AES-256-GCM key of the photo and video vault. The people list fills in: names when the database opens, faces decrypting when the vault opens, then Enzo’s card, his large photo and gallery, decrypted in memory. On lock, the keys are forgotten: on disk, without the fingerprint, bodycount.db, the vault’s .bcx files and the stored key are just noise. Removing the key from the Keystore is enough to make everything unreadable, for everyone." width="100%">

Each photo is its own file, encrypted with AES-GCM in one block, named by a UUID that says nothing about its contents. A video follows the same principle, in chunks: the next section says why. An exported backup uses the same chunked stream, except that its key comes from your passphrase rather than the Keystore: without it, the file reads back nowhere, including on the phone that produced it.

<img src="docs/en/schemas/formats.svg" alt="BodyCount’s file formats, as in a hex editor. A vault photo: the BCX1 mark on 4 bytes, a random 12-byte nonce, the whole photo encrypted in one block with AES-256-GCM, then a 16-byte MAC, that is 4 + 12 + 184,288 + 16 bytes; its name is a UUID that says nothing about the person. A video: the BCV1 mark, then chunks, each made of a 4-byte length, 00 10 00 00 for one megabyte, a fresh 12-byte nonce, at most one encrypted megabyte and a 16-byte MAC; same key and same extension as photos. A backup: the BCEX2 mark on 5 bytes, a 16-byte salt in the clear so that PBKDF2 can rebuild the key from the passphrase, then the same chunked stream; once decrypted, it carries entries made of a 1-byte kind, a 2-byte name length, the name, donnees.json first, an 8-byte size and the content, then the photos and videos, and a single zero byte to finish. One chunk up close: 4 + 12 + 1,048,576 + 16 bytes on disk, and 9 more authenticated without being written, its rank on 8 bytes and whether it is the last on 1; moving or cutting a chunk changes those values, and reading stops at the chunk touched." width="100%">

The lock closes after a spell without a gesture on screen, or on returning from the background, after a configurable delay. It waits for work in progress: a backup, a restore or a long video being encrypted involve no finger on the glass, and the system file picker sends the app to the background. It can also be switched off entirely in the settings: encryption stays, but the key then loads without proof of identity, and the screen says so before accepting. On lock, the keys are forgotten, and their bytes overwritten before being released rather than left to the garbage collector. The task switcher preview is blanked, screenshots are blocked, and Android's automatic backup is refused: it would copy the encrypted database onto servers that are not yours.

<img src="docs/en/schemas/verrou.svg" alt="The BodyCount lock. On touching the sensor, the fingerprint loads the master key from the Keystore, the database opens and the people list appears. Every touch restarts a 45-second countdown, adjustable to 15 s, 2 or 5 minutes. In the recents screen, the app preview stays black and screenshots are blocked. In the background, the time is noted; on return, if the delay has run out, the key, the database connection, the decrypted photos and the videos being played are wiped from memory, and the fingerprint is asked again. A backup, a restore or a video being encrypted holds the lock back." width="100%">

<img src="docs/en/sections/s07.png" alt="07 Videos and backups" width="100%">

A photo or a video never enters BodyCount in the clear. The copy handed over by the Android picker is encrypted into the app's vault, then deleted, and nothing shows up in the phone's gallery. To display it, the photo is decrypted in memory and the video in the private cache while it plays. Only the download button puts a copy in the clear into the gallery, and only when you ask for it.

<img src="docs/en/schemas/coffre.svg" alt="The photo and video vault. On Enzo’s card, Photos and videos, then Add: the Android picker hands over a photo and a video as temporary copies, in the clear. The photo enters the vault encrypted as one AES-GCM block; the video first gives up its length and one frame, which becomes its encrypted thumbnail, then is shrunk and encrypted in chunks. Each original is deleted, and nothing shows up in the phone’s gallery. In the viewer, the photo is decrypted in memory; the video is decrypted into the private cache while it plays, then deleted on close. The download button puts a copy in the clear into Movies › BodyCount, only when asked. A file changed by one byte is refused, and on lock the photo cache and the playback copies are gone." width="100%">

A video weighs a hundred photos. Encrypting it in one block meant holding it whole in memory, and a backup carrying videos had to hold all of them at once. Both therefore go through a stream encrypted in one megabyte chunks, written and read back on disk.

<img src="docs/en/schemas/flux.svg" alt="The chunked encrypted stream. A 6.4 MB video of Enzo enters the vault one megabyte at a time: each slice goes through a buffer of one megabyte at most, then through native AES-GCM with the vault key and a fresh nonce, and is written into the BCV1 file, preceded by its length and nonce, followed by its tag. Each chunk also authenticates, without writing them, its rank and whether it is the last; the last one, even empty, is only written on close. On reading, the seven tags are verified and the video is decrypted into the private cache. Then three attacks: two chunks swapped, and chunk 2 is refused; the end cut off, and chunk 5, which now looks like the last without being it, is refused; one byte changed in chunk 4, refused. Each time, the viewer shows Unreadable video instead of a truncated content." width="100%">

Each chunk authenticates its rank and whether it is the last, without writing them: they go into the tag computation. Swapping two chunks, removing one or cutting the end of the file makes reading fail instead of returning a truncated video without a word. AES goes through Android's encryption, which uses the processor's instructions: in pure Dart, a hundred megabytes took half a minute.

A phone films in 1080p or 4K at bitrates meant for a big screen. On import, a heavy video is re-encoded by Media3 on the phone encoder: H.264, 720 points on the short side, 2.5 Mb/s, sound as is. A 20 MB video comes out at about 3. Re-encoding always costs a little: a video that is already light is left alone, and the shrunk version is only kept if it saves at least a tenth. If the encoder fails, the original goes into the vault.

<img src="docs/en/schemas/allegement.svg" alt="Shrinking a video on import. In Enzo’s gallery, three videos are added, and the screen says “Encrypting the video, 1 of 3”, then “Shrinking the video” with its percentage. The first, shot on the phone at 1080 x 1920 and 16 Mb/s, weighs 20 MB: Media3 re-encodes it on the phone encoder, in H.264, 720 points on the short side, 2.5 Mb/s, sound as is. It comes out at 3 MB, under the 90% line: the shrunk one enters the vault and the original is deleted. The second, already compressed at 2.7 Mb/s, weighs 8 MB; re-encoded, it still takes 7.6, above the 7.2 line: the shrunk one is deleted and the original goes in. The third, 720 x 1280 at 3 Mb/s, is already under both limits, 720 points and 4 Mb/s: it goes in without touching the encoder. If the encoder fails, its output is deleted and the original goes in. In all, 33 MB picked, 16 MB in the vault, every video encrypted in chunks." width="100%">

To be played, a video is decrypted into the app's private cache, because the system player needs a file. The copy is erased when the player closes, on lock, and on the next launch if the app was killed mid-playback. A button in the viewer saves a photo or video to the phone's gallery, under Pictures or Movies, in a BodyCount folder: in the clear, since that is the whole point of the gesture, and the message says so.

A backup is encrypted with a passphrase, not with the phone's key, so it can be read back on another device. The passphrase goes through PBKDF2 for 210,000 rounds, then the file is written as a stream: the cards first, then every photo and video, taken out of the vault and re-encrypted straight away, never touching the disk in the clear. Once the file is saved where you want it, the date is noted and the reminder in the people list stays quiet for a month.

<img src="docs/en/schemas/sauvegarde.svg" alt="Exporting a backup. The people list reminds you the last one is 38 days old; Back up leads to the settings, then to Export, encrypted. The passphrase, at least eight characters, goes through PBKDF2-HMAC-SHA256 for 210,000 rounds with a random 16-byte salt, and yields an AES-256 key. The file is written as a stream into the private cache: the BCEX2 mark and the salt in the clear, then donnees.json with the cards, then each photo and each video, taken out of the vault and re-encrypted straight away in one-megabyte chunks, and a single zero byte to finish. Backup ready: it is saved to Downloads through the system picker, the cache copy is deleted, and the date noted silences the reminder for 30 days. “Later” silences it for a week. The lock waits during the export, and a restore checks everything before touching anything." width="100%">

A restore touches nothing before it has checked everything. The file is read twice: first to decrypt each chunk and drop it, then to store the media under new names, next to the old ones. The cards are only replaced at the very end. A wrong passphrase stops at the first chunk, a damaged byte at its own, and a cut-off halfway only deletes the files it had just added: either way, the cards on the phone are intact.

<img src="docs/en/schemas/restauration.svg" alt="Restoring a backup. In the settings, Restore a backup warns that everything will be replaced, but that nothing changes until it has been read and checked in full. The system picker hands over the file, then the passphrase chosen at export rebuilds the key through PBKDF2. The file is read twice: on the first pass, each chunk is decrypted, its tag checked, then dropped; on the second, the photos and videos enter the vault under new names, next to the old ones, and donnees.json is kept for the end. All that time, the 12 cards on the phone are intact. Only then are they replaced by the 18 from the backup, the old vault files deleted, and the people list reread. Another time, with a wrong passphrase, the first chunk refuses to decrypt: the restore stops dead and nothing has moved. A damaged byte stops the first pass; a cut-off during the second only deletes the new files. The lock waits, and the copy of the file is always deleted." width="100%">

Export offers to save the file to a folder before sharing it: with videos, a backup quickly exceeds what most apps accept. Sharing goes through a temporary URI limited to the backups folder alone. When the last backup is more than a month old, or there never was one, a banner says so at the top of the directory. Backups in the old format, a ZIP encrypted in one block, still read back.

<img src="docs/en/sections/s08.png" alt="08 The map, without tiles" width="100%">

A tile map would send a server, on every drag of a finger, the exact list of places being looked at. For an app whose whole promise is that nothing leaves the phone, that was the one thing not to do. So France ships with the app.

<img src="docs/en/schemas/fabrication.svg" alt="How the BodyCount map background is made. It starts as an open-data GeoJSON: 1.2 MB of text for the coastline and department borders, each point written in some twenty characters. Every longitude and latitude is brought down to 1/2000 of a degree from (−6°, 41°), about fifty metres, and fits in a 16-bit integer: four bytes per point, an error no phone screen can show. Out comes france.bin: the FRA1 mark, two layers, 160 coast rings and 117 department rings, 45,853 points, 184,536 bytes, shipped in the APK and decoded once per launch. When the Map screen opens, the view frames the main city and its neighbours up to two thirds of encounters, with a floor and a margin. The land is a separate drawing, painted once and shielded from the ripples and shuttles that move all along; on a pinch, the zoom goes through a matrix without rebuilding a single path. Not one network request: no tile, no font, and the 34,836 towns are shipped too." width="100%">

The map opens tight on your cities, not all of them: it starts from the main one and widens until two thirds of your encounters are in. Two cities too close to sit side by side become a single bubble carrying the sum; the disks never move, and moving closer is what splits them.

<img src="docs/en/schemas/carte.svg" alt="The BodyCount Map screen. The view opens tight on your cities: from the main one, nearest first, until two thirds of your encounters are in, here Vannes, Auray and Lorient, at 4.3×. The land rises, the cities drop in as bubbles carrying their count, biggest first, with two ripples on Vannes and a shuttle to every other city. Vannes and Auray, too close at this scale, make a single bubble of 65. A pinch on the gulf zooms to 9.6×: the bubble splits into Vannes 61 and Auray 4, and the pins placed by hand appear. The zoom button brings back the opening view. Further down, the cities ranked in bars, then the faces seen in Vannes. No tile is loaded: no server knows which corner of the map you are looking at. The exact spot of an encounter is placed by hand, with nearby towns as landmarks." width="100%">

The map pinches to zoom up to twenty times, drags to pan, and the scale bar regraduates itself. It opens framed on the cities making up two thirds of the encounters, so on the real centre of activity rather than the whole country.

No pin is moved by a single pixel: at country scale, nudging a point by forty points moves it a hundred kilometres. When two cities are too close to sit side by side, they merge into one bubble carrying the sum, which splits as soon as you get close enough. Vannes and Auray are seventeen kilometres apart: no clever placement changes that, it is geography.

Cities come from the official register of French communes, shipped with the app as well: all 34,836 communes of mainland France and Corsica, from the smallest village to Paris, 420 KB once compressed in the APK. `tool/communes.mjs` rebuilds it from geo.api.gouv.fr; it is the only part of the project that touches the network, and it runs on the developer's machine, not the phone. The exact spot already opens centred on the commune the typed place lands on.

<img src="docs/en/schemas/villes.svg" alt="A typed city and the commune it lands on. In the encounter form, the place is typed, then Place on the map opens the exact spot centred on the commune found among the 34,836 in the reference list, ranked from most to least populous. The input becomes a key, lower case, without accents, hyphens or spaces, then goes through four tries in order, and the first that answers wins. Locmariaquer: the exact name. Plougastel: the start of a name, Plougastel-Daoulas; with just Plou, Plouzané, more populous, would come first. Locmariaqer: a typo, one letter off, two allowed from eight letters. Vannes centre: a commune name opening the input, the longest wins, Vannes rather than Vanne in Haute-Saône. London is in the table of foreign cities: it is never approximated, otherwise it would land in Ondres, in the Landes, and the exact spot opens on the whole of France. A department in brackets settles namesakes, Saint-Denis (11); « St » becomes « saint »; and for the ranking, only an exact name makes a place a city." width="100%">

Everything in France gets placed. The exact name first, ignoring accents, hyphens and « St »; then a start of name, « Plougastel » for Plougastel-Daoulas; then a typo of one or two letters; then a commune name followed by a neighbourhood. At each step the most populous wins, and a department in brackets, « Saint-Denis (11) », settles namesakes. The tolerance stops at cities: « chez lui » is not a village one letter away, and an encounter place that is not a city counts for the person's city. Places abroad stay off the map, which only draws France, but appear in the ranking of places.

An encounter can also be placed by hand, at an exact point. Without tiles there are no streets to show: nearby communes, with their names, serve as landmarks. Enough to drop a pin « between Arradon and Séné », which shows on the map of places once you zoom in.

<img src="docs/en/sections/s09.png" alt="09 The calendar" width="100%">

The question you ask most is not « how many » but « when »: which night was it, how long ago, was that a good stretch. A chronological list answers badly past a few dozen entries: you have to scroll and count.

The calendar answers at a glance. A month fits in seven columns: busy nights, empty weeks and streaks read without counting. An empty day is just a dimmed number; a busy one carries a disc, golden when the night earned something. Tap it to see only that day in the list below.

Under each day, up to three signs say what it had of note, rarest first: the year's best amount before the hundred euros, the hundred euros before a plain banknote, the month's best rating before a five out of five. Twenty-five signs in all, every one derived from what the app already records, none to enter by hand. A legend reachable from the header states exactly what triggers each: not « a good night » but « a five out of five rating », so you know what to enter if you want to see one appear.

<img src="docs/en/schemas/calendrier.svg" alt="The BodyCount calendar. September 2026 fills in on seven columns: an empty day is only a faded number, a busy day carries a purple disc, golden when the night paid. Under each disc, three signs at most. Touching the 23rd rings it in white and the list shows only that day. Its six signs, first time, amount, best rating of the month, all night, his place, bottom, are sorted by rarity: the first three stay under the day, the first two on the list row. The legend, opened by the question mark, gives the twenty-five signs in seven families, money, rating, who, rhythm, time, place and role, all worked out from what is already entered. Then August shows, still on six weeks, and a touch on 2025 opens December, its last busy month." width="100%">

A day can earn far more than three signs: the 23rd has six. They get sorted from rarest to most common, and only the first three fit under the disc, the first two on the list row. The rest is not lost, there is simply no room for it.

Always six weeks on screen, even when the month only fills five: a grid whose height depends on the month makes the whole screen jump as you leaf through it.

<img src="docs/en/sections/s10.png" alt="10 Privacy model" width="100%">

<img src="docs/en/schemas/confidentialite.svg" alt="The BodyCount privacy model, in two columns. What is true: no network request, no account, no analytics, Android refuses any connection for lack of the INTERNET permission. The database is encrypted by SQLCipher, its key lives in the Keystore and is only loaded after the fingerprint. Every photo and video is encrypted with AES-GCM and never shows in the phone gallery. The recents preview is hidden, screenshots blocked, Android backup refused. A restore checks the whole backup before erasing anything. What is not: once the app is open, everything is readable on screen, the fingerprint guards access, not your shoulder. An exported backup travels, it is worth what your passphrase is worth. Losing the phone means losing the data, the key is copied nowhere. The fingerprint can be turned off in the settings, and the key then loads without asking anything. To be played, a video is decrypted into the private cache while it plays." width="100%">

<img src="docs/en/sections/s11.png" alt="11 The tests" width="100%">

What breaks silently is what touches the disk: opening the database, its migrations, encryption, backups. Yet SQLCipher, the Keystore and native AES only exist on Android. The tests therefore run on an emulator, against the real libraries, rather than against stand-ins that would pass where the app fails. Six of them drive the whole app, by finger, from one screen to the next.

```bash
flutter test integration_test -d emulator-5554 --flavor complete
```

They destroy the data and the key of the app they target: run them on an emulator, never on the phone holding the real journal.

<img src="docs/en/schemas/tests.svg" alt="The BodyCount tests, running. flutter test integration_test on the emulator: Database, four tests, including simultaneous openings sharing a single connection and a database without a version number repaired, not destroyed; Encrypted stream, eight tests, round trips from 0 bytes to three megabytes, native and Dart reading each other, a truncated file, two swapped chunks and one changed byte refused; Video vault, a video that reads back identical; Backup, four tests, everything comes back, and a wrong passphrase, a damaged backup or a foreign file touch nothing; Communes, a village, a typo, a homonym. Meanwhile, nothing on screen: it all happens under the hood, with the real SQLCipher and the real Keystore. Then six journeys drive the app by finger: Nathan’s city goes from London to Locmariaquer, the Musclé tag leaves only Kelyan, searching “barb” leaves only Adam, Ibrahim’s photo opens full screen with its gallery button, the map ranks Arradon and the agenda shows the month, the backup reminder shows up then goes quiet. 24 tests passed. Finally, on the machine, no emulator, the seven commune search tests." width="100%">

They paid off on their first run. The data tests found a backup end marker written on eleven bytes and read on one: no restore would have gone through. The screen tests found a row of figures overflowing its fixed height on the person page.

<img src="docs/en/sections/s12.png" alt="12 No Internet" width="100%">

"No network requests" is easy to write. Here it is not a promise made by the code but an Android rule: the app does not ask for the `INTERNET` permission, and without it the system refuses to open any connection at all. A bug, a chatty library, a dependency poisoned in its next update: everything hits the same wall, which is not inside the app and which the app cannot get past.

It can be checked on the APK itself, without reading a line of code:

```bash
aapt2 dump permissions app-arm64-v8a-release.apk
```

The list is short: the fingerprint, under its current name and its old one, then `WAKE_LOCK` and `ACCESS_NETWORK_STATE`, added by libraries. The first keeps the phone from falling asleep mid-task, the second tells whether a network is there, without allowing any use of it.

Four exits remain, and none of them opens by itself. Each one waits for a finger, and hands over to another app, which then answers for what it does with it:

<img src="docs/en/schemas/reseau.svg" alt="BodyCount does not ask for the INTERNET permission: Android refuses to open any connection. Map tiles, fonts, analytics or crash reports that other apps send on their own would crash into that wall, and the Internet is never reached. Four doors remain, each opened by a touch and handing over to another app: Directions gives the address to the maps app chosen through geo:, Call gives the number to the dialer through tel:, Export puts the encrypted backup in the folder picked in the system picker, and Download files a plain copy of the photo under Pictures › BodyCount. The manifest writes a single permission, the fingerprint; France ships inside, so does the font, and Android backup is refused." width="100%">

The last one is the only one that leaves a plain trace: a downloaded photo becomes a photo like any other, visible to the gallery and to anything that reads it. That is the price of "I want to keep it somewhere else", and the app only pays it on request.

<img src="docs/en/sections/s13.png" alt="13 A word of warning" width="100%">

This repository is a personal project, not a security product. The encryption rests on proven primitives and on Android's Keystore, but the assembly itself has been reviewed by nobody other than me. If you plan to put data in it whose leak would cost you something, read the code first, or don't.

The sample set only exists in the demo, and in a working build compiled with `--dart-define=ESSAIS=true`. Its faces, generated portraits of no one real, are not part of the repository: to build the demo, they go into `assets/demo/`; for a working build, onto the phone, with `adb push assets/demo/. /sdcard/Android/data/com.bodycount.bodycount/files/demo/`. Without them the eighteen people are still created, simply without a photo: the generator copes with every missing image.

<img src="docs/en/sections/s14.png" alt="14 Licence and author" width="100%">

BodyCount is designed and built by **Tristan Joncour** ([@Cybertrist](https://github.com/Cybertrist)), a cyber defence engineering student at ENSIBS, for his own use first: it is the app he wanted on his phone, and it did not exist.

The code is released under the [MIT](LICENSE) licence: free to read, reuse and modify, as long as the copyright notice stays. The geometry of France and the register of communes come from open data; the Chakra Petch typeface is under the SIL Open Font licence; the fingerprint icon in the diagrams comes from Material Design, under the Apache 2.0 licence.

---

<sub>None of the images on this page come out of a drawing tool: they are HTML pages captured by Chrome, plus six animated SVGs. The screenshots come from an emulator driven by script, trimmed of their bars by <code>rogner.js</code>. Everything lives in <a href="docs/tools/">docs/tools</a>, and <code>bash docs/tools/tout.sh</code> rebuilds it all, in both languages, social preview included.</sub>
