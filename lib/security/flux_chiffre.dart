import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';

import 'aes_natif.dart';

/// Un flux chiffré par morceaux, pour ce qui est trop gros pour la
/// mémoire : les vidéos du coffre, et les sauvegardes qui les emportent.
///
/// Le contenu est découpé en morceaux d'un mégaoctet, chacun chiffré à
/// part en AES-GCM avec son propre nonce :
///
///     longueur du chiffré (4 octets) | nonce (12) | chiffré | MAC (16)
///
/// Chaque morceau authentifie aussi, en données associées, son rang et le
/// fait d'être le dernier. Intervertir deux morceaux, en retirer un ou
/// couper la fin du fichier fait donc échouer la lecture, au lieu de
/// rendre un contenu amputé sans rien dire.
///
/// L'AES passe par le chiffrement natif d'Android ([AesNatif]) : en Dart
/// pur, cent mégaoctets prenaient une demi-minute. Passer un [AesGcm] en
/// Dart au constructeur fait tout en Dart, ce que font les tests.
const tailleMorceau = 1024 * 1024;

const _longueurNonce = 12;
const _longueurMac = 16;

/// Chiffre et déchiffre un morceau, en natif ou en Dart.
class _Moteur {
  _Moteur(SecretKey cle, AesGcm? dart)
    : _cle = cle,
      _dart = dart,
      _natif = dart == null ? AesNatif(cle) : null;

  final SecretKey _cle;
  final AesGcm? _dart;
  final AesNatif? _natif;

  Future<SecretBox> chiffrer(Uint8List clair, List<int> aad) {
    final dart = _dart;
    if (dart != null) return dart.encrypt(clair, secretKey: _cle, aad: aad);
    return _natif!.chiffrer(clair, aad);
  }

  Future<List<int>> dechiffrer(SecretBox boite, List<int> aad) {
    final dart = _dart;
    if (dart != null) return dart.decrypt(boite, secretKey: _cle, aad: aad);
    return _natif!.dechiffrer(boite, aad);
  }
}

List<int> _associees(int rang, bool dernier) {
  final d = ByteData(9)
    ..setUint64(0, rang)
    ..setUint8(8, dernier ? 1 : 0);
  return d.buffer.asUint8List();
}

/// Écrit un flux chiffré dans [sortie], à partir de sa position courante.
///
/// Un morceau plein n'est écrit qu'au moment où d'autres octets arrivent :
/// c'est ce qui permet de marquer le vrai dernier morceau, à la fermeture.
class EcritureChiffree {
  EcritureChiffree(this._sortie, SecretKey cle, {AesGcm? chiffre})
    : _moteur = _Moteur(cle, chiffre);

  final RandomAccessFile _sortie;
  final _Moteur _moteur;
  final Uint8List _tampon = Uint8List(tailleMorceau);
  int _rempli = 0;
  int _rang = 0;
  bool _ferme = false;

  Future<void> ajouter(List<int> octets) async {
    if (_ferme) throw StateError('Flux déjà fermé.');
    var i = 0;
    while (i < octets.length) {
      if (_rempli == tailleMorceau) await _emettre(dernier: false);
      final n = min(tailleMorceau - _rempli, octets.length - i);
      _tampon.setRange(_rempli, _rempli + n, octets, i);
      _rempli += n;
      i += n;
    }
  }

  /// Écrit le dernier morceau, même vide : sans lui, rien ne distinguerait
  /// un flux vide d'un flux tronqué.
  Future<void> fermer() async {
    if (_ferme) return;
    await _emettre(dernier: true);
    _ferme = true;
    await _sortie.flush();
  }

  Future<void> _emettre({required bool dernier}) async {
    final boite = await _moteur.chiffrer(
      Uint8List.fromList(Uint8List.sublistView(_tampon, 0, _rempli)),
      _associees(_rang, dernier),
    );
    final longueur = ByteData(4)..setUint32(0, boite.cipherText.length);
    await _sortie.writeFrom(longueur.buffer.asUint8List());
    await _sortie.writeFrom(boite.nonce);
    await _sortie.writeFrom(boite.cipherText);
    await _sortie.writeFrom(boite.mac.bytes);
    _rang++;
    _rempli = 0;
  }
}

/// Le flux ne s'ouvre pas avec cette clé, ou a été modifié.
class FluxIllisible implements Exception {
  const FluxIllisible(this.raison, {this.desLePremierMorceau = false});

  final String raison;

  /// Vrai quand même le premier morceau refuse la clé : c'est presque
  /// toujours une mauvaise clé plutôt qu'un fichier abîmé.
  final bool desLePremierMorceau;

  @override
  String toString() => raison;
}

/// Lit un flux chiffré depuis [entree], à partir de sa position courante.
class LectureChiffree {
  LectureChiffree(this._entree, SecretKey cle, {AesGcm? chiffre})
    : _moteur = _Moteur(cle, chiffre);

  final RandomAccessFile _entree;
  final _Moteur _moteur;

  Uint8List _bloc = Uint8List(0);
  int _position = 0;
  int _rang = 0;
  bool _dernierLu = false;

  /// Vrai quand tout a été lu, jusqu'au dernier morceau.
  Future<bool> get fini async {
    while (_position == _bloc.length) {
      if (_dernierLu) return true;
      await _suivant();
    }
    return false;
  }

  /// Rend exactement [n] octets, ou lève [FluxIllisible] si le flux
  /// s'arrête avant.
  Future<Uint8List> lire(int n) async {
    final sortie = Uint8List(n);
    var rempli = 0;
    while (rempli < n) {
      if (_position == _bloc.length) {
        if (_dernierLu) {
          throw const FluxIllisible('Flux plus court qu\'annoncé.');
        }
        await _suivant();
        continue;
      }
      final k = min(n - rempli, _bloc.length - _position);
      sortie.setRange(rempli, rempli + k, _bloc, _position);
      _position += k;
      rempli += k;
    }
    return sortie;
  }

  /// Rend le prochain morceau déchiffré tel quel, ou null à la fin. Plus
  /// rapide que [lire] pour tout recopier.
  Future<Uint8List?> morceau() async {
    while (_position == _bloc.length) {
      if (_dernierLu) return null;
      await _suivant();
    }
    final reste = Uint8List.sublistView(_bloc, _position);
    _position = _bloc.length;
    return reste;
  }

  /// Recopie [n] octets du flux vers [ecriture], sans les tenir en
  /// mémoire plus d'un morceau à la fois.
  Future<void> copierVers(EcritureChiffree ecriture, int n) async {
    var reste = n;
    while (reste > 0) {
      final k = min(reste, tailleMorceau);
      await ecriture.ajouter(await lire(k));
      reste -= k;
    }
  }

  Future<void> _suivant() async {
    final tete = await _entree.read(4);
    if (tete.length != 4) {
      throw const FluxIllisible('Flux tronqué.');
    }
    final longueur = ByteData.sublistView(tete).getUint32(0);
    if (longueur > tailleMorceau) {
      throw const FluxIllisible('Morceau de taille impossible.');
    }
    final nonce = await _entree.read(_longueurNonce);
    final chiffre = await _entree.read(longueur);
    final mac = await _entree.read(_longueurMac);
    if (nonce.length != _longueurNonce ||
        chiffre.length != longueur ||
        mac.length != _longueurMac) {
      throw const FluxIllisible('Flux tronqué.');
    }
    final dernier = await _entree.position() >= await _entree.length();
    try {
      final clair = await _moteur.dechiffrer(
        SecretBox(chiffre, nonce: nonce, mac: Mac(mac)),
        _associees(_rang, dernier),
      );
      _bloc = clair is Uint8List ? clair : Uint8List.fromList(clair);
    } on SecretBoxAuthenticationError {
      throw FluxIllisible(
        'Morceau $_rang refusé.',
        desLePremierMorceau: _rang == 0,
      );
    }
    _position = 0;
    _rang++;
    _dernierLu = dernier;
  }

  /// La taille en clair d'un flux, sans rien déchiffrer : en AES-GCM, le
  /// chiffré a la longueur du clair, il suffit d'additionner les têtes.
  static Future<int> tailleClaire(RandomAccessFile entree) async {
    final depart = await entree.position();
    final fin = await entree.length();
    var total = 0;
    var position = depart;
    while (position < fin) {
      await entree.setPosition(position);
      final tete = await entree.read(4);
      if (tete.length != 4) break;
      final longueur = ByteData.sublistView(tete).getUint32(0);
      total += longueur;
      position += 4 + _longueurNonce + longueur + _longueurMac;
    }
    await entree.setPosition(depart);
    return total;
  }
}
