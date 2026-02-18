import 'package:flutter/material.dart';
import '../config/theme.dart';

class RatingStars extends StatelessWidget {
  final int rating;
  final double size;
  final bool interactive;
  final ValueChanged<int>? onChanged;

  const RatingStars({
    super.key,
    required this.rating,
    this.size = 20,
    this.interactive = false,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starIndex = index + 1;
        final icon = starIndex <= rating
            ? Icons.star_rounded
            : Icons.star_outline_rounded;
        final color = starIndex <= rating
            ? AppColors.star
            : AppColors.textSecondary.withValues(alpha: 0.3);

        if (interactive) {
          return GestureDetector(
            onTap: () => onChanged?.call(starIndex),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Icon(icon, size: size, color: color),
            ),
          );
        }
        return Icon(icon, size: size, color: color);
      }),
    );
  }
}
