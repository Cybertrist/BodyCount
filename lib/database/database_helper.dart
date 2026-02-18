import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'bodycount.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL,
        platform TEXT,
        profile_url TEXT,
        age INTEGER,
        height INTEGER,
        description TEXT,
        tags TEXT,
        main_photo_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE encounters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        notes TEXT,
        rating INTEGER DEFAULT 3,
        created_at TEXT NOT NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        encounter_id INTEGER,
        file_path TEXT NOT NULL,
        is_main INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE,
        FOREIGN KEY (encounter_id) REFERENCES encounters (id) ON DELETE SET NULL
      )
    ''');

    // Index pour les requêtes fréquentes
    await db.execute('CREATE INDEX idx_encounters_contact ON encounters(contact_id)');
    await db.execute('CREATE INDEX idx_encounters_date ON encounters(date)');
    await db.execute('CREATE INDEX idx_photos_contact ON photos(contact_id)');
    await db.execute('CREATE INDEX idx_photos_encounter ON photos(encounter_id)');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Migrations futures ici
  }

  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }

  Future<void> deleteAllData() async {
    final db = await database;
    await db.delete('photos');
    await db.delete('encounters');
    await db.delete('contacts');
  }
}
