import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../ecrans/carte.dart';
import '../ecrans/editeurs.dart';
import '../ecrans/fiche.dart';
import '../ecrans/formulaire_personne.dart';
import '../ecrans/formulaire_rencontre.dart';
import '../ecrans/calendrier.dart';
import '../ecrans/legende_calendrier.dart';
import '../ecrans/repertoire.dart';
import '../ecrans/statistiques.dart';
import '../ecrans/verrouillage.dart';
import '../ecrans/visionneuse.dart';
import '../ecrans/reglages.dart';
import '../security/lock_state.dart';
import '../widgets/common/app_scaffold.dart';

final _racine = GlobalKey<NavigatorState>();
final _coque = GlobalKey<NavigatorState>();

/// Lit l'identifiant d'une route, ou zéro si l'URL est abîmée.
///
/// Zéro ne correspond à aucune fiche : l'écran affichera « cette fiche
/// n'existe plus » au lieu de planter sur un `int.parse`.
int _id(GoRouterState state) => int.tryParse(state.pathParameters['id'] ?? '') ?? 0;

final router = GoRouter(
  navigatorKey: _racine,
  initialLocation: '/verrou',
  refreshListenable: EtatVerrou.instance,
  // Une seule porte d'entrée : tant que le trousseau est verrouillé,
  // toute route ramène à l'écran d'ouverture. Ce n'est pas une politesse,
  // les écrans qui liraient la base sans la clé lèveraient une erreur.
  redirect: (context, state) {
    final ouvert = EtatVerrou.instance.isUnlocked;
    final surVerrou = state.matchedLocation == '/verrou';
    if (!ouvert) return surVerrou ? null : '/verrou';
    if (surVerrou) return '/repertoire';
    return null;
  },
  routes: [
    GoRoute(
      path: '/verrou',
      builder: (context, state) => const LockScreen(),
    ),

    ShellRoute(
      navigatorKey: _coque,
      builder: (context, state, child) => AppScaffold(child: child),
      routes: [
        GoRoute(
          path: '/repertoire',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: EcranRepertoire()),
        ),
        GoRoute(
          path: '/stats',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: EcranStatistiques()),
        ),
        GoRoute(
          path: '/carte',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: EcranCarte()),
        ),
        GoRoute(
          path: '/calendrier',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: EcranCalendrier()),
        ),

        // La légende du calendrier vit dans la coque, et non par dessus :
        // la barre de navigation reste donc utilisable pendant qu'on la
        // consulte, ce qui est la moindre des choses pour un écran de
        // simple lecture.
        GoRoute(
          path: '/legende',
          builder: (context, state) => const LegendeCalendrier(),
        ),
      ],
    ),

    // Déclarée avant `/personne/:id`, sinon « nouvelle » serait lu comme
    // un identifiant.
    GoRoute(
      path: '/personne/nouvelle',
      builder: (context, state) => const EcranFormulairePersonne(),
    ),
    GoRoute(
      path: '/personne/:id',
      builder: (context, state) => EcranFiche(personneId: _id(state)),
      routes: [
        GoRoute(
          path: 'modifier',
          builder: (context, state) =>
              EcranFormulairePersonne(personneId: _id(state)),
        ),
        GoRoute(
          path: 'rencontre',
          builder: (context, state) =>
              EcranFormulaireRencontre(personneId: _id(state)),
        ),
        // Reprendre une rencontre déjà enregistrée. Déclarée après
        // « rencontre » seule, pour que l'une n'avale pas l'autre.
        GoRoute(
          path: 'rencontre/:rid',
          builder: (context, state) => EcranFormulaireRencontre(
            personneId: _id(state),
            rencontreId: int.tryParse(state.pathParameters['rid'] ?? ''),
          ),
        ),
        GoRoute(
          path: 'etiquettes',
          builder: (context, state) => EcranEtiquettes(personneId: _id(state)),
        ),
        GoRoute(
          path: 'note',
          builder: (context, state) => EcranNote(personneId: _id(state)),
        ),
        // Reprendre une note déjà écrite. Déclarée après « note » seule,
        // pour que l'une n'avale pas l'autre.
        GoRoute(
          path: 'note/:nid',
          builder: (context, state) => EcranNote(
            personneId: _id(state),
            noteId: int.tryParse(state.pathParameters['nid'] ?? ''),
          ),
        ),
        GoRoute(
          path: 'photos',
          builder: (context, state) => EcranPhotos(personneId: _id(state)),
        ),
        // Plein écran, ouvert sur le média de ce rang dans la galerie.
        GoRoute(
          path: 'medias/:rang',
          builder: (context, state) => EcranVisionneuse(
            personneId: _id(state),
            depart: int.tryParse(state.pathParameters['rang'] ?? '') ?? 0,
          ),
        ),
      ],
    ),

    GoRoute(
      path: '/reglages',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
