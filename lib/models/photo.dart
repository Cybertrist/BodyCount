class Photo {
  final int? id;
  final int contactId;
  final int? encounterId;
  final String filePath;
  final bool isMain;
  final DateTime createdAt;

  Photo({
    this.id,
    required this.contactId,
    this.encounterId,
    required this.filePath,
    this.isMain = false,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'contact_id': contactId,
      'encounter_id': encounterId,
      'file_path': filePath,
      'is_main': isMain ? 1 : 0,
      'created_at': createdAt.toIso8601String(),
    };
  }

  factory Photo.fromMap(Map<String, dynamic> map) {
    return Photo(
      id: map['id'] as int?,
      contactId: map['contact_id'] as int,
      encounterId: map['encounter_id'] as int?,
      filePath: map['file_path'] as String,
      isMain: (map['is_main'] as int? ?? 0) == 1,
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }

  Photo copyWith({
    int? id,
    int? contactId,
    int? encounterId,
    String? filePath,
    bool? isMain,
    DateTime? createdAt,
  }) {
    return Photo(
      id: id ?? this.id,
      contactId: contactId ?? this.contactId,
      encounterId: encounterId ?? this.encounterId,
      filePath: filePath ?? this.filePath,
      isMain: isMain ?? this.isMain,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
