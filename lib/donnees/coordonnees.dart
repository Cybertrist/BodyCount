/// Coordonnées des villes, pour poser la carte.
///
/// Une carte qui charge des tuiles enverrait à un serveur, à chaque
/// déplacement, la liste exacte des endroits regardés. Pour une
/// application dont toute la promesse est que rien ne sort du téléphone,
/// c'est la seule chose à ne pas faire. Les positions sont donc
/// embarquées : aucune requête, aucune clé d'API, et elles sont vraies.
///
/// Trois sources, lues dans cet ordre :
///
/// 1. les 34 836 communes de métropole et de Corse, du référentiel
///    officiel (`assets/carte/communes.txt`, construit par
///    `tool/communes.mjs`). Le plus petit village y est, et c'est lui qui
///    fait qu'une ville saisie tombe presque toujours quelque part ;
/// 2. quelques noms d'usage que le référentiel écrit autrement, « Brive »
///    pour Brive-la-Gaillarde ;
/// 3. une poignée de villes étrangères, qui servent aux distances mais
///    que la carte, dessinée pour la France, ne pose pas.
///
/// Une ville mal orthographiée tombe quand même sur la commune la plus
/// proche par le nom : la carte pose tout ce qui est en France.
library;

import 'package:flutter/services.dart' show rootBundle;

/// Une position sur le globe, en degrés.
typedef Coordonnee = ({double latitude, double longitude});

/// Une commune du référentiel.
class Commune {
  const Commune(this.nom, this.departement, this.position);

  final String nom;

  /// Code du département, « 56 », « 2A ».
  final String departement;

  final Coordonnee position;
}

/// Les communes, de la plus peuplée à la moins peuplée.
List<Commune> _communes = const [];

/// Même ordre que [_communes], la clé normalisée de chacune.
List<String> _clefs = const [];

/// Première commune pour chaque clé, donc la plus peuplée des homonymes.
Map<String, Commune> _parClef = const {};

Future<void>? _chargement;

/// Lit le référentiel des communes. Lancé au démarrage sans l'attendre,
/// pendant que l'écran de verrouillage demande l'empreinte ; ce qui lit
/// des villes l'attend ensuite. Les appels suivants rendent le même
/// futur.
Future<void> chargerCommunes() => _chargement ??= _lireCommunes();

Future<void> _lireCommunes() async {
  final texte = await rootBundle.loadString('assets/carte/communes.txt');
  final communes = <Commune>[];
  final clefs = <String>[];
  final parClef = <String, Commune>{};

  for (final ligne in texte.split('\n')) {
    final champs = ligne.split(';');
    if (champs.length != 4) continue;
    final latitude = int.tryParse(champs[2]);
    final longitude = int.tryParse(champs[3]);
    if (latitude == null || longitude == null) continue;

    final commune = Commune(
      champs[0],
      champs[1],
      (latitude: latitude / 1000, longitude: longitude / 1000),
    );
    final clef = _normaliser(commune.nom);
    communes.add(commune);
    clefs.add(clef);
    parClef.putIfAbsent(clef, () => commune);
  }

  _communes = communes;
  _clefs = clefs;
  _parClef = parClef;
  _resolues.clear();
}

/// Les réponses déjà calculées par [coordonneesEnFrance]. La recherche
/// approchée parcourt trente-cinq mille noms, et la carte la redemande
/// à chaque image de pincement.
final _resolues = <String, Coordonnee?>{};

/// Cherche une ville, en France comme à l'étranger, sans approximation.
///
/// La comparaison ignore la casse, les accents, les traits d'union et
/// les espaces, parce que personne ne saisit « Saint-Brieuc » deux fois
/// de la même manière. « St Malo » et « saint-malo » tombent sur la même
/// entrée. Un département entre parenthèses, « Saint-Denis (11) »,
/// départage les homonymes. Sert à décider si un lieu est une ville :
/// « chez lui » n'en est pas une, même à une lettre près d'un village.
Coordonnee? coordonneesDe(String ville) =>
    _exacte(ville) ?? _chercher(_etranger, _normaliser(ville));

/// Où poser une ville sur la carte de France. Rend null seulement pour
/// l'étranger et pour un nom vide.
///
/// Tout ce qui ressemble à une commune y tombe : le nom exact d'abord,
/// puis un début de nom (« Plougastel » pour Plougastel-Daoulas), puis
/// une faute de frappe d'une ou deux lettres (« Locmariaqer »), puis un
/// nom de commune suivi d'autre chose (« Vannes centre »). À chaque
/// étape, la plus peuplée l'emporte.
Coordonnee? coordonneesEnFrance(String ville) {
  final clef = _normaliser(ville);
  if (clef.isEmpty) return null;
  if (_resolues.containsKey(ville)) return _resolues[ville];

  final exacte = _exacte(ville);
  final trouve = exacte ??
      (_chercher(_etranger, clef) != null
          ? null
          : _approchee(_normaliser(_decouper(ville).nom)));
  return _resolues[ville] = trouve;
}

Coordonnee? _exacte(String ville) {
  final saisie = _decouper(ville);
  final clef = _normaliser(saisie.nom);
  if (clef.isEmpty) return null;

  for (final essai in _variantes(clef)) {
    final departement = saisie.departement;
    if (departement != null) {
      for (var i = 0; i < _clefs.length; i++) {
        if (_clefs[i] == essai && _communes[i].departement == departement) {
          return _communes[i].position;
        }
      }
    }
    final commune = _parClef[essai];
    if (commune != null) return commune.position;
    final alias = _alias[essai];
    if (alias != null) return alias;
  }
  return null;
}

Coordonnee? _approchee(String clef) {
  if (clef.length < 3) return null;
  final variantes = _variantes(clef).toList();

  // Un début de nom. Les communes sont rangées par population : la
  // première qui convient est la plus probable.
  for (var i = 0; i < _clefs.length; i++) {
    if (variantes.any(_clefs[i].startsWith)) return _communes[i].position;
  }

  // Une faute de frappe : une lettre d'écart sur un nom court, deux au
  // delà de huit lettres.
  final tolerance = clef.length >= 8 ? 2 : 1;
  Commune? proche;
  var meilleur = tolerance + 1;
  for (var i = 0; i < _clefs.length && meilleur > 1; i++) {
    final c = _clefs[i];
    if ((c.length - clef.length).abs() > tolerance) continue;
    final d = _ecart(c, clef, meilleur);
    if (d < meilleur) {
      meilleur = d;
      proche = _communes[i];
    }
  }
  if (proche != null) return proche.position;

  // Un nom de commune suivi d'un quartier ou d'une précision. On garde
  // le plus long, pour que « Saint-Malo plage » ne tombe pas sur une
  // commune qui s'appellerait « Saint ».
  Commune? prefixe;
  var longueur = 0;
  for (var i = 0; i < _clefs.length; i++) {
    final c = _clefs[i];
    if (c.length >= 4 &&
        c.length > longueur &&
        variantes.any((v) => v.startsWith(c))) {
      prefixe = _communes[i];
      longueur = c.length;
    }
  }
  return prefixe?.position;
}

/// Distance de Levenshtein, abandonnée dès qu'elle atteint [plafond].
int _ecart(String a, String b, int plafond) {
  var avant = List<int>.generate(b.length + 1, (j) => j);
  for (var i = 1; i <= a.length; i++) {
    final ligne = List<int>.filled(b.length + 1, 0)..[0] = i;
    var minimum = i;
    for (var j = 1; j <= b.length; j++) {
      final cout = a.codeUnitAt(i - 1) == b.codeUnitAt(j - 1) ? 0 : 1;
      final v = [avant[j] + 1, ligne[j - 1] + 1, avant[j - 1] + cout]
          .reduce((x, y) => x < y ? x : y);
      ligne[j] = v;
      if (v < minimum) minimum = v;
    }
    if (minimum >= plafond) return plafond;
    avant = ligne;
  }
  return avant[b.length];
}

/// Les communes dont le centre tombe dans une zone, en degrés, les plus
/// peuplées d'abord. Sert de repère au choix d'un point précis : sans
/// tuiles, pas de rues à montrer, mais les villages voisins et leur nom
/// suffisent à se situer.
List<Commune> communesDans(
  double ouest,
  double sud,
  double est,
  double nord, {
  int maximum = 80,
}) {
  final trouvees = <Commune>[];
  for (final c in _communes) {
    final p = c.position;
    if (p.longitude < ouest || p.longitude > est) continue;
    if (p.latitude < sud || p.latitude > nord) continue;
    trouvees.add(c);
    if (trouvees.length >= maximum) break;
  }
  return trouvees;
}

/// « Saint-Denis (93) » : le nom d'un côté, le département de l'autre.
({String nom, String? departement}) _decouper(String ville) {
  final m = RegExp(r'^(.*?)\s*\(\s*(\w{2,3})\s*\)\s*$').firstMatch(ville);
  if (m == null) return (nom: ville, departement: null);
  return (nom: m.group(1)!, departement: m.group(2)!.toUpperCase());
}

/// La clé telle quelle, puis avec « st » et « ste » développés.
Iterable<String> _variantes(String clef) sync* {
  yield clef;
  if (clef.startsWith('ste') && !clef.startsWith('stet')) {
    yield 'sainte${clef.substring(3)}';
  }
  if (clef.startsWith('st') && !clef.startsWith('sta')) {
    yield 'saint${clef.substring(2)}';
  }
}

Coordonnee? _chercher(Map<String, Coordonnee> table, String clef) {
  for (final essai in _variantes(clef)) {
    final trouve = table[essai];
    if (trouve != null) return trouve;
  }
  return null;
}

String _normaliser(String valeur) {
  final sansAccent = valeur
      .toLowerCase()
      .replaceAll(RegExp('[àâäá]'), 'a')
      .replaceAll(RegExp('[éèêë]'), 'e')
      .replaceAll(RegExp('[îïí]'), 'i')
      .replaceAll(RegExp('[ôöó]'), 'o')
      .replaceAll(RegExp('[ùûüú]'), 'u')
      .replaceAll('ÿ', 'y')
      .replaceAll('ç', 'c')
      .replaceAll('œ', 'oe')
      .replaceAll('æ', 'ae');
  return sansAccent.replaceAll(RegExp('[^a-z0-9]'), '');
}

/// Noms d'usage, et positions déjà vérifiées à la main. Lu après le
/// référentiel : il ne sert plus que pour ce que celui-ci écrit autrement.
const _alias = <String, Coordonnee>{
  // ------------------------------------------------ Morbihan et Bretagne
  'vannes': (latitude: 47.658, longitude: -2.760),
  'auray': (latitude: 47.667, longitude: -2.982),
  'lorient': (latitude: 47.748, longitude: -3.367),
  'quimper': (latitude: 47.996, longitude: -4.103),
  'brest': (latitude: 48.390, longitude: -4.486),
  'rennes': (latitude: 48.117, longitude: -1.677),
  'saintbrieuc': (latitude: 48.514, longitude: -2.765),
  'saintmalo': (latitude: 48.649, longitude: -2.026),
  'lannion': (latitude: 48.732, longitude: -3.459),
  'morlaix': (latitude: 48.578, longitude: -3.828),
  'pontivy': (latitude: 48.068, longitude: -2.964),
  'redon': (latitude: 47.651, longitude: -2.085),
  'ploermel': (latitude: 47.932, longitude: -2.398),
  'josselin': (latitude: 47.954, longitude: -2.547),
  'locmine': (latitude: 47.886, longitude: -2.836),
  'baud': (latitude: 47.870, longitude: -3.014),
  'hennebont': (latitude: 47.802, longitude: -3.276),
  'lanester': (latitude: 47.762, longitude: -3.341),
  'ploemeur': (latitude: 47.734, longitude: -3.435),
  'guidel': (latitude: 47.789, longitude: -3.492),
  'quimperle': (latitude: 47.870, longitude: -3.549),
  'concarneau': (latitude: 47.875, longitude: -3.920),
  'carnac': (latitude: 47.585, longitude: -3.079),
  'quiberon': (latitude: 47.483, longitude: -3.120),
  'arzon': (latitude: 47.545, longitude: -2.890),
  'sarzeau': (latitude: 47.528, longitude: -2.766),
  'sene': (latitude: 47.626, longitude: -2.738),
  'theix': (latitude: 47.617, longitude: -2.652),
  'elven': (latitude: 47.733, longitude: -2.585),
  'questembert': (latitude: 47.662, longitude: -2.454),
  'muzillac': (latitude: 47.554, longitude: -2.482),
  'larochebernard': (latitude: 47.518, longitude: -2.302),
  'dinan': (latitude: 48.452, longitude: -2.047),
  'fougeres': (latitude: 48.353, longitude: -1.203),
  'vitre': (latitude: 48.124, longitude: -1.207),

  // ----------------------------------------------------- Pays de la Loire
  'nantes': (latitude: 47.218, longitude: -1.554),
  'saintnazaire': (latitude: 47.273, longitude: -2.213),
  'labaule': (latitude: 47.286, longitude: -2.393),
  'guerande': (latitude: 47.328, longitude: -2.428),
  'pornic': (latitude: 47.113, longitude: -2.103),
  'angers': (latitude: 47.478, longitude: -0.563),
  'lemans': (latitude: 48.007, longitude: 0.199),
  'laval': (latitude: 48.070, longitude: -0.770),
  'saumur': (latitude: 47.260, longitude: -0.077),
  'cholet': (latitude: 47.059, longitude: -0.879),
  'larochesuryon': (latitude: 46.670, longitude: -1.427),
  'lessablesdolonne': (latitude: 46.497, longitude: -1.783),

  // ------------------------------------------------------ grandes villes
  'paris': (latitude: 48.857, longitude: 2.352),
  'marseille': (latitude: 43.296, longitude: 5.370),
  'lyon': (latitude: 45.764, longitude: 4.836),
  'toulouse': (latitude: 43.605, longitude: 1.444),
  'nice': (latitude: 43.700, longitude: 7.265),
  'montpellier': (latitude: 43.611, longitude: 3.877),
  'strasbourg': (latitude: 48.573, longitude: 7.752),
  'bordeaux': (latitude: 44.838, longitude: -0.579),
  'lille': (latitude: 50.629, longitude: 3.057),
  'reims': (latitude: 49.258, longitude: 4.032),
  'lehavre': (latitude: 49.494, longitude: 0.108),
  'saintetienne': (latitude: 45.440, longitude: 4.387),
  'toulon': (latitude: 43.125, longitude: 5.930),
  'grenoble': (latitude: 45.188, longitude: 5.724),
  'dijon': (latitude: 47.322, longitude: 5.041),
  'nimes': (latitude: 43.837, longitude: 4.360),
  'clermontferrand': (latitude: 45.777, longitude: 3.087),
  'aixenprovence': (latitude: 43.529, longitude: 5.448),
  'tours': (latitude: 47.394, longitude: 0.684),
  'amiens': (latitude: 49.895, longitude: 2.302),
  'limoges': (latitude: 45.833, longitude: 1.261),
  'annecy': (latitude: 45.899, longitude: 6.129),
  'perpignan': (latitude: 42.689, longitude: 2.895),
  'besancon': (latitude: 47.238, longitude: 6.024),
  'metz': (latitude: 49.120, longitude: 6.176),
  'orleans': (latitude: 47.902, longitude: 1.909),
  'rouen': (latitude: 49.443, longitude: 1.100),
  'mulhouse': (latitude: 47.750, longitude: 7.340),
  'caen': (latitude: 49.183, longitude: -0.370),
  'nancy': (latitude: 48.692, longitude: 6.184),
  'avignon': (latitude: 43.949, longitude: 4.806),
  'dunkerque': (latitude: 51.035, longitude: 2.377),
  'poitiers': (latitude: 46.580, longitude: 0.340),
  'versailles': (latitude: 48.804, longitude: 2.130),
  'pau': (latitude: 43.295, longitude: -0.370),
  'antibes': (latitude: 43.581, longitude: 7.125),
  'larochelle': (latitude: 46.160, longitude: -1.152),
  'cannes': (latitude: 43.553, longitude: 7.018),
  'calais': (latitude: 50.949, longitude: 1.856),
  'beziers': (latitude: 43.344, longitude: 3.216),
  'colmar': (latitude: 48.079, longitude: 7.358),
  'bourges': (latitude: 47.084, longitude: 2.396),
  'valence': (latitude: 44.933, longitude: 4.892),
  'troyes': (latitude: 48.297, longitude: 4.074),
  'montauban': (latitude: 44.018, longitude: 1.355),
  'niort': (latitude: 46.324, longitude: -0.464),
  'chambery': (latitude: 45.564, longitude: 5.918),
  'beauvais': (latitude: 49.430, longitude: 2.081),
  'ajaccio': (latitude: 41.927, longitude: 8.737),
  'bastia': (latitude: 42.700, longitude: 9.450),
  'biarritz': (latitude: 43.483, longitude: -1.559),
  'bayonne': (latitude: 43.493, longitude: -1.475),
  'angouleme': (latitude: 45.650, longitude: 0.160),
  'perigueux': (latitude: 45.184, longitude: 0.721),
  'brive': (latitude: 45.159, longitude: 1.533),
  'albi': (latitude: 43.928, longitude: 2.148),
  'carcassonne': (latitude: 43.213, longitude: 2.353),
  'narbonne': (latitude: 43.184, longitude: 3.004),
  'arles': (latitude: 43.677, longitude: 4.628),
  'gap': (latitude: 44.559, longitude: 6.079),
  'chamonix': (latitude: 45.924, longitude: 6.870),
  'sainttropez': (latitude: 43.268, longitude: 6.640),
  'monaco': (latitude: 43.738, longitude: 7.424),
  'deauville': (latitude: 49.360, longitude: 0.075),
  'cherbourg': (latitude: 49.639, longitude: -1.616),
  'compiegne': (latitude: 49.418, longitude: 2.826),
  'chartres': (latitude: 48.444, longitude: 1.489),
  'blois': (latitude: 47.586, longitude: 1.335),
  'nevers': (latitude: 46.990, longitude: 3.163),
  'macon': (latitude: 46.307, longitude: 4.828),
  'bourgenbresse': (latitude: 46.205, longitude: 5.226),
  'vichy': (latitude: 46.127, longitude: 3.426),
  'chateauroux': (latitude: 46.812, longitude: 1.691),
  'tarbes': (latitude: 43.233, longitude: 0.078),
  'agen': (latitude: 44.202, longitude: 0.617),
  'cahors': (latitude: 44.448, longitude: 1.441),
  'rodez': (latitude: 44.351, longitude: 2.575),
  'aurillac': (latitude: 44.926, longitude: 2.444),
  'lepuyenvelay': (latitude: 45.043, longitude: 3.885),
  'evreux': (latitude: 49.024, longitude: 1.151),
  'alencon': (latitude: 48.432, longitude: 0.093),
  'royan': (latitude: 45.628, longitude: -1.028),
  'saintes': (latitude: 45.746, longitude: -0.633),
  'rochefort': (latitude: 45.941, longitude: -0.961),
  'arcachon': (latitude: 44.658, longitude: -1.168),
  'dax': (latitude: 43.710, longitude: -1.053),
  'montdemarsan': (latitude: 43.890, longitude: -0.500),
  'auch': (latitude: 43.646, longitude: 0.586),
  'millau': (latitude: 44.099, longitude: 3.078),
  'sete': (latitude: 43.403, longitude: 3.697),
  'menton': (latitude: 43.775, longitude: 7.503),
  'frejus': (latitude: 43.433, longitude: 6.737),
  'draguignan': (latitude: 43.539, longitude: 6.466),
  'manosque': (latitude: 43.829, longitude: 5.784),
  'albertville': (latitude: 45.676, longitude: 6.392),
  'thononlesbains': (latitude: 46.371, longitude: 6.478),
  'belfort': (latitude: 47.638, longitude: 6.864),
  'epinal': (latitude: 48.174, longitude: 6.451),
  'verdun': (latitude: 49.160, longitude: 5.383),
  'boulognesurmer': (latitude: 50.726, longitude: 1.614),
  'arras': (latitude: 50.291, longitude: 2.778),
  'valenciennes': (latitude: 50.357, longitude: 3.523),
  'lens': (latitude: 50.430, longitude: 2.832),
};

/// Hors de France : utile aux distances, jamais posé sur la carte.
const _etranger = <String, Coordonnee>{
  'londres': (latitude: 51.507, longitude: -0.128),
  'bruxelles': (latitude: 50.851, longitude: 4.352),
  'amsterdam': (latitude: 52.370, longitude: 4.895),
  'berlin': (latitude: 52.520, longitude: 13.405),
  'madrid': (latitude: 40.417, longitude: -3.704),
  'barcelone': (latitude: 41.385, longitude: 2.173),
  'lisbonne': (latitude: 38.722, longitude: -9.139),
  'rome': (latitude: 41.903, longitude: 12.496),
  'milan': (latitude: 45.464, longitude: 9.190),
  'geneve': (latitude: 46.204, longitude: 6.143),
  'luxembourg': (latitude: 49.611, longitude: 6.130),
  'dublin': (latitude: 53.350, longitude: -6.260),
};
