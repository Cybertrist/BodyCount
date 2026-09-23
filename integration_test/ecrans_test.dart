// Les parcours des écrans, sur appareil : l'application entière est
// lancée, et chaque test la pilote comme un doigt le ferait.
//
//   flutter test integration_test/ecrans_test.dart -d <émulateur>
//
// Comme les tests de données, ils détruisent tout ce que l'application
// contient : un émulateur, jamais le téléphone qui porte le vrai journal.
import 'dart:ui' as ui;

import 'package:bodycount/app.dart';
import 'package:bodycount/domaine/note.dart';
import 'package:bodycount/domaine/personne.dart';
import 'package:bodycount/domaine/rencontre.dart';
import 'package:bodycount/donnees/base.dart';
import 'package:bodycount/donnees/coordonnees.dart';
import 'package:bodycount/donnees/depots.dart';
import 'package:bodycount/providers/settings_provider.dart';
import 'package:bodycount/security/key_vault.dart';
import 'package:bodycount/security/lock_state.dart';
import 'package:bodycount/security/photo_vault.dart';
import 'package:bodycount/utils/date_formatter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

const _personnes = DepotPersonnes();
const _rencontres = DepotRencontres();
const _photos = DepotPhotos();
const _etiquettes = DepotEtiquettes();

/// Attend qu'un élément apparaisse, image par image.
///
/// pumpAndSettle n'aboutit jamais ici : l'anneau du lancement, les
/// étoiles de la carte et les ondes tournent en boucle, l'écran n'est
/// jamais « posé ».
Future<void> attendre(WidgetTester t, Finder f, {int secondes = 15}) async {
  for (var i = 0; i < secondes * 10; i++) {
    await t.pump(const Duration(milliseconds: 100));
    if (f.evaluate().isNotEmpty) return;
  }
  fail('Jamais apparu : $f');
}

Future<void> patienter(WidgetTester t, [int ms = 600]) async {
  for (var i = 0; i < ms ~/ 100; i++) {
    await t.pump(const Duration(milliseconds: 100));
  }
}

/// Une petite image PNG, dessinée sur place : le coffre refuse ce qui ne
/// se décode pas, et la visionneuse doit avoir quelque chose à montrer.
Future<List<int>> image() async {
  final enregistreur = ui.PictureRecorder();
  ui.Canvas(enregistreur).drawRect(
    const Rect.fromLTWH(0, 0, 64, 64),
    Paint()..color = const Color(0xFFA855F7),
  );
  final img = await enregistreur.endRecording().toImage(64, 64);
  final octets = await img.toByteData(format: ui.ImageByteFormat.png);
  return octets!.buffer.asUint8List();
}

Future<int> fiche(
  String prenom, {
  String? ville,
  List<String> etiquettes = const [],
  String? photo,
}) async {
  final id = await _personnes.creer(
    Personne(
      prenom: prenom,
      ville: ville,
      creeLe: DateTime(2026, 1, 1),
      modifieLe: DateTime(2026, 1, 1),
    ),
  );
  if (etiquettes.isNotEmpty) {
    await _etiquettes.definirPourPersonne(id, etiquettes);
  }
  if (photo != null) {
    await _photos.ajouter(
      Photo(personneId: id, chemin: photo, ajouteeLe: DateTime(2026)),
    );
  }
  return id;
}

/// Lance l'application jusqu'au répertoire, verrou coupé : la demande
/// d'empreinte du système bloquerait le test.
Future<void> lancer(WidgetTester t) async {
  await t.pumpWidget(const ProviderScope(child: BodyCountApp()));
  await attendre(t, find.text('RÉPERTOIRE'));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await DateFormatter.init();
    await chargerCommunes();
  });

  setUp(() async {
    EtatVerrou.instance.setUnlocked(false);
    await Base.instance.toutDetruire();
    await KeyVault.instance.unlock();
    await ReglagesStore.setVerrouActif(false);
  });

  testWidgets('changer la ville d’une fiche se voit dans le répertoire', (
    t,
  ) async {
    await fiche('Nathan', ville: 'Londres');
    await lancer(t);
    expect(find.text('Londres'), findsWidgets);

    await t.tap(find.text('Nathan'));
    await attendre(t, find.byTooltip('Modifier la fiche'));
    await t.tap(find.byTooltip('Modifier la fiche'));
    await attendre(t, find.text('Enregistrer'));

    final champVille = find.descendant(
      of: find
          .ancestor(of: find.text('VILLE'), matching: find.byType(Column))
          .first,
      matching: find.byType(TextField),
    );
    await t.enterText(champVille, 'Locmariaquer');
    await t.tap(find.text('Enregistrer'));
    await patienter(t, 1500);

    // Retour au répertoire, par le bouton rond de la fiche.
    await attendre(t, find.byType(BackButton));
    await t.tap(find.byType(BackButton).last);
    await attendre(t, find.text('RÉPERTOIRE'));
    await patienter(t, 1000);
    expect(find.text('Locmariaquer'), findsWidgets);
    expect(find.text('Londres'), findsNothing);
  });

  testWidgets('une étiquette filtre le répertoire', (t) async {
    await fiche('Kelyan', etiquettes: ['Musclé']);
    await fiche('Lou', etiquettes: ['Drôle']);
    await lancer(t);
    await attendre(t, find.text('Lou'));

    // Les filtres défilent de côté : on va chercher l'étiquette.
    await t.scrollUntilVisible(
      find.text('Musclé'),
      200,
      scrollable: find
          .ancestor(of: find.text('Récents'), matching: find.byType(Scrollable))
          .first,
    );
    await t.tap(find.text('Musclé'));
    await patienter(t, 1200);
    expect(find.text('Kelyan'), findsOneWidget);
    expect(find.text('Lou'), findsNothing);
  });

  testWidgets('la recherche trouve une étiquette', (t) async {
    await fiche('Adam', etiquettes: ['Barbu']);
    await fiche('Matteo');
    await lancer(t);
    await attendre(t, find.text('Matteo'));
    await t.enterText(find.byType(TextField).first, 'barb');
    await patienter(t, 1200);
    expect(find.text('Adam'), findsOneWidget);
    expect(find.text('Matteo'), findsNothing);
  });

  testWidgets('la photo d’une fiche s’ouvre en grand', (t) async {
    final chemin = await PhotoVault.instance.store(await image());
    await fiche('Ibrahim', photo: chemin);
    await lancer(t);
    await t.tap(find.text('Ibrahim'));
    await attendre(t, find.byTooltip('Modifier la fiche'));
    await patienter(t, 800);

    // La grande photo en haut de la fiche.
    await t.tapAt(const Offset(200, 220));
    await attendre(t, find.text('1 / 1'));
    expect(find.byTooltip('Enregistrer dans la galerie'), findsOneWidget);
  });

  testWidgets('la carte range les lieux, l’agenda montre le mois', (t) async {
    final id = await fiche('Lou', ville: 'Vannes');
    await _rencontres.creer(
      Rencontre(
        personneId: id,
        quand: DateTime.now(),
        lieu: 'Arradon',
        noteDemiPoints: 8,
        creeLe: DateTime.now(),
      ),
    );
    await lancer(t);

    await t.tap(find.byIcon(Icons.map_rounded));
    await attendre(t, find.text('TES LIEUX'));
    await attendre(t, find.text('Arradon'));

    await t.tap(find.byIcon(Icons.calendar_month_rounded));
    await attendre(t, find.text('CALENDRIER'));
  });

  testWidgets('le rappel de sauvegarde se montre, puis se tait', (t) async {
    await fiche('Noa');
    await lancer(t);
    await attendre(t, find.text('Aucune sauvegarde de tes fiches'));

    await t.tap(find.byTooltip('Plus tard'));
    await patienter(t, 1000);
    expect(find.text('Aucune sauvegarde de tes fiches'), findsNothing);
  });
}
