/// Une note libre sur une personne.
///
/// Le carnet est daté et s'empile : on n'écrase pas ce qu'on pensait il y
/// a six mois. Une note peut être rattachée à une rencontre précise, ce
/// qui permet d'afficher « après la 7e fois » au lieu d'une date sèche.
class Note {
  const Note({
    this.id,
    required this.personneId,
    this.rencontreId,
    required this.texte,
    required this.ecriteLe,
  });

  final int? id;
  final int personneId;
  final int? rencontreId;
  final String texte;
  final DateTime ecriteLe;

  Note copyWith({String? texte}) => Note(
        id: id,
        personneId: personneId,
        rencontreId: rencontreId,
        texte: texte ?? this.texte,
        ecriteLe: ecriteLe,
      );

  Map<String, Object?> versMap() => {
        if (id != null) 'id': id,
        'personne_id': personneId,
        'rencontre_id': rencontreId,
        'texte': texte,
        'ecrite_le': ecriteLe.toIso8601String(),
      };

  factory Note.depuisMap(Map<String, Object?> map) => Note(
        id: map['id'] as int?,
        personneId: map['personne_id'] as int,
        rencontreId: map['rencontre_id'] as int?,
        texte: map['texte'] as String,
        ecriteLe: DateTime.parse(map['ecrite_le'] as String),
      );
}

/// Une photo du coffre, rattachée à une personne.
class Photo {
  const Photo({
    this.id,
    required this.personneId,
    this.rencontreId,
    required this.chemin,
    this.principale = false,
    required this.ajouteeLe,
  });

  final int? id;
  final int personneId;
  final int? rencontreId;

  /// Chemin du fichier chiffré dans le coffre.
  final String chemin;

  final bool principale;
  final DateTime ajouteeLe;

  Map<String, Object?> versMap() => {
        if (id != null) 'id': id,
        'personne_id': personneId,
        'rencontre_id': rencontreId,
        'chemin': chemin,
        'principale': principale ? 1 : 0,
        'ajoutee_le': ajouteeLe.toIso8601String(),
      };

  factory Photo.depuisMap(Map<String, Object?> map) => Photo(
        id: map['id'] as int?,
        personneId: map['personne_id'] as int,
        rencontreId: map['rencontre_id'] as int?,
        chemin: map['chemin'] as String,
        principale: (map['principale'] as int? ?? 0) == 1,
        ajouteeLe: DateTime.parse(map['ajoutee_le'] as String),
      );
}
