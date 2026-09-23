/// Portée d'une étiquette.
///
/// Une étiquette de personne décrit quelqu'un et reste sur sa fiche. Une
/// étiquette de rencontre décrit une soirée et ne vaut que pour elle.
/// Les deux vocabulaires sont séparés : « chez lui » n'a pas le même sens
/// collé à une personne ou à une fois précise.
enum PorteeEtiquette {
  personne('personne'),
  rencontre('rencontre');

  const PorteeEtiquette(this.code);

  final String code;

  static PorteeEtiquette depuisCode(String code) {
    return PorteeEtiquette.values.firstWhere(
      (p) => p.code == code,
      orElse: () => PorteeEtiquette.personne,
    );
  }
}

/// Une étiquette du vocabulaire.
///
/// Les étiquettes vivent dans leur propre table, et non dans une colonne
/// de texte. C'est ce qui permet de compter les usages, de renommer sans
/// tout réécrire, de proposer l'existant à la saisie, et de filtrer sans
/// attraper « chaud » en cherchant « chaudasse ».
class Etiquette {
  const Etiquette({
    this.id,
    required this.libelle,
    required this.portee,
    this.usages = 0,
  });

  final int? id;
  final String libelle;
  final PorteeEtiquette portee;

  /// Nombre de fiches ou de rencontres qui la portent. Calculé, pas stocké.
  final int usages;

  /// Forme utilisée pour repérer les doublons : sans accents, sans casse,
  /// sans espaces en trop. « Grosse Bite » et « grosse bite » sont la
  /// même étiquette.
  static String normaliser(String libelle) {
    const accents = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ';
    const sans = 'aaaaaaceeeeiiiinooooouuuuyy';
    final base = libelle.trim().toLowerCase();
    final tampon = StringBuffer();
    for (final rune in base.runes) {
      final c = String.fromCharCode(rune);
      final i = accents.indexOf(c);
      tampon.write(i >= 0 ? sans[i] : c);
    }
    return tampon.toString().replaceAll(RegExp(r'\s+'), ' ');
  }

  Map<String, Object?> versMap() => {
        if (id != null) 'id': id,
        'libelle': libelle.trim(),
        'cle': normaliser(libelle),
        'portee': portee.code,
      };

  factory Etiquette.depuisMap(Map<String, Object?> map) => Etiquette(
        id: map['id'] as int?,
        libelle: map['libelle'] as String,
        portee: PorteeEtiquette.depuisCode(map['portee'] as String),
        usages: (map['usages'] as int?) ?? 0,
      );
}
