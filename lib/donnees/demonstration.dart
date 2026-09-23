import 'dart:io';
import 'dart:math';

import 'package:path_provider/path_provider.dart';

import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../security/photo_vault.dart';
import 'depots.dart';

/// Une fiche du jeu d'essai.
///
/// Chaque profil est écrit à la main d'après sa photo, plutôt que tiré au
/// sort : un répertoire où tout le monde s'appelle « Noa B. » et habite
/// une ville au hasard ne permet pas de juger l'application. Ici les
/// étiquettes, les notes et les lieux racontent quelque chose, et les
/// écrans ressemblent à ce qu'ils seront une fois remplis pour de vrai.
class _Profil {
  const _Profil({
    required this.photo,
    required this.prenom,
    required this.age,
    required this.ville,
    required this.source,
    required this.genre,
    this.role,
    required this.telephone,
    required this.etiquettes,
    required this.fois,
    required this.noteBasse,
    required this.noteHaute,
    required this.depuisJours,
    this.lieux = const [],
    this.carnet = const [],
    this.etiquettesSoir = const [],
  });

  /// Numéro du fichier dans `assets/demo`.
  final int photo;

  final String prenom;
  final int age;
  final String ville;
  final String source;
  final Genre genre;
  final RoleSexuel? role;
  final String telephone;
  final List<String> etiquettes;

  /// Nombre de rencontres, et fourchette de notes en demi-points.
  final int fois;
  final int noteBasse;
  final int noteHaute;

  /// Ancienneté de la première rencontre.
  final int depuisJours;

  /// Lieux possibles, la ville par défaut.
  final List<String> lieux;

  /// Notes du carnet, écrites à différentes dates.
  final List<String> carnet;

  final List<String> etiquettesSoir;
}

/// Remplit la base avec un jeu d'essai.
///
/// Les visages sont des portraits générés, qui ne représentent personne de
/// réel. Ils ne sont pas dans l'APK : on les pose sur le téléphone, dans le
/// dossier propre à l'application, avant de lancer le remplissage.
///
///     adb push assets/demo/. /sdcard/Android/data/com.bodycount.bodycount/files/demo/
class Demonstration {
  const Demonstration();

  static const _depotPersonnes = DepotPersonnes();
  static const _depotRencontres = DepotRencontres();
  static const _depotEtiquettes = DepotEtiquettes();
  static const _depotNotes = DepotNotes();
  static const _depotPhotos = DepotPhotos();

  static const _profils = <_Profil>[
    _Profil(
      photo: 1,
      prenom: 'Lou M.',
      age: 24,
      ville: 'Vannes',
      source: 'Tinder',
      genre: Genre.femme,
      role: RoleSexuel.versatile,
      telephone: '06 47 18 25 03',
      etiquettes: ['Douce', 'Embrasse bien', 'Chez elle', 'Cocooning'],
      etiquettesSoir: ['Chez elle', 'Toute la nuit'],
      fois: 9,
      noteBasse: 8,
      noteHaute: 10,
      depuisJours: 430,
      lieux: ['Vannes'],
      carnet: [
        'Toujours chez elle, plaid, bougies et le chat qui s\'incruste. '
            'On ne sort jamais et personne ne s\'en plaint.',
        'Elle écrit beaucoup entre deux fois. Répond dans la minute.',
        'Ne jamais proposer le dimanche, elle voit sa famille.',
        'Prend son temps, préliminaires interminables, et c\'est tout '
            'l\'intérêt. Personne d\'autre ne fait ça.',
      ],
    ),
    _Profil(
      photo: 2,
      prenom: 'Emma R.',
      age: 26,
      ville: 'Nantes',
      source: 'En vacances',
      genre: Genre.femme,
      role: RoleSexuel.versatile,
      telephone: '07 62 90 14 77',
      etiquettes: ['Bronzée', 'Spontanée', 'Rieuse', 'Dehors'],
      etiquettesSoir: ['Dehors', 'Rapide'],
      fois: 3,
      noteBasse: 7,
      noteHaute: 9,
      depuisJours: 400,
      lieux: ['Nantes', 'Quimper'],
      carnet: [
        'Rencontrée sur la promenade, elle était en vacances chez sa sœur. '
            'Tout s\'est passé dehors, et c\'était très bien comme ça.',
        'Revenue deux fois depuis. Prévient toujours la veille.',
        'Rapide et sans manières, dehors les trois fois. Ça lui va très '
            'bien et à moi aussi.',
      ],
    ),
    _Profil(
      photo: 3,
      prenom: 'Matteo B.',
      age: 29,
      ville: 'Rennes',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.actif,
      telephone: '06 12 74 58 21',
      etiquettes: ['Sportif', 'Musclé', 'Endurant', 'Barbu', 'Cash'],
      etiquettesSoir: ['Chez lui', 'Toute la nuit'],
      fois: 11,
      noteBasse: 8,
      noteHaute: 10,
      depuisJours: 560,
      lieux: ['Rennes', 'Vannes'],
      carnet: [
        'Court tous les matins le long de la Vilaine, et ça se voit. '
            'Le seul qui tienne vraiment la distance.',
        'Très direct sur ce qu\'il veut, aucune ambiguïté, ça repose.',
        'Il déteste qu\'on arrive en retard. Noté.',
        'Endurant au sens strict : deux fois dans la soirée, sans que ça '
            'retombe entre les deux.',
      ],
    ),
    _Profil(
      photo: 4,
      prenom: 'Chloé D.',
      age: 25,
      ville: 'Vannes',
      source: 'En soirée',
      genre: Genre.femme,
      role: RoleSexuel.versatile,
      telephone: '07 81 33 46 92',
      etiquettes: ['Drôle', 'Cash', 'Bavarde', 'Café'],
      etiquettesSoir: ['Chez moi', 'Rapide'],
      fois: 4,
      noteBasse: 6,
      noteHaute: 8,
      depuisJours: 260,
      lieux: ['Vannes'],
      carnet: [
        'On se retrouve toujours au même café avant. Elle parle beaucoup, '
            'et c\'est drôle, jusqu\'à ce que ça ne le soit plus.',
        'Pas de nouvelles pendant trois semaines, puis un message à 2 h.',
        'Toujours chez moi, toujours expédié. On ne se déshabille même pas '
            'complètement.',
      ],
    ),
    _Profil(
      photo: 5,
      prenom: 'Jade L.',
      age: 27,
      ville: 'Lorient',
      source: 'Par un ami',
      genre: Genre.femme,
      role: RoleSexuel.passif,
      telephone: '06 55 07 88 40',
      etiquettes: ['Calme', 'Attachante', 'Plantes', 'Chez elle'],
      etiquettesSoir: ['Chez elle'],
      fois: 6,
      noteBasse: 7,
      noteHaute: 9,
      depuisJours: 330,
      lieux: ['Lorient'],
      carnet: [
        'Appartement rempli de plantes, il faut enjamber pour aller aux '
            'toilettes. Elle les connaît toutes par leur nom.',
        'La seule avec qui on reste discuter après, et longtemps.',
        'Très passive, attend qu\'on mène, et le dit franchement.',
      ],
    ),
    _Profil(
      photo: 6,
      prenom: 'Inès V.',
      age: 28,
      ville: 'Paris',
      source: 'Tinder',
      genre: Genre.femme,
      role: RoleSexuel.actif,
      telephone: '07 26 61 19 58',
      etiquettes: ['Classe', 'Pressée', 'Distante', 'Ambitieuse'],
      etiquettesSoir: ['Chez moi', 'Rapide'],
      fois: 2,
      noteBasse: 5,
      noteHaute: 7,
      depuisJours: 190,
      lieux: ['Paris'],
      carnet: [
        'Repartie avant minuit les deux fois, taxi commandé pendant qu\'elle '
            'se rhabillait. Très clair sur le cadre, au moins.',
        'Mène tout de bout en bout, sans demander. Efficace, mais on ne '
            'participe pas vraiment.',
      ],
    ),
    _Profil(
      photo: 7,
      prenom: 'Gabriel T.',
      age: 27,
      ville: 'Vannes',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.versatile,
      telephone: '06 39 52 70 16',
      etiquettes: ['Doux', 'Cuisine', 'Embrasse bien', 'Chez lui'],
      etiquettesSoir: ['Chez lui', 'Toute la nuit'],
      fois: 8,
      noteBasse: 8,
      noteHaute: 10,
      depuisJours: 300,
      lieux: ['Vannes'],
      carnet: [
        'Il cuisine avant, systématiquement, et c\'est bon. La soirée '
            'commence à table et finit tard.',
        'Le plus doux de tous. Jamais pressé, jamais brusque.',
        'A laissé une brosse à dents. On verra.',
        'Le seul qui embrasse encore après. Ça paraît idiot dit comme ça, '
            'mais ça change tout.',
      ],
    ),
    _Profil(
      photo: 8,
      prenom: 'Raphaël C.',
      age: 22,
      ville: 'Rennes',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.passif,
      telephone: '07 04 87 23 65',
      etiquettes: ['Étudiant', 'Mince', 'Timide', 'Silencieux'],
      etiquettesSoir: ['Chez moi', 'Rapide'],
      fois: 3,
      noteBasse: 6,
      noteHaute: 8,
      depuisJours: 150,
      lieux: ['Rennes'],
      carnet: [
        'En troisième année, colocation bruyante, donc toujours chez moi. '
            'Très timide au début, beaucoup moins après.',
        'Disparaît pendant les partiels, revient après.',
        'Silencieux du début à la fin, pas un mot, pas un bruit. '
            'Déstabilisant les premières fois.',
      ],
    ),
    _Profil(
      photo: 9,
      prenom: 'Sami K.',
      age: 30,
      ville: 'Nantes',
      source: 'Dans la rue',
      genre: Genre.homme,
      role: RoleSexuel.actif,
      telephone: '06 73 41 09 84',
      etiquettes: ['Barbu', 'Cultivé', 'Grosse bite', 'Cash', 'Tatoué'],
      etiquettesSoir: ['Chez lui'],
      fois: 5,
      noteBasse: 7,
      noteHaute: 10,
      depuisJours: 240,
      lieux: ['Nantes'],
      carnet: [
        'Abordé dans une librairie, ce qui n\'arrive jamais. Il travaillait '
            'là, en fait.',
        'Parle de livres pendant une heure puis ne parle plus du tout.',
        'Très actif, très sûr de lui, et il a de quoi. La note de 5 vient '
            'de là.',
      ],
    ),
    _Profil(
      photo: 10,
      prenom: 'Noa J.',
      age: 25,
      ville: 'Vannes',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.versatile,
      telephone: '06 51 24 88 03',
      etiquettes: [
        'Incroyable',
        'Sportif',
        'Endurant',
        'Embrasse bien',
        'Chez lui',
      ],
      etiquettesSoir: ['Chez lui', 'Toute la nuit'],
      fois: 14,
      noteBasse: 9,
      noteHaute: 10,
      depuisJours: 620,
      lieux: ['Vannes', 'Rennes'],
      carnet: [
        'Rencontré au Fébrile, reparti avec moi vingt minutes après. '
            'Jamais compliqué, il répond toujours, et il dit clairement '
            'ce qu\'il veut.',
        'Le seul qu\'on rappelle sans réfléchir. Celui qui fait relativiser '
            'tous les autres.',
        'Ne pas proposer avant 23 h, il bosse en coupure.',
        'Quatorze fois et jamais deux pareilles. C\'est bien ça le sujet.',
      ],
    ),
    _Profil(
      photo: 11,
      prenom: 'Ibrahim D.',
      age: 24,
      ville: 'Vannes',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.actif,
      telephone: '06 84 30 27 15',
      etiquettes: ['Sportif', 'Musclé', 'Endurant', 'Cash', 'Grosse bite'],
      etiquettesSoir: ['Chez lui', 'Toute la nuit'],
      fois: 10,
      noteBasse: 8,
      noteHaute: 10,
      depuisJours: 480,
      lieux: ['Vannes'],
      carnet: [
        'Rencontré après un match, il sortait du terrain. Très actif, très '
            'direct, aucune négociation : il sait ce qu\'il veut et il le '
            'prend. Capote systématique sans avoir à le demander.',
        'Deux fois dans la nuit à chaque fois, et il ne dort presque pas.',
        'Il ne reste jamais petit-déjeuner. Ça n\'a jamais posé problème.',
      ],
    ),
    _Profil(
      photo: 12,
      prenom: 'Enzo P.',
      age: 23,
      ville: 'Vannes',
      source: 'En soirée',
      genre: Genre.homme,
      role: RoleSexuel.versatile,
      telephone: '07 15 93 62 08',
      etiquettes: ['Bronzé', 'Moustache', 'Bavard', 'Embrasse bien'],
      etiquettesSoir: ['Chez moi', 'Dehors'],
      fois: 7,
      noteBasse: 7,
      noteHaute: 9,
      depuisJours: 350,
      lieux: ['Vannes', 'Auray'],
      carnet: [
        'Croisé place des Lices un soir de terrasse. Parle sans arrêt jusqu\'à '
            'ce qu\'on l\'embrasse, et là plus un mot.',
        'Alterne sans prévenir, il décide en cours de route et ça marche.',
        'Toujours partant pour un deuxième round, jamais pour rester dormir.',
      ],
    ),
    _Profil(
      photo: 13,
      prenom: 'Erwan G.',
      age: 22,
      ville: 'Auray',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.passif,
      telephone: '06 08 45 71 29',
      etiquettes: ['Blond', 'Timide', 'Doux', 'Campagne'],
      etiquettesSoir: ['Chez lui'],
      fois: 4,
      noteBasse: 6,
      noteHaute: 8,
      depuisJours: 200,
      lieux: ['Auray', 'Vannes'],
      carnet: [
        'Habite un hameau paumé, vingt minutes de route. Très timide au '
            'début, beaucoup moins une fois la porte fermée.',
        'Passif, franchement passif, et il le dit sans détour dès le premier '
            'message. Au moins c\'est clair.',
      ],
    ),
    _Profil(
      photo: 14,
      prenom: 'Adam Z.',
      age: 23,
      ville: 'Rochefort',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.actif,
      telephone: '07 39 60 84 52',
      etiquettes: ['Sportif', 'Bronzé', 'Silencieux', 'Rapide'],
      etiquettesSoir: ['Dehors', 'Rapide'],
      fois: 6,
      noteBasse: 5,
      noteHaute: 8,
      depuisJours: 270,
      lieux: ['Rochefort', 'La Rochelle'],
      carnet: [
        'Nage au canal tous les matins, c\'est là qu\'on s\'est vus la '
            'première fois. Efficace, rapide, reparti dans la foulée.',
        'Beaucoup trop silencieux, on ne sait jamais si ça lui plaît. '
            'Il revient, donc j\'imagine que oui.',
      ],
    ),
    _Profil(
      photo: 15,
      prenom: 'Kelyan M.',
      age: 24,
      ville: 'Lorient',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.versatile,
      telephone: '06 27 11 58 93',
      etiquettes: ['Musclé', 'Tresses', 'Drôle', 'Endurant'],
      etiquettesSoir: ['Chez lui', 'Toute la nuit'],
      fois: 9,
      noteBasse: 8,
      noteHaute: 10,
      depuisJours: 390,
      lieux: ['Lorient', 'Vannes'],
      carnet: [
        'Le plus drôle du répertoire, on rit autant qu\'autre chose, et ça '
            'ne gâche rien.',
        'Versatile pour de vrai, pas sur le papier. Le seul avec qui la '
            'question ne se pose même pas.',
        'Trois heures la dernière fois. Il ne lâche rien.',
      ],
    ),
    _Profil(
      photo: 16,
      prenom: 'Tom L.',
      age: 22,
      ville: 'Vannes',
      source: 'Par un ami',
      genre: Genre.homme,
      role: RoleSexuel.passif,
      telephone: '07 72 06 39 41',
      etiquettes: ['Mince', 'Timide', 'Voisin', 'Chez moi'],
      etiquettesSoir: ['Chez moi'],
      fois: 5,
      noteBasse: 6,
      noteHaute: 9,
      depuisJours: 170,
      lieux: ['Vannes'],
      carnet: [
        'Habite deux rues plus loin, ce qui est pratique et dangereux. '
            'Arrive toujours après 23 h, reparti avant 2 h.',
        'Passif au début, prend les devants au bout d\'un moment, et c\'est '
            'là que ça devient intéressant.',
      ],
    ),
    _Profil(
      photo: 17,
      prenom: 'Malo R.',
      age: 21,
      ville: 'Marseille',
      source: 'Grindr',
      genre: Genre.homme,
      role: RoleSexuel.versatile,
      telephone: '06 63 82 04 77',
      etiquettes: ['Roux', 'Sportif', 'Endurant', 'Taches de rousseur'],
      etiquettesSoir: ['Dehors', 'Toute la nuit'],
      fois: 3,
      noteBasse: 7,
      noteHaute: 9,
      depuisJours: 120,
      lieux: ['Marseille'],
      carnet: [
        'Croisé sur la plage des Catalans un dimanche. Taches de rousseur '
            'partout, et il le sait.',
        'Étudiant à Marseille, donc les allers-retours sont rares. Trois '
            'fois en quatre mois.',
      ],
    ),
    _Profil(
      photo: 18,
      prenom: 'Nathan B.',
      age: 23,
      ville: 'Lyon',
      source: 'Tinder',
      genre: Genre.homme,
      role: RoleSexuel.actif,
      telephone: '07 48 25 16 30',
      etiquettes: ['Beau gosse', 'Distant', 'Rapide', 'Chez lui'],
      etiquettesSoir: ['Chez lui', 'Rapide'],
      fois: 2,
      noteBasse: 4,
      noteHaute: 6,
      depuisJours: 90,
      lieux: ['Lyon'],
      carnet: [
        'Très beau, et parfaitement au courant. Tout va vite, trop vite, '
            'et il regarde son téléphone après.',
        'Deux fois, ça suffira.',
      ],
    ),
  ];

  /// Range un visage du dossier d'essai dans le coffre.
  ///
  /// Si le fichier manque, la fiche se crée quand même, sans photo : le
  /// jeu d'essai ne doit jamais échouer pour une image absente.
  Future<String?> _visage(int numero) async {
    try {
      final dossier = await getExternalStorageDirectory();
      if (dossier == null) return null;
      final nom = 'v${numero.toString().padLeft(2, '0')}.jpg';
      final fichier = File('${dossier.path}/demo/$nom');
      return await PhotoVault.instance.store(await fichier.readAsBytes());
    } catch (_) {
      return null;
    }
  }

  /// Écrit toutes les fiches, leurs rencontres, leurs notes et leurs
  /// étiquettes.
  Future<void> remplir() async {
    // Graine fixe : deux appels donnent le même jeu, donc une capture
    // d'écran reste comparable d'une fois sur l'autre.
    final hasard = Random(20260922);
    final maintenant = DateTime.now();
    final calendrier = _calendrier(hasard, maintenant);

    for (var index = 0; index < _profils.length; index++) {
      final profil = _profils[index];
      final dates = calendrier[index];
      final photo = await _visage(profil.photo);
      final debut = maintenant.subtract(Duration(days: profil.depuisJours));

      final personneId = await _depotPersonnes.creer(Personne(
        prenom: profil.prenom,
        age: profil.age,
        ville: profil.ville,
        rencontreSur: profil.source,
        telephone: profil.telephone,
        genre: profil.genre,
        role: profil.role,
        photoPrincipale: photo,
        creeLe: debut,
        modifieLe: debut,
      ));

      if (photo != null) {
        await _depotPhotos.ajouter(Photo(
          personneId: personneId,
          chemin: photo,
          principale: true,
          ajouteeLe: debut,
        ));
      }

      await _depotEtiquettes.definirPourPersonne(
        personneId,
        profil.etiquettes,
      );

      // Les rencontres s'échelonnent entre la première fois et
      // aujourd'hui, avec un peu de désordre : des dates régulières au
      // jour près donneraient un graphique mensuel en peigne.
      final lieux = profil.lieux.isEmpty ? [profil.ville] : profil.lieux;
      final rencontres = <int>[];

      for (final soir in dates) {
        final note = profil.noteBasse +
            hasard.nextInt(profil.noteHaute - profil.noteBasse + 1);

        // Une soirée sur quatorze environ a rapporté quelque chose, entre
        // cinquante et cent cinquante euros.
        //
        // La première version payait un soir sur quatre jusqu'à trois
        // cents euros, ce qui donnait plusieurs milliers sur l'année :
        // un jeu d'essai est censé ressembler à une vie, pas à une
        // démonstration. Ici l'année tourne autour de huit cents euros,
        // assez pour que les écrans aient quelque chose à montrer, assez
        // peu pour que ça reste crédible.
        final paye = hasard.nextInt(100) < 7;
        final montant = paye ? (1 + hasard.nextInt(3)) * 5000 : null;

        final rencontreId = await _depotRencontres.creer(Rencontre(
          personneId: personneId,
          quand: soir,
          lieu: lieux[hasard.nextInt(lieux.length)],
          noteDemiPoints: note,
          montantCentimes: montant,
          creeLe: soir,
        ));
        rencontres.add(rencontreId);

        if (profil.etiquettesSoir.isNotEmpty && hasard.nextInt(10) < 6) {
          await _depotEtiquettes.definirPourRencontre(rencontreId, [
            profil.etiquettesSoir[hasard.nextInt(profil.etiquettesSoir.length)],
          ]);
        }
      }

      // Les notes du carnet se rattachent aux dernières rencontres, pour
      // que la fiche affiche « après la Ne fois » plutôt qu'une date nue.
      for (var n = 0; n < profil.carnet.length; n++) {
        final rattachee = rencontres.isEmpty
            ? null
            : rencontres[
                (rencontres.length - 1 - n).clamp(0, rencontres.length - 1)];
        await _depotNotes.ajouter(Note(
          personneId: personneId,
          rencontreId: rattachee,
          texte: profil.carnet[n],
          ecriteLe: maintenant.subtract(Duration(days: 20 + n * 45)),
        ));
      }
    }
  }

  /// Repartit toutes les rencontres sur un calendrier commun.
  ///
  /// Chaque fiche calculee dans son coin posait forcement sa derniere
  /// rencontre le jour meme : a dix-huit fiches, ca donnait dix-huit
  /// rencontres le meme soir, toutes entre 22 h et minuit. Le calendrier
  /// ci-dessous est partage : il accepte deux rencontres par jour au
  /// maximum et decale les suivantes vers le jour libre le plus proche.
  List<List<DateTime>> _calendrier(Random hasard, DateTime maintenant) {
    final occupe = <int, int>{};
    final tout = List.generate(_profils.length, (_) => <DateTime>[]);

    // On etale d'abord chaque fiche sur son anciennete, puis on brasse
    // l'ordre de service : sans ca, les premieres fiches prendraient
    // toutes les bonnes dates et les dernieres seraient repoussees en bloc.
    final demandes = <({int fiche, int jour})>[];
    for (var i = 0; i < _profils.length; i++) {
      final profil = _profils[i];
      for (var r = 0; r < profil.fois; r++) {
        final part = profil.fois == 1 ? 0.0 : r / (profil.fois - 1);
        final jour = (profil.depuisJours * (1 - part) + 3).round() +
            hasard.nextInt(13) -
            6;
        demandes.add((fiche: i, jour: max(jour, 0)));
      }
    }
    demandes.shuffle(hasard);

    for (final demande in demandes) {
      final jour = _jourLibre(demande.jour, occupe);
      final rang = occupe[jour] ?? 0;
      occupe[jour] = rang + 1;

      final date = maintenant.subtract(Duration(days: jour));
      // Deux rencontres le meme jour ne tombent pas a la meme heure : la
      // premiere en debut de soiree, la seconde en pleine nuit.
      tout[demande.fiche].add(DateTime(
        date.year,
        date.month,
        date.day,
        rang == 0 ? 18 + hasard.nextInt(4) : 22 + hasard.nextInt(2),
        hasard.nextInt(60),
      ));
    }

    for (final liste in tout) {
      liste.sort();
    }
    return tout;
  }

  /// Cherche le jour libre le plus proche, deux rencontres par jour au
  /// maximum, en s'ecartant de part et d'autre de la date voulue.
  int _jourLibre(int souhaite, Map<int, int> occupe) {
    for (var ecart = 0; ecart < 500; ecart++) {
      for (final signe in ecart == 0 ? const [0] : const [1, -1]) {
        final jour = souhaite + ecart * signe;
        if (jour < 0) continue;
        if ((occupe[jour] ?? 0) < 2) return jour;
      }
    }
    return souhaite;
  }
}
