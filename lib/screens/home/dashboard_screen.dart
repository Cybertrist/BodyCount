import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/contacts_provider.dart';
import '../../providers/stats_provider.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/contact_card.dart';
import '../../widgets/chart_widgets/monthly_bar_chart.dart';
import '../../widgets/common/empty_state.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactCount = ref.watch(totalContactsProvider);
    final encounterCount = ref.watch(totalEncountersProvider);
    final avgRating = ref.watch(averageRatingProvider);
    final monthlyData = ref.watch(monthlyDataProvider);
    final recentContacts = ref.watch(recentContactsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('BODYCOUNT', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900)),
        actions: [
          IconButton(
            icon: const Icon(Icons.timeline_rounded, size: 22),
            onPressed: () => context.push('/timeline'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_rounded, size: 22),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: encounterCount.when(
        data: (totalEncounters) {
          if (totalEncounters == 0) {
            return EmptyState(
              icon: Icons.favorite_border_rounded,
              title: 'Bienvenue',
              subtitle: 'Ajoute ta première rencontre',
              action: FilledButton.icon(
                onPressed: () => context.push('/contacts/new'),
                icon: const Icon(Icons.add_rounded),
                label: const Text('Commencer'),
              ),
            );
          }

          return RefreshIndicator(
            color: AppColors.primary,
            backgroundColor: AppColors.card,
            onRefresh: () async {
              ref.invalidate(totalContactsProvider);
              ref.invalidate(totalEncountersProvider);
              ref.invalidate(averageRatingProvider);
              ref.invalidate(monthlyDataProvider);
              ref.invalidate(recentContactsProvider);
            },
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: [
                // Stat cards — 3 across
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        icon: Icons.people_rounded,
                        value: contactCount.valueOrNull?.toString() ?? '—',
                        label: 'Contacts',
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: StatCard(
                        icon: Icons.favorite_rounded,
                        value: totalEncounters.toString(),
                        label: 'Rencontres',
                        iconColor: AppColors.primaryDark,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: StatCard(
                        icon: Icons.star_rounded,
                        value: avgRating.valueOrNull?.toStringAsFixed(1) ?? '—',
                        label: 'Moyenne',
                        iconColor: AppColors.star,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Monthly chart
                _sectionTitle('PAR MOIS'),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: monthlyData.when(
                    data: (data) => MonthlyBarChart(data: data),
                    loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
                    error: (_, _) => const SizedBox(height: 200),
                  ),
                ),
                const SizedBox(height: 20),

                // Recent contacts — horizontal grid
                _sectionTitle('DERNIERS AJOUTS'),
                const SizedBox(height: 8),
                recentContacts.when(
                  data: (contacts) {
                    if (contacts.isEmpty) return const SizedBox.shrink();
                    return SizedBox(
                      height: 180,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: contacts.length > 6 ? 6 : contacts.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 4),
                        itemBuilder: (context, index) {
                          final contact = contacts[index];
                          return SizedBox(
                            width: 130,
                            child: ContactCard(
                              contact: contact,
                              gridView: true,
                              onTap: () => context.push('/contacts/${contact.id}'),
                            ),
                          );
                        },
                      ),
                    );
                  },
                  loading: () => const SizedBox(height: 180, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 80),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const Center(child: Text('Erreur de chargement')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/contacts/new'),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        color: AppColors.textSecondary,
        letterSpacing: 1,
      ),
    );
  }
}
