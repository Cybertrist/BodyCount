import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../config/theme.dart';

class WeekdayBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> data; // [{weekday: 0, count: 5}, ...]

  const WeekdayBarChart({super.key, required this.data});

  static const _dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox(
        height: 180,
        child: Center(child: Text('Pas de données', style: TextStyle(color: AppColors.textSecondary))),
      );
    }

    // Remplir les jours manquants
    final Map<int, int> dayMap = {};
    for (int i = 0; i < 7; i++) {
      dayMap[i] = 0;
    }
    for (final entry in data) {
      dayMap[entry['weekday'] as int] = entry['count'] as int;
    }

    final maxY = dayMap.values.fold<int>(0, (max, v) => v > max ? v : max).toDouble();

    return SizedBox(
      height: 180,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: maxY + 1,
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipColor: (_) => AppColors.card,
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                return BarTooltipItem(
                  '${_dayLabels[group.x]}\n${rod.toY.toInt()}',
                  const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                );
              },
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      _dayLabels[value.toInt() % 7],
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 28,
                getTitlesWidget: (value, meta) {
                  if (value == value.roundToDouble() && value >= 0) {
                    return Text(value.toInt().toString(), style: const TextStyle(color: AppColors.textSecondary, fontSize: 10));
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          gridData: const FlGridData(show: false),
          barGroups: dayMap.entries.map((entry) {
            return BarChartGroupData(
              x: entry.key,
              barRods: [
                BarChartRodData(
                  toY: entry.value.toDouble(),
                  color: AppColors.primaryDark,
                  width: 20,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                ),
              ],
            );
          }).toList(),
        ),
        duration: const Duration(milliseconds: 500),
      ),
    );
  }
}
