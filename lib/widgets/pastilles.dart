import 'package:flutter/material.dart';

import '../config/theme.dart';

/// Une pastille.
///
/// Trois tons seulement : pleine pour ce qui doit sauter aux yeux, douce
/// pour le reste, verte pour un signal positif. Multiplier les variantes
/// reviendrait à n'en mettre aucune en avant.
enum TonPastille { pleine, douce, verte, sombre }

class Pastille extends StatelessWidget {
  const Pastille({
    super.key,
    required this.texte,
    this.ton = TonPastille.douce,
    this.icone,
    this.hauteur = 30,
    this.onTap,
  });

  final String texte;
  final TonPastille ton;
  final Widget? icone;
  final double hauteur;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final (fond, bordure, encre, graisse) = switch (ton) {
      TonPastille.pleine => (
          AppColors.brandGradient,
          const Color(0x24FFFFFF),
          const Color(0xFF12071F),
          FontWeight.w800,
        ),
      TonPastille.douce => (
          null,
          const Color(0x1FFFFFFF),
          AppColors.textPrimary.withValues(alpha: 0.88),
          FontWeight.w600,
        ),
      TonPastille.verte => (
          null,
          AppColors.success.withValues(alpha: 0.30),
          AppColors.success,
          FontWeight.w800,
        ),
      TonPastille.sombre => (
          null,
          const Color(0x2BFFFFFF),
          Colors.white,
          FontWeight.w700,
        ),
    };

    final couleurFond = switch (ton) {
      TonPastille.pleine => null,
      TonPastille.douce => const Color(0x0EFFFFFF),
      TonPastille.verte => AppColors.success.withValues(alpha: 0.14),
      TonPastille.sombre => const Color(0x610B0616),
    };

    final contenu = Container(
      height: hauteur,
      padding: EdgeInsets.symmetric(horizontal: icone == null ? 13 : 11),
      decoration: BoxDecoration(
        gradient: fond,
        color: couleurFond,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: bordure),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icone != null) ...[icone!, const SizedBox(width: 6)],
          Text(
            texte,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: graisse,
              color: encre,
            ),
          ),
        ],
      ),
    );

    if (onTap == null) return contenu;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: contenu,
    );
  }
}

/// La pastille « ajouter », en pointillés.
class PastilleAjout extends StatelessWidget {
  const PastilleAjout({super.key, required this.onTap, this.libelle});

  final VoidCallback onTap;
  final String? libelle;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: libelle ?? 'Ajouter une étiquette',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: Container(
          height: 30,
          width: libelle == null ? 30 : null,
          padding: libelle == null
              ? null
              : const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(
              color: const Color(0x3DFFFFFF),
              style: BorderStyle.solid,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.add_rounded,
                  size: 15, color: AppColors.textSecondary),
              if (libelle != null) ...[
                const SizedBox(width: 5),
                Text(
                  libelle!,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
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

/// Le badge de rang, en vert, sur la fiche.
///
/// Il ne dit que le rang : « N°1 ». Le total vit en haut du répertoire,
/// et une pastille courte ne déborde jamais, quelle que soit la largeur.
class BadgeRang extends StatelessWidget {
  const BadgeRang({super.key, required this.rang});

  final int rang;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 24,
      padding: const EdgeInsets.only(left: 7, right: 10),
      decoration: BoxDecoration(
        color: AppColors.success,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, size: 15, color: Color(0xFF12071F)),
          const SizedBox(width: 4),
          Text(
            'N°$rang',
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF12071F),
            ),
          ),
        ],
      ),
    );
  }
}
