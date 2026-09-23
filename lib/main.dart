import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'donnees/coordonnees.dart';
import 'security/video_vault.dart';
import 'utils/export_helper.dart';
import 'utils/date_formatter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // La protection de l'écran suit le réglage, appliqué au chargement des
  // préférences. Rien n'est forcé ici.
  await DateFormatter.init();

  // Les communes de France, lues pendant que l'empreinte est demandée.
  // Les providers qui posent des villes attendent la fin de la lecture.
  chargerCommunes();

  // Une vidéo déchiffrée pour la lecture, restée là si l'application a
  // été tuée pendant qu'on la regardait.
  VideoVault.instance.oublierLectures();

  // Une sauvegarde partagée au lancement précédent : l'application qui la
  // recevait a eu le temps de la lire.
  ExportHelper.menage();

  runApp(const ProviderScope(child: BodyCountApp()));
}
