import 'dart:io';

import 'package:path/path.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';

import '../domaine/etiquette.dart';
import '../security/key_vault.dart';
import '../security/photo_vault.dart';

/// La base, chiffrée par SQLCipher.
///
/// Le fichier sur le disque est illisible sans la clé du trousseau : avec
/// un accès root, une sauvegarde ADB ou la mémoire du téléphone en main,
/// on ne voit qu'un bloc d'octets.
///
/// Le schéma tient en six tables. Les étiquettes ont la leur, avec deux
/// tables de liaison, au lieu d'être une chaîne de texte dans la fiche :
/// c'est ce qui permet de les compter, de les renommer, de les proposer à
/// la saisie et de filtrer dessus sans attraper les voisines.
class Base {
  Base._();

  static final Base instance = Base._();

  static const _fichier = 'bodycount.db';
  static const _version = 6;

  /// L'ouverture en cours ou faite. On garde le futur, pas la base : au
  /// déverrouillage, le répertoire, les villes et les statistiques
  /// demandent la base au même instant. Avec `_base ??= await _ouvrir()`,
  /// chacun lançait sa propre ouverture avant que la première n'ait fini.
  /// L'une fermait la connexion de l'autre en vérifiant la clé, l'autre
  /// croyait alors la base en clair et la « convertissait » en effaçant
  /// le fichier. L'application finissait avec deux connexions sur deux
  /// fichiers différents : la fiche écrivait dans l'un, le répertoire
  /// lisait l'autre et affichait l'ancienne ville.
  Future<Database>? _ouverture;

  Future<Database> get db {
    final enCours = _ouverture;
    if (enCours != null) return enCours;
    final ouverture = _ouvrir();
    _ouverture = ouverture;
    // Une ouverture ratée ne doit pas rester en mémoire : la suivante
    // retentera au lieu de rendre toujours la même erreur.
    ouverture.then(
      (_) {},
      onError: (Object _) {
        if (identical(_ouverture, ouverture)) _ouverture = null;
      },
    );
    return ouverture;
  }

  Future<Database> _ouvrir() async {
    if (!KeyVault.instance.isUnlocked) {
      throw StateError(
        'Base demandée avant déverrouillage : authentifier d\'abord.',
      );
    }

    final dossier = await getDatabasesPath();
    final chemin = join(dossier, _fichier);
    final motDePasse = await KeyVault.instance.databasePassword();

    await _chiffrerSiEnClair(dossier, chemin, motDePasse);

    return openDatabase(
      chemin,
      password: motDePasse,
      version: _version,
      onConfigure: (base) async {
        // Sans cette ligne, les ON DELETE CASCADE ne s'appliquent pas :
        // SQLite désactive les clés étrangères par défaut.
        await base.execute('PRAGMA foreign_keys = ON');
      },
      onCreate: (base, version) async {
        await _creerSchema(base);
        // Une base qui a déjà ses tables mais a perdu son numéro de
        // version passe aussi par ici : c'est ce que laissait la fausse
        // conversion décrite sur [_ouverture]. Les migrations suivantes
        // ne font que ce qui manque, elles la remettent d'aplomb.
        await _migrerVers3(base);
        await _migrerVers4(base);
        await _migrerVers5(base);
        await _migrerVers6(base);
      },
      onUpgrade: (base, ancienne, nouvelle) async {
        if (ancienne < 2) await _migrerVers2(base);
        if (ancienne < 3) await _migrerVers3(base);
        if (ancienne < 4) await _migrerVers4(base);
        if (ancienne < 5) await _migrerVers5(base);
        if (ancienne < 6) await _migrerVers6(base);
      },
    );
  }

  Future<void> fermer() async {
    final ouverture = _ouverture;
    _ouverture = null;
    if (ouverture == null) return;
    try {
      await (await ouverture).close();
    } catch (_) {
      // Jamais ouverte : rien à fermer.
    }
  }

  // ---------------------------------------------------------------- schéma

  Future<void> _creerSchema(Database base) async {
    await base.execute('''
      CREATE TABLE IF NOT EXISTS personnes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT NOT NULL,
        age INTEGER,
        ville TEXT,
        rencontre_sur TEXT,
        telephone TEXT,
        adresse TEXT,
        photo_principale TEXT,
        genre TEXT,
        role TEXT,
        cree_le TEXT NOT NULL,
        modifie_le TEXT NOT NULL
      )
    ''');

    await base.execute('''
      CREATE TABLE IF NOT EXISTS rencontres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        personne_id INTEGER NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
        quand TEXT NOT NULL,
        lieu TEXT,
        latitude REAL,
        longitude REAL,
        note INTEGER,
        montant_centimes INTEGER,
        cree_le TEXT NOT NULL
      )
    ''');

    // La clé normalisée porte l'unicité : « Grosse Bite » et « grosse
    // bite » ne peuvent pas coexister, mais le libellé garde la casse
    // que l'utilisateur a tapée.
    await base.execute('''
      CREATE TABLE IF NOT EXISTS etiquettes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        libelle TEXT NOT NULL,
        cle TEXT NOT NULL,
        portee TEXT NOT NULL,
        UNIQUE (cle, portee)
      )
    ''');

    await base.execute('''
      CREATE TABLE IF NOT EXISTS personne_etiquettes (
        personne_id INTEGER NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
        etiquette_id INTEGER NOT NULL REFERENCES etiquettes(id) ON DELETE CASCADE,
        rang INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (personne_id, etiquette_id)
      )
    ''');

    await base.execute('''
      CREATE TABLE IF NOT EXISTS rencontre_etiquettes (
        rencontre_id INTEGER NOT NULL REFERENCES rencontres(id) ON DELETE CASCADE,
        etiquette_id INTEGER NOT NULL REFERENCES etiquettes(id) ON DELETE CASCADE,
        PRIMARY KEY (rencontre_id, etiquette_id)
      )
    ''');

    await base.execute('''
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        personne_id INTEGER NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
        rencontre_id INTEGER REFERENCES rencontres(id) ON DELETE SET NULL,
        texte TEXT NOT NULL,
        ecrite_le TEXT NOT NULL
      )
    ''');

    await base.execute('''
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        personne_id INTEGER NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
        rencontre_id INTEGER REFERENCES rencontres(id) ON DELETE SET NULL,
        chemin TEXT NOT NULL,
        principale INTEGER NOT NULL DEFAULT 0,
        ajoutee_le TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'photo',
        duree_ms INTEGER
      )
    ''');

    // Les index suivent les tris réels de l'application : le journal trie
    // par date, la fiche regroupe par personne.
    await base.execute(
      'CREATE INDEX IF NOT EXISTS idx_rencontres_personne ON rencontres(personne_id)',
    );
    await base.execute(
      'CREATE INDEX IF NOT EXISTS idx_rencontres_quand ON rencontres(quand DESC)',
    );
    await base.execute(
      'CREATE INDEX IF NOT EXISTS idx_notes_personne ON notes(personne_id)',
    );
    await base.execute(
      'CREATE INDEX IF NOT EXISTS idx_photos_personne ON photos(personne_id)',
    );
  }

  // -------------------------------------------------------------- migration

  /// Reprend le schéma de la première version, en anglais et sans
  /// étiquettes véritables.
  ///
  /// Les anciennes notes de rencontre deviennent des entrées du carnet, et
  /// la chaîne `tags` est découpée en vraies étiquettes. Les notes sur
  /// cinq passent en demi-points.
  Future<void> _migrerVers2(Database base) async {
    final anciennes = await base.rawQuery(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'contacts'",
    );
    if (anciennes.isEmpty) {
      await _creerSchema(base);
      return;
    }

    // L'ancienne table `photos` porte le même nom que la nouvelle : elle
    // est mise de côté avant de créer le schéma, sinon la création échoue.
    await base.execute('ALTER TABLE photos RENAME TO photos_anciennes');

    await _creerSchema(base);

    final contacts = await base.query('contacts');
    for (final c in contacts) {
      final id = await base.insert('personnes', {
        'prenom': c['pseudo'] ?? 'Sans nom',
        'age': c['age'],
        'ville': null,
        'rencontre_sur': c['platform'],
        'telephone': null,
        'photo_principale': c['main_photo_path'],
        'cree_le': c['created_at'],
        'modifie_le': c['updated_at'],
      });

      final tags = (c['tags'] as String?) ?? '';
      var rang = 0;
      for (final brut in tags.split(',')) {
        final libelle = brut.trim();
        if (libelle.isEmpty) continue;
        final etiquetteId = await _etiquetteId(
          base,
          libelle,
          PorteeEtiquette.personne,
        );
        await base.insert('personne_etiquettes', {
          'personne_id': id,
          'etiquette_id': etiquetteId,
          'rang': rang++,
        }, conflictAlgorithm: ConflictAlgorithm.ignore);
      }

      final description = (c['description'] as String?)?.trim();
      if (description != null && description.isNotEmpty) {
        await base.insert('notes', {
          'personne_id': id,
          'texte': description,
          'ecrite_le': c['created_at'],
        });
      }

      final rencontres = await base.query(
        'encounters',
        where: 'contact_id = ?',
        whereArgs: [c['id']],
      );
      for (final r in rencontres) {
        final note = r['rating'] as int?;
        final rencontreId = await base.insert('rencontres', {
          'personne_id': id,
          'quand': r['date'],
          'lieu': r['location_name'],
          'latitude': r['latitude'],
          'longitude': r['longitude'],
          // Les anciennes notes allaient de 1 à 5 sans demi-points.
          'note': note == null ? null : note * 2,
          'cree_le': r['created_at'],
        });

        final texte = (r['notes'] as String?)?.trim();
        if (texte != null && texte.isNotEmpty) {
          await base.insert('notes', {
            'personne_id': id,
            'rencontre_id': rencontreId,
            'texte': texte,
            'ecrite_le': r['date'],
          });
        }
      }

      final photos = await base.query(
        'photos_anciennes',
        where: 'contact_id = ?',
        whereArgs: [c['id']],
      );
      for (final p in photos) {
        await base.insert('photos', {
          'personne_id': id,
          'chemin': p['file_path'],
          'principale': p['is_main'] ?? 0,
          'ajoutee_le': p['created_at'],
        });
      }
    }

    await base.execute('DROP TABLE IF EXISTS encounters');
    await base.execute('DROP TABLE IF EXISTS contacts');
    await base.execute('DROP TABLE IF EXISTS photos_anciennes');
  }

  /// Ajoute le genre et le rôle, arrivés après coup.
  ///
  /// Deux colonnes nullables : les fiches existantes restent valides, et
  /// l'interface affiche simplement moins de pastilles tant qu'elles ne
  /// sont pas renseignées.
  Future<void> _migrerVers3(Database base) async {
    final colonnes = await base.rawQuery('PRAGMA table_info(personnes)');
    final noms = colonnes.map((c) => c['name'] as String).toSet();
    if (!noms.contains('genre')) {
      await base.execute('ALTER TABLE personnes ADD COLUMN genre TEXT');
    }
    if (!noms.contains('role')) {
      await base.execute('ALTER TABLE personnes ADD COLUMN role TEXT');
    }
  }

  /// Ajoute le montant gagné sur une rencontre.
  ///
  /// En centimes, et nullable : une rencontre sans argent n'est pas une
  /// rencontre à zéro euro, c'est une rencontre dont la question ne se
  /// pose pas. La distinction compte pour les moyennes.
  Future<void> _migrerVers4(Database base) async {
    final colonnes = await base.rawQuery('PRAGMA table_info(rencontres)');
    final noms = colonnes.map((c) => c['name'] as String).toSet();
    if (!noms.contains('montant_centimes')) {
      await base.execute(
        'ALTER TABLE rencontres ADD COLUMN montant_centimes INTEGER',
      );
    }
  }

  /// Ajoute l'adresse d'une personne.
  ///
  /// Du texte libre, pas des coordonnées : c'est l'application de
  /// cartographie du téléphone qui saura quoi en faire, et elle le fera
  /// mieux qu'un géocodeur embarqué.
  Future<void> _migrerVers5(Database base) async {
    final colonnes = await base.rawQuery('PRAGMA table_info(personnes)');
    final noms = colonnes.map((c) => c['name'] as String).toSet();
    if (!noms.contains('adresse')) {
      await base.execute('ALTER TABLE personnes ADD COLUMN adresse TEXT');
    }
  }

  /// Les vidéos rejoignent les photos dans la même table : elles vivent
  /// au même endroit de la fiche, partent avec elle, et le coffre les
  /// range côte à côte. Une colonne dit laquelle est laquelle, une autre
  /// garde la durée, mesurée une fois à l'import plutôt qu'à chaque
  /// affichage de la galerie.
  Future<void> _migrerVers6(Database base) async {
    final colonnes = await base.rawQuery('PRAGMA table_info(photos)');
    final noms = colonnes.map((c) => c['name'] as String).toSet();
    if (!noms.contains('type')) {
      await base.execute(
        "ALTER TABLE photos ADD COLUMN type TEXT NOT NULL DEFAULT 'photo'",
      );
    }
    if (!noms.contains('duree_ms')) {
      await base.execute('ALTER TABLE photos ADD COLUMN duree_ms INTEGER');
    }
  }

  Future<int> _etiquetteId(
    Database base,
    String libelle,
    PorteeEtiquette portee,
  ) async {
    final cle = Etiquette.normaliser(libelle);
    final existante = await base.query(
      'etiquettes',
      where: 'cle = ? AND portee = ?',
      whereArgs: [cle, portee.code],
      limit: 1,
    );
    if (existante.isNotEmpty) return existante.first['id'] as int;
    return base.insert('etiquettes', {
      'libelle': libelle.trim(),
      'cle': cle,
      'portee': portee.code,
    });
  }

  // ------------------------------------------------------ base en clair

  /// Reprend une base laissée en clair par une version antérieure.
  ///
  /// On la recopie chiffrée avec `sqlcipher_export`, puis on efface
  /// l'ancienne. Tant que la copie n'est pas finie, l'ancienne reste en
  /// place : une coupure ne perd rien.
  Future<void> _chiffrerSiEnClair(
    String dossier,
    String chemin,
    String motDePasse,
  ) async {
    final fichier = File(chemin);
    if (!await fichier.exists()) return;
    if (!await _estEnClair(fichier)) return;

    final temporaire = join(dossier, 'bodycount.migration.db');
    final tmp = File(temporaire);
    if (await tmp.exists()) await tmp.delete();

    final enClair = await openDatabase(chemin, singleInstance: false);
    try {
      await enClair.rawQuery('ATTACH DATABASE ? AS chiffre KEY ?', [
        temporaire,
        motDePasse,
      ]);
      await enClair.rawQuery("SELECT sqlcipher_export('chiffre')");
      await enClair.execute('DETACH DATABASE chiffre');
    } finally {
      await enClair.close();
    }

    await fichier.delete();
    await tmp.rename(chemin);
  }

  /// Vrai seulement si le fichier commence par l'en-tête d'un SQLite en
  /// clair. Un fichier SQLCipher commence par du bruit : il ne peut pas
  /// être pris pour une base à convertir, même si une ouverture échoue
  /// pour une autre raison, un verrou ou une connexion fermée ailleurs.
  Future<bool> _estEnClair(File fichier) async {
    // « SQLite format 3 » suivi d'un octet nul.
    final entete = [...'SQLite format 3'.codeUnits, 0];
    final flux = await fichier.open();
    try {
      final debut = await flux.read(entete.length);
      if (debut.length != entete.length) return false;
      for (var i = 0; i < entete.length; i++) {
        if (debut[i] != entete[i]) return false;
      }
      return true;
    } finally {
      await flux.close();
    }
  }

  // ------------------------------------------------------------ effacement

  Future<void> viderDonnees() async {
    final base = await db;
    await base.transaction((t) async {
      await t.delete('photos');
      await t.delete('notes');
      await t.delete('rencontre_etiquettes');
      await t.delete('personne_etiquettes');
      await t.delete('rencontres');
      await t.delete('personnes');
      await t.delete('etiquettes');
    });
  }

  /// Effacement total : les données, les photos, puis la clé.
  ///
  /// Détruire la clé en dernier évite de se retrouver avec des fichiers
  /// qu'on ne peut plus nettoyer si l'opération est interrompue.
  Future<void> toutDetruire() async {
    await fermer();
    await PhotoVault.instance.wipe();

    final dossier = await getDatabasesPath();
    for (final nom in const [_fichier, 'bodycount.migration.db']) {
      final fichier = File(join(dossier, nom));
      if (await fichier.exists()) await fichier.delete();
    }

    await KeyVault.instance.destroy();
  }
}
