import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/layout.dart';
import '../../config/theme.dart';

/// Coque commune des quatre onglets.
///
/// En dessous de 600 points de large, la navigation est une barre flottante
/// en bas, à portée de pouce. Au dessus, elle devient un rail vertical à
/// gauche et libère toute la hauteur pour le contenu. Le même arbre de
/// widgets sert les deux cas : rien n'est dupliqué, donc rien ne peut
/// diverger.
class AppScaffold extends StatelessWidget {
  final Widget child;

  const AppScaffold({super.key, required this.child});

  static const _destinations = <_Destination>[
    _Destination('/repertoire', Icons.grid_view_rounded, 'Fiches'),
    _Destination('/stats', Icons.bar_chart_rounded, 'Stats'),
    _Destination('/carte', Icons.map_rounded, 'Carte'),
    _Destination('/calendrier', Icons.calendar_month_rounded, 'Agenda'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;

    // La légende appartient au calendrier : c'est de là qu'on y entre, et
    // c'est l'onglet qui doit rester allumé pendant qu'on la lit.
    if (location.startsWith('/legende')) return 3;

    for (var i = 0; i < _destinations.length; i++) {
      if (location.startsWith(_destinations[i].route)) return i;
    }
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    context.go(_destinations[index].route);
  }

  @override
  Widget build(BuildContext context) {
    final index = _currentIndex(context);

    if (AppLayout.usesRail(context)) {
      return Scaffold(
        body: Row(
          children: [
            _Rail(index: index, onTap: (i) => _onTap(context, i)),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      body: child,
      extendBody: true,
      bottomNavigationBar: _FloatingBar(
        index: index,
        onTap: (i) => _onTap(context, i),
      ),
    );
  }
}

/// Le style d'un libellé d'onglet, mesuré et affiché avec le même.
///
/// La graisse du sélectionné est la plus large des deux : c'est donc
/// celle qui décide, sinon la barre changerait de forme en passant d'un
/// onglet à l'autre.
TextStyle _styleLibelle(BuildContext context, {required bool gras}) {
  return DefaultTextStyle.of(context).style.merge(
        TextStyle(
          fontSize: 12.5,
          fontWeight: gras ? FontWeight.w800 : FontWeight.w700,
        ),
      );
}

/// La largeur du plus long libellé, à l'échelle de texte du téléphone.
///
/// Les quatre mots sont mesurés, pas devinés : un réglage d'accessibilité
/// qui grossit les textes de moitié doit faire tomber les libellés, et
/// une police remplacée ne doit pas non plus prendre la barre en traître.
double _libellePlusLarge(BuildContext context, {required bool majuscules}) {
  final style = _styleLibelle(context, gras: true);
  final echelle = MediaQuery.textScalerOf(context);
  var large = 0.0;

  for (final d in AppScaffold._destinations) {
    final peintre = TextPainter(
      text: TextSpan(
        text: majuscules ? d.label.toUpperCase() : d.label,
        style: majuscules
            ? style.copyWith(fontSize: 9, letterSpacing: 0.4)
            : style,
      ),
      textDirection: TextDirection.ltr,
      textScaler: echelle,
    )..layout();
    large = math.max(large, peintre.width);
  }
  return large;
}

class _Destination {
  final String route;
  final IconData icon;
  final String label;

  const _Destination(this.route, this.icon, this.label);
}

/// Barre flottante en pilule, posée au dessus du contenu.
class _FloatingBar extends StatelessWidget {
  const _FloatingBar({required this.index, required this.onTap});

  final int index;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    final marge = AppLayout.gutter(context);

    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(marge, 0, marge, 10),
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 7),
          decoration: BoxDecoration(
            color: const Color(0xF01A1030),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0x17FFFFFF)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x80000000),
                blurRadius: 40,
                offset: Offset(0, 16),
              ),
            ],
          ),
          // Deux onglets, le bouton d'ajout, deux onglets. Il était à
          // droite, en bout de rangée, ce qui en faisait un cinquième
          // onglet mal rangé ; au centre, il devient ce qu'il est : la
          // seule action de la barre, et la barre reste symétrique.
          child: LayoutBuilder(
            builder: (context, contraintes) {
              // Les libellés passent, ou ne passent pas, pour toute la
              // barre d'un coup. Les mesurer onglet par onglet donnerait
              // une barre bâtarde, « Stats » écrit et « Agenda » muet,
              // et un mot qui apparaît en changeant d'onglet décalerait
              // les quatre emplacements à chaque appui.
              final libelles = _libellesTiennent(context, contraintes.maxWidth);

              return Row(
                children: [
                  for (var i = 0;
                      i < AppScaffold._destinations.length;
                      i++) ...[
                    if (i == 2) ...[
                      const SizedBox(width: 6),
                      const _BoutonAjout(),
                      const SizedBox(width: 6),
                    ],
                    Expanded(
                      child: _BarItem(
                        destination: AppScaffold._destinations[i],
                        selected: i == index,
                        showLabel: libelles,
                        onTap: () => onTap(i),
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Les libellés tiennent-ils dans la barre du bas ?
///
/// La place d'un onglet, c'est la barre moins le bouton d'ajout et ses
/// deux écarts, divisée par le nombre d'onglets. Il y faut l'icône,
/// l'écart qui la suit, le mot, et de quoi ne pas coller au bord arrondi
/// de la pastille allumée. Faute de quoi le mot serait coupé net par des
/// points de suspension, ce qui est pire que pas de mot du tout.
bool _libellesTiennent(BuildContext context, double largeur) {
  const icone = 19.0;
  const ecart = 7.0;
  const respiration = 6.0;
  const ajout = 48.0 + 6.0 + 6.0;

  final dispo = (largeur - ajout) / AppScaffold._destinations.length;
  return dispo >=
      icone + ecart + _libellePlusLarge(context, majuscules: false) + respiration;
}

/// Le bouton d'ajout, logé dans la barre de navigation.
///
/// Il flottait au dessus de la grille, en bas à droite, et masquait la
/// note et la ville d'une fiche sur trois. Le déplacer ne servait à rien :
/// où qu'on le pose, un bouton flottant recouvre quelque chose. Il prend
/// donc sa place dans la barre, qui est justement l'endroit prévu pour
/// que rien ne soit caché.
class _BoutonAjout extends StatelessWidget {
  const _BoutonAjout();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Ajouter une fiche',
      child: Tooltip(
        message: 'Ajouter une fiche',
        child: InkWell(
          onTap: () => context.push('/personne/nouvelle'),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accent.withValues(alpha: 0.38),
                  blurRadius: 16,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: const Icon(
              Icons.add_rounded,
              size: 25,
              color: Color(0xFF12071F),
            ),
          ),
        ),
      ),
    );
  }
}

class _BarItem extends StatelessWidget {
  const _BarItem({
    required this.destination,
    required this.selected,
    required this.showLabel,
    required this.onTap,
  });

  final _Destination destination;
  final bool selected;
  final bool showLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final couleur =
        selected ? const Color(0xFFE9D5FF) : const Color(0xFF8B7BA8);

    return Semantics(
      selected: selected,
      button: true,
      label: destination.label,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(17),
        child: Container(
          height: 50,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(17),
            gradient: selected
                ? const LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [Color(0x42A855F7), Color(0x33D946EF)],
                  )
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(destination.icon, size: 19, color: couleur),
              if (showLabel) ...[
                const SizedBox(width: 7),
                Flexible(
                  child: Text(
                    destination.label,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: selected ? FontWeight.w800 : FontWeight.w700,
                      color: couleur,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Rail vertical de l'écran déplié.
class _Rail extends StatelessWidget {
  const _Rail({required this.index, required this.onTap});

  final int index;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    // Même règle que sur téléphone : le mot passe, ou il disparaît. Une
    // pastille de 56 points laisse peu de marge, et un réglage
    // d'accessibilité suffit à faire déborder « AGENDA ».
    final libelles =
        _libellePlusLarge(context, majuscules: true) <= 56 - 8;

    return Container(
      width: 92,
      decoration: const BoxDecoration(
        color: Color(0x9E100920),
        border: Border(right: BorderSide(color: AppColors.cardBorder)),
      ),
      // Le logo en haut, puis un seul groupe centré dans la hauteur
      // restante. La version précédente collait les onglets sous le logo
      // et exilait le bouton d'ajout tout en bas : il restait un grand
      // vide au milieu, et l'ajout n'appartenait visiblement à rien.
      // L'ordre est celui de la barre du téléphone, bouton compris.
      child: SafeArea(
        right: false,
        child: Column(
          children: [
            const SizedBox(height: 22),
            // Le logo de l'application, et non plus un cœur : celui-ci ne
            // venait de nulle part et ne voulait rien dire, alors que cet
            // emplacement est justement celui de la marque. Même
            // traitement que sur l'écran d'ouverture, l'arrondi et le
            // halo raccordant le fond sombre du fichier à celui du rail.
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(13),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.32),
                    blurRadius: 16,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(13),
                child: Image.asset(
                  'assets/logo.png',
                  fit: BoxFit.cover,
                  filterQuality: FilterQuality.medium,
                ),
              ),
            ),
            const SizedBox(height: 18),
            const _TraitRail(),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      for (var i = 0;
                          i < AppScaffold._destinations.length;
                          i++) ...[
                        if (i == 2) const _AjoutRail(),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: _RailItem(
                            destination: AppScaffold._destinations[i],
                            selected: i == index,
                            showLabel: libelles,
                            onTap: () => onTap(i),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 22),
          ],
        ),
      ),
    );
  }
}

/// Le filet sous le logo, qui sépare la marque de la navigation.
class _TraitRail extends StatelessWidget {
  const _TraitRail();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 1,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.transparent,
            Colors.white.withValues(alpha: 0.13),
            Colors.transparent,
          ],
        ),
      ),
    );
  }
}

/// Le bouton d'ajout du rail, au milieu du groupe comme sur téléphone.
class _AjoutRail extends StatelessWidget {
  const _AjoutRail();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Semantics(
        button: true,
        label: 'Ajouter une fiche',
        child: Tooltip(
          message: 'Ajouter une fiche',
          child: InkWell(
            onTap: () => context.push('/personne/nouvelle'),
            borderRadius: BorderRadius.circular(18),
            child: Container(
              width: 56,
              height: 56,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                gradient: AppColors.brandGradient,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent.withValues(alpha: 0.34),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(Icons.add_rounded,
                  size: 27, color: Color(0xFF12071F)),
            ),
          ),
        ),
      ),
    );
  }
}

class _RailItem extends StatelessWidget {
  const _RailItem({
    required this.destination,
    required this.selected,
    required this.showLabel,
    required this.onTap,
  });

  final _Destination destination;
  final bool selected;
  final bool showLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final couleur =
        selected ? const Color(0xFFE9D5FF) : const Color(0xFF8B7BA8);

    return Semantics(
      selected: selected,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: selected
                ? const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0x4DA855F7), Color(0x38D946EF)],
                  )
                : null,
            border: selected
                ? Border.all(color: const Color(0x1FFFFFFF))
                : null,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(destination.icon, size: showLabel ? 19 : 23, color: couleur),
              if (showLabel) ...[
                const SizedBox(height: 4),
                Text(
                  destination.label.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                    color: couleur,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
