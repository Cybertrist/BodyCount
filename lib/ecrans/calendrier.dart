import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../config/layout.dart';
import '../config/theme.dart';
import '../domaine/rencontre.dart';
import '../donnees/statistiques.dart';
import 'legende_calendrier.dart';
import 'marqueurs_calendrier.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../utils/date_formatter.dart';
import '../widgets/animations.dart';
import '../widgets/titre_ecran.dart';
import '../widgets/etoiles.dart';
import '../widgets/echec.dart';

/// Le calendrier, et ce qu'il y a eu dedans.
///
/// C'était une frise, c'est à dire une seule longue liste du plus récent
/// au plus ancien. Elle répondait à « c'était quand » à condition de
/// défiler jusqu'à la bonne date, ce qui devient vite absurde. Un mois
/// tient sur sept colonnes : on voit d'un coup les soirs pleins, les
/// semaines vides, et on tape sur un jour pour n'avoir que lui.
///
/// L'écran s'appelait encore « Frise » après ce changement, ce qui ne
/// décrivait plus rien de ce qu'on voyait.
class EcranCalendrier extends ConsumerStatefulWidget {
  const EcranCalendrier({super.key});

  @override
  ConsumerState<EcranCalendrier> createState() => _EcranCalendrierState();
}

class _EcranCalendrierState extends ConsumerState<EcranCalendrier> {
  /// Le premier jour du mois affiché. Nul tant que rien n'a été choisi :
  /// le mois par défaut dépend des données, qui ne sont pas encore là au
  /// moment où l'état se crée.
  DateTime? _mois;

  /// Le jour retenu, ou nul pour le mois entier.
  DateTime? _jour;

  @override
  Widget build(BuildContext context) {
    final entrees = ref.watch(journalProvider);
    final marge = AppLayout.gutter(context);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: entrees.when(
          loading: () =>
              const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
          error: (e, _) => Echec(titre: 'Impossible de lire le calendrier', erreur: e),
          data: (liste) {
            if (liste.isEmpty) return const _Vide();

            // La liste arrive du plus récent au plus ancien : son premier
            // élément donne le mois à ouvrir.
            final mois = _mois ?? _premierJour(liste.first.rencontre.quand);

            final annees = <int>{
              for (final e in liste) e.rencontre.quand.year,
            }.toList()..sort((a, b) => b.compareTo(a));

            final duMois = liste
                .where(
                  (e) =>
                      e.rencontre.quand.year == mois.year &&
                      e.rencontre.quand.month == mois.month,
                )
                .toList();

            final parJour = <int, int>{};
            for (final e in duMois) {
              final j = e.rencontre.quand.day;
              parJour[j] = (parJour[j] ?? 0) + 1;
            }

            // La ville la plus fréquente sert de point de référence pour
            // savoir ce qui compte comme un déplacement.
            final compteVilles = <String, int>{};
            for (final e in liste) {
              final ville = e.rencontre.lieu ?? e.villePersonne;
              if (ville == null || ville.isEmpty) continue;
              compteVilles[ville] = (compteVilles[ville] ?? 0) + 1;
            }
            String? villePrincipale;
            var meilleur = 0;
            compteVilles.forEach((ville, n) {
              if (n > meilleur) {
                meilleur = n;
                villePrincipale = ville;
              }
            });

            final marques = MarqueursCalendrier.pourLeMois(
              toutes: liste,
              duMois: duMois,
              mois: mois,
              villePrincipale: villePrincipale,
            );

            // Les mêmes signes, mais rattachés à chaque rencontre : sur
            // un jour à deux personnes, la case ne dit pas laquelle a
            // rapporté, la liste si.
            final parLigne = MarqueursCalendrier.parRencontre(
              toutes: liste,
              duMois: duMois,
              mois: mois,
              villePrincipale: villePrincipale,
            );

            final gainDuMois = duMois.fold<int>(
              0,
              (somme, e) => somme + (e.rencontre.montantCentimes ?? 0),
            );

            final affichees = _jour == null
                ? duMois
                : duMois
                      .where((e) => e.rencontre.quand.day == _jour!.day)
                      .toList();

            return CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: EdgeInsets.fromLTRB(marge, 10, marge, 0),
                  sliver: SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _EnTete(total: liste.length),
                        if (annees.length > 1) ...[
                          const SizedBox(height: 15),
                          _ChoixAnnee(
                            annees: annees,
                            choisie: mois.year,
                            onChoisir: (a) => _allerAnnee(a, liste),
                          ),
                        ],
                        const SizedBox(height: 16),
                        _Calendrier(
                          mois: mois,
                          parJour: parJour,
                          marques: marques,
                          gainCentimes: gainDuMois,
                          jourChoisi: _jour,
                          onMois: _allerMois,
                          onJour: _choisirJour,
                        ),
                        const SizedBox(height: 18),
                        _Intitule(
                          mois: mois,
                          jour: _jour,
                          compte: affichees.length,
                          onTout: _jour == null
                              ? null
                              : () => setState(() => _jour = null),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
                if (affichees.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(marge, 26, marge, 130),
                      child: const Text(
                        'Rien ce mois-ci.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textTertiary),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(marge, 0, marge, 130),
                    sliver: SliverList.separated(
                      itemCount: affichees.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, i) => Apparition(
                        rang: i,
                        child: _Ligne(
                          entree: affichees[i],
                          marqueurs:
                              parLigne[affichees[i].rencontre.id] ??
                              const <String>[],
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  static DateTime _premierJour(DateTime d) => DateTime(d.year, d.month);

  void _allerMois(int pas) {
    setState(() {
      final base = _mois ?? DateTime.now();
      _mois = DateTime(base.year, base.month + pas);
      _jour = null;
    });
  }

  /// Ouvre le mois le plus récent de l'année demandée qui contienne
  /// quelque chose. Tomber sur janvier vide n'apprendrait rien.
  void _allerAnnee(int annee, List<EntreeJournal> liste) {
    final dedans = liste.where((e) => e.rencontre.quand.year == annee);
    setState(() {
      _mois = dedans.isEmpty
          ? DateTime(annee, 12)
          : _premierJour(dedans.first.rencontre.quand);
      _jour = null;
    });
  }

  void _choisirJour(DateTime jour) {
    setState(() => _jour = _jour?.day == jour.day ? null : jour);
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
            Icon(
              Icons.event_note_outlined,
              size: 34,
              color: AppColors.textTertiary,
            ),
            SizedBox(height: 14),
            Text(
              'Aucune rencontre enregistrée',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            SizedBox(height: 8),
            Text(
              'Le calendrier se remplira tout seul.',
              style: TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

/// Le choix de l'année, en pastilles, comme sur les statistiques.
class _ChoixAnnee extends StatelessWidget {
  const _ChoixAnnee({
    required this.annees,
    required this.choisie,
    required this.onChoisir,
  });

  final List<int> annees;
  final int choisie;
  final ValueChanged<int> onChoisir;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 34,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: annees.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final actif = annees[i] == choisie;
          return Pressable(
            onTap: () => onChoisir(annees[i]),
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
                '${annees[i]}',
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.3,
                  color: actif ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Le calendrier du mois.
///
/// Toujours six semaines, même quand le mois n'en occupe que cinq : la
/// carte gardait sinon une hauteur différente d'un mois à l'autre, et
/// passer de l'un à l'autre faisait sauter tout l'écran.
class _Calendrier extends StatelessWidget {
  const _Calendrier({
    required this.mois,
    required this.parJour,
    required this.marques,
    required this.gainCentimes,
    required this.jourChoisi,
    required this.onMois,
    required this.onJour,
  });

  final DateTime mois;
  final Map<int, int> parJour;
  final Map<int, List<String>> marques;
  final int gainCentimes;
  final DateTime? jourChoisi;
  final ValueChanged<int> onMois;
  final ValueChanged<DateTime> onJour;

  static const _jours = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  @override
  Widget build(BuildContext context) {
    // DateTime.weekday vaut 1 le lundi : le nombre de cases vides avant
    // le premier du mois se lit directement.
    final vides = DateTime(mois.year, mois.month, 1).weekday - 1;
    final nbJours = DateTime(mois.year, mois.month + 1, 0).day;
    final total = parJour.values.fold(0, (a, b) => a + b);
    final aujourdhui = DateTime.now();

    return Container(
      padding: const EdgeInsets.fromLTRB(10, 12, 10, 12),
      decoration: BoxDecoration(
        color: const Color(0x0BFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              children: [
                _Fleche(
                  icone: Icons.chevron_left_rounded,
                  onTap: () => onMois(-1),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        DateFormat(
                          'MMMM yyyy',
                          'fr_FR',
                        ).format(mois).toUpperCase(),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.4,
                          color: Color(0xFFE9D5FF),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            total == 0
                                ? 'aucune rencontre'
                                : total == 1
                                ? '1 rencontre'
                                : '$total rencontres',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textTertiary,
                            ),
                          ),
                          if (gainCentimes > 0) ...[
                            const SizedBox(width: 9),
                            const Text('💵', style: TextStyle(fontSize: 11)),
                            const SizedBox(width: 4),
                            Text(
                              Statistiques.eurosAffiches(gainCentimes),
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.gold,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                _Fleche(
                  icone: Icons.chevron_right_rounded,
                  onTap: () => onMois(1),
                ),
                const SizedBox(width: 4),
                // La légende des signes, à portée de pouce : un
                // calendrier semé de pictogrammes dont on a oublié le
                // sens ne vaut pas mieux qu'un calendrier vide.
                _Fleche(
                  icone: Icons.help_outline_rounded,
                  onTap: () => LegendeCalendrier.ouvrir(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              for (final j in _jours)
                Expanded(
                  child: Center(
                    child: Text(
                      j,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          // Six lignes de sept, toujours. Une grille dont la hauteur
          // dépendrait du mois ferait sauter la liste en dessous.
          for (var semaine = 0; semaine < 6; semaine++)
            Row(
              children: [
                for (var colonne = 0; colonne < 7; colonne++)
                  Expanded(
                    child: Builder(
                      builder: (context) {
                        final j = semaine * 7 + colonne - vides + 1;
                        if (j < 1 || j > nbJours) {
                          return const SizedBox(height: 54);
                        }
                        return _Case(
                          jour: j,
                          nombre: parJour[j] ?? 0,
                          choisi: jourChoisi?.day == j,
                          aujourdhui:
                              aujourdhui.year == mois.year &&
                              aujourdhui.month == mois.month &&
                              aujourdhui.day == j,
                          marqueurs: marques[j] ?? const <String>[],
                          onTap: () =>
                              onJour(DateTime(mois.year, mois.month, j)),
                        );
                      },
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _Fleche extends StatelessWidget {
  const _Fleche({required this.icone, required this.onTap});

  final IconData icone;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Icon(icone, size: 20, color: AppColors.textSecondary),
      ),
    );
  }
}

/// Une case du calendrier.
///
/// Un jour vide n'est qu'un chiffre effacé. Un jour plein porte un
/// disque, doré s'il a rapporté, et sous lui une ligne de marqueurs.
///
/// La version précédente empilait deux pastilles en angle par dessus le
/// disque, dans un Stack débordant enveloppé d'un Opacity. Le résultat
/// était un carré noir derrière certains jours, selon l'humeur du
/// compositeur. Ici rien ne déborde et rien n'est composé à part : une
/// colonne, un disque, une ligne de texte.
class _Case extends StatelessWidget {
  const _Case({
    required this.jour,
    required this.nombre,
    required this.choisi,
    required this.aujourdhui,
    required this.marqueurs,
    required this.onTap,
  });

  final int jour;
  final int nombre;
  final bool choisi;
  final bool aujourdhui;

  /// Ce que la journée a eu de remarquable, trois signes au plus.
  final List<String> marqueurs;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final plein = nombre > 0;
    // Le disque passe en or dès qu'un des signes d'argent est là.
    final argent = marqueurs.any((m) => m == '💵' || m == '💰' || m == '🤑');

    return SizedBox(
      height: 54,
      child: Pressable(
        echelle: 0.92,
        onTap: plein ? onTap : () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: plein
                    ? (argent
                          ? const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFFFDE68A), Color(0xFFE0A93F)],
                            )
                          : AppColors.brandGradient)
                    : null,
                border: choisi
                    ? Border.all(color: Colors.white, width: 2)
                    : aujourdhui && !plein
                    ? Border.all(
                        color: AppColors.primary.withValues(alpha: 0.55),
                      )
                    : null,
              ),
              child: Text(
                '$jour',
                style: TextStyle(
                  fontSize: 13,
                  height: 1,
                  fontWeight: plein ? FontWeight.w800 : FontWeight.w600,
                  color: plein
                      ? const Color(0xFF12071F)
                      : aujourdhui
                      ? AppColors.accentLight
                      : AppColors.textTertiary,
                ),
              ),
            ),
            const SizedBox(height: 3),
            // La ligne reste là même vide : sans elle, les disques des
            // jours marqués ne seraient plus alignés avec les autres.
            SizedBox(
              height: 13,
              child: marqueurs.isEmpty
                  ? null
                  : FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          for (final m in marqueurs)
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 1,
                              ),
                              child: Text(
                                m,
                                style: const TextStyle(
                                  fontSize: 10,
                                  height: 1.1,
                                ),
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

/// La ligne qui annonce la liste : le mois, ou le jour retenu.
class _Intitule extends StatelessWidget {
  const _Intitule({
    required this.mois,
    required this.jour,
    required this.compte,
    required this.onTout,
  });

  final DateTime mois;
  final DateTime? jour;
  final int compte;
  final VoidCallback? onTout;

  @override
  Widget build(BuildContext context) {
    final titre = jour == null
        ? DateFormat('MMMM', 'fr_FR').format(mois)
        : DateFormat('EEEE d MMMM', 'fr_FR').format(jour!);

    return Row(
      children: [
        Flexible(
          child: Text(
            titre.toUpperCase(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
              color: Color(0xFFC9B8E8),
            ),
          ),
        ),
        const SizedBox(width: 11),
        Expanded(
          flex: 0,
          child: Text(
            compte <= 1 ? '$compte rencontre' : '$compte rencontres',
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: AppColors.textTertiary,
            ),
          ),
        ),
        if (onTout != null) ...[
          const SizedBox(width: 10),
          Pressable(
            onTap: onTout!,
            child: Container(
              height: 26,
              padding: const EdgeInsets.symmetric(horizontal: 11),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3),
                ),
              ),
              child: const Text(
                'Tout le mois',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFE9D5FF),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _EnTete extends StatelessWidget {
  const _EnTete({required this.total});

  final int total;

  @override
  Widget build(BuildContext context) {
    // Même forme que l'en-tête de la carte : l'intitulé à gauche, le
    // compte en pastille à droite. Un gros chiffre sur sa propre ligne
    // poussait le calendrier d'autant plus bas, sur un écran qui a déjà
    // six semaines et une liste à faire tenir.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const TitreEcran('Calendrier'),
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
              Text(
                '$total',
                style: const TextStyle(
                  fontSize: 15,
                  height: 1,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                total <= 1 ? 'Rencontre' : 'Rencontres',
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

class _Ligne extends StatelessWidget {
  const _Ligne({required this.entree, this.marqueurs = const []});

  final EntreeJournal entree;

  /// Ce que cette rencontre a eu de remarquable, en pastille d'angle.
  final List<String> marqueurs;

  @override
  Widget build(BuildContext context) {
    final rencontre = entree.rencontre;
    final haute = (rencontre.noteDemiPoints ?? 0) >= 9;

    return Pressable(
      onTap: () => context.push('/personne/${rencontre.personneId}'),
      child: Stack(
        children: [
          Container(
            height: 84,
            padding: const EdgeInsets.fromLTRB(8, 0, 14, 0),
            decoration: BoxDecoration(
              color: const Color(0x0BFFFFFF),
              borderRadius: BorderRadius.circular(AppRadius.card),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(17),
                  child: SizedBox(
                    width: 62,
                    height: 62,
                    child: entree.photo == null
                        ? const ColoredBox(color: Color(0xFF1B0C36))
                        : VaultImage(path: entree.photo!),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              entree.prenom,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 9),
                          Etoiles(
                            demiPoints: rencontre.noteDemiPoints,
                            taille: 12,
                            anime: false,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            DateFormatter.jourCourt(rencontre.quand),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFD8B4FE),
                            ),
                          ),
                          if (rencontre.lieu != null) ...[
                            const _Point(),
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
                          const _Point(),
                          Text(
                            DateFormatter.formatTime(rencontre.quand),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          if (rencontre.montantAffiche != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 7,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                rencontre.montantAffiche!,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.gold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),

                // Les signes de cette rencontre là, dans la ligne et non
                // au dessus. Posés en angle, ils venaient se coller à la
                // note et les deux pastilles se chevauchaient presque.
                if (marqueurs.isNotEmpty) ...[
                  Container(
                    height: 31,
                    padding: const EdgeInsets.symmetric(horizontal: 9),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0x0FFFFFFF),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      border: Border.all(color: const Color(0x1AFFFFFF)),
                    ),
                    child: Text(
                      marqueurs.take(2).join(' '),
                      style: const TextStyle(fontSize: 12, height: 1.1),
                    ),
                  ),
                  const SizedBox(width: 7),
                ],

                Container(
                  height: 31,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: haute ? AppColors.brandGradient : null,
                    color: haute ? null : const Color(0x0FFFFFFF),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    border: Border.all(
                      color: haute
                          ? const Color(0x24FFFFFF)
                          : const Color(0x1AFFFFFF),
                    ),
                  ),
                  child: Text(
                    rencontre.noteAffichee,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: haute
                          ? const Color(0xFF12071F)
                          : const Color(0xFFE9D5FF),
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

class _Point extends StatelessWidget {
  const _Point();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 3,
      height: 3,
      margin: const EdgeInsets.symmetric(horizontal: 7),
      decoration: const BoxDecoration(
        color: Color(0x42FFFFFF),
        shape: BoxShape.circle,
      ),
    );
  }
}
