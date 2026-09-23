/// Une rencontre, c'est à dire une fois.
///
/// La note est stockée en demi-points entiers, de 0 à 10, et non en
/// nombre à virgule. Une note de 4,5 devient 9. Les flottants se
/// comparent mal, s'additionnent mal et s'affichent mal ; les demi-points
/// règlent les trois d'un coup, et l'interface divise par deux pour
/// afficher.
class Rencontre {
  const Rencontre({
    this.id,
    required this.personneId,
    required this.quand,
    this.lieu,
    this.latitude,
    this.longitude,
    this.noteDemiPoints,
    this.montantCentimes,
    required this.creeLe,
  });

  final int? id;
  final int personneId;
  final DateTime quand;

  /// Nom lisible du lieu, « chez lui », « Le Fébrile ». Les coordonnées
  /// servent à la carte, le nom sert à la mémoire.
  final String? lieu;
  final double? latitude;
  final double? longitude;

  /// De 0 à 10, par demi-points. Null tant que rien n'a été noté.
  final int? noteDemiPoints;

  /// Ce que la soirée a rapporté, en centimes.
  ///
  /// En centimes entiers plutôt qu'en euros à virgule : additionner des
  /// doubles finit toujours par afficher un centime de travers. Null
  /// veut dire « la question ne se pose pas », ce qui n'est pas zéro.
  final int? montantCentimes;

  final DateTime creeLe;

  bool get aUnePosition => latitude != null && longitude != null;

  bool get aRapporte => (montantCentimes ?? 0) > 0;

  /// Le montant en euros, sans centimes quand ils sont nuls : « 100 € »
  /// se lit mieux que « 100,00 € » dans une liste.
  String? get montantAffiche {
    final c = montantCentimes;
    if (c == null || c == 0) return null;
    if (c % 100 == 0) return '${c ~/ 100} €';
    return '${(c / 100).toStringAsFixed(2).replaceAll('.', ',')} €';
  }

  /// La note sur cinq, pour l'affichage.
  String get noteAffichee {
    final n = noteDemiPoints;
    if (n == null) return '—';
    return (n / 2).toStringAsFixed(1).replaceAll('.', ',');
  }

  Rencontre copyWith({
    int? id,
    int? personneId,
    DateTime? quand,
    String? lieu,
    double? latitude,
    double? longitude,
    int? noteDemiPoints,
    int? montantCentimes,
    bool effacerMontant = false,
    DateTime? creeLe,
  }) {
    return Rencontre(
      id: id ?? this.id,
      personneId: personneId ?? this.personneId,
      quand: quand ?? this.quand,
      lieu: lieu ?? this.lieu,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      noteDemiPoints: noteDemiPoints ?? this.noteDemiPoints,
      montantCentimes:
          effacerMontant ? null : (montantCentimes ?? this.montantCentimes),
      creeLe: creeLe ?? this.creeLe,
    );
  }

  Map<String, Object?> versMap() => {
        if (id != null) 'id': id,
        'personne_id': personneId,
        'quand': quand.toIso8601String(),
        'lieu': lieu,
        'latitude': latitude,
        'longitude': longitude,
        'note': noteDemiPoints,
        'montant_centimes': montantCentimes,
        'cree_le': creeLe.toIso8601String(),
      };

  factory Rencontre.depuisMap(Map<String, Object?> map) => Rencontre(
        id: map['id'] as int?,
        personneId: map['personne_id'] as int,
        quand: DateTime.parse(map['quand'] as String),
        lieu: map['lieu'] as String?,
        latitude: map['latitude'] as double?,
        longitude: map['longitude'] as double?,
        noteDemiPoints: map['note'] as int?,
        montantCentimes: map['montant_centimes'] as int?,
        creeLe: DateTime.parse(map['cree_le'] as String),
      );
}

/// Une entrée du journal : la rencontre et de quoi l'afficher sans
/// repasser chercher la personne.
class EntreeJournal {
  const EntreeJournal({
    required this.rencontre,
    required this.prenom,
    this.photo,
    this.role,
    this.villePersonne,
    this.etiquettes = const <String>{},
  });

  final Rencontre rencontre;
  final String prenom;
  final String? photo;

  /// Le rôle de la personne, et sa ville. Rapportés par la requête pour
  /// que le calendrier n'ait pas à rouvrir chaque fiche.
  final String? role;
  final String? villePersonne;

  /// Les clés normalisées des étiquettes posées sur ce soir là.
  final Set<String> etiquettes;

  bool aEtiquette(String cle) => etiquettes.contains(cle);
}
