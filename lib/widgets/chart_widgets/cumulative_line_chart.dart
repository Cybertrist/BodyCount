import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../config/theme.dart';

class CumulativeLineChart extends StatelessWidget {
  final List<Map<String, dynamic>> data; // [{day: '2025-01-15', count: 1}, ...]

  const CumulativeLineChart({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(child: Text('Pas de données', style: TextStyle(color: AppColors.textSecondary))),
      );
    }

    // Calculer les valeurs cumulatives
    final List<FlSpot> spots = [];
    int cumulative = 0;
    for (int i = 0; i < data.length; i++) {
      cumulative += data[i]['count'] as int;
      spots.add(FlSpot(i.toDouble(), cumulative.toDouble()));
    }

    return SizedBox(
      height: 200,
      child: LineChart(
        LineChartData(
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => AppColors.card,
              getTooltipItems: (touchedSpots) {
                return touchedSpots.map((spot) {
                  final index = spot.x.toInt();
                  final day = index < data.length ? data[index]['day'] as String : '';
                  return LineTooltipItem(
                    '$day\n${spot.y.toInt()} total',
                    const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                  );
                }).toList();
              },
            ),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            getDrawingHorizontalLine: (value) => FlLine(
              color: AppColors.cardBorder.withValues(alpha: 0.5),
              strokeWidth: 1,
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 30,
                interval: (data.length / 5).ceilToDouble().clamp(1, double.infinity),
                getTitlesWidget: (value, meta) {
                  final index = value.toInt();
                  if (index >= data.length || index < 0) return const SizedBox.shrink();
                  final day = data[index]['day'] as String;
                  final parts = day.split('-');
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      '${parts[2]}/${parts[1]}',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 9),
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 35,
                getTitlesWidget: (value, meta) {
                  if (value == value.roundToDouble()) {
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
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: AppColors.primary,
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: AppColors.primary.withValues(alpha: 0.1),
              ),
            ),
          ],
        ),
        duration: const Duration(milliseconds: 500),
      ),
    );
  }
}
