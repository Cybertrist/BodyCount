import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../providers/donnees.dart';
import '../providers/settings_provider.dart';

/// Le rappel de sauvegarde, en haut du répertoire.
///
/// La clé ne se recopie nulle part : perdre le téléphone, c'est perdre
/// tout ce qui n'a pas été exporté. Le bandeau le dit quand il n'y a
/// jamais eu de sauvegarde, ou quand la dernière a plus d'un mois, et
/// seulement s'il y a quelque chose à sauver. « Plus tard » le fait taire
/// une semaine : un rappel qu'on ne peut pas écarter finit ignoré.
class RappelSauvegarde extends ConsumerWidget {
  const RappelSauvegarde({super.key, required this.marge});

  final double marge;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final etat = ref.watch(sauvegardeProvider).valueOrNull;
    final fiches = ref.watch(repertoireProvider).valueOrNull;
    if (etat == null || fiches == null || fiches.isEmpty) {
      return const SizedBox.shrink();
    }
    final maintenant = DateTime.now();
    if (!etat.aRappeler(maintenant)) return const SizedBox.shrink();

    final derniere = etat.derniere;
    final titre = derniere == null
        ? 'Aucune sauvegarde de tes fiches'
        : 'Dernière sauvegarde il y a '
            '${maintenant.difference(derniere).inDays} jours';

    return Padding(
      padding: EdgeInsets.fromLTRB(marge, 0, marge, 12),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.panel),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0x2EA855F7), Color(0x1AD946EF)],
          ),
          border: Border.all(color: const Color(0x40A855F7)),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0x33A855F7),
              ),
              child: const Icon(
                Icons.save_alt_rounded,
                size: 19,
                color: AppColors.accentLight,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titre,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Perdre le téléphone, c\'est perdre ce qui n\'a pas été '
                    'exporté.',
                    style: TextStyle(
                      fontSize: 12,
                      height: 1.35,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => context.push('/reglages'),
              child: const Text('Sauvegarder'),
            ),
            IconButton(
              tooltip: 'Plus tard',
              icon: const Icon(Icons.close_rounded, size: 18),
              color: AppColors.textTertiary,
              onPressed: () async {
                await ReglagesStore.repousserRappel(
                  maintenant.add(EtatSauvegarde.repit),
                );
                ref.invalidate(sauvegardeProvider);
              },
            ),
          ],
        ),
      ),
    );
  }
}
