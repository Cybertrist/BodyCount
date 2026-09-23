import 'dart:math';

import 'package:cryptography/cryptography.dart';
import 'package:flutter/services.dart';

/// AES-GCM par le chiffrement d'Android, pour les gros volumes.
///
/// Le paquet `cryptography` chiffre en Dart pur, à quelques mégaoctets par
/// seconde : assez pour une photo, une demi-minute pour une vidéo de cent
/// mégaoctets. Android, lui, passe par les instructions AES du processeur.
/// Le format est le même AES-GCM standard, nonce de douze octets et
/// étiquette de seize : un morceau chiffré ici se relit en Dart, et
/// inversement.
///
/// Un paquet faisait ce travail, mais il s'installait comme implémentation
/// de toute la cryptographie de l'application, dérivation de clé comprise,
/// et Android refusait la clé HMAC vide d'une extraction sans sel : la base
/// ne s'ouvrait plus. Deux appels natifs suffisent, et ne touchent à rien
/// d'autre.
class AesNatif {
  AesNatif(SecretKey cle) : _cle = cle;

  static const _canal = MethodChannel('bodycount/aes');
  static final _hasard = Random.secure();

  final SecretKey _cle;
  Uint8List? _octets;

  Future<Uint8List> _cleBrute() async {
    return _octets ??= Uint8List.fromList(await _cle.extractBytes());
  }

  Future<SecretBox> chiffrer(Uint8List clair, List<int> aad) async {
    final nonce = Uint8List(12);
    for (var i = 0; i < nonce.length; i++) {
      nonce[i] = _hasard.nextInt(256);
    }
    final sortie = await _canal.invokeMethod<Uint8List>('chiffrer', {
      'cle': await _cleBrute(),
      'nonce': nonce,
      'aad': Uint8List.fromList(aad),
      'donnees': clair,
    });
    final s = sortie!;
    return SecretBox(
      Uint8List.sublistView(s, 0, s.length - 16),
      nonce: nonce,
      mac: Mac(Uint8List.sublistView(s, s.length - 16)),
    );
  }

  /// Lève [SecretBoxAuthenticationError] si le morceau a été modifié ou si
  /// la clé n'est pas la bonne, comme le fait le paquet en Dart.
  Future<Uint8List> dechiffrer(SecretBox boite, List<int> aad) async {
    final donnees = Uint8List(boite.cipherText.length + 16)
      ..setRange(0, boite.cipherText.length, boite.cipherText)
      ..setRange(
        boite.cipherText.length,
        boite.cipherText.length + 16,
        boite.mac.bytes,
      );
    try {
      final clair = await _canal.invokeMethod<Uint8List>('dechiffrer', {
        'cle': await _cleBrute(),
        'nonce': Uint8List.fromList(boite.nonce),
        'aad': Uint8List.fromList(aad),
        'donnees': donnees,
      });
      return clair!;
    } on PlatformException catch (e) {
      if (e.code == 'refuse') throw SecretBoxAuthenticationError();
      rethrow;
    }
  }
}
