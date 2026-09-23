import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'config/routes.dart';
import 'config/theme.dart';
import 'ecrans/lancement.dart';
import 'providers/auth_provider.dart';
import 'providers/donnees.dart';
import 'providers/settings_provider.dart';
import 'security/lock_state.dart';

class BodyCountApp extends ConsumerStatefulWidget {
  const BodyCountApp({super.key});

  @override
  ConsumerState<BodyCountApp> createState() => _BodyCountAppState();
}

class _BodyCountAppState extends ConsumerState<BodyCountApp>
    with WidgetsBindingObserver {
  /// La minuterie d'inactivité, relancée à chaque geste.
  Timer? _inactivite;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Le verrou change d'état quand on ouvre ou ferme : c'est le moment
    // de lancer ou d'arrêter la minuterie.
    EtatVerrou.instance.addListener(_surVerrou);
  }

  @override
  void dispose() {
    EtatVerrou.instance.removeListener(_surVerrou);
    _inactivite?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Ce que l'ouverture et la fermeture du verrou déclenchent.
  ///
  /// Les providers de données vivent aussi longtemps que l'application.
  /// Ce qu'ils ont lu leur reste donc en mémoire par dessus un
  /// verrouillage, erreur comprise : un écran monté au moment où la base
  /// disparaissait gardait « Base demandée avant déverrouillage » affiché
  /// pour de bon, et revenir par l'empreinte n'y changeait rien, puisque
  /// plus personne ne leur redemandait rien.
  ///
  /// On les vide donc à chaque ouverture, au moment précis où la clé
  /// redevient disponible : la première lecture repart du disque, et les
  /// filtres de recherche repartent à zéro par la même occasion.
  ///
  /// Le verrou prévient aussi quand un travail relâche sa retenue : ce
  /// n'est pas une ouverture, il ne faut alors que relancer le compte à
  /// rebours, sans rien oublier.
  void _surVerrou() {
    final ouvert = EtatVerrou.instance.isUnlocked;
    if (ouvert && !_etaitOuvert) toutOublier(ref);
    _etaitOuvert = ouvert;
    _relancer();
  }

  bool _etaitOuvert = false;

  /// Repart de zéro à chaque contact avec l'écran.
  ///
  /// Le délai ne s'appliquait qu'au retour d'arrière plan : l'application
  /// laissée ouverte sur la table restait ouverte indéfiniment, ce qui
  /// vide de son sens le réglage « verrouiller après ». Il compte
  /// maintenant aussi l'inactivité, écran allumé.
  void _relancer() {
    _inactivite?.cancel();
    if (!EtatVerrou.instance.isUnlocked) return;

    final reglages = ref.read(reglagesProvider);
    if (!reglages.verrouActif) return;

    _inactivite = Timer(reglages.delaiVerrou, () {
      // Un travail en cours repousse le verrou : il se réarme quand
      // l'écoute de [EtatVerrou] entend la retenue se relâcher.
      if (EtatVerrou.instance.retenu) return;
      if (EtatVerrou.instance.isUnlocked) {
        ref.read(authServiceProvider).lock();
      }
    });
  }

  /// Reverrouillage automatique.
  ///
  /// On note l'heure du passage en arrière plan, et au retour on compare.
  /// Verrouiller dès la mise en arrière plan serait pénible : ouvrir
  /// l'appareil photo ou répondre à un message redemanderait l'empreinte
  /// à chaque fois. Le délai laisse ces allers retours tranquilles, sans
  /// laisser l'application ouverte dans la poche.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    final verrou = EtatVerrou.instance;

    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        if (verrou.isUnlocked) verrou.pausedAt = DateTime.now();
        _inactivite?.cancel();
      case AppLifecycleState.resumed:
        final parti = verrou.pausedAt;
        verrou.pausedAt = null;
        if (!verrou.isUnlocked || parti == null) return;
        final reglages = ref.read(reglagesProvider);
        if (reglages.verrouActif &&
            !verrou.retenu &&
            DateTime.now().difference(parti) >= reglages.delaiVerrou) {
          ref.read(authServiceProvider).lock();
        } else {
          _relancer();
        }
      case AppLifecycleState.inactive:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Les réglages arrivent du stockage sécurisé, donc après le premier
    // affichage. Sans cette écoute, la minuterie serait armée d'après les
    // valeurs par défaut et continuerait de verrouiller une application
    // dont on vient justement de couper le verrou.
    ref.listen(reglagesProvider, (_, _) => _relancer());

    // Translucide : le Listener voit passer les gestes sans en prendre
    // aucun, donc rien de l'interface ne change de comportement.
    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerDown: (_) => _relancer(),
      onPointerMove: (_) => _relancer(),
      child: MaterialApp.router(
      title: 'BodyCount',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: router,
      // L'animation de lancement se pose par dessus le routeur, le temps
      // qu'elle dure : l'écran d'ouverture est déjà dessous, prêt.
      builder: (context, enfant) => Stack(
        children: [
          ?enfant,
          const AnimationLancement(),
        ],
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('fr', 'FR')],
        locale: const Locale('fr', 'FR'),
      ),
    );
  }
}
