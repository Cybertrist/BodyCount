/// Le genre d'une personne.
///
/// Champ libre à choix fermé plutôt que case à cocher : l'application
/// sert à se souvenir, pas à classer, mais une valeur commune permet les
/// répartitions de l'écran des statistiques.
enum Genre {
  homme('homme', 'Homme'),
  femme('femme', 'Femme'),
  nonBinaire('non_binaire', 'Non binaire'),
  autre('autre', 'Autre');

  const Genre(this.code, this.libelle);

  final String code;
  final String libelle;

  static Genre? depuisCode(String? code) {
    if (code == null) return null;
    for (final g in Genre.values) {
      if (g.code == code) return g;
    }
    return null;
  }
}

/// Le rôle, au lit.
enum RoleSexuel {
  actif('actif', 'Actif'),
  passif('passif', 'Passif'),
  versatile('versatile', 'Versatile');

  const RoleSexuel(this.code, this.libelle);

  final String code;
  final String libelle;

  static RoleSexuel? depuisCode(String? code) {
    if (code == null) return null;
    for (final r in RoleSexuel.values) {
      if (r.code == code) return r;
    }
    return null;
  }
}

/// Une personne du répertoire.
///
/// Le prénom est le seul champ obligatoire : une fiche doit pouvoir être
/// créée en dix secondes, quitte à la compléter plus tard. Tout le reste
/// est facultatif, et l'interface ne réclame jamais rien.
class Personne {
  const Personne({
    this.id,
    required this.prenom,
    this.age,
    this.ville,
    this.rencontreSur,
    this.telephone,
    this.adresse,
    this.photoPrincipale,
    this.genre,
    this.role,
    required this.creeLe,
    required this.modifieLe,
  });

  final int? id;
  final String prenom;
  final int? age;
  final String? ville;

  /// D'où vient la rencontre : Grindr, une soirée, la rue. Champ libre,
  /// parce qu'une liste fermée finit toujours par manquer d'une entrée.
  final String? rencontreSur;

  final String? telephone;

  /// Où il ou elle habite, en texte libre.
  ///
  /// Ce champ ne sert qu'à ouvrir l'itinéraire dans l'application de
  /// cartes du téléphone. Il reste dans la base chiffrée comme le reste,
  /// et rien ne part nulle part tant qu'on n'a pas appuyé sur le bouton.
  final String? adresse;

  /// Chemin de la photo mise en avant, dans le coffre chiffré.
  final String? photoPrincipale;

  final Genre? genre;
  final RoleSexuel? role;

  final DateTime creeLe;
  final DateTime modifieLe;

  Personne copyWith({
    int? id,
    String? prenom,
    int? age,
    String? ville,
    String? rencontreSur,
    String? telephone,
    String? adresse,
    String? photoPrincipale,
    Genre? genre,
    RoleSexuel? role,
    DateTime? creeLe,
    DateTime? modifieLe,
    bool effacerPhoto = false,
  }) {
    return Personne(
      id: id ?? this.id,
      prenom: prenom ?? this.prenom,
      age: age ?? this.age,
      ville: ville ?? this.ville,
      rencontreSur: rencontreSur ?? this.rencontreSur,
      telephone: telephone ?? this.telephone,
      adresse: adresse ?? this.adresse,
      photoPrincipale:
          effacerPhoto ? null : (photoPrincipale ?? this.photoPrincipale),
      genre: genre ?? this.genre,
      role: role ?? this.role,
      creeLe: creeLe ?? this.creeLe,
      modifieLe: modifieLe ?? this.modifieLe,
    );
  }

  Map<String, Object?> versMap() => {
        if (id != null) 'id': id,
        'prenom': prenom,
        'age': age,
        'ville': ville,
        'rencontre_sur': rencontreSur,
        'telephone': telephone,
        'adresse': adresse,
        'photo_principale': photoPrincipale,
        'genre': genre?.code,
        'role': role?.code,
        'cree_le': creeLe.toIso8601String(),
        'modifie_le': modifieLe.toIso8601String(),
      };

  factory Personne.depuisMap(Map<String, Object?> map) => Personne(
        id: map['id'] as int?,
        prenom: map['prenom'] as String,
        age: map['age'] as int?,
        ville: map['ville'] as String?,
        rencontreSur: map['rencontre_sur'] as String?,
        telephone: map['telephone'] as String?,
        adresse: map['adresse'] as String?,
        photoPrincipale: map['photo_principale'] as String?,
        genre: Genre.depuisCode(map['genre'] as String?),
        role: RoleSexuel.depuisCode(map['role'] as String?),
        creeLe: DateTime.parse(map['cree_le'] as String),
        modifieLe: DateTime.parse(map['modifie_le'] as String),
      );
}

/// Une personne accompagnée de ce qui se calcule à partir de ses
/// rencontres.
///
/// Ces valeurs viennent d'une requête groupée et non d'une colonne :
/// stocker un compteur dans la table obligerait à le tenir à jour à chaque
/// ajout, et il finirait par mentir.
class FichePersonne {
  const FichePersonne({
    required this.personne,
    required this.nombreRencontres,
    required this.moyenne,
    required this.derniereFois,
    required this.premiereFois,
    this.etiquettes = const [],
  });

  final Personne personne;
  final int nombreRencontres;

  /// Moyenne des notes en demi-points, de 0 à 10, ou null si aucune
  /// rencontre n'a été notée.
  final double? moyenne;

  final DateTime? derniereFois;
  final DateTime? premiereFois;
  final List<String> etiquettes;

  /// La note telle qu'elle s'affiche, sur cinq.
  String get moyenneAffichee {
    final m = moyenne;
    if (m == null) return '—';
    return (m / 2).toStringAsFixed(1).replaceAll('.', ',');
  }

  /// Nombre de jours depuis la première rencontre.
  int? get anciennete {
    final debut = premiereFois;
    if (debut == null) return null;
    return DateTime.now().difference(debut).inDays;
  }
}
