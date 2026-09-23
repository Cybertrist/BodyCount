import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import 'flux_chiffre.dart';
import 'key_vault.dart';

/// Coffre des vidéos.
///
/// Même clé et même principe que [PhotoVault], mais une vidéo pèse cent
/// fois une photo : la chiffrer d'un bloc demanderait de la tenir entière
/// en mémoire. Elle est donc écrite en flux chiffré par morceaux
/// ([EcritureChiffree]), derrière un en-tête de quatre octets :
///
///     "BCV1" | morceaux chiffrés
///
/// Pour la lire, le lecteur du système a besoin d'un fichier. Elle est
/// donc déchiffrée dans le cache privé de l'application, invisible des
/// autres applications, et ce fichier est effacé à la fermeture du
/// lecteur, au verrouillage et au démarrage suivant s'il en restait un.
class VideoVault {
  VideoVault._();

  static final VideoVault instance = VideoVault._();

  static const _magic = [0x42, 0x43, 0x56, 0x31]; // BCV1
  static const _extension = '.bcv';
  static const _uuid = Uuid();

  static bool estVideo(String chemin) => chemin.endsWith(_extension);

  Future<Directory> _dossier(
    Future<Directory> Function() racine,
    String nom,
  ) async {
    final base = await racine();
    final dir = Directory(p.join(base.path, nom));
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  Future<Directory> _coffre() =>
      _dossier(getApplicationDocumentsDirectory, 'vault');

  Future<Directory> _lectures() => _dossier(getTemporaryDirectory, 'lecture');

  /// Ouvre une nouvelle vidéo du coffre en écriture. L'appelant ajoute les
  /// octets en clair, puis appelle [VideoEnEcriture.terminer] ; en cas
  /// d'échec, [VideoEnEcriture.abandonner] efface le fichier commencé.
  Future<VideoEnEcriture> creer() async {
    final key = await KeyVault.instance.photoKey();
    final dir = await _coffre();
    final chemin = p.join(dir.path, '${_uuid.v4()}$_extension');
    final sortie = await File(chemin).open(mode: FileMode.write);
    await sortie.writeFrom(_magic);
    return VideoEnEcriture._(chemin, sortie, EcritureChiffree(sortie, key));
  }

  /// Chiffre la vidéo [source] dans le coffre, efface l'original, et rend
  /// le chemin à ranger en base.
  Future<String> absorber(File source) async {
    final video = await creer();
    final entree = await source.open();
    try {
      while (true) {
        final bloc = await entree.read(tailleMorceau);
        if (bloc.isEmpty) break;
        await video.ajouter(bloc);
      }
      await video.terminer();
    } catch (_) {
      await video.abandonner();
      rethrow;
    } finally {
      await entree.close();
    }

    try {
      await source.delete();
    } on FileSystemException {
      // Le sélecteur garde parfois la main sur son fichier temporaire ;
      // le système le nettoiera.
    }
    return video.chemin;
  }

  /// Ouvre une vidéo du coffre en lecture, déchiffrée au fil de l'eau.
  /// Rend null si le fichier manque ou ne porte pas l'en-tête attendu.
  /// L'appelant ferme la lecture rendue.
  Future<VideoEnLecture?> ouvrir(String chemin) async {
    final fichier = File(chemin);
    if (!await fichier.exists()) return null;
    final key = await KeyVault.instance.photoKey();
    final entree = await fichier.open();
    final entete = await entree.read(_magic.length);
    var valide = entete.length == _magic.length;
    for (var i = 0; valide && i < _magic.length; i++) {
      valide = entete[i] == _magic[i];
    }
    if (!valide) {
      await entree.close();
      return null;
    }
    final taille = await LectureChiffree.tailleClaire(entree);
    return VideoEnLecture._(entree, LectureChiffree(entree, key), taille);
  }

  /// Déchiffre une vidéo du coffre dans le cache privé, pour le lecteur.
  ///
  /// Rend null si le fichier manque ou a été touché. L'appelant efface le
  /// fichier rendu avec [oublierLecture] quand il n'en a plus besoin.
  Future<File?> dechiffrerPourLecture(String chemin) async {
    final video = await ouvrir(chemin);
    if (video == null) return null;

    final dir = await _lectures();
    final clair = File(p.join(dir.path, '${_uuid.v4()}.mp4'));
    final sortie = await clair.open(mode: FileMode.write);
    var valide = false;
    try {
      while (true) {
        final bloc = await video.flux.morceau();
        if (bloc == null) break;
        await sortie.writeFrom(bloc);
      }
      await sortie.flush();
      valide = true;
      return clair;
    } on FluxIllisible {
      return null;
    } finally {
      await video.fermer();
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

/// Une vidéo du coffre en cours d'écriture.
class VideoEnEcriture {
  VideoEnEcriture._(this.chemin, this._sortie, this._flux);

  final String chemin;
  final RandomAccessFile _sortie;
  final EcritureChiffree _flux;

  Future<void> ajouter(List<int> octets) => _flux.ajouter(octets);

  EcritureChiffree get flux => _flux;

  Future<void> terminer() async {
    await _flux.fermer();
    await _sortie.close();
  }

  /// Un coffre ne garde pas de vidéo à moitié chiffrée.
  Future<void> abandonner() async {
    try {
      await _sortie.close();
    } on FileSystemException {
      // Déjà fermée.
    }
    try {
      await File(chemin).delete();
    } on FileSystemException {
      // Déjà partie.
    }
  }
}

/// Une vidéo du coffre ouverte en lecture.
class VideoEnLecture {
  VideoEnLecture._(this._entree, this.flux, this.taille);

  final RandomAccessFile _entree;
  final LectureChiffree flux;

  /// Taille de la vidéo en clair, en octets.
  final int taille;

  Future<void> fermer() => _entree.close();
}
