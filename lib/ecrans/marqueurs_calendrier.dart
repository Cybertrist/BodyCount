import '../domaine/coordonnees_utils.dart';
import '../domaine/rencontre.dart';

/// Les petits signes posés sous les jours du calendrier.
///
/// Tout ce qui suit se déduit de ce que l'application enregistre déjà :
/// la note, le montant, la date, l'étiquette du soir, le rôle de la
/// personne, sa ville. Rien n'est à saisir en plus, et rien n'est
/// inventé.
///
/// Une case fait trente points de large : au delà de trois signes, ça
/// devient une soupe où on ne sait plus lequel regarder. L'ordre de
/// [_priorites] décide donc qui reste, du plus rare au plus banal.
class MarqueursCalendrier {
  const MarqueursCalendrier._();

  /// Combien de signes une case peut porter.
  static const maximum = 3;

  /// Du plus remarquable au plus courant.
  ///
  /// Un billet est moins intéressant qu'un record de l'année, et une nuit
  /// entière l'est plus que l'heure à laquelle ça a commencé. C'est cet
  /// ordre qui fait qu'une case chargée montre ce qui compte.
  static const _priorites = [
    '🤑', // le meilleur montant de l'année
    '💰', // plus de cent euros
    '💵', // ça a rapporté
    '👑', // le mieux noté du mois
    '⭐', // cinq sur cinq
    '🔥', // trois jours d'affilée
    '🎂', // un an jour pour jour après la première fois
    '✨', // première fois avec cette personne
    '❤️', // la cinquième fois avec la même
    '🏁', // la première rencontre de l'année
    '📅', // le jour le plus chargé du mois
    '🌙', // toute la nuit
    '🌅', // fini après six heures
    '🌃', // commencé après minuit
    '🕐', // commencé avant dix-huit heures
    '⚡', // étiquette « Rapide »
    '✈️', // à plus de deux cents kilomètres
    '🏖️', // en vacances
    '🚗', // dans une voiture
    '🌲', // dehors
    '🏠', // chez toi
    '🛏️', // chez l'autre
    '🍆', // actif
    '🍑', // passif
    '♾️', // versatile
  ];

  /// Les signes de chaque rencontre du mois, une liste par rencontre.
  ///
  /// C'est la forme utile : une case de calendrier réunit ce qui s'est
  /// passé dans la journée, mais la liste du dessous nomme les gens un
  /// par un, et c'est là qu'on veut savoir qui a rapporté quoi.
  static Map<int, List<String>> parRencontre({
    required List<EntreeJournal> toutes,
    required List<EntreeJournal> duMois,
    required DateTime mois,
    required String? villePrincipale,
  }) {
    final brut = _calculer(
      toutes: toutes,
      duMois: duMois,
      mois: mois,
      villePrincipale: villePrincipale,
    );
    return {
      for (final entree in brut.entries)
        entree.key: _trier(entree.value).take(maximum).toList(),
    };
  }

  /// Calcule les signes de chaque jour du mois affiché.
  ///
  /// [toutes] sert aux comparaisons qui dépassent le mois : la première
  /// fois avec quelqu'un, le cinquième rendez-vous, l'anniversaire, le
  /// record de l'année.
  static Map<int, List<String>> pourLeMois({
    required List<EntreeJournal> toutes,
    required List<EntreeJournal> duMois,
    required DateTime mois,
    required String? villePrincipale,
  }) {
    final brut = _calculer(
      toutes: toutes,
      duMois: duMois,
      mois: mois,
      villePrincipale: villePrincipale,
    );

    // On réunit par jour ce qui a été calculé par rencontre.
    final parJour = <int, Set<String>>{};
    for (final entree in brut.entries) {
      final rencontre = duMois.firstWhere((e) => e.rencontre.id == entree.key);
      (parJour[rencontre.rencontre.quand.day] ??= <String>{})
          .addAll(entree.value);
    }

    return {
      for (final entree in parJour.entries)
        entree.key: _trier(entree.value).take(maximum).toList(),
    };
  }

  /// Le calcul, rencontre par rencontre, indexé sur leur identifiant.
  static Map<int, Set<String>> _calculer({
    required List<EntreeJournal> toutes,
    required List<EntreeJournal> duMois,
    required DateTime mois,
    required String? villePrincipale,
  }) {
    if (duMois.isEmpty) return const {};

    // Les repères qui demandent de regarder au delà du mois.
    final premieres = <int, DateTime>{};
    final rangs = <int, List<DateTime>>{};
    for (final e in toutes) {
      final id = e.rencontre.personneId;
      (rangs[id] ??= []).add(e.rencontre.quand);
      final connue = premieres[id];
      if (connue == null || e.rencontre.quand.isBefore(connue)) {
        premieres[id] = e.rencontre.quand;
      }
    }
    for (final liste in rangs.values) {
      liste.sort();
    }

    final annee = mois.year;
    final delAnnee = toutes.where((e) => e.rencontre.quand.year == annee);

    // Le meilleur montant de l'année, et la première rencontre de l'année.
    var record = 0;
    DateTime? premiereDeLAnnee;
    for (final e in delAnnee) {
      final m = e.rencontre.montantCentimes ?? 0;
      if (m > record) record = m;
      final q = e.rencontre.quand;
      if (premiereDeLAnnee == null || q.isBefore(premiereDeLAnnee)) {
        premiereDeLAnnee = q;
      }
    }

    // La note la plus haute du mois, pour la couronne.
    var meilleureDuMois = -1;
    for (final e in duMois) {
      final n = e.rencontre.noteDemiPoints ?? -1;
      if (n > meilleureDuMois) meilleureDuMois = n;
    }

    // Les jours occupés, pour les séries et le jour le plus chargé.
    final parJour = <int, int>{};
    for (final e in duMois) {
      final j = e.rencontre.quand.day;
      parJour[j] = (parJour[j] ?? 0) + 1;
    }
    final joursOccupes = _joursOccupes(toutes);
    var jourLePlusCharge = 0;
    var recordDuJour = 0;
    parJour.forEach((j, n) {
      if (n > recordDuJour) {
        recordDuJour = n;
        jourLePlusCharge = j;
      }
    });

    final resultat = <int, Set<String>>{};

    for (final e in duMois) {
      final r = e.rencontre;
      final j = r.quand.day;
      final signes = resultat[r.id ?? -j] ??= <String>{};

      // L'argent, un seul signe : le plus flatteur qui s'applique.
      final montant = r.montantCentimes ?? 0;
      if (montant > 0) {
        if (montant == record && record > 0) {
          signes.add('🤑');
        } else if (montant >= 10000) {
          signes.add('💰');
        } else {
          signes.add('💵');
        }
      }

      final note = r.noteDemiPoints ?? -1;
      if (note >= 0 && note == meilleureDuMois && note >= 8) signes.add('👑');
      if (note == 10) signes.add('⭐');

      final premiere = premieres[r.personneId];
      if (premiere == r.quand) signes.add('✨');
      if (premiere != null &&
          premiere != r.quand &&
          r.quand.year == premiere.year + 1 &&
          r.quand.month == premiere.month &&
          r.quand.day == premiere.day) {
        signes.add('🎂');
      }

      final serie = rangs[r.personneId];
      if (serie != null &&
          serie.length >= 5 &&
          serie.indexOf(r.quand) == 4) {
        signes.add('❤️');
      }

      if (premiereDeLAnnee == r.quand) signes.add('🏁');
      if (j == jourLePlusCharge && recordDuJour > 1) signes.add('📅');

      if (_serieDeTrois(joursOccupes, r.quand)) signes.add('🔥');

      // L'heure. Un seul signe, du plus tard au plus tôt.
      if (e.aEtiquette('toute la nuit')) {
        signes.add('🌙');
      } else if (r.quand.hour >= 6 && r.quand.hour < 10) {
        signes.add('🌅');
      } else if (r.quand.hour >= 0 && r.quand.hour < 6) {
        signes.add('🌃');
      } else if (r.quand.hour < 18) {
        signes.add('🕐');
      }

      if (e.aEtiquette('rapide')) signes.add('⚡');

      // Le lieu.
      final lieu = r.lieu ?? e.villePersonne;
      if (lieu != null && villePrincipale != null) {
        final km = distanceEntreVilles(villePrincipale, lieu);
        if (km != null && km >= 200) signes.add('✈️');
      }
      if (e.aEtiquette('en vacances')) signes.add('🏖️');
      if (e.aEtiquette('dans une voiture') || e.aEtiquette('voiture')) {
        signes.add('🚗');
      }
      if (e.aEtiquette('dehors')) signes.add('🌲');
      if (e.aEtiquette('chez moi')) signes.add('🏠');
      if (e.aEtiquette('chez lui') || e.aEtiquette('chez elle')) {
        signes.add('🛏️');
      }

      switch (e.role) {
        case 'actif':
          signes.add('🍆');
        case 'passif':
          signes.add('🍑');
        case 'versatile':
          signes.add('♾️');
      }
    }

    return resultat;
  }

  static List<String> _trier(Set<String> signes) {
    final ordonnes = signes.toList()
      ..sort((a, b) {
        final ia = _priorites.indexOf(a);
        final ib = _priorites.indexOf(b);
        return (ia < 0 ? 999 : ia).compareTo(ib < 0 ? 999 : ib);
      });
    return ordonnes;
  }

  /// L'ensemble des jours qui portent au moins une rencontre, toutes
  /// années confondues, sous la forme « année-mois-jour ».
  static Set<int> _joursOccupes(List<EntreeJournal> toutes) {
    return {
      for (final e in toutes) _clefJour(e.rencontre.quand),
    };
  }

  static int _clefJour(DateTime d) => d.year * 10000 + d.month * 100 + d.day;

  /// Vrai si ce jour appartient à une série d'au moins trois jours
  /// consécutifs occupés, qu'il en soit le début, le milieu ou la fin.
  static bool _serieDeTrois(Set<int> occupes, DateTime jour) {
    final base = DateTime(jour.year, jour.month, jour.day);
    var avant = 0;
    for (var i = 1; i <= 2; i++) {
      if (!occupes.contains(_clefJour(base.subtract(Duration(days: i))))) break;
      avant++;
    }
    var apres = 0;
    for (var i = 1; i <= 2; i++) {
      if (!occupes.contains(_clefJour(base.add(Duration(days: i))))) break;
      apres++;
    }
    return avant + apres + 1 >= 3;
  }
}
