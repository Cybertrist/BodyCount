import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';

class DateFormatter {
  static bool _initialized = false;

  static Future<void> init() async {
    if (!_initialized) {
      await initializeDateFormatting('fr_FR', null);
      _initialized = true;
    }
  }

  /// "15 janvier 2025"
  static String formatDate(DateTime date) {
    return DateFormat('d MMMM yyyy', 'fr_FR').format(date);
  }

  /// "15 jan. 2025"
  static String formatDateShort(DateTime date) {
    return DateFormat('d MMM yyyy', 'fr_FR').format(date);
  }

  /// "15 jan. 2025 à 21h30"
  static String formatDateTime(DateTime date) {
    final datePart = DateFormat('d MMM yyyy', 'fr_FR').format(date);
    final timePart = DateFormat('HH\'h\'mm', 'fr_FR').format(date);
    return '$datePart à $timePart';
  }

  /// "21h30"
  static String formatTime(DateTime date) {
    return DateFormat('HH\'h\'mm', 'fr_FR').format(date);
  }

  /// "il y a 3 jours", "il y a 2 mois", etc.
  static String timeAgo(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inSeconds < 60) return 'à l\'instant';
    if (diff.inMinutes < 60) return 'il y a ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'il y a ${diff.inHours}h';
    if (diff.inDays < 7) return 'il y a ${diff.inDays} jour${diff.inDays > 1 ? 's' : ''}';
    if (diff.inDays < 30) {
      final weeks = (diff.inDays / 7).floor();
      return 'il y a $weeks semaine${weeks > 1 ? 's' : ''}';
    }
    if (diff.inDays < 365) {
      final months = (diff.inDays / 30).floor();
      return 'il y a $months mois';
    }
    final years = (diff.inDays / 365).floor();
    return 'il y a $years an${years > 1 ? 's' : ''}';
  }

  /// "Janvier 2025"
  static String formatMonthYear(DateTime date) {
    return DateFormat('MMMM yyyy', 'fr_FR').format(date);
  }

  /// "Janvier"
  static String formatMonth(int month) {
    final date = DateTime(2025, month);
    return DateFormat('MMMM', 'fr_FR').format(date);
  }

  /// "Lun", "Mar", etc.
  static String formatWeekdayShort(int weekday) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[weekday % 7];
  }

  /// Parse "2025-01" en "Janvier 2025"
  static String parseMonthKey(String monthKey) {
    final parts = monthKey.split('-');
    final year = int.parse(parts[0]);
    final month = int.parse(parts[1]);
    return formatMonthYear(DateTime(year, month));
  }
}
