import 'package:flutter/material.dart';

import '../config/theme.dart';

/// Une note, en étoiles.
///
/// Les demi-points sont rendus par une étoile coupée en deux, et non
/// arrondis à l'entier : afficher quatre étoiles pleines pour un 3,5
/// mentirait sur la seule donnée que l'application sert à garder.
///
/// Les étoiles apparaissent l'une après l'autre au premier affichage,
/// avec un rebond. C'est court, et ça donne du poids à la note.
class Etoiles extends StatelessWidget {
  const Etoiles({
    super.key,
    required this.demiPoints,
    this.taille = 14,
    this.espace = 1,
    this.anime = true,
    this.couleur = AppColors.star,
  });

  /// De 0 à 10.
  final int? demiPoints;

  final double taille;
  final double espace;
  final bool anime;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    final note = demiPoints ?? 0;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < 5; i++)
          Padding(
            padding: EdgeInsets.only(right: i == 4 ? 0 : espace),
            child: _Etoile(
              part: ((note - i * 2).clamp(0, 2)) / 2,
              taille: taille,
              couleur: couleur,
              rang: i,
              anime: anime,
            ),
          ),
      ],
    );
  }
}

class _Etoile extends StatelessWidget {
  const _Etoile({
    required this.part,
    required this.taille,
    required this.couleur,
    required this.rang,
    required this.anime,
  });

  final double part;
  final double taille;
  final Color couleur;
  final int rang;
  final bool anime;

  @override
  Widget build(BuildContext context) {
    final etoile = Stack(
      children: [
        Icon(Icons.star_rounded,
            size: taille, color: Colors.white.withValues(alpha: 0.13)),
        if (part > 0)
          ClipRect(
            clipper: _Coupe(part),
            child: Icon(Icons.star_rounded, size: taille, color: couleur),
          ),
      ],
    );

    if (!anime || part == 0) return etoile;

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 260 + rang * 70),
      curve: Curves.elasticOut,
      builder: (context, v, enfant) {
        return Transform.scale(scale: 0.4 + 0.6 * v, child: enfant);
      },
      child: etoile,
    );
  }
}

class _Coupe extends CustomClipper<Rect> {
  const _Coupe(this.part);

  final double part;

  @override
  Rect getClip(Size taille) =>
      Rect.fromLTWH(0, 0, taille.width * part, taille.height);

  @override
  bool shouldReclip(_Coupe ancien) => ancien.part != part;
}

/// La note en chiffre, avec une étoile devant.
class NoteChiffree extends StatelessWidget {
  const NoteChiffree({
    super.key,
    required this.texte,
    this.taille = 12,
    this.fond,
  });

  final String texte;
  final double taille;
  final Color? fond;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: taille + 8,
      padding: EdgeInsets.symmetric(horizontal: taille * 0.6),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: fond ?? const Color(0x26FFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.star_rounded, size: taille, color: AppColors.gold),
          SizedBox(width: taille * 0.22),
          Text(
            texte,
            style: TextStyle(
              fontSize: taille,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
