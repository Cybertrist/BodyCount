import 'dart:math';

import 'package:flutter/material.dart';

import '../config/theme.dart';

/// Une part d'anneau.
class Part {
  const Part({required this.libelle, required this.valeur, required this.couleur});

  final String libelle;
  final int valeur;
  final Color couleur;
}

/// Un anneau de répartition, qui se dessine en tournant.
///
/// Préféré au camembert plein : le trou du milieu accueille le total, donc
/// la figure répond à deux questions au lieu d'une, et les parts fines
/// restent lisibles au lieu de se réduire à une pointe.
class Anneau extends StatelessWidget {
  const Anneau({
    super.key,
    required this.parts,
    this.diametre = 132,
    this.epaisseur = 18,
    this.centre,
    this.legende,
  });

  final List<Part> parts;
  final double diametre;
  final double epaisseur;

  /// Ce qui s'écrit au milieu.
  final Widget? centre;

  final String? legende;

  /// Les pourcentages, arrondis de façon à faire exactement cent.
  ///
  /// Arrondir chaque part dans son coin donnait « 44, 33, 22 », soit
  /// quatre-vingt-dix-neuf. La méthode du plus fort reste rend le point
  /// manquant à la part dont la décimale était la plus grande.
  static List<int> _pourcentages(List<Part> parts, int total) {
    if (total == 0) return List.filled(parts.length, 0);

    final exacts = [for (final p in parts) p.valeur * 100 / total];
    final bas = [for (final e in exacts) e.floor()];
    var reste = 100 - bas.fold<int>(0, (a, b) => a + b);

    final ordre = List.generate(parts.length, (i) => i)
      ..sort((a, b) => (exacts[b] - bas[b]).compareTo(exacts[a] - bas[a]));

    for (var i = 0; i < ordre.length && reste > 0; i++, reste--) {
      bas[ordre[i]]++;
    }
    return bas;
  }

  @override
  Widget build(BuildContext context) {
    final total = parts.fold<int>(0, (a, p) => a + p.valeur);
    final pourcents = _pourcentages(parts, total);

    return Row(
      children: [
        SizedBox(
          width: diametre,
          height: diametre,
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: const Duration(milliseconds: 900),
            curve: Curves.easeOutCubic,
            builder: (context, avancee, _) {
              return CustomPaint(
                painter: _PeintreAnneau(
                  parts: parts,
                  total: total,
                  epaisseur: epaisseur,
                  avancee: avancee,
                ),
                child: Center(child: centre),
              );
            },
          ),
        ),
        const SizedBox(width: 18),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final (index, part) in parts.indexed)
                Padding(
                  padding: const EdgeInsets.only(bottom: 9),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: part.couleur,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Text(
                          part.libelle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      Text(
                        total == 0 ? '—' : '${part.valeur} · ${pourcents[index]} %',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              if (legende != null)
                Text(
                  legende!,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textTertiary,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PeintreAnneau extends CustomPainter {
  _PeintreAnneau({
    required this.parts,
    required this.total,
    required this.epaisseur,
    required this.avancee,
  });

  final List<Part> parts;
  final int total;
  final double epaisseur;
  final double avancee;

  @override
  void paint(Canvas toile, Size taille) {
    final centre = Offset(taille.width / 2, taille.height / 2);
    final rayon = (min(taille.width, taille.height) - epaisseur) / 2;
    final boite = Rect.fromCircle(center: centre, radius: rayon);

    // Le creux, pour que l'anneau existe même quand il n'y a rien.
    toile.drawCircle(
      centre,
      rayon,
      Paint()
        ..color = Colors.white.withValues(alpha: 0.06)
        ..style = PaintingStyle.stroke
        ..strokeWidth = epaisseur,
    );

    if (total == 0) return;

    // On démarre en haut, et un petit écart sépare les parts : sans lui,
    // deux couleurs voisines se touchent et la limite disparaît.
    //
    // Bouts francs, et non arrondis. Un bout arrondi déborde de l'arc
    // d'un demi-trait à chaque extrémité, ce qui à cette épaisseur
    // représentait dix-huit degrés par part : la figure ne correspondait
    // plus aux pourcentages écrits à côté d'elle.
    const depart = -pi / 2;
    const ecart = 0.045;
    var angle = depart;

    for (final part in parts) {
      final portion = part.valeur / total * 2 * pi * avancee;
      if (portion <= ecart) {
        angle += portion;
        continue;
      }

      toile.drawArc(
        boite,
        angle + ecart / 2,
        portion - ecart,
        false,
        Paint()
          ..color = part.couleur
          ..style = PaintingStyle.stroke
          ..strokeWidth = epaisseur
          ..strokeCap = StrokeCap.butt,
      );
      angle += portion;
    }
  }

  @override
  bool shouldRepaint(_PeintreAnneau ancien) =>
      ancien.avancee != avancee || ancien.total != total;
}
