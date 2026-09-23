import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/layout.dart';
import '../config/theme.dart';
import '../domaine/personne.dart';
import '../donnees/statistiques.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../widgets/animations.dart';
import '../widgets/titre_ecran.dart';
import '../widgets/plan_france.dart';
import '../widgets/echec.dart';

/// Les lieux.
///
/// Ce n'est pas une carte routière, et c'est assumé. Charger des tuiles
/// enverrait à un serveur, à chaque déplacement, la liste exacte des
/// endroits regardés : pour une application dont la promesse est
/// qu'aucune requête ne sort du téléphone, c'est la seule chose à ne pas
/// faire.
///
/// La première version dessinait un faux plan, avec des côtes et des
/// routes inventées. Ça ne disait rien de vrai et ça n'était pas beau.
/// Ici, les villes sont des bulles dont la taille dit le nombre, posées
/// en constellation, et un classement les reprend en dessous. On y lit la
/// seule chose que la donnée contient : où, et combien.
class EcranCarte extends ConsumerStatefulWidget {
  const EcranCarte({super.key});

  @override
  ConsumerState<EcranCarte> createState() => _EcranCarteState();
}

class _EcranCarteState extends ConsumerState<EcranCarte> {
  /// Vrai quand un doigt déplace la carte agrandie.
  ///
  /// La carte et la page se disputent le même glissement vertical. Le
  /// temps du geste, la page cesse de défiler : la carte reste alors
  /// seule en lice et n'a pas à forcer l'arbitrage, ce qui était la
  /// cause du plantage précédent.
  bool _carteTenue = false;

  @override
  Widget build(BuildContext context) {
    final stats = ref.watch(statistiquesProvider);
    final marge = AppLayout.gutter(context);

    return Scaffold(
      // La zone sûre manquait ici, et seulement ici : l'en-tête passait
      // sous la barre d'état du téléphone.
      body: SafeArea(
        bottom: false,
        child: stats.when(
          loading: () =>
              const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
          error: (e, _) => Echec(titre: 'Impossible de lire la carte', erreur: e),
          data: (valeur) {
            if (valeur.parVille.isEmpty) return const _Vide();
            return ListView(
              physics: _carteTenue
                  ? const NeverScrollableScrollPhysics()
                  : null,
              padding: EdgeInsets.fromLTRB(marge, 10, marge, 130),
              children: [
                _EnTete(stats: valeur),
                const SizedBox(height: 18),
                Apparition(
                  child: PlanFrance(
                    villes: valeur.parVille,
                    points: valeur.points,
                    onPrise: (tenue) {
                      if (tenue == _carteTenue) return;
                      setState(() => _carteTenue = tenue);
                    },
                  ),
                ),
                const SizedBox(height: 22),
                Apparition(rang: 1, child: _Classement(stats: valeur)),
                const SizedBox(height: 18),
                Apparition(rang: 2, child: _VuIci(stats: valeur)),
              ],
            );
          },
        ),
      ),
    );
  }
}

/// L'intitulé de l'écran, et le nombre de villes à l'autre bout.
///
/// Il empilait l'intitulé et un gros chiffre, ce qui poussait la carte
/// d'autant plus bas sur un écran déjà court. Sur une ligne, l'un à
/// gauche et l'autre à droite, la carte gagne quarante points de hauteur
/// et l'œil n'a qu'une seule ligne à lire.
class _EnTete extends StatelessWidget {
  const _EnTete({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context) {
    final villes = stats.parVille.length;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const TitreEcran('Tes lieux'),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0x0DFFFFFF),
            borderRadius: BorderRadius.circular(AppRadius.pill),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Compteur(
                valeur: villes,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                villes <= 1 ? 'Ville' : 'Villes',
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Le classement des lieux, en barres.
class _Classement extends StatelessWidget {
  const _Classement({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context) {
    final villes = stats.parVille;
    final maximum = villes.first.nombre;

    return _Panneau(
      titre: 'Classement',
      enfant: Column(
        children: [
          for (var i = 0; i < villes.length && i < 8; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == villes.length - 1 ? 0 : 14),
              child: _Barre(
                ville: villes[i].ville,
                nombre: villes[i].nombre,
                part: maximum == 0 ? 0 : villes[i].nombre / maximum,
                pourcentage: stats.totalLieux == 0
                    ? 0
                    : (villes[i].nombre * 100 / stats.totalLieux).round(),
                rang: i,
              ),
            ),
        ],
      ),
    );
  }
}

class _Barre extends StatelessWidget {
  const _Barre({
    required this.ville,
    required this.nombre,
    required this.part,
    required this.pourcentage,
    required this.rang,
  });

  final String ville;
  final int nombre;
  final double part;
  final int pourcentage;
  final int rang;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                ville,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: rang == 0 ? FontWeight.w800 : FontWeight.w600,
                  color: rang == 0
                      ? const Color(0xFFE9D5FF)
                      : AppColors.textPrimary,
                ),
              ),
            ),
            Text(
              '$nombre',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 7),
            Text(
              '$pourcentage %',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 7),
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: part),
            duration: Duration(milliseconds: 650 + rang * 90),
            curve: Curves.easeOutCubic,
            builder: (context, valeur, _) {
              return LinearProgressIndicator(
                value: valeur,
                minHeight: 8,
                backgroundColor: Colors.white.withValues(alpha: 0.06),
                valueColor: AlwaysStoppedAnimation(
                  rang == 0 ? AppColors.accent : AppColors.primary,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Les personnes vues dans la ville principale.
class _VuIci extends ConsumerWidget {
  const _VuIci({required this.stats});

  final Statistiques stats;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final principal = stats.lieuPrincipal;
    if (principal == null) return const SizedBox.shrink();

    final fiches = ref.watch(repertoireProvider).valueOrNull ?? const [];
    final surPlace = fiches
        .where((f) => f.personne.ville == principal.ville)
        .take(6)
        .toList();
    if (surPlace.isEmpty) return const SizedBox.shrink();

    return _Panneau(
      titre: 'Vu à ${principal.ville}',
      enfant: SizedBox(
        height: 104,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: surPlace.length,
          separatorBuilder: (_, _) => const SizedBox(width: 10),
          itemBuilder: (context, index) =>
              _Vignette(fiche: surPlace[index], largeur: 78),
        ),
      ),
    );
  }
}

class _Vignette extends StatelessWidget {
  const _Vignette({required this.fiche, required this.largeur});

  final FichePersonne fiche;
  final double largeur;

  @override
  Widget build(BuildContext context) {
    final photo = fiche.personne.photoPrincipale;

    return Pressable(
      onTap: () => context.push('/personne/${fiche.personne.id}'),
      child: SizedBox(
        width: largeur,
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: const Color(0xFF1B0C36),
            borderRadius: BorderRadius.circular(20),
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
                decoration: BoxDecoration(gradient: AppColors.photoScrim),
              ),
              Positioned(
                left: 6,
                right: 6,
                bottom: 8,
                child: Text(
                  fiche.personne.prenom,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Panneau extends StatelessWidget {
  const _Panneau({required this.titre, required this.enfant});

  final String titre;
  final Widget enfant;

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
          Text(
            titre.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall,
          ),
          const SizedBox(height: 15),
          enfant,
        ],
      ),
    );
  }
}

class _Vide extends StatelessWidget {
  const _Vide();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.place_outlined, size: 34, color: AppColors.textTertiary),
            SizedBox(height: 14),
            Text(
              'Aucun lieu pour l\'instant',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            SizedBox(height: 8),
            Text(
              'Renseigne un lieu en enregistrant une rencontre, '
              'et les villes apparaîtront ici.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                height: 1.5,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
