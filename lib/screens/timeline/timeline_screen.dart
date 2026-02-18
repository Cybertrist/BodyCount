import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/encounters_provider.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/encounter_tile.dart';
import '../../widgets/common/empty_state.dart';

class TimelineScreen extends ConsumerWidget {
  const TimelineScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final encountersAsync = ref.watch(allEncountersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Timeline'),
      ),
      body: encountersAsync.when(
        data: (encounters) {
          if (encounters.isEmpty) {
            return const EmptyState(
              icon: Icons.timeline_rounded,
              title: 'Aucune rencontre',
              subtitle: 'Ta timeline apparaîtra ici',
            );
          }

          // Group by month
          final grouped = <String, List<dynamic>>{};
          for (final encounter in encounters) {
            final key = DateFormatter.formatMonthYear(encounter.date);
            grouped.putIfAbsent(key, () => []).add(encounter);
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: grouped.length,
            itemBuilder: (context, index) {
              final monthKey = grouped.keys.elementAt(index);
              final monthEncounters = grouped[monthKey]!;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Month header
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            monthKey,
                            style: const TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.w800,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${monthEncounters.length}x',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  // Encounters
                  ...monthEncounters.map((encounter) => EncounterTile(
                    encounter: encounter,
                    showContactInfo: true,
                    onTap: () => context.push('/contacts/${encounter.contactId}'),
                  )),
                ],
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
      ),
    );
  }
}
