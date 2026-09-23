import 'package:flutter/material.dart';

import '../config/theme.dart';

/// Ce qu'on montre quand une lecture n'aboutit pas.
///
/// Les écrans affichaient l'objet d'erreur tel quel, donc « Bad state: »
/// suivi d'une phrase écrite pour un développeur, seul au milieu d'un
/// écran par ailleurs soigné. Le titre dit ce qui n'a pas marché, la
/// ligne du dessous dit pourquoi, en français quand la cause est connue.
class Echec extends StatelessWidget {
  const Echec({super.key, required this.titre, required this.erreur});

  final String titre;
  final Object erreur;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              titre,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 10),
            Text(
              detailErreur(erreur),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13.5,
                height: 1.5,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Met en français les erreurs qu'on sait nommer.
///
/// Celle du verrou est la seule qui arrive en usage normal, quand un
/// écran demande la base à l'instant où la clé vient d'être rendue. Les
/// autres gardent leur texte, amputé du préfixe que Dart y colle.
String detailErreur(Object erreur) {
  final texte = '$erreur';
  if (texte.contains('avant déverrouillage')) {
    return 'L\'application s\'est verrouillée pendant la lecture. '
        'Rouvre-la avec ton empreinte, les données sont intactes.';
  }
  return texte.replaceFirst(
    RegExp(r'^(Bad state|Exception|StateError|DatabaseException): '),
    '',
  );
}
