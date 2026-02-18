import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/encounter_dao.dart';
import '../database/contact_dao.dart';

final statsYearProvider = StateProvider<int?>((ref) => null);

// Données mensuelles
final monthlyDataProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dao = EncounterDao();
  final year = ref.watch(statsYearProvider);
  return dao.getMonthlyCount(year: year);
});

// Données par jour de la semaine
final weekdayDataProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dao = EncounterDao();
  return dao.getWeekdayCount();
});

// Répartition par rating
final ratingDistributionProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dao = EncounterDao();
  return dao.getRatingDistribution();
});

// Répartition par plateforme
final platformDistributionProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dao = EncounterDao();
  return dao.getPlatformDistribution();
});

// Moyenne des ratings
final averageRatingProvider = FutureProvider<double>((ref) async {
  final dao = EncounterDao();
  return dao.getAverageRating();
});

// Meilleur mois
final bestMonthProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final dao = EncounterDao();
  return dao.getBestMonth();
});

// Plus longue série
final longestStreakProvider = FutureProvider<int>((ref) async {
  final dao = EncounterDao();
  return dao.getLongestStreak();
});

// Données cumulatives
final cumulativeDataProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final dao = EncounterDao();
  return dao.getCumulativeData();
});

// Nombre total de contacts
final totalContactsProvider = FutureProvider<int>((ref) async {
  final dao = ContactDao();
  return dao.getCount();
});

// Nombre total de rencontres
final totalEncountersProvider = FutureProvider<int>((ref) async {
  final dao = EncounterDao();
  return dao.getCount();
});
