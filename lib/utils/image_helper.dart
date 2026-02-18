import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:uuid/uuid.dart';

class ImageHelper {
  static final ImagePicker _picker = ImagePicker();
  static const _uuid = Uuid();

  static Future<String> get _privateDir async {
    final dir = await getApplicationDocumentsDirectory();
    final imgDir = Directory(p.join(dir.path, 'bodycount_photos'));
    if (!await imgDir.exists()) {
      await imgDir.create(recursive: true);
    }
    return imgDir.path;
  }

  /// Sélectionne une image depuis la galerie
  static Future<File?> pickFromGallery() async {
    final xFile = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (xFile == null) return null;
    return File(xFile.path);
  }

  /// Sélectionne une image depuis la caméra
  static Future<File?> pickFromCamera() async {
    final xFile = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    if (xFile == null) return null;
    return File(xFile.path);
  }

  /// Sélectionne plusieurs images depuis la galerie
  static Future<List<File>> pickMultipleFromGallery() async {
    final xFiles = await _picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    return xFiles.map((xf) => File(xf.path)).toList();
  }

  /// Copie une image dans le stockage privé de l'app
  static Future<String> saveToPrivateStorage(File sourceFile) async {
    final dir = await _privateDir;
    final ext = p.extension(sourceFile.path).toLowerCase();
    final fileName = '${_uuid.v4()}$ext';
    final destPath = p.join(dir, fileName);
    await sourceFile.copy(destPath);
    return destPath;
  }

  /// Supprime une image du stockage privé
  static Future<void> deleteImage(String filePath) async {
    final file = File(filePath);
    if (await file.exists()) {
      await file.delete();
    }
  }

  /// Vérifie si un fichier image existe
  static Future<bool> imageExists(String filePath) async {
    return File(filePath).exists();
  }

  /// Retourne le dossier de stockage des photos
  static Future<String> getPhotosDirectory() async {
    return _privateDir;
  }
}
