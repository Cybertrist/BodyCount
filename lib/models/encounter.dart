class Encounter {
  final int? id;
  final int contactId;
  final DateTime date;
  final String? locationName;
  final double? latitude;
  final double? longitude;
  final String? notes;
  final int rating;
  final DateTime createdAt;

  // Champ calculé (non stocké en DB)
  final String? contactPseudo;
  final String? contactPhotoPath;

  Encounter({
    this.id,
    required this.contactId,
    required this.date,
    this.locationName,
    this.latitude,
    this.longitude,
    this.notes,
    this.rating = 3,
    DateTime? createdAt,
    this.contactPseudo,
    this.contactPhotoPath,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'contact_id': contactId,
      'date': date.toIso8601String(),
      'location_name': locationName,
      'latitude': latitude,
      'longitude': longitude,
      'notes': notes,
      'rating': rating,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory Encounter.fromMap(Map<String, dynamic> map) {
    return Encounter(
      id: map['id'] as int?,
      contactId: map['contact_id'] as int,
      date: DateTime.parse(map['date'] as String),
      locationName: map['location_name'] as String?,
      latitude: map['latitude'] != null
          ? (map['latitude'] as num).toDouble()
          : null,
      longitude: map['longitude'] != null
          ? (map['longitude'] as num).toDouble()
          : null,
      notes: map['notes'] as String?,
      rating: map['rating'] as int? ?? 3,
      createdAt: DateTime.parse(map['created_at'] as String),
      contactPseudo: map['contact_pseudo'] as String?,
      contactPhotoPath: map['contact_photo_path'] as String?,
    );
  }

  Encounter copyWith({
    int? id,
    int? contactId,
    DateTime? date,
    String? locationName,
    double? latitude,
    double? longitude,
    String? notes,
    int? rating,
    DateTime? createdAt,
  }) {
    return Encounter(
      id: id ?? this.id,
      contactId: contactId ?? this.contactId,
      date: date ?? this.date,
      locationName: locationName ?? this.locationName,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      notes: notes ?? this.notes,
      rating: rating ?? this.rating,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  bool get hasLocation => latitude != null && longitude != null;
}
