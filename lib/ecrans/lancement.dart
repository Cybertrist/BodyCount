import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../config/theme.dart';
import '../donnees/coordonnees.dart';

/// Le lancement : ce qui se voit entre l'icône touchée et l'écran
/// d'ouverture.
///
/// Android pose d'abord son propre écran, l'icône au centre sur le fond de
/// l'application. Celui-ci prend le relais avec le même logo au même
/// endroit, puis l'anime : un anneau qui se trace, le nom qui monte, et,
/// si le chargement traîne, l'anneau qui tourne en attendant. Il ne se
/// retire qu'une fois les communes lues, et jamais avant une seconde et
/// demie : plus court, l'animation passerait pour un clignotement.
class Lancement {
  Lancement._();

  static final _fini = Completer<void>();

  /// Se termine quand l'animation s'est retirée. L'écran d'ouverture
  /// attend ce moment pour demander l'empreinte : la fenêtre du système
  /// par dessus l'animation la couperait en plein milieu.
  static Future<void> get termine => _fini.future;

  static bool get estTermine => _fini.isCompleted;

  static void _terminer() {
    if (!_fini.isCompleted) _fini.complete();
  }
}

class AnimationLancement extends StatefulWidget {
  const AnimationLancement({super.key});

  @override
  State<AnimationLancement> createState() => _AnimationLancementState();
}

class _AnimationLancementState extends State<AnimationLancement>
    with TickerProviderStateMixin {
  /// L'entrée, jouée une fois.
  late final AnimationController _entree = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..forward();

  /// La rotation de l'anneau, en boucle, le temps qu'il faut.
  late final AnimationController _attente = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2400),
  )..repeat();

  /// La sortie : le logo et le titre gagnent leur place sur l'écran
  /// d'ouverture, puis le fond s'efface.
  late final AnimationController _sortie = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 760),
  );

  /// Déjà joué dans ce processus : l'activité a été recréée, pas
  /// l'application relancée. On ne rejoue pas.
  bool _parti = Lancement.estTermine;

  @override
  void initState() {
    super.initState();
    if (!_parti) _attendre();
  }

  Future<void> _attendre() async {
    await Future.wait([
      Future<void>.delayed(const Duration(milliseconds: 1500)),
      // Un référentiel illisible ne doit pas bloquer l'ouverture : la
      // carte s'en passera, l'application non.
      chargerCommunes().catchError((_) {}),
    ]);
    if (!mounted) return;
    await _sortie.forward();
    if (!mounted) return;
    setState(() => _parti = true);
    Lancement._terminer();
  }

  @override
  void dispose() {
    _entree.dispose();
    _attente.dispose();
    _sortie.dispose();
    // Si l'arbre part avant la fin, l'écran d'ouverture ne doit pas rester
    // à attendre pour toujours.
    Lancement._terminer();
    super.dispose();
  }

  /// Une portion de l'entrée, ramenée entre 0 et 1.
  double _phase(
    double debut,
    double fin, [
    Curve courbe = Curves.easeOutCubic,
  ]) {
    final t = ((_entree.value - debut) / (fin - debut)).clamp(0.0, 1.0);
    return courbe.transform(t);
  }

  /// Une portion de la sortie, ramenée entre 0 et 1.
  double _sortieEntre(
    double debut,
    double fin, [
    Curve courbe = Curves.linear,
  ]) {
    final t = ((_sortie.value - debut) / (fin - debut)).clamp(0.0, 1.0);
    return courbe.transform(t);
  }

  @override
  Widget build(BuildContext context) {
    if (_parti) return const SizedBox.shrink();

    final taille = MediaQuery.sizeOf(context);
    final haut = MediaQuery.paddingOf(context).top;

    // Où l'écran d'ouverture pose son logo et son titre. Les mêmes valeurs
    // que lui : c'est ce qui rend le passage invisible.
    final court = taille.height < 800;
    final logoCible = court ? 92.0 : 108.0;
    final logoCibleHaut = haut + (court ? 48 : 90);
    final titreCibleHaut = logoCibleHaut + logoCible + 26;
    final titreCibleTaille = court ? 36.0 : 42.0;

    // Au départ, le logo est au centre de l'écran, là où Android a posé
    // l'icône de démarrage, et à la même taille qu'elle.
    const logoDepart = 112.0;
    final logoDepartHaut = taille.height / 2 - logoDepart / 2;
    final titreDepartHaut = taille.height / 2 + 88 + 30;

    // Un Material transparent au dessus : l'animation vit hors des écrans,
    // et un texte sans lui prend le style de secours, souligné de jaune.
    return IgnorePointer(
      ignoring: _sortie.isAnimating,
      child: Material(
        type: MaterialType.transparency,
        child: AnimatedBuilder(
          animation: Listenable.merge([_entree, _attente, _sortie]),
          builder: (context, _) {
            final logo = _phase(0.0, 0.42, Curves.easeOutBack);
            final anneau = _phase(0.12, 0.72);
            final titre = _phase(0.38, 0.72);
            final sousTitre = _phase(0.55, 0.9);
            final halo = _phase(0.0, 0.6);

            // La sortie en trois temps : l'anneau et la phrase s'effacent, le
            // logo et le titre glissent jusqu'à leur place sur l'écran
            // d'ouverture, puis le fond disparaît sur un écran identique.
            final efface = _sortieEntre(0.0, 0.35, Curves.easeOut);
            final glisse = _sortieEntre(0.0, 0.78, Curves.easeInOutCubic);
            final fond = _sortieEntre(0.8, 1.0);

            final cote = lerpDouble(logoDepart, logoCible, glisse)!;
            final logoHaut = lerpDouble(logoDepartHaut, logoCibleHaut, glisse)!;
            final titreHaut = lerpDouble(
              titreDepartHaut,
              titreCibleHaut,
              glisse,
            )!;
            final titreTaille = lerpDouble(38, titreCibleTaille, glisse)!;
            final centreLogo = logoHaut + cote / 2;

            return Opacity(
              opacity: 1 - fond,
              child: ColoredBox(
                color: AppColors.background,
                child: Stack(
                  children: [
                    // Les deux halos de l'écran d'ouverture, qui montent
                    // doucement : il les retrouve à leur place.
                    Positioned(
                      top: -150,
                      left: -110,
                      child: _Halo(
                        taille: 420,
                        couleur: AppColors.primary.withValues(
                          alpha: 0.30 * halo,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: -180,
                      right: -120,
                      child: _Halo(
                        taille: 440,
                        couleur: AppColors.accent.withValues(
                          alpha: 0.22 * halo,
                        ),
                      ),
                    ),

                    // L'anneau reste centré sur le logo pendant qu'il monte.
                    Positioned(
                      left: taille.width / 2 - 88,
                      top: centreLogo - 88,
                      width: 176,
                      height: 176,
                      child: Opacity(
                        opacity: 1 - efface,
                        child: CustomPaint(
                          painter: _Anneau(
                            trace: anneau,
                            rotation: _attente.value,
                          ),
                        ),
                      ),
                    ),

                    Positioned(
                      left: taille.width / 2 - cote / 2,
                      top: logoHaut,
                      width: cote,
                      height: cote,
                      child: Opacity(
                        // Pas de départ à zéro : Android vient de montrer
                        // l'icône, elle ne doit pas disparaître pour
                        // réapparaître.
                        opacity: (0.45 + 0.55 * logo).clamp(0.0, 1.0),
                        child: Transform.scale(
                          scale: (0.86 + 0.14 * logo) * (1 - glisse) + glisse,
                          child: _Logo(cote: cote, lueur: halo),
                        ),
                      ),
                    ),

                    Positioned(
                      left: 0,
                      right: 0,
                      top: titreHaut,
                      child: Opacity(
                        opacity: titre,
                        child: Transform.translate(
                          offset: Offset(0, 14 * (1 - titre)),
                          child: Text(
                            'BodyCount',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineLarge
                                ?.copyWith(
                                  fontSize: titreTaille,
                                  // Les lettres se resserrent en arrivant,
                                  // comme un titre qui se met au point.
                                  letterSpacing: 6 * (1 - titre),
                                ),
                          ),
                        ),
                      ),
                    ),

                    Positioned(
                      left: 0,
                      right: 0,
                      top: titreDepartHaut + 58,
                      child: Opacity(
                        opacity: sousTitre * (1 - efface),
                        child: const Text(
                          'Journal chiffré, hors ligne',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo({required this.cote, required this.lueur});

  final double cote;
  final double lueur;

  @override
  Widget build(BuildContext context) {
    // Le même arrondi que l'écran d'ouverture, proportionnel à la taille.
    final rayon = cote * 30 / 108;
    return Container(
      width: cote,
      height: cote,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(rayon),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.34 * lueur),
            blurRadius: 44,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(rayon),
        child: Image.asset(
          'assets/logo.png',
          fit: BoxFit.cover,
          filterQuality: FilterQuality.medium,
        ),
      ),
    );
  }
}

/// L'anneau autour du logo : il se trace d'abord, du violet au fuchsia,
/// puis tourne sur lui même tant qu'on attend. Une petite bille lumineuse
/// marque sa tête, pour que la rotation se lise.
class _Anneau extends CustomPainter {
  _Anneau({required this.trace, required this.rotation});

  final double trace;
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    if (trace <= 0) return;
    final centre = size.center(Offset.zero);
    final rayon = size.width / 2 - 6;
    final cadre = Rect.fromCircle(center: centre, radius: rayon);
    final depart = -math.pi / 2 + rotation * 2 * math.pi;
    final balayage = 2 * math.pi * 0.82 * trace;

    // Le fond de l'anneau, à peine visible.
    canvas.drawCircle(
      centre,
      rayon,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = Colors.white.withValues(alpha: 0.05 * trace),
    );

    final trait = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        startAngle: 0,
        endAngle: 2 * math.pi,
        transform: GradientRotation(depart),
        colors: [
          AppColors.primary.withValues(alpha: 0),
          AppColors.primary,
          AppColors.accent,
        ],
        stops: const [0.0, 0.45, 0.82],
      ).createShader(cadre);
    canvas.drawArc(cadre, depart, balayage, false, trait);

    // La tête de l'anneau.
    final angle = depart + balayage;
    final tete = centre + Offset(math.cos(angle), math.sin(angle)) * rayon;
    canvas.drawCircle(
      tete,
      9,
      Paint()..color = AppColors.accent.withValues(alpha: 0.22 * trace),
    );
    canvas.drawCircle(tete, 3.4, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_Anneau ancien) =>
      ancien.trace != trace || ancien.rotation != rotation;
}

class _Halo extends StatelessWidget {
  const _Halo({required this.taille, required this.couleur});

  final double taille;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: taille,
      height: taille,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [couleur, couleur.withValues(alpha: 0)],
          stops: const [0.0, 0.72],
        ),
      ),
    );
  }
}
