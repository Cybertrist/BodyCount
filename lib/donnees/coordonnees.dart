/// Coordonnées des villes, pour poser la carte.
///
/// Une carte qui charge des tuiles enverrait à un serveur, à chaque
/// déplacement, la liste exacte des endroits regardés. Pour une
/// application dont toute la promesse est que rien ne sort du téléphone,
/// c'est la seule chose à ne pas faire. La table ci-dessous est donc
/// embarquée : aucune requête, aucune clé d'API, et les positions sont
/// les vraies.
///
/// Elle couvre les grandes villes françaises, la Bretagne et le Morbihan
/// dans le détail, et quelques capitales proches. Une ville absente
/// n'est pas perdue : elle est listée à part, sous la carte, plutôt que
/// posée au hasard.
library;

/// Une position sur le globe, en degrés.
typedef Coordonnee = ({double latitude, double longitude});

/// Cherche une ville dans la table.
///
/// La comparaison ignore la casse, les accents, les traits d'union et
/// les espaces, parce que personne ne saisit « Saint-Brieuc » deux fois
/// de la même manière. « St Malo » et « saint-malo » tombent sur la même
/// entrée.
Coordonnee? coordonneesDe(String ville) {
  final clef = _normaliser(ville);
  final trouve = _table[clef];
  if (trouve != null) return trouve;

  // Deuxième essai, avec « st » développé en « saint ».
  if (clef.startsWith('st') && !clef.startsWith('sta')) {
    return _table['saint${clef.substring(2)}'];
  }
  return null;
}

String _normaliser(String valeur) {
  final sansAccent = valeur
      .toLowerCase()
      .replaceAll(RegExp('[àâä]'), 'a')
      .replaceAll(RegExp('[éèêë]'), 'e')
      .replaceAll(RegExp('[îï]'), 'i')
      .replaceAll(RegExp('[ôö]'), 'o')
      .replaceAll(RegExp('[ùûü]'), 'u')
      .replaceAll('ç', 'c');
  return sansAccent.replaceAll(RegExp('[^a-z0-9]'), '');
}

const _table = <String, Coordonnee>{
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

  // --------------------------------------------------- un peu plus loin
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
