import 'package:flutter/material.dart';

/// L'intitulé d'un onglet : RÉPERTOIRE, STATISTIQUES, TES LIEUX, FRISE.
///
/// Les quatre écrans partagent ce widget plutôt que de recopier un style
/// chacun de leur côté, sans quoi ils finissent par diverger d'un point
/// ou d'un demi-espacement, ce qui se voit en passant de l'un à l'autre.
///
/// Il ne reprend pas le style d'intitulé du thème : celui-ci sert aussi
/// aux en-têtes de cartes, « CLASSEMENT », « PAR MOIS », et un titre
/// d'écran doit peser plus lourd qu'un titre de bloc.
///
/// La police est Chakra Petch, choisie sur planche parmi douze, rendues
/// à l'échelle réelle avec la barre de recherche à côté : c'est là que la
/// largeur d'un titre se paie, et ça ne se juge pas sur un nom.
///
/// Elle est plus étroite que la police système à graisse égale, donc le
/// titre tient sans pousser la recherche, et ses angles coupés lui
/// donnent le caractère qui manquait.
class TitreEcran extends StatelessWidget {
  const TitreEcran(this.texte, {super.key});

  final String texte;

  @override
  Widget build(BuildContext context) {
    return Text(
      texte.toUpperCase(),
      style: const TextStyle(
        fontFamily: 'ChakraPetch',
        fontSize: 16,
        height: 1.2,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.5,
        color: Colors.white,
      ),
    );
  }
}
