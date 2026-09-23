import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/layout.dart';
import '../config/theme.dart';
import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../utils/date_formatter.dart';
import '../widgets/etoiles.dart';
import '../widgets/pastilles.dart';
import '../widgets/echec.dart';
import '../widgets/vignette_media.dart';

/// La fiche d'une personne.
///
/// Une seule page qui se déroule, et non deux écrans : les maquettes en
/// montraient deux parce qu'un cadre de téléphone ne défile pas. Ici la
/// photo occupe le haut, se replie au défilement, et le bandeau d'actions
/// reste posé en bas, toujours à portée de pouce.
class EcranFiche extends ConsumerWidget {
  const EcranFiche({super.key, required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fiche = ref.watch(fichePersonneProvider(personneId));

    return Scaffold(
      body: fiche.when(
        loading: () =>
            const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
        error: (e, _) => Echec(titre: 'Impossible de lire la fiche', erreur: e),
        data: (valeur) {
          if (valeur == null) return const _Disparue();
          return _Contenu(fiche: valeur);
        },
      ),
    );
  }
}

/// La fiche a disparu sous les pieds.
///
/// C'était un texte centré sur du noir, sans barre de navigation ni
/// flèche de retour : l'écran se laissait ouvrir mais plus quitter, et
/// c'est exactement ce qui arrivait après un effacement total. Il y a
/// maintenant une sortie, et elle est la seule chose à cliquer.
class _Disparue extends StatelessWidget {
  const _Disparue();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.person_off_outlined,
                size: 36,
                color: AppColors.textTertiary,
              ),
              const SizedBox(height: 16),
              const Text(
                'Cette fiche n\'existe plus',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 17.5, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 9),
              const Text(
                'Elle a été supprimée, ou effacée avec le reste des '
                'données.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13.5,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go('/repertoire'),
                child: const Text('Retour au répertoire'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Contenu extends ConsumerWidget {
  const _Contenu({required this.fiche});

  final FichePersonne fiche;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final personne = fiche.personne;
    final id = personne.id!;
    final hauteurPhoto =
        MediaQuery.sizeOf(context).height *
        (AppLayout.isShort(context) ? 0.46 : 0.56);

    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            _PhotoEnTete(fiche: fiche, hauteur: hauteurPhoto),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(22, 22, 22, 140),
              sliver: SliverList.list(
                children: [
                  _Chiffres(fiche: fiche),
                  const SizedBox(height: 22),
                  _Etiquettes(personneId: id),
                  const SizedBox(height: 22),
                  _Rencontres(personneId: id),
                  const SizedBox(height: 22),
                  _Notes(personneId: id),
                  const SizedBox(height: 22),
                  _Galerie(personneId: id),
                  const SizedBox(height: 22),
                  _Infos(personne: personne, fiche: fiche),
                ],
              ),
            ),
          ],
        ),
        _BandeauActions(personne: personne),
      ],
    );
  }
}

class _PhotoEnTete extends ConsumerWidget {
  const _PhotoEnTete({required this.fiche, required this.hauteur});

  final FichePersonne fiche;
  final double hauteur;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final personne = fiche.personne;
    final photo = personne.photoPrincipale;
    final rang = ref.watch(rangProvider(personne.id!)).valueOrNull;

    return SliverAppBar(
      expandedHeight: hauteur,
      pinned: true,
      stretch: true,
      backgroundColor: AppColors.background,
      leading: const _RondNoir(child: BackButton(color: Colors.white)),
      actions: [
        _RondNoir(
          child: IconButton(
            tooltip: 'Modifier la fiche',
            icon: const Icon(
              Icons.edit_outlined,
              color: Colors.white,
              size: 19,
            ),
            onPressed: () => context.push('/personne/${personne.id}/modifier'),
          ),
        ),
        const SizedBox(width: 10),
      ],
      flexibleSpace: FlexibleSpaceBar(
        // Toucher la photo l'ouvre en grand. Elle est la principale, donc
        // la première de la galerie.
        background: GestureDetector(
          onTap: photo == null
              ? null
              : () => context.push('/personne/${personne.id}/medias/0'),
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (photo != null)
                VaultImage(path: photo, fit: BoxFit.cover)
              else
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(-0.3, -0.5),
                      radius: 1.2,
                      colors: [Color(0xFF7C3AED), Color(0xFF3B1D6E)],
                    ),
                  ),
                ),
              if (photo != null)
                const DecoratedBox(
                  decoration: BoxDecoration(gradient: AppColors.photoGrade),
                ),
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    stops: [0.0, 0.26, 0.5, 0.9, 1.0],
                    colors: [
                      Color(0x940B0616),
                      Color(0x000B0616),
                      Color(0x1A0B0616),
                      Color(0xDB0B0616),
                      Color(0xFF0B0616),
                    ],
                  ),
                ),
              ),
              Positioned(
                left: 22,
                right: 22,
                bottom: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        if (rang != null) BadgeRang(rang: rang.rang),
                        if (personne.age != null)
                          Pastille(
                            texte: '${personne.age} ans',
                            ton: TonPastille.sombre,
                            hauteur: 24,
                          ),
                        if (personne.ville != null)
                          Pastille(
                            texte: personne.ville!,
                            ton: TonPastille.sombre,
                            hauteur: 24,
                            icone: const Icon(
                              Icons.place_outlined,
                              size: 12,
                              color: Colors.white,
                            ),
                          ),
                        if (personne.role != null)
                          Pastille(
                            texte: personne.role!.libelle,
                            ton: TonPastille.sombre,
                            hauteur: 24,
                          ),
                        if (personne.genre != null)
                          Pastille(
                            texte: personne.genre!.libelle,
                            ton: TonPastille.sombre,
                            hauteur: 24,
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      personne.prenom,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 42,
                        height: 0.98,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -1.5,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RondNoir extends StatelessWidget {
  const _RondNoir({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(6),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: const Color(0x610B0616),
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0x2EFFFFFF)),
        ),
        child: child,
      ),
    );
  }
}

class _Chiffres extends StatelessWidget {
  const _Chiffres({required this.fiche});

  final FichePersonne fiche;

  @override
  Widget build(BuildContext context) {
    final anciennete = fiche.anciennete;

    return SizedBox(
      height: 46,
      child: Row(
        children: [
          _Colonne(
            valeur: fiche.moyenneAffichee,
            legende: 'Note',
            teinte: const Color(0xFFE9D5FF),
            sous: fiche.moyenne == null
                ? null
                : Etoiles(demiPoints: fiche.moyenne!.round(), taille: 12),
          ),
          const _Trait(),
          _Colonne(
            valeur: '${fiche.nombreRencontres}',
            legende: fiche.nombreRencontres <= 1 ? 'Fois' : 'Fois',
          ),
          const _Trait(),
          _Colonne(
            valeur: anciennete == null ? '—' : '$anciennete',
            suffixe: anciennete == null ? null : ' j',
            legende: 'Depuis',
          ),
        ],
      ),
    );
  }
}

class _Colonne extends StatelessWidget {
  const _Colonne({
    required this.valeur,
    required this.legende,
    this.suffixe,
    this.teinte,
    this.sous,
  });

  final String valeur;
  final String legende;
  final String? suffixe;
  final Color? teinte;

  /// Remplace la légende quand il y a mieux à montrer qu'un mot.
  final Widget? sous;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text.rich(
            TextSpan(
              text: valeur,
              children: [
                if (suffixe != null)
                  TextSpan(
                    text: suffixe,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
            style: TextStyle(
              fontSize: 26,
              height: 1,
              fontWeight: FontWeight.w800,
              color: teinte ?? AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 5),
          sous ??
              Text(
                legende.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall,
              ),
        ],
      ),
    );
  }
}

class _Trait extends StatelessWidget {
  const _Trait();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 34,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      color: AppColors.cardBorder,
    );
  }
}

class _Titre extends StatelessWidget {
  const _Titre(this.texte, {this.action, this.onAction});

  final String texte;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            texte.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall,
          ),
          if (action != null)
            GestureDetector(
              onTap: onAction,
              child: Text(
                action!,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFC084FC),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Etiquettes extends ConsumerWidget {
  const _Etiquettes({required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final etiquettes =
        ref.watch(etiquettesPersonneProvider(personneId)).valueOrNull ??
        const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Titre(
          'Étiquettes',
          action: 'Modifier',
          onAction: () => context.push('/personne/$personneId/etiquettes'),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            // Les deux premières sont mises en avant : c'est l'ordre
            // choisi sur l'écran d'édition qui décide, pas le hasard.
            for (var i = 0; i < etiquettes.length; i++)
              Pastille(
                texte: etiquettes[i].libelle,
                ton: i < 2 ? TonPastille.pleine : TonPastille.douce,
              ),
            PastilleAjout(
              onTap: () => context.push('/personne/$personneId/etiquettes'),
            ),
          ],
        ),
      ],
    );
  }
}

/// La liste des soirs, et le seul endroit d'où on peut les reprendre.
///
/// La fiche affichait le nombre de fois sans jamais les montrer : une
/// rencontre mal saisie restait fausse pour toujours, puisque rien ne
/// permettait ni de la rouvrir ni de l'effacer.
class _Rencontres extends ConsumerWidget {
  const _Rencontres({required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rencontres =
        ref.watch(rencontresProvider(personneId)).valueOrNull ?? const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Titre(
          rencontres.isEmpty
              ? 'Rencontres'
              : 'Rencontres · ${rencontres.length}',
          action: 'Ajouter',
          onAction: () => context.push('/personne/$personneId/rencontre'),
        ),
        if (rencontres.isEmpty)
          _Vide(
            texte: 'Aucune rencontre enregistrée.',
            onTap: () => context.push('/personne/$personneId/rencontre'),
          )
        else
          for (final r in rencontres.take(8))
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _LigneRencontre(personneId: personneId, rencontre: r),
            ),
        if (rencontres.length > 8)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              'et ${rencontres.length - 8} autres, dans le calendrier',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textTertiary,
              ),
            ),
          ),
      ],
    );
  }
}

class _LigneRencontre extends StatelessWidget {
  const _LigneRencontre({required this.personneId, required this.rencontre});

  final int personneId;
  final Rencontre rencontre;

  @override
  Widget build(BuildContext context) {
    final montant = rencontre.montantAffiche;

    return InkWell(
      onTap: () =>
          context.push('/personne/$personneId/rencontre/${rencontre.id}'),
      borderRadius: BorderRadius.circular(AppRadius.card),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 11, 12, 11),
        decoration: BoxDecoration(
          color: const Color(0x0BFFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    DateFormatter.jourCourt(rencontre.quand),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Text(
                        DateFormatter.formatTime(rencontre.quand),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (rencontre.lieu != null) ...[
                        const SizedBox(width: 7),
                        Flexible(
                          child: Text(
                            rencontre.lieu!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            if (montant != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  montant,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.gold,
                  ),
                ),
              ),
              const SizedBox(width: 9),
            ],
            Etoiles(
              demiPoints: rencontre.noteDemiPoints,
              taille: 11,
              anime: false,
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: AppColors.textTertiary,
            ),
          ],
        ),
      ),
    );
  }
}

class _Notes extends ConsumerWidget {
  const _Notes({required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notes = ref.watch(notesProvider(personneId)).valueOrNull ?? const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Titre(
          notes.isEmpty ? 'Notes' : 'Notes · ${notes.length}',
          action: 'Ajouter',
          onAction: () => context.push('/personne/$personneId/note'),
        ),
        if (notes.isEmpty)
          _Vide(
            texte: 'Rien d\'écrit pour l\'instant.',
            onTap: () => context.push('/personne/$personneId/note'),
          )
        else
          for (final note in notes.take(5))
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _CarteNote(note: note, personneId: personneId),
            ),
        if (notes.length > 5)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              'et ${notes.length - 5} autres',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textTertiary,
              ),
            ),
          ),
      ],
    );
  }
}

class _CarteNote extends StatelessWidget {
  const _CarteNote({required this.note, required this.personneId});

  final Note note;
  final int personneId;

  @override
  Widget build(BuildContext context) {
    // La note s'ouvre d'un appui : c'était le seul texte de l'application
    // qu'on ne pouvait ni reprendre ni effacer une fois écrit.
    return InkWell(
      onTap: () => context.push('/personne/$personneId/note/${note.id}'),
      borderRadius: BorderRadius.circular(AppRadius.panel),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 14, 15, 13),
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.panel),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Stack(
          children: [
            Positioned(
              left: -18,
              top: 2,
              bottom: 2,
              child: Container(
                width: 3,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [AppColors.accent, AppColors.primary],
                  ),
                  borderRadius: BorderRadius.horizontal(
                    right: Radius.circular(AppRadius.pill),
                  ),
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  note.texte,
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.55,
                    color: Color(0xFFD6CBEA),
                  ),
                ),
                const SizedBox(height: 9),
                Row(
                  children: [
                    Text(
                      DateFormatter.jourCourt(note.ecriteLe),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textTertiary,
                      ),
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.edit_outlined,
                      size: 13,
                      color: AppColors.textTertiary,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Galerie extends ConsumerWidget {
  const _Galerie({required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final photos =
        ref.watch(photosProvider(personneId)).valueOrNull ?? const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Titre(photos.isEmpty ? 'Galerie' : 'Galerie · ${photos.length}'),
        SizedBox(
          height: 74,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: photos.length + 1,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              if (index == photos.length) {
                return _AjoutPhoto(
                  onTap: () => context.push('/personne/$personneId/photos'),
                );
              }
              return GestureDetector(
                onTap: () =>
                    context.push('/personne/$personneId/medias/$index'),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.thumb),
                  child: SizedBox(
                    width: 74,
                    child: VignetteMedia(media: photos[index]),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _AjoutPhoto extends StatelessWidget {
  const _AjoutPhoto({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Ajouter des photos',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.thumb),
        child: Container(
          width: 74,
          height: 74,
          decoration: BoxDecoration(
            color: const Color(0x0FFFFFFF),
            borderRadius: BorderRadius.circular(AppRadius.thumb),
            border: Border.all(color: const Color(0x2EFFFFFF)),
          ),
          child: const Icon(
            Icons.add_rounded,
            size: 22,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _Infos extends StatelessWidget {
  const _Infos({required this.personne, required this.fiche});

  final Personne personne;
  final FichePersonne fiche;

  @override
  Widget build(BuildContext context) {
    final lignes = <(IconData, String, String)>[
      if (personne.telephone != null)
        (Icons.call_outlined, 'Téléphone', personne.telephone!),
      if (personne.adresse != null)
        (Icons.home_outlined, 'Adresse', personne.adresse!),
      if (personne.rencontreSur != null)
        (
          Icons.chat_bubble_outline_rounded,
          'Rencontré sur',
          personne.rencontreSur!,
        ),
      if (fiche.premiereFois != null)
        (
          Icons.nightlight_outlined,
          'Première fois',
          DateFormatter.jourCourt(fiche.premiereFois!),
        ),
      if (fiche.derniereFois != null)
        (
          Icons.schedule_rounded,
          'Dernière fois',
          DateFormatter.jourCourt(fiche.derniereFois!),
        ),
    ];

    if (lignes.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _Titre('Infos'),
        Container(
          decoration: BoxDecoration(
            color: const Color(0x0BFFFFFF),
            borderRadius: BorderRadius.circular(AppRadius.panel),
            border: Border.all(color: AppColors.cardBorder),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              for (var i = 0; i < lignes.length; i++) ...[
                if (i > 0) const Divider(height: 1),
                _LigneInfo(
                  icone: lignes[i].$1,
                  libelle: lignes[i].$2,
                  valeur: lignes[i].$3,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _LigneInfo extends StatelessWidget {
  const _LigneInfo({
    required this.icone,
    required this.libelle,
    required this.valeur,
  });

  final IconData icone;
  final String libelle;
  final String valeur;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 13),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icone, size: 14, color: const Color(0xFFC084FC)),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              libelle,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Text(
            valeur,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _Vide extends StatelessWidget {
  const _Vide({required this.texte, required this.onTap});

  final String texte;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.panel),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.panel),
          border: Border.all(color: const Color(0x1FFFFFFF)),
        ),
        child: Text(
          texte,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
      ),
    );
  }
}

/// Bandeau d'actions, posé au dessus du contenu qui défile.
class _BandeauActions extends StatelessWidget {
  const _BandeauActions({required this.personne});

  final Personne personne;

  @override
  Widget build(BuildContext context) {
    final telephone = personne.telephone;
    final adresse = personne.adresse;

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: IgnorePointer(
        ignoring: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(22, 40, 22, 26),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              stops: [0.0, 0.55],
              colors: [Color(0x000B0616), Color(0xFF0B0616)],
            ),
          ),
          child: Row(
            children: [
              if (telephone != null) ...[
                _BoutonRond(
                  icone: Icons.call_outlined,
                  libelle: 'Appeler',
                  onTap: () => launchUrl(Uri(scheme: 'tel', path: telephone)),
                ),
                const SizedBox(width: 10),
              ],
              if (adresse != null) ...[
                _BoutonRond(
                  icone: Icons.directions_outlined,
                  libelle: 'Y aller',
                  onTap: () => _itineraire(adresse),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: FilledButton.icon(
                  onPressed: () =>
                      context.push('/personne/${personne.id}/rencontre'),
                  icon: const Icon(Icons.add_rounded, size: 20),
                  label: const Text('Nouvelle rencontre'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Ouvre l'itinéraire dans l'application de cartes du téléphone.
///
/// Le schéma `geo:` est celui d'Android : il laisse l'utilisateur
/// choisir son application plutôt que d'imposer celle de Google. Si
/// aucune ne répond, on retombe sur une recherche web.
///
/// C'est la seule chose de toute l'application qui sorte du téléphone,
/// et elle ne part que sur appui délibéré : l'adresse est transmise à
/// l'application de cartes, donc à son éditeur.
Future<void> _itineraire(String adresse) async {
  final terme = Uri.encodeComponent(adresse);
  final geo = Uri.parse('geo:0,0?q=$terme');
  if (await canLaunchUrl(geo)) {
    await launchUrl(geo);
    return;
  }
  await launchUrl(
    Uri.parse('https://www.google.com/maps/search/?api=1&query=$terme'),
    mode: LaunchMode.externalApplication,
  );
}

class _BoutonRond extends StatelessWidget {
  const _BoutonRond({
    required this.icone,
    required this.libelle,
    required this.onTap,
  });

  final IconData icone;
  final String libelle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: libelle,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.button),
        child: Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: const Color(0x0FFFFFFF),
            borderRadius: BorderRadius.circular(AppRadius.button),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Icon(icone, size: 20, color: const Color(0xFFC084FC)),
        ),
      ),
    );
  }
}
