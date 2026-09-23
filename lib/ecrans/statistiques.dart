import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/layout.dart';
import '../config/theme.dart';
import '../domaine/personne.dart';
import '../donnees/statistiques.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../widgets/anneau.dart';
import '../widgets/animations.dart';
import '../widgets/titre_ecran.dart';
import '../widgets/etoiles.dart';
import '../widgets/echec.dart';

/// Les statistiques.
///
/// Trois questions, trois blocs : combien cette année, à quel rythme, et
/// qui sort du lot. Rien d'autre, parce qu'un écran de chiffres auquel on
/// ne sait pas quoi demander ne sert à rien.
class EcranStatistiques extends ConsumerWidget {
  const EcranStatistiques({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(statistiquesProvider);
    final marge = AppLayout.gutter(context);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: stats.when(
          loading: () =>
              const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
          error: (e, _) => Echec(titre: 'Impossible de lire les statistiques', erreur: e),
          data: (valeur) => ListView(
            padding: EdgeInsets.fromLTRB(marge, 10, marge, 130),
            children: [
              _EnTete(annee: valeur.annee),
              const SizedBox(height: 16),
              // Du plus général au plus particulier : combien, avec qui,
              // ce que ça a rapporté, à quel rythme, et pour finir la
              // répartition des rôles. Le podium remontait après le
              // graphique mensuel, ce qui coupait la question « qui » en
              // deux moitiés éloignées.
              Apparition(rang: 0, child: _Total(stats: valeur)),
              const SizedBox(height: 14),
              Apparition(rang: 1, child: _Podium(stats: valeur)),
              if (valeur.aGagne) ...[
                const SizedBox(height: 14),
                Apparition(rang: 2, child: _Gains(stats: valeur)),
              ],
              const SizedBox(height: 14),
              Apparition(rang: 3, child: _ParMois(stats: valeur)),
              if (valeur.parRole.isNotEmpty) ...[
                const SizedBox(height: 14),
                Apparition(rang: 4, child: _Roles(stats: valeur)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _EnTete extends ConsumerWidget {
  const _EnTete({required this.annee});

  final int annee;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final annees = ref.watch(anneesProvider).valueOrNull ?? [annee];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const TitreEcran('Statistiques'),
        const SizedBox(height: 3),
        // Toujours l'année, jamais « Cette année ». Les pastilles
        // dessous disent 2026 et 2025 : lire « Cette année » au dessus de
        // « 2026 » oblige à faire le rapprochement soi même.
        Text('$annee', style: Theme.of(context).textTheme.headlineLarge),
        if (annees.length > 1) ...[
          const SizedBox(height: 15),
          _ChoixAnnee(annees: annees, choisie: annee),
        ],
      ],
    );
  }
}

/// Le choix de l'année, en pastilles.
///
/// C'était un menu déroulant Material, c'est-à-dire un rectangle gris
/// posé par-dessus l'écran, sans rien de la palette autour. Ici les
/// années sont visibles d'un coup d'œil et se choisissent d'un seul
/// geste : il y en a deux ou trois, un menu n'avait rien à cacher.
class _ChoixAnnee extends ConsumerWidget {
  const _ChoixAnnee({required this.annees, required this.choisie});

  final List<int> annees;
  final int choisie;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 34,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: annees.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) => _Pastille(
          annee: annees[i],
          actif: annees[i] == choisie,
          onTap: () => ref.read(anneeProvider.notifier).state = annees[i],
        ),
      ),
    );
  }
}

class _Pastille extends StatelessWidget {
  const _Pastille({
    required this.annee,
    required this.actif,
    required this.onTap,
  });

  final int annee;
  final bool actif;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(horizontal: 17),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: actif ? AppColors.brandGradient : null,
          color: actif ? null : const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(
            color: actif ? Colors.transparent : AppColors.cardBorder,
          ),
          boxShadow: actif
              ? [
                  BoxShadow(
                    color: AppColors.accent.withValues(alpha: 0.32),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Text(
          '$annee',
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.3,
            color: actif ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

/// Ce que l'année a rapporté.
///
/// La carte n'apparaît que s'il y a quelque chose à montrer : un bloc
/// « 0 € » sur un écran de statistiques ne renseigne personne, et pose
/// une question à quelqu'un qui ne se la posait pas.
class _Gains extends StatefulWidget {
  const _Gains({required this.stats});

  final Statistiques stats;

  @override
  State<_Gains> createState() => _GainsState();
}

class _GainsState extends State<_Gains> with SingleTickerProviderStateMixin {
  /// Le reflet qui traverse la carte. Lent et espacé : un éclat qui
  /// repasse toutes les secondes se lit comme un défaut d'affichage.
  late final AnimationController _reflet = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 3400),
  )..repeat();

  @override
  void dispose() {
    _reflet.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stats = widget.stats;
    final variation = stats.variationGain;

    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.card),
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 17, 20, 18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.card),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF2A1E3A), Color(0xFF1C1428)],
              ),
              border: Border.all(
                color: AppColors.gold.withValues(alpha: 0.24),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('💵', style: TextStyle(fontSize: 14)),
                    const SizedBox(width: 8),
                    Text('CE QUE ÇA A RAPPORTÉ',
                        style: Theme.of(context).textTheme.labelSmall),
                    const Spacer(),
                    if (variation != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                        ),
                        child: Text(
                          '${variation >= 0 ? '+' : ''}${variation.round()} %',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            color: AppColors.gold,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 13),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Le montant se compte depuis zéro. Sur une somme, le
                    // décompte dit quelque chose que le chiffre seul ne dit
                    // pas : qu'elle s'est accumulée.
                    TweenAnimationBuilder<int>(
                      tween: IntTween(begin: 0, end: stats.gainCentimes),
                      duration: const Duration(milliseconds: 1100),
                      curve: Curves.easeOutCubic,
                      builder: (context, valeur, _) => Text(
                        Statistiques.eurosAffiches(valeur),
                        style: const TextStyle(
                          fontSize: 34,
                          height: 1,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -1,
                          color: AppColors.gold,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          stats.gainMoyenAffiche,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'en moyenne',
                          style: Theme.of(context).textTheme.labelSmall,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _Jauge(stats: stats),
                const SizedBox(height: 9),
                Text(
                  stats.rencontresPayees <= 1
                      ? 'sur 1 soirée, des ${stats.totalRencontres} de l\'année'
                      : 'sur ${stats.rencontresPayees} soirées, des '
                          '${stats.totalRencontres} de l\'année',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Le reflet, posé par dessus et hors du chemin des doigts.
          Positioned.fill(
            child: IgnorePointer(
              child: AnimatedBuilder(
                animation: _reflet,
                builder: (context, _) {
                  // Il ne traverse que le premier tiers du cycle : le
                  // reste du temps, la carte est au repos.
                  final t = _reflet.value;
                  if (t > 0.34) return const SizedBox.shrink();
                  final avance = t / 0.34;

                  return FractionalTranslation(
                    translation: Offset(-1.2 + avance * 2.4, 0),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.transparent,
                            AppColors.gold.withValues(
                              alpha: 0.13 * sin(avance * pi),
                            ),
                            Colors.transparent,
                          ],
                          stops: const [0.36, 0.5, 0.64],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// La part des soirées qui ont rapporté, en une barre.
///
/// Le chiffre seul ne dit pas si c'est une fois sur trois ou une fois
/// sur vingt, et c'est pourtant la première chose qu'on veut savoir.
class _Jauge extends StatelessWidget {
  const _Jauge({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context) {
    final part = stats.totalRencontres == 0
        ? 0.0
        : stats.rencontresPayees / stats.totalRencontres;

    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: part.clamp(0.0, 1.0)),
        duration: const Duration(milliseconds: 900),
        curve: Curves.easeOutCubic,
        builder: (context, valeur, _) => LinearProgressIndicator(
          value: valeur,
          minHeight: 5,
          backgroundColor: Colors.white.withValues(alpha: 0.07),
          valueColor: const AlwaysStoppedAnimation(AppColors.gold),
        ),
      ),
    );
  }
}

class _Total extends StatelessWidget {
  const _Total({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context) {
    final variation = stats.variation;

    return Container(
      padding: const EdgeInsets.fromLTRB(22, 20, 20, 22),
      decoration: BoxDecoration(
        color: const Color(0x0BFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AU TOTAL',
                    style: Theme.of(context).textTheme.labelSmall),
                const SizedBox(height: 10),
                // Le dégradé est peint à travers le chiffre plutôt que
                // derrière lui : la couleur reste, la surface disparaît.
                ShaderMask(
                  shaderCallback: (cadre) => const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFE9D5FF), Color(0xFFA855F7)],
                  ).createShader(cadre),
                  child: Compteur(
                    valeur: stats.totalRencontres,
                    style: const TextStyle(
                      fontSize: 58,
                      height: 0.92,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -2.4,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  // En tête de phrase, donc une majuscule.
                  '${stats.totalRencontres <= 1 ? 'Rencontre' : 'Rencontres'}'
                  ' · ${stats.totalPersonnes} '
                  '${stats.totalPersonnes <= 1 ? 'personne' : 'personnes'}',
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (variation != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
                  decoration: BoxDecoration(
                    color: (variation >= 0
                            ? AppColors.success
                            : AppColors.textTertiary)
                        .withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        variation >= 0
                            ? Icons.trending_up_rounded
                            : Icons.trending_down_rounded,
                        size: 14,
                        color: variation >= 0
                            ? AppColors.success
                            : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        '${variation >= 0 ? '+' : ''}${variation.round()} %',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color: variation >= 0
                              ? AppColors.success
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'vs ${stats.annee - 1}',
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _ParMois extends StatelessWidget {
  const _ParMois({required this.stats});

  final Statistiques stats;

  static const _lettres = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  static const _noms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  @override
  Widget build(BuildContext context) {
    final valeurs = stats.parMois;
    final max = valeurs.fold<int>(0, (a, b) => b > a ? b : a);
    final meilleur = stats.moisLePlusCharge;

    return _Panneau(
      titre: 'Par mois',
      // « Septembre, 18 » se lisait comme une date, le 18 septembre. Ce
      // sont pourtant deux choses sans rapport : le mois le plus chargé,
      // et combien de fois. Le mot manquant lève l'ambiguïté.
      complement: max == 0
          ? null
          : '${_noms[meilleur]} · ${valeurs[meilleur]} fois',
      enfant: SizedBox(
        height: 108,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            for (var i = 0; i < 12; i++)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween(
                          begin: 0,
                          end: max == 0 ? 8 : (valeurs[i] / max) * 78 + 8,
                        ),
                        duration: Duration(milliseconds: 500 + i * 45),
                        curve: Curves.easeOutBack,
                        builder: (context, hauteur, _) => Container(
                        height: hauteur < 4 ? 4 : hauteur,
                        decoration: BoxDecoration(
                          gradient: i == meilleur && max > 0
                              ? const LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    AppColors.accent,
                                    AppColors.primary
                                  ],
                                )
                              : null,
                          color: i == meilleur && max > 0
                              ? null
                              : AppColors.primary.withValues(
                                  alpha: valeurs[i] > max * 0.5 ? 0.58 : 0.22,
                                ),
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _lettres[i],
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Podium extends StatelessWidget {
  const _Podium({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context) {
    final podium = stats.podium;
    if (podium.isEmpty) {
      return _Panneau(
        titre: 'Les mieux notés',
        enfant: const Padding(
          padding: EdgeInsets.symmetric(vertical: 18),
          child: Text(
            'Personne n\'est encore noté.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
      );
    }

    // L'ordre visuel du podium met le premier au milieu.
    final ordre = <FichePersonne?>[
      podium.length > 1 ? podium[1] : null,
      podium[0],
      podium.length > 2 ? podium[2] : null,
    ];
    const hauteurs = [112.0, 148.0, 94.0];
    const rangs = [2, 1, 3];

    return _Panneau(
      titre: 'Les mieux notés',
      enfant: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < 3; i++)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 5),
                child: ordre[i] == null
                    ? const SizedBox.shrink()
                    : _Marche(
                        fiche: ordre[i]!,
                        rang: rangs[i],
                        hauteur: hauteurs[i],
                      ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Marche extends StatelessWidget {
  const _Marche({
    required this.fiche,
    required this.rang,
    required this.hauteur,
  });

  final FichePersonne fiche;
  final int rang;
  final double hauteur;

  @override
  Widget build(BuildContext context) {
    final photo = fiche.personne.photoPrincipale;
    final premier = rang == 1;

    return InkWell(
      onTap: () => context.push('/personne/${fiche.personne.id}'),
      borderRadius: BorderRadius.circular(AppRadius.panel),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: hauteur,
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: const Color(0xFF1B0C36),
              borderRadius: BorderRadius.circular(AppRadius.panel),
              boxShadow: premier
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.34),
                        blurRadius: 34,
                        offset: const Offset(0, 14),
                      ),
                    ]
                  : null,
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (photo != null) VaultImage(path: photo),
                if (photo != null)
                  const DecoratedBox(
                    decoration: BoxDecoration(gradient: AppColors.photoGrade),
                  ),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: [0.0, 0.34, 1.0],
                      colors: [
                        Color(0x570B0616),
                        Color(0x000B0616),
                        Color(0xE00B0616),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    width: 24,
                    height: 24,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      gradient: premier ? AppColors.brandGradient : null,
                      color: premier ? null : const Color(0x9E0B0616),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0x38FFFFFF)),
                    ),
                    child: Text(
                      '$rang',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color:
                            premier ? const Color(0xFF12071F) : Colors.white,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 8,
                  child: Column(
                    children: [
                      Etoiles(
                        demiPoints: fiche.moyenne?.round(),
                        taille: premier ? 13 : 11,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        fiche.moyenneAffichee,
                        style: TextStyle(
                          fontSize: premier ? 15 : 13,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            fiche.personne.prenom,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFFE2D8F2),
            ),
          ),
          const SizedBox(height: 1),
          Text(
            '${fiche.nombreRencontres} fois',
            style: const TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }
}

/// La répartition des rôles, en anneau.
///
/// Comptée en personnes et non en rencontres : savoir avec qui on couche
/// dit quelque chose, savoir combien de fois dit autre chose.
class _Roles extends StatelessWidget {
  const _Roles({required this.stats});

  final Statistiques stats;

  /// Trois teintes voisines plutôt que trois couleurs qui se battent.
  ///
  /// C'était fuchsia, violet et vert fluo : deux d'entre elles sortaient
  /// de la palette et le vert arrachait l'œil au milieu d'un écran
  /// sombre. Ici les trois se suivent du violet au turquoise, se
  /// distinguent sans effort, et l'anneau cesse d'être le seul objet de
  /// l'écran qu'on regarde.
  /// Rouge, vert, bleu : trois couleurs qu'on distingue sans réfléchir,
  /// y compris du coin de l'œil, et qui ne reprennent pas le violet du
  /// reste de l'écran. Des tons adoucis plutôt que primaires : sur un
  /// fond noir, un rouge et un vert purs vibrent et fatiguent.
  static const _couleurs = {
    'actif': Color(0xFFF87171),
    'passif': Color(0xFF60A5FA),
    'versatile': Color(0xFF34D399),
  };

  @override
  Widget build(BuildContext context) {
    final parts = [
      for (final ligne in stats.parRole)
        Part(
          libelle: RoleSexuel.depuisCode(ligne.role)?.libelle ?? ligne.role,
          valeur: ligne.nombre,
          couleur: _couleurs[ligne.role] ?? AppColors.primary,
        ),
    ];
    final total = parts.fold<int>(0, (a, p) => a + p.valeur);

    return _Panneau(
      titre: 'Répartition',
      enfant: Anneau(
        parts: parts,
        centre: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Compteur(
              valeur: total,
              style: const TextStyle(
                fontSize: 26,
                height: 1,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              total <= 1 ? 'fiche' : 'fiches',
              style: const TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
        legende: 'Sur les fiches où le rôle est renseigné.',
      ),
    );
  }
}

class _Panneau extends StatelessWidget {
  const _Panneau({
    required this.titre,
    required this.enfant,
    this.complement,
  });

  final String titre;
  final Widget enfant;
  final String? complement;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: const Color(0x0BFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(titre.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall),
              if (complement != null)
                Text(
                  complement!,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFC2B5D9),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 15),
          enfant,
        ],
      ),
    );
  }
}
