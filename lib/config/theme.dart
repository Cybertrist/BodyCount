import 'package:flutter/material.dart';

/// Palette de BodyCount.
///
/// Tirée du logo : le violet et le fuchsia du dégradé, le vert du feuillage
/// pour les signaux positifs. Le fond n'est pas noir pur mais très
/// légèrement violet, ce qui évite l'effet trou noir des écrans OLED et
/// fait chanter les photos posées dessus.
class AppColors {
  static const primary = Color(0xFFA855F7);        // Violet, accent principal
  static const primaryDark = Color(0xFF7C3AED);    // Violet profond
  static const accent = Color(0xFFD946EF);         // Fuchsia, fin du dégradé
  static const accentLight = Color(0xFFF0ABFC);    // Rose pâle, lumières

  static const background = Color(0xFF0B0616);     // Le sol
  static const surface = Color(0xFF150C28);        // Panneaux, feuilles
  static const card = Color(0xFF1A1030);           // Cartes
  static const cardBorder = Color(0xFF261A45);     // Arête à peine visible

  static const textPrimary = Color(0xFFF6F2FF);
  static const textSecondary = Color(0xFF9B8CB8);
  static const textTertiary = Color(0xFF7D6E99);

  // Les notes. C'était le fuchsia de l'accent, à pleine saturation :
  // cinq étoiles côte à côte sur une photo sombre piquaient les yeux.
  // Un violet clair dit la même chose sans crier.
  static const star = Color(0xFFC084FC);
  static const gold = Color(0xFFFDE68A);           // L'étoile du podium
  // Le vert des hausses. C'était un vert lime, celui du logo, qui sur
  // fond noir tire vers le jaune et se lit mal. Celui-ci est franc et
  // saturé, sans virer au fluo.
  static const success = Color(0xFF1ED760);
  static const danger = Color(0xFFF87171);         // Le seul rouge de l'app

  /// Le dégradé de la marque, sur les boutons d'action et les pastilles
  /// qui doivent sauter aux yeux.
  static const brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, accent],
  );

  /// Voile posé sur les photos, réduit à presque rien.
  ///
  /// La première version teintait tout en rose pour uniformiser la
  /// palette : les visages viraient au violet et ça se voyait. Un fond
  /// sombre à peine marqué dans le coin bas droit suffit à asseoir la
  /// photo sans la colorer.
  static const photoGrade = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0x00160B2E), Color(0x22160B2E)],
  );

  /// Dégradé de lisibilité sous le texte posé sur une photo.
  static const photoScrim = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0.38, 1.0],
    colors: [Color(0x000B0616), Color(0xE00B0616)],
  );

  // Plateformes : couleurs de marque, laissées telles quelles.
  static const grindr = Color(0xFFFFC629);
  static const scruff = Color(0xFFE85D04);
  static const tinder = Color(0xFFFE3C72);
}

/// Rayons d'arrondi, d'un seul endroit.
///
/// Les maquettes reposent sur des formes franchement arrondies : c'est ce
/// qui donne son air moderne à l'ensemble. Des valeurs éparpillées dans les
/// écrans finiraient par diverger.
class AppRadius {
  static const pill = 999.0;
  static const card = 22.0;
  static const panel = 20.0;
  static const field = 16.0;
  static const button = 18.0;
  static const thumb = 16.0;
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        tertiary: AppColors.success,
        surface: AppColors.surface,
        error: AppColors.danger,
        onPrimary: Color(0xFF12071F),
        onSecondary: Color(0xFF12071F),
        onSurface: AppColors.textPrimary,
        onError: Color(0xFF12071F),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
            letterSpacing: -1.6),
        displayMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
            letterSpacing: -1),
        displaySmall: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w800),
        // Les grands titres passent en Chakra Petch, comme les intitulés
        // d'onglet : « 2026 », « Réglages », les titres de formulaires. Le
        // reste garde la police système, volontairement. Une police
        // d'affichage sur un paragraphe se lit mal, et deux caractères
        // qui se répondent valent mieux qu'un seul appliqué partout.
        //
        // L'espacement repart à zéro : Chakra Petch est déjà étroite, la
        // resserrer encore collerait les lettres.
        headlineLarge: TextStyle(
            fontFamily: 'ChakraPetch',
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 34,
            letterSpacing: 0),
        headlineMedium: TextStyle(
            fontFamily: 'ChakraPetch',
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 24,
            letterSpacing: 0),
        headlineSmall: TextStyle(
            fontFamily: 'ChakraPetch',
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 19,
            letterSpacing: 0),
        titleLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 17),
        titleMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            fontSize: 15),
        titleSmall: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
            fontSize: 13),
        bodyLarge: TextStyle(color: AppColors.textPrimary, fontSize: 16),
        bodyMedium: TextStyle(color: AppColors.textPrimary, fontSize: 14),
        bodySmall: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        labelLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
            fontSize: 14),
        labelMedium: TextStyle(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w700,
            fontSize: 12),
        // Les intitulés de section des maquettes : petits, espacés, en
        // capitales. La lettre espacée compense la petite taille.
        labelSmall: TextStyle(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w700,
            fontSize: 11,
            letterSpacing: 1.8),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.card),
          side: const BorderSide(color: AppColors.cardBorder),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: Color(0xFFE9D5FF),
        unselectedItemColor: Color(0xFF8B7BA8),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedLabelStyle:
            TextStyle(fontSize: 11, fontWeight: FontWeight.w800),
        unselectedLabelStyle:
            TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.accent,
        foregroundColor: Color(0xFF12071F),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppRadius.panel)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0x0DFFFFFF),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.field),
          borderSide: const BorderSide(color: AppColors.cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.field),
          borderSide: const BorderSide(color: AppColors.cardBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.field),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
        ),
        labelStyle:
            const TextStyle(color: AppColors.textSecondary, fontSize: 14),
        hintStyle:
            const TextStyle(color: Color(0xFF6F6191), fontSize: 14),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0x0EFFFFFF),
        selectedColor: AppColors.primary,
        labelStyle: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 12.5,
            fontWeight: FontWeight.w600),
        side: const BorderSide(color: AppColors.cardBorder),
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.card),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.card,
        contentTextStyle:
            const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.field),
        ),
        behavior: SnackBarBehavior.floating,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.cardBorder,
        thickness: 1,
        space: 0,
      ),
      iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 22),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: const Color(0xFF12071F),
          minimumSize: const Size.fromHeight(54),
          textStyle:
              const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.button),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          minimumSize: const Size.fromHeight(54),
          side: const BorderSide(color: AppColors.cardBorder),
          textStyle:
              const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.button),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: const Color(0xFFC084FC),
          textStyle:
              const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
