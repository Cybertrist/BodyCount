import 'package:sqflite/sqflite.dart';
import '../models/encounter.dart';
import 'database_helper.dart';

class EncounterDao {
  final DatabaseHelper _dbHelper = DatabaseHelper();

  Future<int> insert(Encounter encounter) async {
    final db = await _dbHelper.database;
    return await db.insert('encounters', encounter.toMap());
  }

  Future<int> update(Encounter encounter) async {
    final db = await _dbHelper.database;
    return await db.update(
      'encounters',
      encounter.toMap(),
      where: 'id = ?',
      whereArgs: [encounter.id],
    );
  }

  Future<int> delete(int id) async {
    final db = await _dbHelper.database;
    return await db.delete('encounters', where: 'id = ?', whereArgs: [id]);
  }

  Future<Encounter?> getById(int id) async {
    final db = await _dbHelper.database;
    final maps = await db.query('encounters', where: 'id = ?', whereArgs: [id]);
    if (maps.isEmpty) return null;
    return Encounter.fromMap(maps.first);
  }

  Future<List<Encounter>> getByContact(int contactId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'encounters',
      where: 'contact_id = ?',
      whereArgs: [contactId],
      orderBy: 'date DESC',
    );
    return maps.map((m) => Encounter.fromMap(m)).toList();
  }

  Future<List<Encounter>> getAll({String orderBy = 'date DESC'}) async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT e.*, c.pseudo as contact_pseudo, c.main_photo_path as contact_photo_path
      FROM encounters e
      INNER JOIN contacts c ON c.id = e.contact_id
      ORDER BY e.$orderBy
    ''');
    return maps.map((m) => Encounter.fromMap(m)).toList();
  }

  Future<List<Encounter>> getByDateRange(DateTime start, DateTime end) async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT e.*, c.pseudo as contact_pseudo, c.main_photo_path as contact_photo_path
      FROM encounters e
      INNER JOIN contacts c ON c.id = e.contact_id
      WHERE e.date BETWEEN ? AND ?
      ORDER BY e.date DESC
    ''', [start.toIso8601String(), end.toIso8601String()]);
    return maps.map((m) => Encounter.fromMap(m)).toList();
  }

  Future<List<Encounter>> getWithLocation() async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT e.*, c.pseudo as contact_pseudo, c.main_photo_path as contact_photo_path
      FROM encounters e
      INNER JOIN contacts c ON c.id = e.contact_id
      WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL
      ORDER BY e.date DESC
    ''');
    return maps.map((m) => Encounter.fromMap(m)).toList();
  }

  Future<int> getCount() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM encounters');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<List<Map<String, dynamic>>> getMonthlyCount({int? year}) async {
    final db = await _dbHelper.database;
    final yearFilter = year != null ? "WHERE strftime('%Y', date) = '$year'" : '';
    return await db.rawQuery('''
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM encounters
      $yearFilter
      GROUP BY month
      ORDER BY month ASC
    ''');
  }

  Future<List<Map<String, dynamic>>> getWeekdayCount() async {
    final db = await _dbHelper.database;
    return await db.rawQuery('''
      SELECT CAST(strftime('%w', date) AS INTEGER) as weekday, COUNT(*) as count
      FROM encounters
      GROUP BY weekday
      ORDER BY weekday ASC
    ''');
  }

  Future<List<Map<String, dynamic>>> getRatingDistribution() async {
    final db = await _dbHelper.database;
    return await db.rawQuery('''
      SELECT rating, COUNT(*) as count
      FROM encounters
      GROUP BY rating
      ORDER BY rating ASC
    ''');
  }

  Future<List<Map<String, dynamic>>> getPlatformDistribution() async {
    final db = await _dbHelper.database;
    return await db.rawQuery('''
      SELECT COALESCE(c.platform, 'autre') as platform, COUNT(e.id) as count
      FROM encounters e
      INNER JOIN contacts c ON c.id = e.contact_id
      GROUP BY c.platform
      ORDER BY count DESC
    ''');
  }

  Future<double> getAverageRating() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery('SELECT AVG(rating) as avg FROM encounters');
    final avg = result.first['avg'];
    if (avg == null) return 0.0;
    return (avg as num).toDouble();
  }

  Future<Map<String, dynamic>?> getBestMonth() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery('''
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as count
      FROM encounters
      GROUP BY month
      ORDER BY count DESC
      LIMIT 1
    ''');
    return result.isNotEmpty ? result.first : null;
  }

  Future<int> getLongestStreak() async {
    final db = await _dbHelper.database;
    final maps = await db.rawQuery('''
      SELECT DISTINCT date(date) as day FROM encounters ORDER BY day ASC
    ''');

    if (maps.isEmpty) return 0;

    int maxStreak = 1;
    int currentStreak = 1;
    DateTime? previousDay;

    for (final map in maps) {
      final day = DateTime.parse(map['day'] as String);
      if (previousDay != null) {
        final diff = day.difference(previousDay).inDays;
        if (diff == 1) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 1;
        }
      }
      previousDay = day;
    }

    return maxStreak;
  }

  Future<List<Map<String, dynamic>>> getCumulativeData() async {
    final db = await _dbHelper.database;
    return await db.rawQuery('''
      SELECT date(date) as day, COUNT(*) as count
      FROM encounters
      GROUP BY day
      ORDER BY day ASC
    ''');
  }
}
