import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Trousseau de l'application.
///
/// Une seule clé maîtresse de 32 octets est tirée au hasard au premier
/// lancement, puis rangée dans le Keystore Android via
/// [FlutterSecureStorage]. Elle ne quitte jamais l'appareil et n'est
/// jamais écrite en clair sur le disque.
///
/// Tout le reste en dérive, par HKDF, avec une étiquette différente par
/// usage : la base de données, les photos, les exports. Ainsi la clé d'un
/// usage ne compromet pas les autres, et une clé n'est jamais réutilisée
/// pour deux choses.
class KeyVault {
  KeyVault._();

  static final KeyVault instance = KeyVault._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _masterKeyName = 'bodycount_master_key_v1';

  /// Étiquettes HKDF. Changer une étiquette rend les données de cet usage
  /// illisibles : ce sont des constantes de format, pas des réglages.
  static const _dbLabel = 'bodycount/db/v1';
  static const _photoLabel = 'bodycount/photos/v1';

  Uint8List? _master;
  SecretKey? _photoKey;
  String? _dbPassword;

  bool get isUnlocked => _master != null;

  /// Charge la clé maîtresse, ou la crée si c'est le premier lancement.
  ///
  /// À n'appeler qu'une fois l'utilisateur authentifié : tant que ça n'a
  /// pas été fait, ni la base ni les photos ne peuvent être lues.
  Future<void> unlock() async {
    if (_master != null) return;

    final stored = await _storage.read(key: _masterKeyName);
    if (stored != null) {
      _master = Uint8List.fromList(base64Decode(stored));
      return;
    }

    final fresh = _randomBytes(32);
    await _storage.write(key: _masterKeyName, value: base64Encode(fresh));
    _master = fresh;
  }

  /// Oublie les clés en mémoire. La base reste chiffrée sur le disque et
  /// devra être rouverte après une nouvelle authentification.
  void lock() {
    final master = _master;
    if (master != null) {
      // Écrase les octets avant de lâcher la référence, pour qu'ils ne
      // traînent pas dans le tas en attendant le ramasse-miettes.
      for (var i = 0; i < master.length; i++) {
        master[i] = 0;
      }
    }
    _master = null;
    _photoKey = null;
    _dbPassword = null;
  }

  /// Mot de passe SQLCipher, en hexadécimal.
  Future<String> databasePassword() async {
    final cached = _dbPassword;
    if (cached != null) return cached;

    final bytes = await _derive(_dbLabel, 32);
    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    _dbPassword = hex;
    return hex;
  }

  /// Clé AES-GCM des photos.
  Future<SecretKey> photoKey() async {
    final cached = _photoKey;
    if (cached != null) return cached;

    final bytes = await _derive(_photoLabel, 32);
    final key = SecretKey(bytes);
    _photoKey = key;
    return key;
  }

  /// Efface la clé maîtresse du Keystore.
  ///
  /// Après cet appel, la base et les photos encore présentes sur le disque
  /// ne sont plus déchiffrables par personne, y compris par l'application.
  /// C'est ce qui rend l'effacement total instantané et définitif.
  Future<void> destroy() async {
    await _storage.delete(key: _masterKeyName);
    lock();
  }

  Future<List<int>> _derive(String label, int length) async {
    final master = _master;
    if (master == null) {
      throw StateError(
        'Le trousseau est verrouillé : appeler unlock() après authentification.',
      );
    }

    final hkdf = Hkdf(hmac: Hmac.sha256(), outputLength: length);
    final derived = await hkdf.deriveKey(
      secretKey: SecretKey(master),
      info: utf8.encode(label),
      nonce: const <int>[],
    );
    return derived.extractBytes();
  }

  static Uint8List _randomBytes(int length) {
    final rng = Random.secure();
    final out = Uint8List(length);
    for (var i = 0; i < length; i++) {
      out[i] = rng.nextInt(256);
    }
    return out;
  }
}
