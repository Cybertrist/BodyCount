import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../config/theme.dart';

class RatingPieChart extends StatelessWidget {
  final List<Map<String, dynamic>> data; // [{rating: 5, count: 10}, ...]

  const RatingPieChart({super.key, required this.data});

  static const _ratingColors = [
    Color(0xFFEF4444), // 1 star
    Color(0xFFF97316), // 2 stars
    Color(0xFFEAB308), // 3 stars
    Color(0xFF22C55E), // 4 stars
    Color(0xFF10B981), // 5 stars
  ];

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox(
        height: 180,
        child: Center(child: Text('Pas de données', style: TextStyle(color: AppColors.textSecondary))),
      );
    }

    final total = data.fold<int>(0, (sum, e) => sum + (e['count'] as int));

    return SizedBox(
      height: 180,
      child: Row(
        children: [
          Expanded(
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 30,
                sections: data.map((e) {
                  final rating = e['rating'] as int;
                  final count = e['count'] as int;
                  final percentage = (count / total * 100).roundToDouble();
                  return PieChartSectionData(
                    color: _ratingColors[(rating - 1).clamp(0, 4)],
                    value: count.toDouble(),
                    title: '${percentage.toInt()}%',
                    titleStyle: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    radius: 50,
                  );
                }).toList(),
              ),
              duration: const Duration(milliseconds: 500),
            ),
          ),
          const SizedBox(width: 16),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: data.map((e) {
              final rating = e['rating'] as int;
              final count = e['count'] as int;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10, height: 10,
                      decoration: BoxDecoration(
                        color: _ratingColors[(rating - 1).clamp(0, 4)],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${'★' * rating} ($count)',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
