import 'dart:io';
import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/encounter.dart';
import '../utils/date_formatter.dart';
import 'rating_stars.dart';

class EncounterTile extends StatelessWidget {
  final Encounter encounter;
  final bool showContactInfo;
  final VoidCallback? onTap;

  const EncounterTile({
    super.key,
    required this.encounter,
    this.showContactInfo = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline dot
            Column(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: const Color(0xFF222222),
                ),
              ],
            ),
            const SizedBox(width: 12),
            // Contact avatar
            if (showContactInfo) ...[
              _buildAvatar(),
              const SizedBox(width: 10),
            ],
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (showContactInfo && encounter.contactPseudo != null)
                        Text(
                          encounter.contactPseudo!,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      if (showContactInfo) const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          DateFormatter.formatDateTime(encounter.date),
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  RatingStars(rating: encounter.rating, size: 13),
                  if (encounter.locationName != null && encounter.locationName!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 12, color: AppColors.textSecondary),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            encounter.locationName!,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (encounter.notes != null && encounter.notes!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      encounter.notes!,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    if (encounter.contactPhotoPath != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.file(
          File(encounter.contactPhotoPath!),
          width: 36,
          height: 36,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _defaultAvatar(),
        ),
      );
    }
    return _defaultAvatar();
  }

  Widget _defaultAvatar() {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Center(
        child: Text(
          encounter.contactPseudo?.isNotEmpty == true
              ? encounter.contactPseudo![0].toUpperCase()
              : '?',
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w800,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
