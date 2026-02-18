import 'package:flutter/material.dart';
import '../config/theme.dart';

enum Platform {
  grindr('Grindr', AppColors.grindr, Icons.circle),
  scruff('Scruff', AppColors.scruff, Icons.circle),
  tinder('Tinder', AppColors.tinder, Icons.circle),
  autre('Autre', AppColors.textSecondary, Icons.circle);

  final String label;
  final Color color;
  final IconData icon;
  const Platform(this.label, this.color, this.icon);
}

class PredefinedTags {
  static const List<String> all = [
    'Régulier',
    'One-shot',
    'À revoir',
    'Favori',
    'Plan cul',
    'Date',
    'Ami+',
    'Bloqué',
  ];
}

class AppDimensions {
  static const double cardRadius = 16.0;
  static const double inputRadius = 12.0;
  static const double chipRadius = 20.0;
  static const double pagePadding = 16.0;
  static const double cardPadding = 16.0;
  static const double photoGridSpacing = 4.0;
  static const double thumbnailSize = 80.0;
  static const double avatarSize = 48.0;
}
