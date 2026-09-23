import 'package:sqflite_sqlcipher/sqflite.dart';

import '../domaine/etiquette.dart';
import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../security/photo_vault.dart';
import 'base.dart';

/// Critères de tri du répertoire, tels qu'ils apparaissent en pastilles.
enum TriRepertoire {
  recentes('Récents', 'derniere DESC'),
  mieuxNotes('Mieux notés', 'moyenne DESC'),
  plusVues('Plus vues', 'nb DESC'),
  alphabetique('A à Z', 'p.prenom COLLATE NOCASE ASC');

  const TriRepertoire(this.libelle, this.clause);

  final String libelle;
  final String clause;
}

/// Filtres cumulables du répertoire.
class FiltreRepertoire {
  const FiltreRepertoire({
    this.recherche = '',
    this.tri = TriRepertoire.recentes,
    this.ville,
    this.etiquette,
  });

  final String recherche;
  final TriRepertoire tri;
  final String? ville;
  final String? etiquette;

  FiltreRepertoire copyWith({
    String? recherche,
    TriRepertoire? tri,
    String? ville,
    String? etiquette,
    bool viderVille = false,
    bool viderEtiquette = false,
  }) {
    return FiltreRepertoire(
      recherche: recherche ?? this.recherche,
      tri: tri ?? this.tri,
      ville: viderVille ? null : (ville ?? this.ville),
      etiquette: viderEtiquette ? null : (etiquette ?? this.etiquette),
    );
  }
}

class DepotPersonnes {
  const DepotPersonnes();

  /// Le répertoire, avec le nombre de fois, la moyenne et les dates.
  ///
  /// Une seule requête groupée, et non une requête par personne : sur
  /// cinquante fiches, la seconde approche ferait cinquante et un
  /// allers retours avec la base pour afficher un écran.
  Future<List<FichePersonne>> lister([
    FiltreRepertoire filtre = const FiltreRepertoire(),
  ]) async {
    final base = await Base.instance.db;

    final conditions = <String>[];
    final arguments = <Object?>[];

    final recherche = filtre.recherche.trim();
    if (recherche.isNotEmpty) {
      conditions.add('(p.prenom LIKE ? OR p.ville LIKE ?)');
      arguments..add('%$recherche%')..add('%$recherche%');
    }
    if (filtre.ville != null) {
      conditions.add('p.ville = ?');
      arguments.add(filtre.ville);
    }
    if (filtre.etiquette != null) {
      conditions.add('''
        EXISTS (
          SELECT 1 FROM personne_etiquettes pe
          JOIN etiquettes e ON e.id = pe.etiquette_id
          WHERE pe.personne_id = p.id AND e.cle = ?
        )
      ''');
      arguments.add(Etiquette.normaliser(filtre.etiquette!));
    }

    final ou = conditions.isEmpty ? '' : 'WHERE ${conditions.join(' AND ')}';

    final lignes = await base.rawQuery('''
      SELECT p.*,
             COUNT(r.id) AS nb,
             AVG(r.note) AS moyenne,
             MAX(r.quand) AS derniere,
             MIN(r.quand) AS premiere
      FROM personnes p
      LEFT JOIN rencontres r ON r.personne_id = p.id
      $ou
      GROUP BY p.id
      ORDER BY ${filtre.tri.clause}, p.prenom COLLATE NOCASE ASC
    ''', arguments);

    return lignes.map(_versFiche).toList();
  }

  Future<FichePersonne?> parId(int id) async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT p.*,
             COUNT(r.id) AS nb,
             AVG(r.note) AS moyenne,
             MAX(r.quand) AS derniere,
             MIN(r.quand) AS premiere
      FROM personnes p
      LEFT JOIN rencontres r ON r.personne_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    ''', [id]);
    if (lignes.isEmpty) return null;

    final fiche = _versFiche(lignes.first);
    final etiquettes = await const DepotEtiquettes().pourPersonne(id);
    return FichePersonne(
      personne: fiche.personne,
      nombreRencontres: fiche.nombreRencontres,
      moyenne: fiche.moyenne,
      derniereFois: fiche.derniereFois,
      premiereFois: fiche.premiereFois,
      etiquettes: etiquettes.map((e) => e.libelle).toList(),
    );
  }

  /// Rang d'une personne au classement des notes moyennes.
  ///
  /// Sans rencontre notée, pas de rang : afficher « 1er » à quelqu'un
  /// qu'on n'a jamais noté n'aurait aucun sens.
  Future<({int rang, int total})?> rang(int personneId) async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT personne_id, AVG(note) AS moyenne
      FROM rencontres
      WHERE note IS NOT NULL
      GROUP BY personne_id
      ORDER BY moyenne DESC
    ''');
    if (lignes.isEmpty) return null;

    final index =
        lignes.indexWhere((l) => l['personne_id'] as int == personneId);
    if (index < 0) return null;
    return (rang: index + 1, total: lignes.length);
  }

  Future<int> creer(Personne personne) async {
    final base = await Base.instance.db;
    return base.insert('personnes', personne.versMap());
  }

  Future<void> modifier(Personne personne) async {
    final base = await Base.instance.db;
    await base.update(
      'personnes',
      personne.copyWith(modifieLe: DateTime.now()).versMap(),
      where: 'id = ?',
      whereArgs: [personne.id],
    );
  }

  /// Supprime la fiche, ses rencontres, ses notes et ses photos.
  ///
  /// Les cascades vident la base, mais les fichiers du coffre, eux, ne
  /// sont liés à rien : il faut les effacer à la main, sinon ils restent
  /// à occuper la place pour toujours.
  Future<void> supprimer(int personneId) async {
    final base = await Base.instance.db;
    final photos = await base.query(
      'photos',
      columns: ['chemin'],
      where: 'personne_id = ?',
      whereArgs: [personneId],
    );
    await base.delete('personnes', where: 'id = ?', whereArgs: [personneId]);
    for (final photo in photos) {
      await PhotoVault.instance.delete(photo['chemin'] as String);
    }
  }

  Future<List<String>> villes() async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT ville, COUNT(*) AS nb FROM personnes
      WHERE ville IS NOT NULL AND ville <> ''
      GROUP BY ville ORDER BY nb DESC
    ''');
    return lignes.map((l) => l['ville'] as String).toList();
  }

  FichePersonne _versFiche(Map<String, Object?> ligne) {
    final derniere = ligne['derniere'] as String?;
    final premiere = ligne['premiere'] as String?;
    return FichePersonne(
      personne: Personne.depuisMap(ligne),
      nombreRencontres: (ligne['nb'] as int?) ?? 0,
      moyenne: ligne['moyenne'] as double?,
      derniereFois: derniere == null ? null : DateTime.parse(derniere),
      premiereFois: premiere == null ? null : DateTime.parse(premiere),
    );
  }
}

class DepotRencontres {
  const DepotRencontres();

  Future<List<Rencontre>> pourPersonne(int personneId) async {
    final base = await Base.instance.db;
    final lignes = await base.query(
      'rencontres',
      where: 'personne_id = ?',
      whereArgs: [personneId],
      orderBy: 'quand DESC',
    );
    return lignes.map(Rencontre.depuisMap).toList();
  }

  /// Le journal : les rencontres les plus récentes, avec de quoi les
  /// afficher sans requête supplémentaire par ligne.
  /// Toutes les rencontres, de la plus récente à la plus ancienne.
  ///
  /// La limite était à soixante. Sur une liste qui défile ça passait
  /// inaperçu ; sur un calendrier qu'on feuillette mois par mois, les
  /// mois anciens paraissaient vides et le total affiché en tête était
  /// faux. Le plafond reste très haut, par sécurité, mais il n'est plus
  /// censé être atteint.
  Future<List<EntreeJournal>> journal({int limite = 5000}) async {
    final base = await Base.instance.db;

    // EXISTS plutôt qu'une jointure : une rencontre peut porter
    // plusieurs étiquettes, et une jointure la dédoublerait.
    // Une sous-requête plutôt qu'une jointure : une rencontre peut
    // porter plusieurs étiquettes, et une jointure la dédoublerait.
    final lignes = await base.rawQuery('''
      SELECT r.*, p.prenom, p.photo_principale, p.role AS role_personne,
             p.ville AS ville_personne,
             (SELECT GROUP_CONCAT(e.cle, '|')
              FROM rencontre_etiquettes re
              JOIN etiquettes e ON e.id = re.etiquette_id
              WHERE re.rencontre_id = r.id) AS cles
      FROM rencontres r
      JOIN personnes p ON p.id = r.personne_id
      ORDER BY r.quand DESC
      LIMIT ?
    ''', [limite]);

    return lignes.map((l) {
      final cles = l['cles'] as String?;
      return EntreeJournal(
        rencontre: Rencontre.depuisMap(l),
        prenom: l['prenom'] as String,
        photo: l['photo_principale'] as String?,
        role: l['role_personne'] as String?,
        villePersonne: l['ville_personne'] as String?,
        etiquettes: cles == null || cles.isEmpty
            ? const <String>{}
            : cles.split('|').toSet(),
      );
    }).toList();
  }

  Future<int> creer(Rencontre rencontre) async {
    final base = await Base.instance.db;
    final id = await base.insert('rencontres', rencontre.versMap());
    await _toucherPersonne(base, rencontre.personneId);
    return id;
  }

  Future<void> modifier(Rencontre rencontre) async {
    final base = await Base.instance.db;
    await base.update(
      'rencontres',
      rencontre.versMap(),
      where: 'id = ?',
      whereArgs: [rencontre.id],
    );
    await _toucherPersonne(base, rencontre.personneId);
  }

  Future<void> supprimer(int id) async {
    final base = await Base.instance.db;
    await base.delete('rencontres', where: 'id = ?', whereArgs: [id]);
  }

  /// Marque la fiche comme modifiée, pour que le tri « récents » du
  /// répertoire remonte les personnes qu'on vient de revoir.
  Future<void> _toucherPersonne(Database base, int personneId) async {
    await base.update(
      'personnes',
      {'modifie_le': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [personneId],
    );
  }
}

class DepotEtiquettes {
  const DepotEtiquettes();

  /// Le vocabulaire existant, le plus employé d'abord, pour le proposer
  /// à la saisie plutôt que de laisser réinventer les mêmes mots.
  Future<List<Etiquette>> vocabulaire(PorteeEtiquette portee) async {
    final base = await Base.instance.db;
    final table = portee == PorteeEtiquette.personne
        ? 'personne_etiquettes'
        : 'rencontre_etiquettes';
    final lignes = await base.rawQuery('''
      SELECT e.*, COUNT(l.etiquette_id) AS usages
      FROM etiquettes e
      LEFT JOIN $table l ON l.etiquette_id = e.id
      WHERE e.portee = ?
      GROUP BY e.id
      ORDER BY usages DESC, e.libelle COLLATE NOCASE ASC
    ''', [portee.code]);
    return lignes.map(Etiquette.depuisMap).toList();
  }

  Future<List<Etiquette>> pourPersonne(int personneId) async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT e.* FROM etiquettes e
      JOIN personne_etiquettes pe ON pe.etiquette_id = e.id
      WHERE pe.personne_id = ?
      ORDER BY pe.rang ASC
    ''', [personneId]);
    return lignes.map(Etiquette.depuisMap).toList();
  }

  Future<List<Etiquette>> pourRencontre(int rencontreId) async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT e.* FROM etiquettes e
      JOIN rencontre_etiquettes re ON re.etiquette_id = e.id
      WHERE re.rencontre_id = ?
      ORDER BY e.libelle COLLATE NOCASE ASC
    ''', [rencontreId]);
    return lignes.map(Etiquette.depuisMap).toList();
  }

  /// Remplace les étiquettes d'une personne par cette liste.
  ///
  /// L'ordre est conservé : les deux premières sont mises en avant sur la
  /// fiche, ce n'est donc pas un détail.
  Future<void> definirPourPersonne(int personneId, List<String> libelles) async {
    final base = await Base.instance.db;
    await base.transaction((t) async {
      await t.delete('personne_etiquettes',
          where: 'personne_id = ?', whereArgs: [personneId]);
      var rang = 0;
      for (final libelle in libelles) {
        if (libelle.trim().isEmpty) continue;
        final id = await _trouverOuCreer(t, libelle, PorteeEtiquette.personne);
        await t.insert(
          'personne_etiquettes',
          {'personne_id': personneId, 'etiquette_id': id, 'rang': rang++},
          conflictAlgorithm: ConflictAlgorithm.ignore,
        );
      }
      await _nettoyer(t);
    });
  }

  Future<void> definirPourRencontre(
    int rencontreId,
    List<String> libelles,
  ) async {
    final base = await Base.instance.db;
    await base.transaction((t) async {
      await t.delete('rencontre_etiquettes',
          where: 'rencontre_id = ?', whereArgs: [rencontreId]);
      for (final libelle in libelles) {
        if (libelle.trim().isEmpty) continue;
        final id = await _trouverOuCreer(t, libelle, PorteeEtiquette.rencontre);
        await t.insert(
          'rencontre_etiquettes',
          {'rencontre_id': rencontreId, 'etiquette_id': id},
          conflictAlgorithm: ConflictAlgorithm.ignore,
        );
      }
      await _nettoyer(t);
    });
  }

  Future<int> _trouverOuCreer(
    DatabaseExecutor base,
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

  /// Supprime les étiquettes que plus personne ne porte, pour que les
  /// suggestions ne se remplissent pas de mots abandonnés.
  Future<void> _nettoyer(DatabaseExecutor base) async {
    await base.execute('''
      DELETE FROM etiquettes
      WHERE id NOT IN (SELECT etiquette_id FROM personne_etiquettes)
        AND id NOT IN (SELECT etiquette_id FROM rencontre_etiquettes)
    ''');
  }
}

class DepotNotes {
  const DepotNotes();

  Future<List<Note>> pourPersonne(int personneId) async {
    final base = await Base.instance.db;
    final lignes = await base.query(
      'notes',
      where: 'personne_id = ?',
      whereArgs: [personneId],
      orderBy: 'ecrite_le DESC',
    );
    return lignes.map(Note.depuisMap).toList();
  }

  Future<int> ajouter(Note note) async {
    final base = await Base.instance.db;
    return base.insert('notes', note.versMap());
  }

  Future<void> modifier(Note note) async {
    final base = await Base.instance.db;
    await base.update('notes', note.versMap(),
        where: 'id = ?', whereArgs: [note.id]);
  }

  Future<void> supprimer(int id) async {
    final base = await Base.instance.db;
    await base.delete('notes', where: 'id = ?', whereArgs: [id]);
  }

  /// Rang de la rencontre à laquelle une note se rattache, pour écrire
  /// « après la 7e fois » plutôt qu'une date seule.
  Future<int?> rangDeLaRencontre(int personneId, int rencontreId) async {
    final base = await Base.instance.db;
    final lignes = await base.query(
      'rencontres',
      columns: ['id'],
      where: 'personne_id = ?',
      whereArgs: [personneId],
      orderBy: 'quand ASC',
    );
    final index = lignes.indexWhere((l) => l['id'] as int == rencontreId);
    return index < 0 ? null : index + 1;
  }
}

class DepotPhotos {
  const DepotPhotos();

  Future<List<Photo>> pourPersonne(int personneId) async {
    final base = await Base.instance.db;
    final lignes = await base.query(
      'photos',
      where: 'personne_id = ?',
      whereArgs: [personneId],
      orderBy: 'principale DESC, ajoutee_le DESC',
    );
    return lignes.map(Photo.depuisMap).toList();
  }

  /// Range une photo déjà chiffrée dans le coffre.
  ///
  /// La première photo d'une personne devient sa photo principale : sans
  /// ça, une fiche resterait grise alors qu'elle a une image.
  Future<int> ajouter(Photo photo) async {
    final base = await Base.instance.db;
    final id = await base.insert('photos', photo.versMap());

    final compte = Sqflite.firstIntValue(await base.rawQuery(
      'SELECT COUNT(*) FROM photos WHERE personne_id = ?',
      [photo.personneId],
    ));
    if (compte == 1 || photo.principale) {
      await definirPrincipale(photo.personneId, photo.chemin);
    }
    return id;
  }

  Future<void> definirPrincipale(int personneId, String chemin) async {
    final base = await Base.instance.db;
    await base.transaction((t) async {
      await t.update('photos', {'principale': 0},
          where: 'personne_id = ?', whereArgs: [personneId]);
      await t.update('photos', {'principale': 1},
          where: 'personne_id = ? AND chemin = ?',
          whereArgs: [personneId, chemin]);
      await t.update('personnes', {'photo_principale': chemin},
          where: 'id = ?', whereArgs: [personneId]);
    });
  }

  /// Supprime la photo du coffre et de la base.
  ///
  /// Si c'était la photo mise en avant, une autre prend sa place, sinon
  /// la fiche perdrait son visage alors qu'il reste des images.
  Future<void> supprimer(Photo photo) async {
    final base = await Base.instance.db;
    await base.delete('photos', where: 'id = ?', whereArgs: [photo.id]);
    await PhotoVault.instance.delete(photo.chemin);

    if (!photo.principale) return;
    final restantes = await pourPersonne(photo.personneId);
    if (restantes.isEmpty) {
      await base.update('personnes', {'photo_principale': null},
          where: 'id = ?', whereArgs: [photo.personneId]);
    } else {
      await definirPrincipale(photo.personneId, restantes.first.chemin);
    }
  }
}
