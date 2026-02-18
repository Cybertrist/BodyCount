import 'package:sqflite/sqflite.dart';
import '../models/contact.dart';
import 'database_helper.dart';

class ContactDao {
  final DatabaseHelper _dbHelper = DatabaseHelper();

  Future<int> insert(Contact contact) async {
    final db = await _dbHelper.database;
    return await db.insert('contacts', contact.toMap());
  }

  Future<int> update(Contact contact) async {
    final db = await _dbHelper.database;
    return await db.update(
      'contacts',
      contact.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [contact.id],
    );
  }

  Future<int> delete(int id) async {
    final db = await _dbHelper.database;
    return await db.delete('contacts', where: 'id = ?', whereArgs: [id]);
  }

  Future<Contact?> getById(int id) async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT c.*,
        COUNT(e.id) as encounter_count,
        AVG(e.rating) as average_rating,
        MAX(e.date) as last_encounter_date
      FROM contacts c
      LEFT JOIN encounters e ON e.contact_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    ''', [id]);
    if (maps.isEmpty) return null;
    return Contact.fromMap(maps.first);
  }

  Future<List<Contact>> getAll({
    String? search,
    int? minRating,
    String? platform,
    String? tag,
    String orderBy = 'updated_at DESC',
  }) async {
    final db = await _dbHelper.database;
    final where = <String>[];
    final args = <dynamic>[];

    if (search != null && search.isNotEmpty) {
      where.add('c.pseudo LIKE ?');
      args.add('%$search%');
    }
    if (platform != null) {
      where.add('c.platform = ?');
      args.add(platform);
    }
    if (tag != null) {
      where.add('c.tags LIKE ?');
      args.add('%$tag%');
    }

    String havingClause = '';
    if (minRating != null) {
      havingClause = 'HAVING AVG(e.rating) >= $minRating OR COUNT(e.id) = 0';
    }

    final whereClause = where.isNotEmpty ? 'WHERE ${where.join(' AND ')}' : '';

    // Adapter le ORDER BY pour les champs calculés
    String resolvedOrderBy;
    switch (orderBy) {
      case 'encounter_count DESC':
        resolvedOrderBy = 'encounter_count DESC';
        break;
      case 'average_rating DESC':
        resolvedOrderBy = 'average_rating DESC';
        break;
      case 'pseudo ASC':
        resolvedOrderBy = 'c.pseudo ASC';
        break;
      case 'last_encounter_date DESC':
        resolvedOrderBy = 'last_encounter_date DESC';
        break;
      default:
        resolvedOrderBy = 'c.$orderBy';
    }

    final maps = await db.rawQuery('''
      SELECT c.*,
        COUNT(e.id) as encounter_count,
        AVG(e.rating) as average_rating,
        MAX(e.date) as last_encounter_date
      FROM contacts c
      LEFT JOIN encounters e ON e.contact_id = c.id
      $whereClause
      GROUP BY c.id
      $havingClause
      ORDER BY $resolvedOrderBy
    ''', args);

    return maps.map((m) => Contact.fromMap(m)).toList();
  }

  Future<List<Contact>> search(String query) async {
    return getAll(search: query);
  }

  Future<List<Contact>> getTopContacts({int limit = 5}) async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT c.*,
        COUNT(e.id) as encounter_count,
        AVG(e.rating) as average_rating,
        MAX(e.date) as last_encounter_date
      FROM contacts c
      INNER JOIN encounters e ON e.contact_id = c.id
      GROUP BY c.id
      ORDER BY encounter_count DESC
      LIMIT ?
    ''', [limit]);
    return maps.map((m) => Contact.fromMap(m)).toList();
  }

  Future<int> getCount() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM contacts');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<List<Contact>> getRecent({int limit = 5}) async {
    return getAll(orderBy: 'created_at DESC');
  }

  Future<List<String>> getAllPseudos() async {
    final db = await _dbHelper.database;
    final maps = await db.query('contacts', columns: ['pseudo'], orderBy: 'pseudo ASC');
    return maps.map((m) => m['pseudo'] as String).toList();
  }
}
