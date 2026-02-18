import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../config/theme.dart';

class PlatformPieChart extends StatelessWidget {
  final List<Map<String, dynamic>> data; // [{platform: 'grindr', count: 10}, ...]

  const PlatformPieChart({super.key, required this.data});

  Color _platformColor(String platform) {
    switch (platform.toLowerCase()) {
      case 'grindr':
        return AppColors.grindr;
      case 'scruff':
        return AppColors.scruff;
      case 'tinder':
        return AppColors.tinder;
      default:
        return AppColors.textSecondary;
    }
  }

  String _platformLabel(String platform) {
    switch (platform.toLowerCase()) {
      case 'grindr':
        return 'Grindr';
      case 'scruff':
        return 'Scruff';
      case 'tinder':
        return 'Tinder';
      default:
        return 'Autre';
    }
  }

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
                  final platform = e['platform'] as String;
                  final count = e['count'] as int;
                  final percentage = (count / total * 100).roundToDouble();
                  return PieChartSectionData(
                    color: _platformColor(platform),
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
              final platform = e['platform'] as String;
              final count = e['count'] as int;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10, height: 10,
                      decoration: BoxDecoration(
                        color: _platformColor(platform),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${_platformLabel(platform)} ($count)',
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
