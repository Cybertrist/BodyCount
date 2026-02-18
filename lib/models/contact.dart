class Contact {
  final int? id;
  final String pseudo;
  final String? platform;
  final String? profileUrl;
  final int? age;
  final int? height;
  final String? description;
  final List<String> tags;
  final String? mainPhotoPath;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Champs calculés (non stockés en DB)
  final int encounterCount;
  final double? averageRating;
  final DateTime? lastEncounterDate;

  Contact({
    this.id,
    required this.pseudo,
    this.platform,
    this.profileUrl,
    this.age,
    this.height,
    this.description,
    this.tags = const [],
    this.mainPhotoPath,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.encounterCount = 0,
    this.averageRating,
    this.lastEncounterDate,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'pseudo': pseudo,
      'platform': platform,
      'profile_url': profileUrl,
      'age': age,
      'height': height,
      'description': description,
      'tags': tags.join(','),
      'main_photo_path': mainPhotoPath,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory Contact.fromMap(Map<String, dynamic> map) {
    final tagsStr = map['tags'] as String?;
    return Contact(
      id: map['id'] as int?,
      pseudo: map['pseudo'] as String,
      platform: map['platform'] as String?,
      profileUrl: map['profile_url'] as String?,
      age: map['age'] as int?,
      height: map['height'] as int?,
      description: map['description'] as String?,
      tags: tagsStr != null && tagsStr.isNotEmpty
          ? tagsStr.split(',')
          : [],
      mainPhotoPath: map['main_photo_path'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      encounterCount: map['encounter_count'] as int? ?? 0,
      averageRating: map['average_rating'] != null
          ? (map['average_rating'] as num).toDouble()
          : null,
      lastEncounterDate: map['last_encounter_date'] != null
          ? DateTime.parse(map['last_encounter_date'] as String)
          : null,
    );
  }

  Contact copyWith({
    int? id,
    String? pseudo,
    String? platform,
    String? profileUrl,
    int? age,
    int? height,
    String? description,
    List<String>? tags,
    String? mainPhotoPath,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? encounterCount,
    double? averageRating,
    DateTime? lastEncounterDate,
  }) {
    return Contact(
      id: id ?? this.id,
      pseudo: pseudo ?? this.pseudo,
      platform: platform ?? this.platform,
      profileUrl: profileUrl ?? this.profileUrl,
      age: age ?? this.age,
      height: height ?? this.height,
      description: description ?? this.description,
      tags: tags ?? this.tags,
      mainPhotoPath: mainPhotoPath ?? this.mainPhotoPath,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      encounterCount: encounterCount ?? this.encounterCount,
      averageRating: averageRating ?? this.averageRating,
      lastEncounterDate: lastEncounterDate ?? this.lastEncounterDate,
    );
  }
}
