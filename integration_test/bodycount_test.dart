// Tests sur appareil : la base SQLCipher, le Keystore, l'AES natif et les
// sauvegardes n'existent que sur Android.
//
//   flutter test integration_test -d <émulateur>
//
// Ils détruisent les données et la clé de l'application : à lancer sur un
// émulateur, jamais sur le téléphone qui porte le vrai journal.
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:bodycount/domaine/note.dart';
import 'package:bodycount/domaine/personne.dart';
import 'package:bodycount/domaine/rencontre.dart';
import 'package:bodycount/donnees/base.dart';
import 'package:bodycount/donnees/coordonnees.dart';
import 'package:bodycount/donnees/depots.dart';
import 'package:bodycount/security/flux_chiffre.dart';
import 'package:bodycount/security/key_vault.dart';
import 'package:bodycount/security/photo_vault.dart';
import 'package:bodycount/security/video_vault.dart';
import 'package:bodycount/utils/export_helper.dart';
import 'package:cryptography/cryptography.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

const _personnes = DepotPersonnes();
const _rencontres = DepotRencontres();
const _photos = DepotPhotos();
const _etiquettes = DepotEtiquettes();

final _hasard = Random(42);

Uint8List _octets(int n) =>
    Uint8List.fromList(List.generate(n, (_) => _hasard.nextInt(256)));

Future<File> _fichier(String nom, List<int> contenu) async {
  final dir = await getTemporaryDirectory();
  final f = File(p.join(dir.path, nom));
  await f.writeAsBytes(contenu, flush: true);
  return f;
}

/// Repart d'une application neuve : ni base, ni coffre, ni clé.
Future<void> _neuf() async {
  await Base.instance.toutDetruire();
  await KeyVault.instance.unlock();
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUp(_neuf);

  group('Base', () {
    test('les ouvertures simultanées partagent une seule connexion', () async {
      await Base.instance.fermer();
      final bases = await Future.wait(
        List.generate(8, (_) => Base.instance.db),
      );
      for (final b in bases) {
        expect(identical(b, bases.first), isTrue);
      }
    });

    test('une écriture se relit par toutes les lectures qui suivent', () async {
      // Le bug d'origine : la fiche écrivait dans un fichier, le
      // répertoire en lisait un autre.
      await Base.instance.fermer();
      final ouvertures = List.generate(4, (_) => Base.instance.db);
      final id = await _personnes.creer(Personne(
        prenom: 'Nathan',
        ville: 'Londres',
        creeLe: DateTime(2026),
        modifieLe: DateTime(2026),
      ));
      await Future.wait(ouvertures);
      final fiche = (await _personnes.parId(id))!.personne;
      await _personnes.modifier(fiche.copyWith(ville: 'Vannes'));
      final liste = await _personnes.lister();
      expect(liste.single.personne.ville, 'Vannes');
    });

    test('une base chiffrée n\'est jamais prise pour une base en clair',
        () async {
      await _personnes.creer(Personne(
        prenom: 'Témoin',
        creeLe: DateTime(2026),
        modifieLe: DateTime(2026),
      ));
      // Fermer, rouvrir plusieurs fois de suite, en parallèle : la fiche
      // doit toujours être là, dans le même fichier.
      for (var i = 0; i < 3; i++) {
        await Base.instance.fermer();
        await Future.wait(List.generate(5, (_) => Base.instance.db));
      }
      final liste = await _personnes.lister();
      expect(liste.map((f) => f.personne.prenom), ['Témoin']);
    });

    test('une base sans numéro de version est réparée, pas détruite',
        () async {
      await _personnes.creer(Personne(
        prenom: 'Survivant',
        creeLe: DateTime(2026),
        modifieLe: DateTime(2026),
      ));
      // Ce que laissait la fausse conversion : les tables, sans version,
      // et sans les colonnes les plus récentes.
      final base = await Base.instance.db;
      await base.execute('PRAGMA user_version = 0');
      await Base.instance.fermer();

      final reouverte = await Base.instance.db;
      final colonnes = await reouverte.rawQuery('PRAGMA table_info(photos)');
      expect(colonnes.map((c) => c['name']), contains('vignette'));
      final liste = await _personnes.lister();
      expect(liste.single.personne.prenom, 'Survivant');
    });
  });

  group('Flux chiffré', () {
    Future<(File, SecretKey)> ecrire(
      List<int> contenu, {
      AesGcm? chiffre,
    }) async {
      final cle = await AesGcm.with256bits().newSecretKey();
      final f = await _fichier('flux.bin', const []);
      final sortie = await f.open(mode: FileMode.write);
      final e = EcritureChiffree(sortie, cle, chiffre: chiffre);
      await e.ajouter(contenu);
      await e.fermer();
      await sortie.close();
      return (f, cle);
    }

    Future<Uint8List> lire(File f, SecretKey cle, {AesGcm? chiffre}) async {
      final entree = await f.open();
      try {
        final l = LectureChiffree(entree, cle, chiffre: chiffre);
        final sortie = BytesBuilder();
        while (true) {
          final m = await l.morceau();
          if (m == null) break;
          sortie.add(m);
        }
        return sortie.takeBytes();
      } finally {
        await entree.close();
      }
    }

    for (final taille in [0, 10, tailleMorceau, tailleMorceau * 3 + 17]) {
      test('aller-retour de $taille octets', () async {
        final contenu = _octets(taille);
        final (f, cle) = await ecrire(contenu);
        expect(await lire(f, cle), contenu);
      });
    }

    test('le natif et le Dart se relisent l\'un l\'autre', () async {
      final contenu = _octets(tailleMorceau + 1000);
      final dart = AesGcm.with256bits();

      final (f1, cle1) = await ecrire(contenu);
      expect(await lire(f1, cle1, chiffre: dart), contenu);

      final (f2, cle2) = await ecrire(contenu, chiffre: dart);
      expect(await lire(f2, cle2), contenu);
    });

    test('un fichier tronqué est refusé', () async {
      final (f, cle) = await ecrire(_octets(tailleMorceau * 2 + 5));
      final brut = await f.readAsBytes();
      // On retire exactement le dernier morceau : chaque morceau restant
      // est intact, seule la fin manque.
      final dernier = 4 + 12 + 5 + 16;
      await f.writeAsBytes(brut.sublist(0, brut.length - dernier));
      await expectLater(lire(f, cle), throwsA(isA<FluxIllisible>()));
    });

    test('deux morceaux intervertis sont refusés', () async {
      final (f, cle) = await ecrire(_octets(tailleMorceau * 2 + 5));
      final brut = await f.readAsBytes();
      final m = 4 + 12 + tailleMorceau + 16;
      final inverse = BytesBuilder()
        ..add(brut.sublist(m, 2 * m))
        ..add(brut.sublist(0, m))
        ..add(brut.sublist(2 * m));
      await f.writeAsBytes(inverse.takeBytes());
      await expectLater(lire(f, cle), throwsA(isA<FluxIllisible>()));
    });

    test('un octet modifié est refusé', () async {
      final (f, cle) = await ecrire(_octets(5000));
      final brut = await f.readAsBytes();
      brut[40] ^= 1;
      await f.writeAsBytes(brut);
      await expectLater(lire(f, cle), throwsA(isA<FluxIllisible>()));
    });
  });

  group('Coffre des vidéos', () {
    test('une vidéo entre, se relit à l\'identique, et l\'original part',
        () async {
      final contenu = _octets(tailleMorceau * 2 + 12345);
      final source = await _fichier('source.mp4', contenu);
      final chemin = await VideoVault.instance.absorber(source);

      expect(await source.exists(), isFalse);
      // Le coffre ne contient pas le clair.
      final chiffre = await File(chemin).readAsBytes();
      expect(chiffre.sublist(0, 4), [0x42, 0x43, 0x56, 0x31]);
      expect(chiffre.length, greaterThan(contenu.length));

      final clair = await VideoVault.instance.dechiffrerPourLecture(chemin);
      expect(await clair!.readAsBytes(), contenu);
      await VideoVault.instance.oublierLecture(clair);
      expect(await clair.exists(), isFalse);
    });
  });

  group('Sauvegarde', () {
    Future<int> remplir() async {
      final id = await _personnes.creer(Personne(
        prenom: 'Lou',
        ville: 'Locmariaquer',
        creeLe: DateTime(2025, 3, 1),
        modifieLe: DateTime(2025, 3, 2),
      ));
      await _etiquettes.definirPourPersonne(id, ['Drôle', 'Brune']);
      final rencontre = await _rencontres.creer(Rencontre(
        personneId: id,
        quand: DateTime(2026, 9, 1, 22),
        lieu: 'Vannes',
        noteDemiPoints: 9,
        montantCentimes: 12000,
        creeLe: DateTime(2026, 9, 2),
      ));
      await _etiquettes.definirPourRencontre(rencontre, ['Hôtel']);

      final photo = await PhotoVault.instance.store(_octets(40000));
      await _photos.ajouter(Photo(
        personneId: id,
        chemin: photo,
        ajouteeLe: DateTime(2026),
      ));
      final video = await VideoVault.instance.absorber(
        await _fichier('v.mp4', _octets(tailleMorceau + 777)),
      );
      final vignette = await PhotoVault.instance.store(_octets(3000));
      await _photos.ajouter(Photo(
        personneId: id,
        chemin: video,
        ajouteeLe: DateTime(2026),
        video: true,
        dureeMs: 4200,
        vignette: vignette,
      ));
      return id;
    }

    test('tout revient : fiche, étiquettes, rencontre, photo, vidéo',
        () async {
      final id = await remplir();
      final photosAvant = await _photos.pourPersonne(id);
      final octetsPhoto = await PhotoVault.instance.read(
        photosAvant.firstWhere((m) => !m.video).chemin,
      );
      final videoAvant = photosAvant.firstWhere((m) => m.video);
      final clairAvant =
          await VideoVault.instance.dechiffrerPourLecture(videoAvant.chemin);
      final octetsVideo = await clairAvant!.readAsBytes();

      final sauvegarde = await ExportHelper.exportEncrypted('une phrase sûre');
      final copie = await _fichier('copie.bcx', await File(sauvegarde).readAsBytes());

      await _neuf();
      expect(await _personnes.lister(), isEmpty);

      await ExportHelper.importEncrypted(copie, 'une phrase sûre');

      final fiche = (await _personnes.lister()).single;
      expect(fiche.personne.prenom, 'Lou');
      expect(fiche.personne.ville, 'Locmariaquer');
      expect(fiche.personne.creeLe, DateTime(2025, 3, 1));
      final nouvelId = fiche.personne.id!;
      expect(
        (await _etiquettes.pourPersonne(nouvelId)).map((e) => e.libelle),
        ['Drôle', 'Brune'],
      );
      final rencontre = (await _rencontres.pourPersonne(nouvelId)).single;
      expect(rencontre.lieu, 'Vannes');
      expect(rencontre.montantCentimes, 12000);

      final medias = await _photos.pourPersonne(nouvelId);
      expect(medias, hasLength(2));
      final photo = medias.firstWhere((m) => !m.video);
      expect(await PhotoVault.instance.read(photo.chemin), octetsPhoto);
      expect(fiche.personne.photoPrincipale, photo.chemin);

      final video = medias.firstWhere((m) => m.video);
      expect(video.dureeMs, 4200);
      expect(video.vignette, isNotNull);
      expect(await PhotoVault.instance.read(video.vignette!), isNotNull);
      final clair =
          await VideoVault.instance.dechiffrerPourLecture(video.chemin);
      expect(await clair!.readAsBytes(), octetsVideo);
    });

    test('une mauvaise phrase ne touche à rien', () async {
      await remplir();
      final sauvegarde = await ExportHelper.exportEncrypted('la bonne phrase');
      final copie = await _fichier('copie.bcx', await File(sauvegarde).readAsBytes());

      await expectLater(
        ExportHelper.importEncrypted(copie, 'une autre phrase'),
        throwsA(isA<WrongPassphraseException>()),
      );
      expect((await _personnes.lister()).single.personne.prenom, 'Lou');
    });

    test('une sauvegarde abîmée ne touche à rien', () async {
      await remplir();
      final sauvegarde = await ExportHelper.exportEncrypted('la bonne phrase');
      final brut = await File(sauvegarde).readAsBytes();
      // Un octet changé loin du début : le premier morceau passe, pas la
      // suite. C'est le cas le plus traître, la restauration aurait déjà
      // commencé si elle ne vérifiait pas tout avant.
      brut[brut.length - 100] ^= 1;
      final copie = await _fichier('abimee.bcx', brut);

      await expectLater(
        ExportHelper.importEncrypted(copie, 'la bonne phrase'),
        throwsA(isA<FormatException>()),
      );
      final fiches = await _personnes.lister();
      expect(fiches.single.personne.prenom, 'Lou');
      final medias = await _photos.pourPersonne(fiches.single.personne.id!);
      expect(medias, hasLength(2));
      for (final m in medias) {
        expect(await File(m.chemin).exists(), isTrue);
      }
    });

    test('un fichier qui n\'est pas une sauvegarde est refusé', () async {
      final autre = await _fichier('photo.jpg', _octets(2000));
      await expectLater(
        ExportHelper.importEncrypted(autre, 'peu importe'),
        throwsA(isA<FormatException>()),
      );
    });
  });

  group('Communes', () {
    setUpAll(chargerCommunes);

    test('un village, une faute, un homonyme', () {
      expect(coordonneesEnFrance('Locmariaquer'), isNotNull);
      expect(coordonneesEnFrance('Locmariaqer')!.latitude, closeTo(47.58, 0.05));
      expect(coordonneesEnFrance('Saint-Denis (11)')!.latitude,
          closeTo(43.36, 0.05));
      expect(coordonneesEnFrance('Londres'), isNull);
      expect(coordonneesDe('Chez lui'), isNull);
    });
  });
}
