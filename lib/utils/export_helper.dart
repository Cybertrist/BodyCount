import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:archive/archive.dart';
import 'package:cryptography/cryptography.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../donnees/base.dart';
import '../donnees/depots.dart';
import '../security/photo_vault.dart';

/// Sauvegarde et restauration.
///
/// Un export sort les données de l'application : c'est le moment le plus
/// dangereux de toute l'app, parce que le fichier produit voyage, atterrit
/// dans un dossier Téléchargements, part dans une conversation, se retrouve
/// sur un ordinateur. Il est donc chiffré avec une phrase de passe choisie
/// par l'utilisateur, et non avec la clé de l'appareil : autrement, une
/// sauvegarde serait illisible après un changement de téléphone.
///
/// Format du fichier :
///
///     "BCEX1" (5 octets) | sel (16) | nonce (12) | ZIP chiffré | MAC (16)
///
/// Le ZIP contient `donnees.json` et les photos déchiffrées, le tout
/// protégé par l'enveloppe AES-GCM.
class ExportHelper {
  static const _personnes = DepotPersonnes();
  static const _rencontres = DepotRencontres();
  static const _notes = DepotNotes();
  static const _photos = DepotPhotos();
  static const _etiquettes = DepotEtiquettes();

  static const _magic = [0x42, 0x43, 0x45, 0x58, 0x31]; // BCEX1
  static const _saltLength = 16;
  static const _nonceLength = 12;

  /// Coût de dérivation. Assez élevé pour qu'une phrase moyenne résiste à
  /// une attaque hors ligne, assez bas pour rester supportable sur un
  /// téléphone : compter environ une seconde.
  static const _iterations = 210000;

  static final _cipher = AesGcm.with256bits();

  /// Écrit une sauvegarde chiffrée et rend son chemin.
  ///
  /// Le fichier est déposé dans un dossier temporaire, pas dans les
  /// documents de l'application : une fois partagé, il n'a plus de raison
  /// de rester, et [cleanUp] l'efface.
  static Future<String> exportEncrypted(String passphrase) async {
    if (passphrase.length < 8) {
      throw ArgumentError('Phrase de passe trop courte.');
    }

    final fiches = await _personnes.lister();
    final archive = Archive();

    // Chaque fiche emporte ses rencontres, ses notes, ses photos et ses
    // étiquettes : une sauvegarde doit se suffire à elle même, sinon
    // restaurer sur un téléphone neuf perd la moitié du contenu.
    final personnes = <Map<String, Object?>>[];
    final cheminsPhotos = <String>[];

    for (final fiche in fiches) {
      final id = fiche.personne.id!;
      final rencontres = await _rencontres.pourPersonne(id);
      final notes = await _notes.pourPersonne(id);
      final photos = await _photos.pourPersonne(id);
      final etiquettes = await _etiquettes.pourPersonne(id);

      final parRencontre = <Map<String, Object?>>[];
      for (final rencontre in rencontres) {
        final siennes = await _etiquettes.pourRencontre(rencontre.id!);
        parRencontre.add({
          ...rencontre.versMap(),
          'etiquettes': siennes.map((e) => e.libelle).toList(),
        });
      }

      cheminsPhotos.addAll(photos.map((p) => p.chemin));
      personnes.add({
        ...fiche.personne.versMap(),
        'etiquettes': etiquettes.map((e) => e.libelle).toList(),
        'rencontres': parRencontre,
        'notes': notes.map((n) => n.versMap()).toList(),
        'photos': photos.map((p) => p.versMap()).toList(),
      });
    }

    final donnees = {
      'format': 'bodycount-export',
      'version': 3,
      'exporte_le': DateTime.now().toIso8601String(),
      'personnes': personnes,
    };
    final json = utf8.encode(const JsonEncoder.withIndent('  ').convert(donnees));
    archive.addFile(ArchiveFile('donnees.json', json.length, json));

    // Les photos sortent du coffre déchiffrées, puis sont reprotégées par
    // l'enveloppe du fichier entier. Elles ne touchent jamais le disque
    // en clair : tout se passe en mémoire.
    for (final chemin in cheminsPhotos) {
      final octets = await PhotoVault.instance.read(chemin);
      if (octets == null) continue;
      final nom = 'photos/${p.basename(chemin)}';
      archive.addFile(ArchiveFile(nom, octets.length, octets));
    }

    final zip = ZipEncoder().encode(archive);

    final sel = _randomBytes(_saltLength);
    final cle = await _deriveKey(passphrase, sel);
    final boite = await _cipher.encrypt(zip, secretKey: cle);

    final sortie = BytesBuilder(copy: false)
      ..add(_magic)
      ..add(sel)
      ..add(boite.nonce)
      ..add(boite.cipherText)
      ..add(boite.mac.bytes);

    final dir = await getTemporaryDirectory();
    final horodatage = DateTime.now().toIso8601String().substring(0, 10);
    final chemin = p.join(dir.path, 'bodycount-$horodatage.bcx');
    await File(chemin).writeAsBytes(sortie.takeBytes(), flush: true);
    return chemin;
  }

  static Future<void> shareFile(String filePath) async {
    await Share.shareXFiles([XFile(filePath)]);
  }

  /// Efface une sauvegarde temporaire après partage.
  static Future<void> cleanUp(String filePath) async {
    final file = File(filePath);
    if (await file.exists()) await file.delete();
  }

  /// Restaure une sauvegarde. Remplace les données existantes.
  ///
  /// Lève [FormatException] si le fichier n'est pas une sauvegarde
  /// BodyCount, et [WrongPassphraseException] si la phrase ne convient
  /// pas. Les deux cas sont distingués pour que l'écran puisse dire
  /// laquelle des deux choses ne va pas.
  static Future<void> importEncrypted(File file, String passphrase) async {
    final brut = await file.readAsBytes();
    final minimum = _magic.length + _saltLength + _nonceLength + 16;
    if (brut.length < minimum) {
      throw const FormatException('Fichier trop court pour une sauvegarde.');
    }
    for (var i = 0; i < _magic.length; i++) {
      if (brut[i] != _magic[i]) {
        throw const FormatException('Ce fichier n\'est pas une sauvegarde BodyCount.');
      }
    }

    var offset = _magic.length;
    final sel = brut.sublist(offset, offset + _saltLength);
    offset += _saltLength;
    final nonce = brut.sublist(offset, offset + _nonceLength);
    offset += _nonceLength;
    final finMac = brut.length - 16;
    final chiffre = brut.sublist(offset, finMac);
    final mac = Mac(brut.sublist(finMac));

    final cle = await _deriveKey(passphrase, sel);
    List<int> zip;
    try {
      zip = await _cipher.decrypt(
        SecretBox(chiffre, nonce: nonce, mac: mac),
        secretKey: cle,
      );
    } on SecretBoxAuthenticationError {
      throw const WrongPassphraseException();
    }

    final archive = ZipDecoder().decodeBytes(zip);

    String? json;
    final photos = <String, List<int>>{};
    for (final entree in archive) {
      if (!entree.isFile) continue;
      if (entree.name == 'donnees.json') {
        json = utf8.decode(entree.content as List<int>);
      } else if (entree.name.startsWith('photos/')) {
        photos[p.basename(entree.name)] = entree.content as List<int>;
      }
    }
    if (json == null) {
      throw const FormatException('Sauvegarde incomplète : données absentes.');
    }

    await _restore(json, photos);
  }

  static Future<void> _restore(
    String json,
    Map<String, List<int>> photos,
  ) async {
    final donnees = jsonDecode(json) as Map<String, dynamic>;
    await Base.instance.viderDonnees();

    // Les photos rentrent dans le coffre avec de nouveaux chemins ; la
    // correspondance sert à réécrire ceux stockés en base, sinon les
    // fiches pointeraient vers des fichiers de l'ancien téléphone.
    final nouveauxChemins = <String, String>{};
    for (final entree in photos.entries) {
      nouveauxChemins[entree.key] =
          await PhotoVault.instance.store(entree.value);
    }

    String? traduire(String? ancien) {
      if (ancien == null) return null;
      return nouveauxChemins[p.basename(ancien)];
    }

    for (final brut in (donnees['personnes'] ?? const []) as List) {
      final map = Map<String, dynamic>.from(brut as Map);
      map['photo_principale'] = traduire(map['photo_principale'] as String?);
      map.remove('id');

      final personne = Personne.depuisMap(map);
      final id = await _personnes.creer(personne);

      final etiquettes = ((map['etiquettes'] ?? const []) as List)
          .map((e) => e.toString())
          .toList();
      if (etiquettes.isNotEmpty) {
        await _etiquettes.definirPourPersonne(id, etiquettes);
      }

      for (final brutRencontre in (map['rencontres'] ?? const []) as List) {
        final mr = Map<String, dynamic>.from(brutRencontre as Map);
        mr.remove('id');
        mr['personne_id'] = id;
        final rencontreId = await _rencontres.creer(Rencontre.depuisMap(mr));

        final siennes = ((mr['etiquettes'] ?? const []) as List)
            .map((e) => e.toString())
            .toList();
        if (siennes.isNotEmpty) {
          await _etiquettes.definirPourRencontre(rencontreId, siennes);
        }
      }

      for (final brutNote in (map['notes'] ?? const []) as List) {
        final mn = Map<String, dynamic>.from(brutNote as Map);
        mn.remove('id');
        // Le lien vers la rencontre d'origine n'est pas reconstruit : les
        // identifiants ont changé. La date de la note reste, elle suffit.
        mn['rencontre_id'] = null;
        mn['personne_id'] = id;
        await _notes.ajouter(Note.depuisMap(mn));
      }

      for (final brutPhoto in (map['photos'] ?? const []) as List) {
        final mp = Map<String, dynamic>.from(brutPhoto as Map);
        final chemin = traduire(mp['chemin'] as String?);
        if (chemin == null) continue;
        await _photos.ajouter(Photo(
          personneId: id,
          chemin: chemin,
          principale: (mp['principale'] as int? ?? 0) == 1,
          ajouteeLe: DateTime.parse(mp['ajoutee_le'] as String),
        ));
      }
    }
  }

  static Future<SecretKey> _deriveKey(String passphrase, List<int> salt) async {
    final pbkdf2 = Pbkdf2(
      macAlgorithm: Hmac.sha256(),
      iterations: _iterations,
      bits: 256,
    );
    return pbkdf2.deriveKeyFromPassword(password: passphrase, nonce: salt);
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

/// La phrase de passe ne déchiffre pas la sauvegarde.
class WrongPassphraseException implements Exception {
  const WrongPassphraseException();

  @override
  String toString() => 'Phrase de passe incorrecte.';
}
