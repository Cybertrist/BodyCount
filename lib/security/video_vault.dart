import 'dart:io';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';
import 'package:cryptography_flutter/cryptography_flutter.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'key_vault.dart';

/// Coffre des vidéos.
///
/// Même clé et même principe que [PhotoVault], mais une vidéo pèse cent
/// fois une photo : la chiffrer d'un bloc demanderait de la tenir entière
/// en mémoire. Elle est donc découpée en morceaux d'un mégaoctet, chacun
/// chiffré à part en AES-GCM avec son propre nonce :
///
///     "BCV1" (4 octets)
///     puis pour chaque morceau :
///       longueur du chiffré (4) | nonce (12) | chiffré | MAC (16)
///
/// Chaque morceau authentifie aussi, en données associées, son rang et le
/// fait d'être le dernier. Intervertir deux morceaux, en retirer un ou
/// couper la fin du fichier fait donc échouer la lecture, au lieu de
/// rendre une vidéo amputée sans rien dire.
///
/// L'AES passe par le chiffrement natif d'Android : en Dart pur, une
/// vidéo de cent mégaoctets prenait une demi-minute.
///
/// Pour la lire, le lecteur du système a besoin d'un fichier. Elle est
/// donc déchiffrée dans le cache privé de l'application, invisible des
/// autres applications, et ce fichier est effacé à la fermeture du
/// lecteur, au verrouillage et au démarrage suivant s'il en restait un.
class VideoVault {
  VideoVault._();

  static final VideoVault instance = VideoVault._();

  static const _magic = [0x42, 0x43, 0x56, 0x31]; // BCV1
  static const _morceau = 1024 * 1024;
  static const _nonceLength = 12;
  static const _macLength = 16;
  static const _extension = '.bcv';
  static const _uuid = Uuid();

  final AesGcm _cipher = FlutterAesGcm.with256bits();

  static bool estVideo(String chemin) => chemin.endsWith(_extension);

  Future<Directory> _dossier(Future<Directory> Function() racine, String nom) async {
    final base = await racine();
    final dir = Directory(p.join(base.path, nom));
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  Future<Directory> _coffre() =>
      _dossier(getApplicationDocumentsDirectory, 'vault');

  Future<Directory> _lectures() => _dossier(getTemporaryDirectory, 'lecture');

  List<int> _associees(int rang, bool dernier) {
    final d = ByteData(9)
      ..setUint64(0, rang)
      ..setUint8(8, dernier ? 1 : 0);
    return d.buffer.asUint8List();
  }

  /// Chiffre la vidéo [source] dans le coffre, efface l'original, et rend
  /// le chemin à ranger en base.
  Future<String> absorber(File source) async {
    final key = await KeyVault.instance.photoKey();
    final dir = await _coffre();
    final chemin = p.join(dir.path, '${_uuid.v4()}$_extension');

    final entree = await source.open();
    final sortie = await File(chemin).open(mode: FileMode.write);
    try {
      await sortie.writeFrom(_magic);
      final taille = await entree.length();
      var lu = 0;
      var rang = 0;
      // Une vidéo vide donne quand même un morceau, marqué dernier : sans
      // lui, rien ne distinguerait un fichier vide d'un fichier tronqué.
      do {
        final bloc = await entree.read(_morceau);
        lu += bloc.length;
        final dernier = lu >= taille;
        final box = await _cipher.encrypt(
          bloc,
          secretKey: key,
          aad: _associees(rang, dernier),
        );
        final longueur = ByteData(4)..setUint32(0, box.cipherText.length);
        await sortie.writeFrom(longueur.buffer.asUint8List());
        await sortie.writeFrom(box.nonce);
        await sortie.writeFrom(box.cipherText);
        await sortie.writeFrom(box.mac.bytes);
        rang++;
        if (dernier) break;
      } while (true);
      await sortie.flush();
    } catch (_) {
      await sortie.close();
      // Un coffre ne garde pas de vidéo à moitié chiffrée.
      try {
        await File(chemin).delete();
      } on FileSystemException {
        // Déjà partie.
      }
      rethrow;
    } finally {
      await entree.close();
    }
    await sortie.close();

    try {
      await source.delete();
    } on FileSystemException {
      // Le sélecteur garde parfois la main sur son fichier temporaire ;
      // le système le nettoiera.
    }
    return chemin;
  }

  /// Déchiffre une vidéo du coffre dans le cache privé, pour le lecteur.
  ///
  /// Rend null si le fichier manque ou a été touché. L'appelant efface le
  /// fichier rendu avec [oublierLecture] quand il n'en a plus besoin.
  Future<File?> dechiffrerPourLecture(String chemin) async {
    final fichier = File(chemin);
    if (!await fichier.exists()) return null;

    final key = await KeyVault.instance.photoKey();
    final dir = await _lectures();
    final clair = File(p.join(dir.path, '${_uuid.v4()}.mp4'));

    final entree = await fichier.open();
    final sortie = await clair.open(mode: FileMode.write);
    var valide = false;
    try {
      final entete = await entree.read(_magic.length);
      if (entete.length != _magic.length) return null;
      for (var i = 0; i < _magic.length; i++) {
        if (entete[i] != _magic[i]) return null;
      }

      final taille = await entree.length();
      var rang = 0;
      while (true) {
        final tete = await entree.read(4);
        if (tete.length != 4) return null;
        final longueur = ByteData.sublistView(tete).getUint32(0);
        final nonce = await entree.read(_nonceLength);
        final chiffre = await entree.read(longueur);
        final mac = await entree.read(_macLength);
        if (nonce.length != _nonceLength ||
            chiffre.length != longueur ||
            mac.length != _macLength) {
          return null;
        }
        final dernier = await entree.position() >= taille;
        final bloc = await _cipher.decrypt(
          SecretBox(chiffre, nonce: nonce, mac: Mac(mac)),
          secretKey: key,
          aad: _associees(rang, dernier),
        );
        await sortie.writeFrom(bloc);
        rang++;
        if (dernier) break;
      }
      await sortie.flush();
      valide = true;
      return clair;
    } on SecretBoxAuthenticationError {
      return null;
    } finally {
      await entree.close();
      await sortie.close();
      if (!valide && await clair.exists()) await clair.delete();
    }
  }

  /// Efface une copie de lecture.
  Future<void> oublierLecture(File clair) async {
    try {
      if (await clair.exists()) await clair.delete();
    } on FileSystemException {
      // Le lecteur la tient peut-être encore ; le prochain ménage l'aura.
    }
  }

  /// Efface toutes les copies de lecture : au verrouillage, et au
  /// démarrage pour le cas où l'application aurait été tuée en pleine
  /// lecture.
  Future<void> oublierLectures() async {
    try {
      final base = await getTemporaryDirectory();
      final dir = Directory(p.join(base.path, 'lecture'));
      if (await dir.exists()) await dir.delete(recursive: true);
    } on FileSystemException {
      // Rien de grave : on réessaiera au prochain verrouillage.
    }
  }
}
