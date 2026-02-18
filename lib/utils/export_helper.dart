import 'dart:convert';
import 'dart:io';
import 'package:archive/archive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:share_plus/share_plus.dart';
import '../database/contact_dao.dart';
import '../database/encounter_dao.dart';
import '../database/photo_dao.dart';
import '../database/database_helper.dart';
import '../models/contact.dart';
import '../models/encounter.dart';


class ExportHelper {
  static final _contactDao = ContactDao();
  static final _encounterDao = EncounterDao();
  static final _photoDao = PhotoDao();

  /// Exporte toutes les données en JSON
  static Future<String> exportToJson() async {
    final contacts = await _contactDao.getAll();
    final encounters = await _encounterDao.getAll();
    final photoPaths = await _photoDao.getAllPaths();

    final data = {
      'version': 1,
      'exported_at': DateTime.now().toIso8601String(),
      'contacts': contacts.map((c) => c.toMap()).toList(),
      'encounters': encounters.map((e) => e.toMap()).toList(),
      'photo_paths': photoPaths,
    };

    final json = const JsonEncoder.withIndent('  ').convert(data);

    final dir = await getApplicationDocumentsDirectory();
    final filePath = p.join(dir.path, 'bodycount_export.json');
    await File(filePath).writeAsString(json);

    return filePath;
  }

  /// Exporte toutes les données en ZIP (JSON + photos)
  static Future<String> exportToZip() async {
    final jsonPath = await exportToJson();
    final jsonFile = File(jsonPath);
    final jsonBytes = await jsonFile.readAsBytes();

    final archive = Archive();
    archive.addFile(ArchiveFile('bodycount_export.json', jsonBytes.length, jsonBytes));

    // Ajouter les photos
    final photoPaths = await _photoDao.getAllPaths();
    for (final photoPath in photoPaths) {
      final file = File(photoPath);
      if (await file.exists()) {
        final bytes = await file.readAsBytes();
        final name = 'photos/${p.basename(photoPath)}';
        archive.addFile(ArchiveFile(name, bytes.length, bytes));
      }
    }

    final zipBytes = ZipEncoder().encode(archive);

    final dir = await getApplicationDocumentsDirectory();
    final zipPath = p.join(dir.path, 'bodycount_export.zip');
    await File(zipPath).writeAsBytes(zipBytes);

    // Nettoyer le JSON temporaire
    await jsonFile.delete();

    return zipPath;
  }

  /// Partage un fichier exporté
  static Future<void> shareFile(String filePath) async {
    await Share.shareXFiles([XFile(filePath)]);
  }

  /// Importe des données depuis un JSON
  static Future<void> importFromJson(String jsonString) async {
    final data = jsonDecode(jsonString) as Map<String, dynamic>;

    // Supprimer les données existantes
    await DatabaseHelper().deleteAllData();

    // Importer les contacts
    final contactsList = data['contacts'] as List;
    for (final contactMap in contactsList) {
      final contact = Contact.fromMap(Map<String, dynamic>.from(contactMap));
      await _contactDao.insert(contact);
    }

    // Importer les rencontres
    final encountersList = data['encounters'] as List;
    for (final encounterMap in encountersList) {
      final encounter = Encounter.fromMap(Map<String, dynamic>.from(encounterMap));
      await _encounterDao.insert(encounter);
    }
  }

  /// Importe des données depuis un ZIP
  static Future<void> importFromZip(File zipFile) async {
    final bytes = await zipFile.readAsBytes();
    final archive = ZipDecoder().decodeBytes(bytes);

    String? jsonContent;
    final photosToRestore = <String, List<int>>{};

    for (final file in archive) {
      if (file.isFile) {
        if (file.name == 'bodycount_export.json') {
          jsonContent = utf8.decode(file.content as List<int>);
        } else if (file.name.startsWith('photos/')) {
          photosToRestore[p.basename(file.name)] = file.content as List<int>;
        }
      }
    }

    if (jsonContent == null) {
      throw Exception('Fichier JSON non trouvé dans le ZIP');
    }

    // Importer les données JSON
    await importFromJson(jsonContent);

    // Restaurer les photos
    final dir = await getApplicationDocumentsDirectory();
    final photosDir = Directory(p.join(dir.path, 'bodycount_photos'));
    if (!await photosDir.exists()) {
      await photosDir.create(recursive: true);
    }

    for (final entry in photosToRestore.entries) {
      final filePath = p.join(photosDir.path, entry.key);
      await File(filePath).writeAsBytes(entry.value);
    }
  }
}
