import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../providers/stats_provider.dart';
import '../../providers/contacts_provider.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/chart_widgets/monthly_bar_chart.dart';
import '../../widgets/chart_widgets/rating_pie_chart.dart';
import '../../widgets/chart_widgets/platform_pie_chart.dart';
import '../../widgets/chart_widgets/weekday_bar_chart.dart';
import '../../widgets/chart_widgets/cumulative_line_chart.dart';
import '../../widgets/common/empty_state.dart';

class StatsScreen extends ConsumerWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final totalEncounters = ref.watch(totalEncountersProvider);
    final totalContacts = ref.watch(totalContactsProvider);
    final avgRating = ref.watch(averageRatingProvider);
    final longestStreak = ref.watch(longestStreakProvider);
    final bestMonth = ref.watch(bestMonthProvider);
    final monthlyData = ref.watch(monthlyDataProvider);
    final weekdayData = ref.watch(weekdayDataProvider);
    final ratingData = ref.watch(ratingDistributionProvider);
    final platformData = ref.watch(platformDistributionProvider);
    final cumulativeData = ref.watch(cumulativeDataProvider);
    final topContacts = ref.watch(topContactsProvider);
    final selectedYear = ref.watch(statsYearProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Statistiques'),
      ),
      body: totalEncounters.when(
        data: (total) {
          if (total == 0) {
            return const EmptyState(
              icon: Icons.bar_chart_rounded,
              title: 'Pas encore de stats',
              subtitle: 'Ajoute des rencontres pour voir tes statistiques',
            );
          }

          return ListView(
            padding: const EdgeInsets.all(12),
            children: [
              // Stat cards
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      icon: Icons.favorite_rounded,
                      value: total.toString(),
                      label: 'Rencontres',
                      iconColor: AppColors.primaryDark,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: StatCard(
                      icon: Icons.people_rounded,
                      value: totalContacts.valueOrNull?.toString() ?? '—',
                      label: 'Contacts',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      icon: Icons.star_rounded,
                      value: avgRating.valueOrNull?.toStringAsFixed(1) ?? '—',
                      label: 'Note moy.',
                      iconColor: AppColors.star,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: StatCard(
                      icon: Icons.local_fire_department_rounded,
                      value: longestStreak.valueOrNull?.toString() ?? '—',
                      label: 'Streak max',
                      iconColor: AppColors.primaryDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              // Best month
              bestMonth.when(
                data: (bm) {
                  if (bm == null) return const SizedBox.shrink();
                  final monthStr = bm['month'] as String;
                  final count = bm['count'] as int;
                  final parts = monthStr.split('-');
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.emoji_events_rounded, color: AppColors.primary, size: 28),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Record : $count rencontres',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            Text('${parts[1]}/${parts[0]}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  );
                },
                loading: () => const SizedBox.shrink(),
                error: (_, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 20),

              // Year selector + Monthly chart
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _sectionTitle('PAR MOIS'),
                  DropdownButton<int?>(
                    value: selectedYear,
                    hint: const Text('Toutes', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    dropdownColor: AppColors.card,
                    underline: const SizedBox(),
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Toutes')),
                      for (int y = DateTime.now().year; y >= DateTime.now().year - 5; y--)
                        DropdownMenuItem(value: y, child: Text('$y')),
                    ],
                    onChanged: (v) => ref.read(statsYearProvider.notifier).state = v,
                  ),
                ],
              ),
              const SizedBox(height: 6),
              _chartContainer(
                monthlyData.when(
                  data: (data) => MonthlyBarChart(data: data),
                  loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox(height: 200),
                ),
              ),
              const SizedBox(height: 20),

              // Weekday chart
              _sectionTitle('PAR JOUR'),
              const SizedBox(height: 6),
              _chartContainer(
                weekdayData.when(
                  data: (data) => WeekdayBarChart(data: data),
                  loading: () => const SizedBox(height: 180, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox(height: 180),
                ),
              ),
              const SizedBox(height: 20),

              // Cumulative
              _sectionTitle('CUMUL'),
              const SizedBox(height: 6),
              _chartContainer(
                cumulativeData.when(
                  data: (data) => CumulativeLineChart(data: data),
                  loading: () => const SizedBox(height: 200, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox(height: 200),
                ),
              ),
              const SizedBox(height: 20),

              // Rating distribution
              _sectionTitle('PAR NOTE'),
              const SizedBox(height: 6),
              _chartContainer(
                ratingData.when(
                  data: (data) => RatingPieChart(data: data),
                  loading: () => const SizedBox(height: 180, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox(height: 180),
                ),
              ),
              const SizedBox(height: 20),

              // Platform distribution
              _sectionTitle('PAR PLATEFORME'),
              const SizedBox(height: 6),
              _chartContainer(
                platformData.when(
                  data: (data) => PlatformPieChart(data: data),
                  loading: () => const SizedBox(height: 180, child: Center(child: CircularProgressIndicator())),
                  error: (_, _) => const SizedBox(height: 180),
                ),
              ),
              const SizedBox(height: 20),

              // Top 5
              _sectionTitle('TOP 5'),
              const SizedBox(height: 6),
              topContacts.when(
                data: (contacts) {
                  if (contacts.isEmpty) return const SizedBox.shrink();
                  return Column(
                    children: contacts.asMap().entries.map((entry) {
                      final index = entry.key;
                      final contact = entry.value;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 2),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 24,
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  color: index == 0 ? AppColors.primary : AppColors.textSecondary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                contact.pseudo,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                              ),
                            ),
                            Text(
                              '${contact.encounterCount}x',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                            if (contact.averageRating != null) ...[
                              const SizedBox(width: 8),
                              const Icon(Icons.star_rounded, size: 14, color: AppColors.star),
                              Text(
                                contact.averageRating!.toStringAsFixed(1),
                                style: const TextStyle(fontSize: 13),
                              ),
                            ],
                          ],
                        ),
                      );
                    }).toList(),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, _) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 80),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const Center(child: Text('Erreur de chargement')),
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

  Widget _chartContainer(Widget child) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(4),
      ),
      child: child,
    );
  }
}
