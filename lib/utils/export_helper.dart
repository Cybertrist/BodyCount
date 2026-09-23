import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:archive/archive.dart';
import 'package:cryptography/cryptography.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../donnees/base.dart';
import '../donnees/depots.dart';
import '../security/flux_chiffre.dart';
import '../security/photo_vault.dart';
import '../security/video_vault.dart';

/// Sauvegarde et restauration.
///
/// Un export sort les données de l'application : c'est le moment le plus
/// dangereux de toute l'app, parce que le fichier produit voyage, atterrit
/// dans un dossier Téléchargements, part dans une conversation, se retrouve
/// sur un ordinateur. Il est donc chiffré avec une phrase de passe choisie
/// par l'utilisateur, et non avec la clé de l'appareil : autrement, une
/// sauvegarde serait illisible après un changement de téléphone.
///
/// Format actuel, écrit et relu en flux pour que les vidéos y tiennent :
///
///     "BCEX2" (5 octets) | sel (16) | flux chiffré par morceaux
///
/// Le flux ([EcritureChiffree]) porte une suite d'entrées :
///
///     genre (1) | longueur du nom (2) | nom | taille (8) | contenu
///
/// genre 1 pour `donnees.json`, toujours en premier ; 2 pour une photo ou
/// une vignette ; 3 pour une vidéo. Un seul octet nul marque la fin.
///
/// L'ancien format, « BCEX1 » suivi d'un ZIP chiffré d'un bloc, se relit
/// toujours : une sauvegarde faite avant reste une sauvegarde.
class ExportHelper {
  static const _personnes = DepotPersonnes();
  static const _rencontres = DepotRencontres();
  static const _notes = DepotNotes();
  static const _photos = DepotPhotos();
  static const _etiquettes = DepotEtiquettes();

  static const _magicV1 = [0x42, 0x43, 0x45, 0x58, 0x31]; // BCEX1
  static const _magicV2 = [0x42, 0x43, 0x45, 0x58, 0x32]; // BCEX2
  static const _saltLength = 16;
  static const _nonceLength = 12;

  static const _fin = 0;
  static const _json = 1;
  static const _photo = 2;
  static const _video = 3;

  /// Coût de dérivation. Assez élevé pour qu'une phrase moyenne résiste à
  /// une attaque hors ligne, assez bas pour rester supportable sur un
  /// téléphone : compter environ une seconde.
  static const _iterations = 210000;

  static final _cipher = AesGcm.with256bits();

  // ---------------------------------------------------------------- export

  /// Écrit une sauvegarde chiffrée et rend son chemin.
  ///
  /// Le fichier est déposé dans un dossier temporaire, pas dans les
  /// documents de l'application : une fois partagé, il n'a plus de raison
  /// de rester, et [cleanUp] l'efface.
  ///
  /// [progression] reçoit le nombre de médias écrits et le total.
  static Future<String> exportEncrypted(
    String passphrase, {
    void Function(int fait, int total)? progression,
  }) async {
    if (passphrase.length < 8) {
      throw ArgumentError('Phrase de passe trop courte.');
    }

    final fiches = await _personnes.lister();

    // Chaque fiche emporte ses rencontres, ses notes, ses médias et ses
    // étiquettes : une sauvegarde doit se suffire à elle même, sinon
    // restaurer sur un téléphone neuf perd la moitié du contenu.
    final personnes = <Map<String, Object?>>[];
    final medias = <Photo>[];

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

      medias.addAll(photos);
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
      'version': 4,
      'exporte_le': DateTime.now().toIso8601String(),
      'personnes': personnes,
    };
    final json = utf8.encode(jsonEncode(donnees));

    // Une seule sauvegarde à la fois dans le cache : la précédente, si
    // elle y traîne encore, s'en va.
    await menage();
    final dir = await _dossier();
    final horodatage = DateTime.now().toIso8601String().substring(0, 10);
    final chemin = p.join(dir.path, 'bodycount-$horodatage.bcx');
    final sortie = await File(chemin).open(mode: FileMode.write);

    try {
      final sel = _randomBytes(_saltLength);
      final cle = await _deriveKey(passphrase, sel);
      await sortie.writeFrom(_magicV2);
      await sortie.writeFrom(sel);
      final flux = EcritureChiffree(sortie, cle);

      await _entete(flux, _json, 'donnees.json', json.length);
      await flux.ajouter(json);

      // Les médias sortent du coffre déchiffrés et entrent aussitôt dans
      // le flux de la sauvegarde, rechiffrés : rien ne touche le disque
      // en clair, et une vidéo ne passe jamais en mémoire d'un bloc.
      final total = medias.length;
      var fait = 0;
      for (final media in medias) {
        if (media.video) {
          await _exporterVideo(flux, media.chemin);
          final vignette = media.vignette;
          if (vignette != null) await _exporterPhoto(flux, vignette);
        } else {
          await _exporterPhoto(flux, media.chemin);
        }
        progression?.call(++fait, total);
      }

      // La fin tient en un octet : un genre nul, sans nom ni taille.
      await flux.ajouter(const [_fin]);
      await flux.fermer();
      await sortie.close();
    } catch (_) {
      await sortie.close();
      await cleanUp(chemin);
      rethrow;
    }
    return chemin;
  }

  static Future<void> _exporterPhoto(
    EcritureChiffree flux,
    String chemin,
  ) async {
    final octets = await PhotoVault.instance.read(chemin);
    if (octets == null) return;
    await _entete(flux, _photo, p.basename(chemin), octets.length);
    await flux.ajouter(octets);
  }

  static Future<void> _exporterVideo(
    EcritureChiffree flux,
    String chemin,
  ) async {
    final video = await VideoVault.instance.ouvrir(chemin);
    if (video == null) return;
    try {
      await _entete(flux, _video, p.basename(chemin), video.taille);
      await video.flux.copierVers(flux, video.taille);
    } finally {
      await video.fermer();
    }
  }

  static Future<void> _entete(
    EcritureChiffree flux,
    int genre,
    String nom,
    int taille,
  ) async {
    final octetsNom = utf8.encode(nom);
    final tete = ByteData(1 + 2 + octetsNom.length + 8)
      ..setUint8(0, genre)
      ..setUint16(1, octetsNom.length);
    final vue = tete.buffer.asUint8List();
    vue.setRange(3, 3 + octetsNom.length, octetsNom);
    tete.setUint64(3 + octetsNom.length, taille);
    await flux.ajouter(vue);
  }

  /// Le dossier des sauvegardes, dans le cache : le seul que le partage
  /// expose aux autres applications (voir res/xml/partage.xml).
  static Future<Directory> _dossier() async {
    final cache = await getTemporaryDirectory();
    final dir = Directory(p.join(cache.path, 'sauvegardes'));
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  /// Efface les sauvegardes restées dans le cache.
  ///
  /// Une sauvegarde partagée ne peut pas être effacée tout de suite :
  /// l'application qui la reçoit la lit quand elle veut, parfois après
  /// être revenue ici. Elle reste donc jusqu'à l'export suivant ou au
  /// lancement suivant. Elle est chiffrée, et le cache est privé.
  static Future<void> menage() async {
    try {
      final cache = await getTemporaryDirectory();
      final dir = Directory(p.join(cache.path, 'sauvegardes'));
      if (await dir.exists()) await dir.delete(recursive: true);
    } on FileSystemException {
      // On réessaiera la prochaine fois.
    }
  }

  /// Efface une sauvegarde temporaire, une fois enregistrée ailleurs.
  static Future<void> cleanUp(String filePath) async {
    final file = File(filePath);
    if (await file.exists()) await file.delete();
  }

  // ----------------------------------------------------------- restauration

  /// Restaure une sauvegarde. Remplace les données existantes.
  ///
  /// Lève [FormatException] si le fichier n'est pas une sauvegarde
  /// BodyCount ou s'il est abîmé, et [WrongPassphraseException] si la
  /// phrase ne convient pas. Les cas sont distingués pour que l'écran
  /// puisse dire laquelle des choses ne va pas.
  ///
  /// Rien n'est effacé tant que la sauvegarde n'a pas été lue en entier et
  /// ses médias rangés dans le coffre : une sauvegarde abîmée, une phrase
  /// fausse ou une coupure en route laissent les données actuelles
  /// intactes.
  static Future<void> importEncrypted(
    File file,
    String passphrase, {
    void Function(int fait, int total)? progression,
  }) async {
    final entree = await file.open();
    try {
      final magic = await entree.read(_magicV1.length);
      if (_egal(magic, _magicV2)) {
        await _importerV2(entree, passphrase, progression);
      } else if (_egal(magic, _magicV1)) {
        await entree.close();
        await _importerV1(file, passphrase);
      } else {
        throw const FormatException(
          'Ce fichier n\'est pas une sauvegarde BodyCount.',
        );
      }
    } finally {
      try {
        await entree.close();
      } on FileSystemException {
        // Déjà fermée par la lecture de l'ancien format.
      }
    }
  }

  static Future<void> _importerV2(
    RandomAccessFile entree,
    String passphrase,
    void Function(int fait, int total)? progression,
  ) async {
    final sel = await entree.read(_saltLength);
    if (sel.length != _saltLength) {
      throw const FormatException('Fichier trop court pour une sauvegarde.');
    }
    final debut = await entree.position();
    final cle = await _deriveKey(passphrase, sel);

    // Premier passage : tout déchiffrer sans rien garder. C'est ce qui
    // authentifie le fichier entier avant qu'on touche à quoi que ce soit.
    await _parcourir(entree, cle, (_) async {});

    // Second passage : ranger les médias dans le coffre, sous de nouveaux
    // noms, et garder le JSON pour la fin.
    await entree.setPosition(debut);
    final nouveaux = <String, String>{};
    final crees = <String>[];
    String? json;
    var total = 0;
    var fait = 0;
    try {
      await _parcourir(entree, cle, (e) async {
        switch (e.genre) {
          case _json:
            json = utf8.decode(await e.flux.lire(e.taille));
            total = _compterMedias(json!);
          case _photo:
            final chemin = await PhotoVault.instance.store(
              await e.flux.lire(e.taille),
            );
            crees.add(chemin);
            nouveaux[e.nom] = chemin;
          case _video:
            final video = await VideoVault.instance.creer();
            crees.add(video.chemin);
            await e.flux.copierVers(video.flux, e.taille);
            await video.terminer();
            nouveaux[e.nom] = video.chemin;
            progression?.call(++fait, total);
          default:
            throw const FormatException('Entrée inconnue dans la sauvegarde.');
        }
      });
      final lu = json;
      if (lu == null) {
        throw const FormatException(
          'Sauvegarde incomplète : données absentes.',
        );
      }
      await _remplacer(lu, nouveaux);
    } catch (_) {
      for (final chemin in crees) {
        await PhotoVault.instance.delete(chemin);
      }
      rethrow;
    }
  }

  /// Lit toutes les entrées du flux, et passe chacune à [surEntree], qui
  /// doit consommer exactement son contenu. Les entrées qu'il ignore sont
  /// sautées ici.
  static Future<void> _parcourir(
    RandomAccessFile entree,
    SecretKey cle,
    Future<void> Function(_Entree e) surEntree,
  ) async {
    final flux = LectureChiffree(entree, cle);
    try {
      var premiere = true;
      while (true) {
        final genre = (await flux.lire(1))[0];
        if (genre == _fin) break;
        final longueurNom = ByteData.sublistView(
          await flux.lire(2),
        ).getUint16(0);
        final nom = utf8.decode(await flux.lire(longueurNom));
        final taille = ByteData.sublistView(await flux.lire(8)).getUint64(0);
        if (premiere && genre != _json) {
          throw const FormatException('Sauvegarde mal formée.');
        }
        premiere = false;

        final e = _Entree(genre, nom, taille, _Compteur(flux, taille));
        await surEntree(e);
        await e.flux.sauterLeReste();
      }
      if (!await flux.fini) {
        throw const FormatException('Données après la fin de la sauvegarde.');
      }
    } on FluxIllisible catch (e) {
      if (e.desLePremierMorceau) throw const WrongPassphraseException();
      throw const FormatException('La sauvegarde est abîmée.');
    }
  }

  static int _compterMedias(String json) {
    final donnees = jsonDecode(json) as Map<String, dynamic>;
    var n = 0;
    for (final personne in (donnees['personnes'] ?? const []) as List) {
      for (final photo in ((personne as Map)['photos'] ?? const []) as List) {
        if ((photo as Map)['type'] == 'video') n++;
      }
    }
    return n;
  }

  static Future<void> _importerV1(File file, String passphrase) async {
    final brut = await file.readAsBytes();
    final minimum = _magicV1.length + _saltLength + _nonceLength + 16;
    if (brut.length < minimum) {
      throw const FormatException('Fichier trop court pour une sauvegarde.');
    }

    var offset = _magicV1.length;
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
    final nouveaux = <String, String>{};
    final crees = <String>[];
    try {
      for (final entree in archive) {
        if (!entree.isFile) continue;
        if (entree.name == 'donnees.json') {
          json = utf8.decode(entree.content as List<int>);
        } else if (entree.name.startsWith('photos/')) {
          final chemin = await PhotoVault.instance.store(
            entree.content as List<int>,
          );
          crees.add(chemin);
          nouveaux[p.basename(entree.name)] = chemin;
        }
      }
      final lu = json;
      if (lu == null) {
        throw const FormatException(
          'Sauvegarde incomplète : données absentes.',
        );
      }
      await _remplacer(lu, nouveaux);
    } catch (_) {
      for (final chemin in crees) {
        await PhotoVault.instance.delete(chemin);
      }
      rethrow;
    }
  }

  /// Remplace les données par celles de la sauvegarde. Les médias sont
  /// déjà dans le coffre ; [nouveaux] donne le chemin de chacun à partir
  /// de son nom d'origine. Les fichiers des anciennes fiches sont effacés
  /// à la fin, une fois les nouvelles en place.
  static Future<void> _remplacer(
    String json,
    Map<String, String> nouveaux,
  ) async {
    final donnees = jsonDecode(json) as Map<String, dynamic>;

    final base = await Base.instance.db;
    final anciens = <String>[];
    for (final ligne in await base.query(
      'photos',
      columns: ['chemin', 'vignette'],
    )) {
      anciens.add(ligne['chemin'] as String);
      final vignette = ligne['vignette'] as String?;
      if (vignette != null) anciens.add(vignette);
    }

    await Base.instance.viderDonnees();

    String? traduire(String? ancien) {
      if (ancien == null) return null;
      return nouveaux[p.basename(ancien)];
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
        await _photos.ajouter(
          Photo(
            personneId: id,
            chemin: chemin,
            principale: (mp['principale'] as int? ?? 0) == 1,
            ajouteeLe: DateTime.parse(mp['ajoutee_le'] as String),
            video: mp['type'] == 'video',
            dureeMs: mp['duree_ms'] as int?,
            vignette: traduire(mp['vignette'] as String?),
          ),
        );
      }
    }

    for (final chemin in anciens) {
      await PhotoVault.instance.delete(chemin);
    }
  }

  // ----------------------------------------------------------------- outils

  static bool _egal(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
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

/// Une entrée de la sauvegarde, pendant sa lecture.
class _Entree {
  _Entree(this.genre, this.nom, this.taille, this.flux);

  final int genre;
  final String nom;
  final int taille;
  final _Compteur flux;
}

/// Le contenu d'une entrée : ce qu'on n'en lit pas est sauté ensuite, pour
/// que l'entrée suivante commence au bon endroit.
class _Compteur {
  _Compteur(this._flux, this._reste);

  final LectureChiffree _flux;
  int _reste;

  Future<Uint8List> lire(int n) {
    if (n > _reste) {
      throw const FormatException('Entrée plus courte qu\'annoncé.');
    }
    _reste -= n;
    return _flux.lire(n);
  }

  Future<void> copierVers(EcritureChiffree ecriture, int n) async {
    if (n > _reste) {
      throw const FormatException('Entrée plus courte qu\'annoncé.');
    }
    _reste -= n;
    await _flux.copierVers(ecriture, n);
  }

  Future<void> sauterLeReste() async {
    while (_reste > 0) {
      final k = min(_reste, tailleMorceau);
      await _flux.lire(k);
      _reste -= k;
    }
  }
}

/// La phrase de passe ne déchiffre pas la sauvegarde.
class WrongPassphraseException implements Exception {
  const WrongPassphraseException();

  @override
  String toString() => 'Phrase de passe incorrecte.';
}
