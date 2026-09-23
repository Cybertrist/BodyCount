import 'dart:io';

import 'package:image_picker/image_picker.dart';

import '../security/photo_vault.dart';

/// Sélection des images et entrée dans le coffre.
///
/// Aucune photo n'est conservée en clair : ce qui sort du sélecteur est
/// chiffré puis l'original temporaire est effacé, dans la foulée.
class ImageHelper {
  static final ImagePicker _picker = ImagePicker();

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

  static Future<List<File>> pickMultipleFromGallery() async {
    final xFiles = await _picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );
    return xFiles.map((xf) => File(xf.path)).toList();
  }

  /// Chiffre l'image dans le coffre et rend le chemin à stocker en base.
  ///
  /// Le nom garde son ancienne signature pour que les écrans n'aient rien
  /// à savoir du chiffrement : ils manipulent un chemin, comme avant.
  static Future<String> saveToPrivateStorage(File sourceFile) {
    return PhotoVault.instance.absorb(sourceFile);
  }

  static Future<void> deleteImage(String filePath) {
    return PhotoVault.instance.delete(filePath);
  }

  static Future<bool> imageExists(String filePath) {
    return File(filePath).exists();
  }
}
