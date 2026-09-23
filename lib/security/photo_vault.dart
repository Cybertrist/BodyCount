import 'dart:collection';
import 'dart:io';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'key_vault.dart';

/// Coffre des photos.
///
/// Les images ne sont jamais posées en clair sur le disque. Chaque fichier
/// est chiffré en AES-GCM avec une clé dérivée du trousseau, et porte son
/// propre nonce tiré au hasard. Le format est :
///
///     "BCX1" (4 octets) | nonce (12) | texte chiffré | MAC (16)
///
/// AES-GCM authentifie : un fichier modifié d'un seul octet est refusé au
/// déchiffrement au lieu de rendre une image corrompue.
class PhotoVault {
  PhotoVault._();

  static final PhotoVault instance = PhotoVault._();

  static const _magic = [0x42, 0x43, 0x58, 0x31]; // BCX1
  static const _nonceLength = 12;
  static const _extension = '.bcx';
  static const _uuid = Uuid();

  final AesGcm _cipher = AesGcm.with256bits();

  /// Petit cache des images déchiffrées, pour que faire défiler la grille
  /// ne relance pas un déchiffrement à chaque image réaffichée.
  /// Les octets restent en mémoire vive uniquement, et partent au verrouillage.
  final LinkedHashMap<String, Uint8List> _cache = LinkedHashMap();
  static const _cacheLimit = 40;

  Future<Directory> _vaultDir() async {
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(base.path, 'vault'));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// Chiffre [bytes] dans un nouveau fichier du coffre et rend son chemin.
  Future<String> store(List<int> bytes) async {
    final key = await KeyVault.instance.photoKey();
    final box = await _cipher.encrypt(bytes, secretKey: key);

    final out = BytesBuilder(copy: false)
      ..add(_magic)
      ..add(box.nonce)
      ..add(box.cipherText)
      ..add(box.mac.bytes);

    final dir = await _vaultDir();
    final path = p.join(dir.path, '${_uuid.v4()}$_extension');
    await File(path).writeAsBytes(out.takeBytes(), flush: true);
    return path;
  }

  /// Chiffre un fichier existant dans le coffre, puis efface l'original.
  ///
  /// L'original vient du sélecteur d'images et se trouve dans un dossier
  /// temporaire lisible par d'autres applications : le laisser traîner
  /// annulerait tout le bénéfice du coffre.
  Future<String> absorb(File source, {bool deleteSource = true}) async {
    final bytes = await source.readAsBytes();
    final path = await store(bytes);
    if (deleteSource) {
      try {
        await source.delete();
      } on FileSystemException {
        // Le sélecteur garde parfois la main sur son fichier temporaire ;
        // le système le nettoiera.
      }
    }
    return path;
  }

  /// Déchiffre une photo du coffre.
  ///
  /// Rend `null` si le fichier a disparu ou s'il a été altéré, pour que
  /// l'écran affiche un carré vide plutôt que de planter.
  Future<Uint8List?> read(String path) async {
    final cached = _cache[path];
    if (cached != null) {
      // Remet l'entrée en tête : la plus ancienne sortira en premier.
      _cache.remove(path);
      _cache[path] = cached;
      return cached;
    }

    final file = File(path);
    if (!await file.exists()) return null;

    final raw = await file.readAsBytes();
    if (raw.length < _magic.length + _nonceLength + 16) return null;
    for (var i = 0; i < _magic.length; i++) {
      if (raw[i] != _magic[i]) return null;
    }

    final nonce = raw.sublist(_magic.length, _magic.length + _nonceLength);
    final macStart = raw.length - 16;
    final cipherText = raw.sublist(_magic.length + _nonceLength, macStart);
    final mac = Mac(raw.sublist(macStart));

    try {
      final key = await KeyVault.instance.photoKey();
      final clear = await _cipher.decrypt(
        SecretBox(cipherText, nonce: nonce, mac: mac),
        secretKey: key,
      );
      final bytes = Uint8List.fromList(clear);
      _remember(path, bytes);
      return bytes;
    } on SecretBoxAuthenticationError {
      return null;
    }
  }

  Future<void> delete(String path) async {
    _cache.remove(path);
    final file = File(path);
    if (await file.exists()) {
      await file.delete();
    }
  }

  /// Supprime tout le contenu du coffre.
  Future<void> wipe() async {
    _cache.clear();
    final dir = await _vaultDir();
    if (await dir.exists()) {
      await dir.delete(recursive: true);
    }
  }

  /// Vide le cache mémoire, au verrouillage de l'application.
  void forget() => _cache.clear();

  void _remember(String path, Uint8List bytes) {
    _cache[path] = bytes;
    while (_cache.length > _cacheLimit) {
      _cache.remove(_cache.keys.first);
    }
  }
}
