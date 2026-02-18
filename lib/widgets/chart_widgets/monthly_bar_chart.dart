import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../config/theme.dart';

class MonthlyBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> data; // [{month: '2025-01', count: 5}, ...]

  const MonthlyBarChart({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('Pas de données', style: TextStyle(color: AppColors.textSecondary))),
      );
    }

    final maxY = data.fold<int>(0, (max, e) {
      final count = e['count'] as int;
      return count > max ? count : max;
    }).toDouble();

    return SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: maxY + 1,
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipColor: (_) => AppColors.card,
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final month = data[group.x]['month'] as String;
                final parts = month.split('-');
                final label = '${parts[1]}/${parts[0]}';
                return BarTooltipItem(
                  '$label\n${rod.toY.toInt()} rencontre${rod.toY > 1 ? 's' : ''}',
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
                  if (value.toInt() >= data.length) return const SizedBox.shrink();
                  final month = data[value.toInt()]['month'] as String;
                  final m = month.split('-')[1];
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(m, style: const TextStyle(color: AppColors.textSecondary, fontSize: 10)),
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
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: (maxY / 4).ceilToDouble().clamp(1, double.infinity),
            getDrawingHorizontalLine: (value) => FlLine(
              color: AppColors.cardBorder.withValues(alpha: 0.5),
              strokeWidth: 1,
            ),
          ),
          barGroups: data.asMap().entries.map((entry) {
            return BarChartGroupData(
              x: entry.key,
              barRods: [
                BarChartRodData(
                  toY: (entry.value['count'] as int).toDouble(),
                  color: AppColors.primary,
                  width: data.length > 12 ? 8 : 16,
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
