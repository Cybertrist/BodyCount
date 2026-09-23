import 'package:flutter/widgets.dart';

/// Les trois silhouettes d'écran du Fold.
///
/// Un seul endroit décide, pour que la grille du répertoire, la barre de
/// navigation et les fiches ne partent pas chacune avec leur propre idée
/// de ce qu'est un grand écran.
enum ScreenFormat {
  /// Téléphone tenu fermé, 390 points de large. Une colonne de contenu.
  compact,

  /// Écran de couverture du Fold, 460 de large et seulement 727 de haut.
  /// Plus large, donc une colonne de vignettes de plus ; plus court, donc
  /// les en-têtes se replient sur une seule ligne.
  passport,

  /// Écran intérieur déplié, 900 sur 1200. Deux volets côte à côte et le
  /// rail de navigation à gauche.
  expanded,
}

class AppLayout {
  const AppLayout._();

  /// Seuils en points. 600 est la limite retenue par Android pour passer
  /// en disposition large ; 430 sépare un téléphone d'un écran de
  /// couverture, qui est sensiblement plus large.
  static const passportWidth = 430.0;
  static const expandedWidth = 600.0;

  static ScreenFormat of(BuildContext context) {
    return fromWidth(MediaQuery.sizeOf(context).width);
  }

  static ScreenFormat fromWidth(double width) {
    if (width >= expandedWidth) return ScreenFormat.expanded;
    if (width >= passportWidth) return ScreenFormat.passport;
    return ScreenFormat.compact;
  }

  static bool isExpanded(BuildContext context) =>
      of(context) == ScreenFormat.expanded;

  /// Navigation à gauche plutôt qu'en bas dès qu'il y a la largeur : le
  /// pouce atteint mal le bas d'un écran de 1200 points de haut.
  static bool usesRail(BuildContext context) => isExpanded(context);

  /// Colonnes de la grille des fiches.
  ///
  /// Sur l'écran intérieur, la grille n'occupe que le volet de gauche,
  /// d'où deux colonnes et non quatre : c'est la fiche ouverte à droite
  /// qui prend la place gagnée.
  static int gridColumns(BuildContext context) {
    switch (of(context)) {
      case ScreenFormat.compact:
        return 2;
      case ScreenFormat.passport:
        return 3;
      case ScreenFormat.expanded:
        return 2;
    }
  }

  /// Marge extérieure des écrans.
  static double gutter(BuildContext context) {
    return of(context) == ScreenFormat.compact ? 18 : 16;
  }

  /// Hauteur disponible avare : sur l'écran de couverture, un en-tête sur
  /// deux lignes coûte un tiers de la grille.
  static bool isShort(BuildContext context) =>
      MediaQuery.sizeOf(context).height < 800;

  /// Largeur du volet de gauche quand les deux volets cohabitent.
  static double listPaneWidth(BuildContext context) => 338;

  /// De combien remonter un bouton flottant pour qu'il passe au dessus de
  /// la barre de navigation.
  ///
  /// La barre appartient à la coque, le bouton à l'écran : sans cette
  /// valeur partagée, le bouton se pose au ras du bord et disparaît
  /// derrière elle. 64 de barre, 10 de marge, plus la zone sûre du bas.
  static double fabOffset(BuildContext context) {
    if (usesRail(context)) return 0;
    return 74 + MediaQuery.paddingOf(context).bottom;
  }
}
