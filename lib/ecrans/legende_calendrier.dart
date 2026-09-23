import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../widgets/titre_ecran.dart';

/// La légende des signes du calendrier.
///
/// Un calendrier semé de pictogrammes dont on a oublié le sens est un
/// calendrier illisible. Celle-ci s'ouvre par le point d'interrogation de
/// l'en-tête, et dit exactement ce qui déclenche chaque signe : pas « une
/// bonne soirée » mais « une note de cinq sur cinq », pour qu'on sache
/// quoi saisir si on veut le voir apparaître.
class LegendeCalendrier extends StatelessWidget {
  const LegendeCalendrier({super.key});

  /// Ouvre la légende, dans la coque des onglets.
  ///
  /// C'était d'abord une feuille glissée depuis le bas, puis une page
  /// poussée par dessus tout : dans les deux cas la barre de navigation
  /// était recouverte, et changer d'onglet demandait de refermer d'abord.
  /// Ici la légende s'affiche à la place du contenu, la barre reste
  /// vivante, et la flèche de retour ramène au calendrier.
  static void ouvrir(BuildContext context) => context.push('/legende');

  /// Chaque famille, avec sa teinte, ses signes et ce qui les déclenche.
  static const _familles = <(String, Color, List<(String, String)>)>[
    (
      'Argent',
      AppColors.gold,
      [
        ('🤑', 'Ton meilleur montant de l\'année'),
        ('💰', 'Plus de 100 €'),
        ('💵', 'La soirée a rapporté quelque chose'),
      ],
    ),
    (
      'Note',
      AppColors.accentLight,
      [
        ('👑', 'La meilleure note du mois'),
        ('⭐', 'Un cinq sur cinq'),
      ],
    ),
    (
      'Qui',
      AppColors.accent,
      [
        ('✨', 'Une première fois avec cette personne'),
        ('❤️', 'La cinquième fois avec la même'),
        ('🎂', 'Un an jour pour jour après la première fois'),
      ],
    ),
    (
      'Rythme',
      AppColors.primary,
      [
        ('🔥', 'Trois jours d\'affilée'),
        ('🏁', 'La première rencontre de l\'année'),
        ('📅', 'Le jour le plus chargé du mois'),
      ],
    ),
    (
      'Heure',
      Color(0xFF818CF8),
      [
        ('🌙', 'Étiquette « Toute la nuit »'),
        ('🌅', 'Commencé entre 6 h et 10 h'),
        ('🌃', 'Commencé entre minuit et 6 h'),
        ('🕐', 'Commencé avant 18 h'),
        ('⚡', 'Étiquette « Rapide »'),
      ],
    ),
    (
      'Lieu',
      Color(0xFF5EEAD4),
      [
        ('✈️', 'À plus de 200 km de ta ville principale'),
        ('🏖️', 'Étiquette « En vacances »'),
        ('🚗', 'Étiquette « Dans une voiture »'),
        ('🌲', 'Étiquette « Dehors »'),
        ('🏠', 'Étiquette « Chez moi »'),
        ('🛏️', 'Étiquette « Chez lui » ou « Chez elle »'),
      ],
    ),
    (
      'Rôle',
      Color(0xFFF87171),
      [
        ('🍆', 'Fiche marquée actif'),
        ('🍑', 'Fiche marquée passif'),
        ('♾️', 'Fiche marquée versatile'),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _EnTete(onFermer: () => context.pop()),
            const Divider(height: 1, color: AppColors.cardBorder),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 18, 22, 130),
                children: [
                  const _Preambule(),
                  const SizedBox(height: 20),
                  for (final (titre, teinte, signes) in _familles)
                    _Famille(titre: titre, teinte: teinte, signes: signes),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Le titre, et la flèche de retour.
class _EnTete extends StatelessWidget {
  const _EnTete({required this.onFermer});

  final VoidCallback onFermer;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 8, 12, 14),
      child: Row(
        children: [
          IconButton(
            onPressed: onFermer,
            tooltip: 'Retour',
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 19),
          ),
          const SizedBox(width: 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const TitreEcran('Légende'),
                const SizedBox(height: 3),
                Text(
                  'Les signes du calendrier',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// La règle du jeu, avant la liste.
class _Preambule extends StatelessWidget {
  const _Preambule();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(15, 13, 15, 14),
      decoration: BoxDecoration(
        color: const Color(0x0BFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Regle(
            icone: Icons.filter_3_rounded,
            texte: 'Trois signes au maximum par jour, les plus rares '
                'd\'abord. Deux sur une ligne de la liste.',
          ),
          SizedBox(height: 11),
          _Regle(
            icone: Icons.circle,
            teinte: AppColors.gold,
            texte: 'Un disque doré veut dire que la soirée a rapporté '
                'quelque chose.',
          ),
        ],
      ),
    );
  }
}

class _Regle extends StatelessWidget {
  const _Regle({
    required this.icone,
    required this.texte,
    this.teinte = AppColors.textTertiary,
  });

  final IconData icone;
  final String texte;
  final Color teinte;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Icon(icone, size: 14, color: teinte),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            texte,
            style: const TextStyle(
              fontSize: 12.5,
              height: 1.45,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

/// Une famille de signes, avec sa barre de couleur.
class _Famille extends StatelessWidget {
  const _Famille({
    required this.titre,
    required this.teinte,
    required this.signes,
  });

  final String titre;
  final Color teinte;
  final List<(String, String)> signes;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 3,
                height: 13,
                decoration: BoxDecoration(
                  color: teinte,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 9),
              Text(titre.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall),
            ],
          ),
          const SizedBox(height: 11),
          for (final (signe, sens) in signes)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  // Le signe dans une tuile, et non posé à même le fond :
                  // les emojis n'ont pas tous la même largeur, donc sans
                  // tuile les textes qui suivent ne s'alignent pas.
                  Container(
                    width: 34,
                    height: 34,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: teinte.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(11),
                      border: Border.all(
                        color: teinte.withValues(alpha: 0.18),
                      ),
                    ),
                    child: Text(signe, style: const TextStyle(fontSize: 15)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      sens,
                      style: const TextStyle(
                        fontSize: 13.5,
                        height: 1.35,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
