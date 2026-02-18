import '../models/photo.dart';
import 'database_helper.dart';

class PhotoDao {
  final DatabaseHelper _dbHelper = DatabaseHelper();

  Future<int> insert(Photo photo) async {
    final db = await _dbHelper.database;
    return await db.insert('photos', photo.toMap());
  }

  Future<int> delete(int id) async {
    final db = await _dbHelper.database;
    return await db.delete('photos', where: 'id = ?', whereArgs: [id]);
  }

  Future<List<Photo>> getByContact(int contactId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'photos',
      where: 'contact_id = ?',
      whereArgs: [contactId],
      orderBy: 'created_at DESC',
    );
    return maps.map((m) => Photo.fromMap(m)).toList();
  }

  Future<List<Photo>> getByEncounter(int encounterId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'photos',
      where: 'encounter_id = ?',
      whereArgs: [encounterId],
      orderBy: 'created_at DESC',
    );
    return maps.map((m) => Photo.fromMap(m)).toList();
  }

  Future<void> setAsMain(int photoId, int contactId) async {
    final db = await _dbHelper.database;
    await db.transaction((txn) async {
      // Retirer le flag main de toutes les photos du contact
      await txn.update(
        'photos',
        {'is_main': 0},
        where: 'contact_id = ?',
        whereArgs: [contactId],
      );
      // Marquer la photo sélectionnée comme principale
      await txn.update(
        'photos',
        {'is_main': 1},
        where: 'id = ?',
        whereArgs: [photoId],
      );
      // Mettre à jour le main_photo_path du contact
      final photos = await txn.query(
        'photos',
        where: 'id = ?',
        whereArgs: [photoId],
      );
      if (photos.isNotEmpty) {
        await txn.update(
          'contacts',
          {'main_photo_path': photos.first['file_path']},
          where: 'id = ?',
          whereArgs: [contactId],
        );
      }
    });
  }

  Future<Photo?> getMainPhoto(int contactId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'photos',
      where: 'contact_id = ? AND is_main = 1',
      whereArgs: [contactId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return Photo.fromMap(maps.first);
  }

  Future<int> getCountByContact(int contactId) async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM photos WHERE contact_id = ?',
      [contactId],
    );
    return (result.first['count'] as int?) ?? 0;
  }

  Future<List<String>> getAllPaths() async {
    final db = await _dbHelper.database;
    final maps = await db.query('photos', columns: ['file_path']);
    return maps.map((m) => m['file_path'] as String).toList();
  }
}
