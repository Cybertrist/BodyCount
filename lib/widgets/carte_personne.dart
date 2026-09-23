import 'package:flutter/material.dart';

import '../config/theme.dart';
import '../domaine/personne.dart';
import '../security/vault_image.dart';
import 'animations.dart';
import 'etoiles.dart';

/// Une carte du répertoire.
///
/// Photo plein cadre, un dégradé sombre en bas pour que le nom reste
/// lisible quelle que soit l'image, et deux informations seulement : où,
/// et quelle note. Tout le reste attend la fiche.
class CartePersonne extends StatelessWidget {
  const CartePersonne({
    super.key,
    required this.fiche,
    required this.onTap,
    this.premier = false,
    this.selectionnee = false,
  });

  final FichePersonne fiche;
  final VoidCallback onTap;

  /// Première au classement : reçoit l'étoile verte.
  final bool premier;

  /// Ouverte dans le volet de droite, sur grand écran.
  final bool selectionnee;

  @override
  Widget build(BuildContext context) {
    final personne = fiche.personne;
    final photo = personne.photoPrincipale;

    return Pressable(
      onTap: onTap,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.card),
          // Pas de fond sur le conteneur qui découpe.
          //
          // Un Container qui porte une couleur et découpe son contenu en
          // lissant les bords mélange les deux sur la rangée de pixels du
          // contour : d'où le liseré mauve qui cernait chaque photo. Le
          // fond est donc posé à l'intérieur, sous l'image, où il ne
          // déborde de rien.
          border: Border.all(
            color: selectionnee
                ? AppColors.accent.withValues(alpha: 0.55)
                : const Color(0x12FFFFFF),
            width: selectionnee ? 1.6 : 1,
          ),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            const ColoredBox(color: Color(0xFF1B0C36)),

            // Pas de Hero : la vignette est presque carrée, l'en-tête de
            // la fiche occupe la moitié de l'écran, et le vol de l'une à
            // l'autre déformait la photo en un zoom désagréable. Seule la
            // carte qu'on venait d'ouvrir le faisait, d'où l'impression
            // qu'une carte ne se comportait pas comme les autres.
            if (photo != null)
              VaultImage(path: photo, fit: BoxFit.cover)
            else
              const _FondSansPhoto(),

            if (photo != null)
              const DecoratedBox(
                decoration: BoxDecoration(gradient: AppColors.photoGrade),
                child: SizedBox.expand(),
              ),

            const DecoratedBox(
              decoration: BoxDecoration(gradient: AppColors.photoScrim),
              child: SizedBox.expand(),
            ),

            Positioned(
              top: 12,
              left: 12,
              right: 12,
              height: 22,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _Etiquette(texte: _fois(fiche.nombreRencontres)),
                  // L'étoile du mieux noté, en or.
                  //
                  // Elle était verte, la couleur du logo, ce qui la
                  // faisait lire comme une validation plutôt que comme
                  // une distinction. L'or dit « celui-là sort du lot »
                  // sans avoir à l'expliquer, et rejoint le doré déjà
                  // employé pour l'argent et les jours remarquables.
                  if (premier)
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFFFDE68A), Color(0xFFE0A93F)],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.gold.withValues(alpha: 0.45),
                            blurRadius: 10,
                            spreadRadius: -2,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.star_rounded,
                          size: 13, color: Color(0xFF3A2606)),
                    ),
                ],
              ),
            ),

            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    personne.prenom,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 18,
                      height: 1.1,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (fiche.moyenne != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Etoiles(
                        demiPoints: fiche.moyenne!.round(),
                        taille: 13,
                      ),
                    ),
                  SizedBox(
                    height: 20,
                    child: Row(
                      children: [
                        if (personne.ville != null) ...[
                          const Icon(Icons.place_outlined,
                              size: 12, color: Color(0xFFC9BBE0)),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              personne.ville!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFFC9BBE0),
                              ),
                            ),
                          ),
                        ] else
                          const Spacer(),
                        const SizedBox(width: 6),
                        if (fiche.moyenne != null)
                          NoteChiffree(texte: fiche.moyenneAffichee),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _fois(int nombre) {
    if (nombre == 0) return 'jamais';
    return nombre == 1 ? '1 fois' : '$nombre fois';
  }
}

class _Etiquette extends StatelessWidget {
  const _Etiquette({required this.texte});

  final String texte;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 22,
      padding: const EdgeInsets.symmetric(horizontal: 9),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0x8F0B0616),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        texte,
        style: const TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
          color: Color(0xFFE9DEFF),
        ),
      ),
    );
  }
}

/// Fiche sans photo : un dégradé violet plutôt qu'un trou gris.
class _FondSansPhoto extends StatelessWidget {
  const _FondSansPhoto();

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(-0.4, -0.6),
          radius: 1.3,
          colors: [Color(0xFF6D28D9), Color(0xFF3730A3), Color(0xFF1E1147)],
          stops: [0.0, 0.58, 1.0],
        ),
      ),
      child: SizedBox.expand(),
    );
  }
}
