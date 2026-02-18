import 'package:flutter/material.dart';
import '../config/theme.dart';

class PlatformIcon extends StatelessWidget {
  final String? platform;
  final double size;

  const PlatformIcon({
    super.key,
    this.platform,
    this.size = 20,
  });

  Color get _color {
    switch (platform?.toLowerCase()) {
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

  String get _label {
    switch (platform?.toLowerCase()) {
      case 'grindr':
        return 'G';
      case 'scruff':
        return 'S';
      case 'tinder':
        return 'T';
      default:
        return '?';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Center(
        child: Text(
          _label,
          style: TextStyle(
            color: _color,
            fontSize: size * 0.55,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}
