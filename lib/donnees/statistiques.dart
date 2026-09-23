import '../domaine/personne.dart';
import 'base.dart';
import 'coordonnees.dart';

/// Ce que l'écran des statistiques a besoin de savoir.
///
/// Trois questions, trois réponses : combien cette année, à quel rythme,
/// et qui sort du lot. Tout est calculé côté SQL, parce que faire la somme
/// de mille rencontres dans Dart pour afficher douze barres serait du
/// travail rapatrié pour rien.
class Statistiques {
  const Statistiques({
    required this.annee,
    required this.totalRencontres,
    required this.totalPersonnes,
    required this.variation,
    required this.parMois,
    required this.podium,
    required this.parVille,
    required this.parRole,
    this.points = const [],
    required this.gainCentimes,
    required this.gainPrecedentCentimes,
    required this.rencontresPayees,
  });

  final int annee;
  final int totalRencontres;
  final int totalPersonnes;

  /// Variation en pourcentage face à l'année précédente, ou null si
  /// l'année précédente est vide : diviser par zéro ne dit rien.
  final double? variation;

  /// Douze entiers, de janvier à décembre.
  final List<int> parMois;

  final List<FichePersonne> podium;

  /// Les villes, de la plus fréquentée à la moins, avec leur compte.
  final List<({String ville, int nombre})> parVille;

  /// Les rôles, comptés en personnes et non en rencontres : la question
  /// est « avec qui », pas « combien de fois ».
  final List<({String role, int nombre})> parRole;

  /// Les rencontres posées à la main sur la carte, toutes années
  /// confondues, comme le classement des lieux.
  final List<Coordonnee> points;

  /// Ce que l'année a rapporté, en centimes, et le même chiffre pour
  /// l'année d'avant : une somme sans point de comparaison ne dit rien.
  final int gainCentimes;
  final int gainPrecedentCentimes;

  /// Combien de rencontres ont rapporté quelque chose. La moyenne se
  /// calcule là dessus, et non sur le total : diviser par des soirées
  /// où la question ne se posait pas tirerait le chiffre vers le bas.
  final int rencontresPayees;

  bool get aGagne => gainCentimes > 0;

  String get gainAffiche => _euros(gainCentimes);

  /// La moyenne par soirée payée, arrondie à l'euro.
  String get gainMoyenAffiche => rencontresPayees == 0
      ? '—'
      : _euros((gainCentimes / rencontresPayees).round());

  /// Variation du gain face à l'année précédente, ou null si elle était
  /// à zéro : un pourcentage d'augmentation à partir de rien n'existe pas.
  double? get variationGain {
    if (gainPrecedentCentimes == 0) return null;
    return (gainCentimes - gainPrecedentCentimes) /
        gainPrecedentCentimes *
        100;
  }

  /// Le même formatage, ouvert à qui doit afficher une somme.
  static String eurosAffiches(int centimes) => _euros(centimes);

  static String _euros(int centimes) {
    final euros = centimes / 100;
    if (centimes % 100 == 0) {
      // Un espace insécable avant l'euro, et un séparateur de milliers,
      // sans quoi « 1250 € » se lit de travers.
      final entier = (centimes ~/ 100).toString();
      final groupe = entier.replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+$)'),
        (m) => '${m[1]} ',
      );
      return '$groupe\u00A0€';
    }
    return '${euros.toStringAsFixed(2).replaceAll('.', ',')}\u00A0€';
  }

  int get moisLePlusCharge {
    var max = 0;
    for (var i = 1; i < parMois.length; i++) {
      if (parMois[i] > parMois[max]) max = i;
    }
    return max;
  }

  /// Total des rencontres localisées.
  ///
  /// Les villes sont comptées sur toute la durée, le total de l'année ne
  /// vaut que pour l'année : rapporter les unes à l'autre donnait des
  /// pourcentages au dessus de cent. C'est donc cette somme qui sert de
  /// base, et elle seule.
  int get totalLieux => parVille.fold(0, (a, v) => a + v.nombre);

  ({String ville, int nombre, int pourcentage})? get lieuPrincipal {
    if (parVille.isEmpty || totalLieux == 0) return null;
    final premier = parVille.first;
    return (
      ville: premier.ville,
      nombre: premier.nombre,
      pourcentage: (premier.nombre * 100 / totalLieux).round(),
    );
  }
}

class DepotStatistiques {
  const DepotStatistiques();

  Future<Statistiques> pourAnnee(int annee) async {
    final base = await Base.instance.db;

    final debut = '$annee-01-01';
    final finExclue = '${annee + 1}-01-01';

    final total = _entier(await base.rawQuery(
      'SELECT COUNT(*) AS n FROM rencontres WHERE quand >= ? AND quand < ?',
      [debut, finExclue],
    ));

    final personnes = _entier(await base.rawQuery(
      '''SELECT COUNT(DISTINCT personne_id) AS n FROM rencontres
         WHERE quand >= ? AND quand < ?''',
      [debut, finExclue],
    ));

    final precedent = _entier(await base.rawQuery(
      'SELECT COUNT(*) AS n FROM rencontres WHERE quand >= ? AND quand < ?',
      ['${annee - 1}-01-01', debut],
    ));

    // COALESCE : une année sans aucun montant renvoie NULL, pas zéro.
    final gain = _entier(await base.rawQuery(
      '''SELECT COALESCE(SUM(montant_centimes), 0) AS n FROM rencontres
         WHERE quand >= ? AND quand < ?''',
      [debut, finExclue],
    ));

    final gainPrecedent = _entier(await base.rawQuery(
      '''SELECT COALESCE(SUM(montant_centimes), 0) AS n FROM rencontres
         WHERE quand >= ? AND quand < ?''',
      ['${annee - 1}-01-01', debut],
    ));

    final payees = _entier(await base.rawQuery(
      '''SELECT COUNT(*) AS n FROM rencontres
         WHERE quand >= ? AND quand < ? AND COALESCE(montant_centimes, 0) > 0''',
      [debut, finExclue],
    ));

    // strftime lit la date ISO stockée en texte : pas besoin de la
    // reconstruire côté Dart pour savoir de quel mois elle relève.
    final mois = List<int>.filled(12, 0);
    final lignesMois = await base.rawQuery('''
      SELECT CAST(strftime('%m', quand) AS INTEGER) AS mois, COUNT(*) AS n
      FROM rencontres
      WHERE quand >= ? AND quand < ?
      GROUP BY mois
    ''', [debut, finExclue]);
    for (final ligne in lignesMois) {
      final index = (ligne['mois'] as int) - 1;
      if (index >= 0 && index < 12) mois[index] = ligne['n'] as int;
    }

    final lignesPodium = await base.rawQuery('''
      SELECT p.*,
             COUNT(r.id) AS nb,
             AVG(r.note) AS moyenne,
             MAX(r.quand) AS derniere,
             MIN(r.quand) AS premiere
      FROM personnes p
      JOIN rencontres r ON r.personne_id = p.id
      WHERE r.note IS NOT NULL
      GROUP BY p.id
      ORDER BY moyenne DESC, nb DESC
      LIMIT 3
    ''');

    final podium = lignesPodium.map((ligne) {
      final derniere = ligne['derniere'] as String?;
      final premiere = ligne['premiere'] as String?;
      return FichePersonne(
        personne: Personne.depuisMap(ligne),
        nombreRencontres: (ligne['nb'] as int?) ?? 0,
        moyenne: ligne['moyenne'] as double?,
        derniereFois: derniere == null ? null : DateTime.parse(derniere),
        premiereFois: premiere == null ? null : DateTime.parse(premiere),
      );
    }).toList();

    // Le lieu d'une rencontre prime sur la ville de la personne : on peut
    // habiter Vannes et s'être vus à Rennes. Mais un lieu qui n'est pas une
    // ville, « chez lui », « Le Fébrile », ne dit rien de l'endroit : c'est
    // alors la ville de la fiche qui compte, sinon la carte perdrait la
    // rencontre et le classement afficherait « chez lui » comme une ville.
    //
    // Ce tri demande la table des communes, qui vit dans Dart : SQL rend
    // les couples (lieu, ville) déjà comptés, et le regroupement se fait
    // ici, sur une forme normalisée, pour que « vannes » et « Vannes  »
    // n'en fassent qu'une.
    final couples = await base.rawQuery('''
      SELECT TRIM(COALESCE(r.lieu, '')) AS lieu,
             TRIM(COALESCE(p.ville, '')) AS ville,
             COUNT(*) AS n
      FROM rencontres r
      JOIN personnes p ON p.id = r.personne_id
      GROUP BY LOWER(TRIM(COALESCE(r.lieu, ''))), LOWER(TRIM(COALESCE(p.ville, '')))
    ''');
    final parVille = <String, ({String ville, int nombre})>{};
    for (final c in couples) {
      final lieu = c['lieu'] as String;
      final ville = c['ville'] as String;
      final nom = lieu.isEmpty
          ? ville
          : (ville.isNotEmpty && coordonneesDe(lieu) == null ? ville : lieu);
      if (nom.isEmpty) continue;
      final clef = nom.toLowerCase();
      final avant = parVille[clef];
      parVille[clef] = (
        ville: avant?.ville ?? nom,
        nombre: (avant?.nombre ?? 0) + (c['n'] as int),
      );
    }
    final lignesVilles = parVille.values.toList()
      ..sort((x, y) {
        final parNombre = y.nombre.compareTo(x.nombre);
        return parNombre != 0 ? parNombre : x.ville.compareTo(y.ville);
      });

    final lignesRoles = await base.rawQuery('''
      SELECT role, COUNT(*) AS n FROM personnes
      WHERE role IS NOT NULL AND role <> ''
      GROUP BY role ORDER BY n DESC
    ''');

    return Statistiques(
      annee: annee,
      totalRencontres: total,
      totalPersonnes: personnes,
      variation: precedent == 0 ? null : (total - precedent) * 100 / precedent,
      parMois: mois,
      podium: podium,
      parVille: lignesVilles,
      parRole: lignesRoles
          .map((l) => (role: l['role'] as String, nombre: l['n'] as int))
          .toList(),
      points: [
        for (final l in await base.rawQuery('''
          SELECT latitude, longitude FROM rencontres
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        '''))
          (
            latitude: (l['latitude'] as num).toDouble(),
            longitude: (l['longitude'] as num).toDouble(),
          ),
      ],
      gainCentimes: gain,
      gainPrecedentCentimes: gainPrecedent,
      rencontresPayees: payees,
    );
  }

  /// Les années qui contiennent au moins une rencontre, pour le sélecteur.
  Future<List<int>> anneesRenseignees() async {
    final base = await Base.instance.db;
    final lignes = await base.rawQuery('''
      SELECT DISTINCT CAST(strftime('%Y', quand) AS INTEGER) AS annee
      FROM rencontres ORDER BY annee DESC
    ''');
    final annees = lignes.map((l) => l['annee'] as int).toList();
    if (annees.isEmpty) annees.add(DateTime.now().year);
    return annees;
  }

  int _entier(List<Map<String, Object?>> lignes) {
    if (lignes.isEmpty) return 0;
    return (lignes.first['n'] as int?) ?? 0;
  }
}
