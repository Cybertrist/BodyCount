import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/layout.dart';
import '../config/theme.dart';
import '../domaine/personne.dart';
import '../donnees/depots.dart';
import '../providers/donnees.dart';
import '../widgets/animations.dart';
import '../widgets/titre_ecran.dart';
import '../widgets/carte_personne.dart';
import '../widgets/echec.dart';

/// Le répertoire : la grille des fiches.
///
/// Sur l'écran de couverture du Fold, plus large et plus court, le titre
/// se range à côté de la recherche au lieu d'occuper sa propre ligne, et
/// la grille gagne une colonne. La mise en page vient de [AppLayout], pas
/// de valeurs recopiées ici.
class EcranRepertoire extends ConsumerWidget {
  const EcranRepertoire({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final format = AppLayout.of(context);
    final marge = AppLayout.gutter(context);
    final fiches = ref.watch(repertoireProvider);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(marge, 10, marge, 0),
              child: format == ScreenFormat.compact
                  ? const _EnTeteHaute()
                  : const _EnTeteLarge(),
            ),
            const SizedBox(height: 14),
            _Filtres(marge: marge),
            const SizedBox(height: 14),
            Expanded(
              child: fiches.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(strokeWidth: 2.4),
                ),
                error: (e, _) => Echec(
                  titre: 'Impossible de lire le répertoire',
                  erreur: e,
                ),
                data: (liste) => liste.isEmpty
                    ? const _Vide()
                    : _Grille(fiches: liste, marge: marge),
              ),
            ),
          ],
        ),
      ),
      // Pas de bouton flottant : l'ajout vit dans la barre de navigation,
      // où il ne recouvre aucune fiche.
    );
  }
}

/// En-tête du téléphone : le compte sur sa ligne, la recherche dessous.
class _EnTeteHaute extends StatelessWidget {
  const _EnTeteHaute();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Expanded(child: _Titre()),
            _BoutonReglages(),
          ],
        ),
        const SizedBox(height: 14),
        const _Recherche(),
      ],
    );
  }
}

/// En-tête des écrans larges : tout sur une ligne, pour rendre la hauteur
/// que l'écran de couverture n'a pas.
class _EnTeteLarge extends StatelessWidget {
  const _EnTeteLarge();

  @override
  Widget build(BuildContext context) {
    // Tout sur une ligne, et tout centré sur la même hauteur. Le compte
    // était aligné en haut pendant que la recherche l'était au milieu :
    // le coin gauche paraissait décroché du reste.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const _Titre(),
        const SizedBox(width: 16),
        const Expanded(child: _Recherche()),
        const SizedBox(width: 12),
        _BoutonReglages(),
      ],
    );
  }
}

/// Le titre de l'écran.
///
/// Dans la même casse et le même style que « STATISTIQUES », « FRISE »
/// ou « TES LIEUX » : c'est l'intitulé d'un écran, pas un titre de
/// première page. Il prend donc le style d'intitulé du thème, et les
/// quatre onglets se ressemblent enfin.
class _Titre extends StatelessWidget {
  const _Titre();

  @override
  Widget build(BuildContext context) => const TitreEcran('Répertoire');
}

class _BoutonReglages extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => context.push('/reglages'),
      tooltip: 'Réglages',
      icon: const Icon(Icons.tune_rounded, size: 20),
      style: IconButton.styleFrom(
        backgroundColor: const Color(0x0DFFFFFF),
        fixedSize: const Size(46, 46),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.field),
          side: const BorderSide(color: AppColors.cardBorder),
        ),
      ),
    );
  }
}

class _Recherche extends ConsumerStatefulWidget {
  const _Recherche();

  @override
  ConsumerState<_Recherche> createState() => _RechercheState();
}

class _RechercheState extends ConsumerState<_Recherche> {
  /// Le champ part de ce que dit le filtre, et non d'une chaîne vide.
  ///
  /// Le filtre vit dans un provider, qui survit à tout ; le champ est un
  /// état local, que Android jette en recréant l'activité au retour
  /// d'arrière-plan. La barre repartait donc vide pendant que la grille
  /// restait filtrée : on voyait une liste incomplète sans rien qui
  /// explique pourquoi.
  late final TextEditingController _champ = TextEditingController(
    text: ref.read(filtreProvider).recherche,
  );

  @override
  void dispose() {
    _champ.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // L'autre sens : quand le filtre est vidé ailleurs, le champ suit.
    ref.listen(filtreProvider, (_, filtre) {
      if (filtre.recherche == _champ.text) return;
      _champ.value = TextEditingValue(
        text: filtre.recherche,
        selection: TextSelection.collapsed(offset: filtre.recherche.length),
      );
      setState(() {});
    });

    return TextField(
      controller: _champ,
      onChanged: (valeur) {
        ref.read(filtreProvider.notifier).update(
              (f) => f.copyWith(recherche: valeur),
            );
        // Le champ ne suit aucun provider : sans ce rebuild, la croix
        // d'effacement n'apparaîtrait jamais.
        setState(() {});
      },
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        hintText: 'Nom, ville, étiquette',
        prefixIcon: const Icon(Icons.search_rounded,
            size: 19, color: AppColors.textSecondary),
        prefixIconConstraints:
            const BoxConstraints(minWidth: 44, minHeight: 44),
        suffixIcon: _champ.text.isEmpty
            ? null
            : IconButton(
                icon: const Icon(Icons.close_rounded, size: 18),
                tooltip: 'Effacer',
                onPressed: () {
                  _champ.clear();
                  ref
                      .read(filtreProvider.notifier)
                      .update((f) => f.copyWith(recherche: ''));
                  setState(() {});
                },
              ),
      ),
    );
  }
}

class _Filtres extends ConsumerWidget {
  const _Filtres({required this.marge});

  final double marge;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filtre = ref.watch(filtreProvider);
    final villes = ref.watch(villesProvider).valueOrNull ?? const <String>[];

    return SizedBox(
      height: 33,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: marge),
        children: [
          for (final tri in TriRepertoire.values) ...[
            _Chip(
              libelle: tri.libelle,
              actif: filtre.tri == tri,
              onTap: () => ref
                  .read(filtreProvider.notifier)
                  .update((f) => f.copyWith(tri: tri)),
            ),
            const SizedBox(width: 7),
          ],
          for (final ville in villes.take(4)) ...[
            _Chip(
              libelle: ville,
              actif: filtre.ville == ville,
              onTap: () => ref.read(filtreProvider.notifier).update(
                    (f) => f.ville == ville
                        ? f.copyWith(viderVille: true)
                        : f.copyWith(ville: ville),
                  ),
            ),
            const SizedBox(width: 7),
          ],
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.libelle,
    required this.actif,
    required this.onTap,
  });

  final String libelle;
  final bool actif;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: Container(
        height: 33,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        decoration: BoxDecoration(
          gradient: actif ? AppColors.brandGradient : null,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: actif ? null : Border.all(color: const Color(0x1CFFFFFF)),
        ),
        child: Center(
          widthFactor: 1,
          child: Text(
            libelle,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: actif ? FontWeight.w800 : FontWeight.w600,
              color: actif ? const Color(0xFF12071F) : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}

class _Grille extends StatelessWidget {
  const _Grille({required this.fiches, required this.marge});

  final List<FichePersonne> fiches;
  final double marge;

  @override
  Widget build(BuildContext context) {
    // La meilleure moyenne reçoit l'étoile. Calculé ici et non en base :
    // c'est une question d'affichage, elle dépend de la liste affichée.
    FichePersonne? meilleure;
    for (final fiche in fiches) {
      final m = fiche.moyenne;
      if (m == null) continue;
      if (meilleure?.moyenne == null || m > meilleure!.moyenne!) {
        meilleure = fiche;
      }
    }

    return GridView.builder(
      padding: EdgeInsets.fromLTRB(marge, 0, marge, 130),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: AppLayout.gridColumns(context),
        childAspectRatio: 0.74,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: fiches.length,
      itemBuilder: (context, index) {
        final fiche = fiches[index];
        return Apparition(
          rang: index,
          child: CartePersonne(
            fiche: fiche,
            premier: identical(fiche, meilleure),
            onTap: () => context.push('/personne/${fiche.personne.id}'),
          ),
        );
      },
    );
  }
}

class _Vide extends StatelessWidget {
  const _Vide();

  @override
  Widget build(BuildContext context) {
    return const _Message(
      titre: 'Le répertoire est vide',
      detail: 'Le bouton en bas à droite ajoute une première fiche.',
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.titre, required this.detail});

  final String titre;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              titre,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 10),
            Text(
              detail,
              textAlign: TextAlign.center,
              style: const TextStyle(
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
