import 'package:cryptography/cryptography.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'donnees/coordonnees.dart';
import 'security/video_vault.dart';
import 'utils/date_formatter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // cryptography_flutter s'installe tout seul comme implémentation par
  // défaut de toute la cryptographie. Son HKDF confie l'extraction à
  // Android, qui refuse la clé HMAC vide d'un sel vide : la base ne
  // s'ouvrait plus. On rend donc le Dart d'origine à tout le monde, et
  // seul le coffre des vidéos demande l'AES natif, explicitement.
  Cryptography.instance = Cryptography.defaultInstance;

  // La protection de l'écran suit le réglage, appliqué au chargement des
  // préférences. Rien n'est forcé ici.
  await DateFormatter.init();

  // Les communes de France, lues pendant que l'empreinte est demandée.
  // Les providers qui posent des villes attendent la fin de la lecture.
  chargerCommunes();

  // Une vidéo déchiffrée pour la lecture, restée là si l'application a
  // été tuée pendant qu'on la regardait.
  VideoVault.instance.oublierLectures();

  runApp(
    const ProviderScope(
      child: BodyCountApp(),
    ),
  );
}
