import 'package:flutter/material.dart';

/// Fait apparaître un élément en montant légèrement, avec un retard qui
/// dépend de sa position dans une liste.
///
/// Le décalage donne l'impression que la grille se remplit au lieu de
/// s'afficher d'un bloc. Il reste court, 40 ms par rang plafonnés à six
/// rangs : au delà, on attend, et une animation qu'on attend devient une
/// lenteur.
class Apparition extends StatefulWidget {
  const Apparition({
    super.key,
    required this.child,
    this.rang = 0,
    this.decalage = 18,
    this.duree = const Duration(milliseconds: 420),
  });

  final Widget child;
  final int rang;

  /// Distance de montée, en points.
  final double decalage;

  final Duration duree;

  @override
  State<Apparition> createState() => _ApparitionState();
}

class _ApparitionState extends State<Apparition>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controle = AnimationController(
    vsync: this,
    duration: widget.duree,
  );

  @override
  void initState() {
    super.initState();
    final retard = Duration(milliseconds: 40 * widget.rang.clamp(0, 6));
    Future.delayed(retard, () {
      if (mounted) _controle.forward();
    });
  }

  @override
  void dispose() {
    _controle.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final courbe = CurvedAnimation(
      parent: _controle,
      curve: Curves.easeOutCubic,
    );

    return AnimatedBuilder(
      animation: courbe,
      builder: (context, enfant) {
        return Opacity(
          opacity: courbe.value,
          child: Transform.translate(
            offset: Offset(0, widget.decalage * (1 - courbe.value)),
            child: enfant,
          ),
        );
      },
      child: widget.child,
    );
  }
}

/// Un nombre qui monte jusqu'à sa valeur.
///
/// Sur un écran de statistiques, voir le compteur grimper donne à un
/// chiffre immobile le poids qu'il mérite. La durée s'adapte : compter
/// jusqu'à trois ne doit pas prendre le même temps que compter jusqu'à
/// deux cents.
class Compteur extends StatelessWidget {
  const Compteur({
    super.key,
    required this.valeur,
    required this.style,
    this.suffixe,
  });

  final int valeur;
  final TextStyle style;
  final String? suffixe;

  @override
  Widget build(BuildContext context) {
    final duree = Duration(
      milliseconds: (300 + valeur * 12).clamp(300, 1100),
    );

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: valeur.toDouble()),
      duration: duree,
      curve: Curves.easeOutExpo,
      builder: (context, v, _) {
        return Text('${v.round()}${suffixe ?? ''}', style: style);
      },
    );
  }
}

/// Rétrécit légèrement au toucher, et revient.
///
/// Une carte qui ne bouge pas sous le doigt donne l'impression d'un écran
/// mort. Le retour élastique suffit à rendre l'ensemble vivant, sans
/// ralentir le geste.
class Pressable extends StatefulWidget {
  const Pressable({
    super.key,
    required this.child,
    required this.onTap,
    this.onLongPress,
    this.echelle = 0.96,
  });

  final Widget child;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  final double echelle;

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _appuye = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onLongPress: widget.onLongPress,
      onTapDown: (_) => setState(() => _appuye = true),
      onTapUp: (_) => setState(() => _appuye = false),
      onTapCancel: () => setState(() => _appuye = false),
      child: AnimatedScale(
        scale: _appuye ? widget.echelle : 1,
        duration: const Duration(milliseconds: 130),
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}
