import 'dart:io';
import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/contact.dart';
import 'platform_icon.dart';

class ContactCard extends StatelessWidget {
  final Contact contact;
  final VoidCallback? onTap;
  final bool gridView;

  const ContactCard({
    super.key,
    required this.contact,
    this.onTap,
    this.gridView = false,
  });

  @override
  Widget build(BuildContext context) {
    if (gridView) return _buildGridCard(context);
    return _buildListCard(context);
  }

  Widget _buildListCard(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            Hero(
              tag: 'contact_photo_${contact.id}',
              child: _buildAvatar(48),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          contact.pseudo,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                            letterSpacing: -0.2,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (contact.platform != null)
                        PlatformIcon(platform: contact.platform, size: 20),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (contact.averageRating != null) ...[
                        const Icon(Icons.star_rounded, size: 13, color: AppColors.star),
                        const SizedBox(width: 2),
                        Text(
                          contact.averageRating!.toStringAsFixed(1),
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        '${contact.encounterCount}x',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFF333333), size: 20),
          ],
        ),
      ),
    );
  }

  /// Grindr-style grid tile: photo fills the entire tile, name overlaid at bottom
  Widget _buildGridCard(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Full-bleed photo
            if (contact.mainPhotoPath != null)
              Hero(
                tag: 'contact_photo_${contact.id}',
                child: Image.file(
                  File(contact.mainPhotoPath!),
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => _defaultGridPlaceholder(),
                ),
              )
            else
              _defaultGridPlaceholder(),

            // Bottom gradient overlay
            Positioned(
              left: 0, right: 0, bottom: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(6, 20, 6, 6),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black87],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      contact.pseudo,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: Colors.white,
                        letterSpacing: -0.2,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                    if (contact.averageRating != null)
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 11, color: AppColors.star),
                          const SizedBox(width: 2),
                          Text(
                            contact.averageRating!.toStringAsFixed(1),
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${contact.encounterCount}x',
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),

            // Platform badge top-right
            if (contact.platform != null)
              Positioned(
                top: 4,
                right: 4,
                child: PlatformIcon(platform: contact.platform, size: 18),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(double size) {
    if (contact.mainPhotoPath != null) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.file(
          File(contact.mainPhotoPath!),
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => _defaultAvatar(size),
        ),
      );
    }
    return _defaultAvatar(size);
  }

  Widget _defaultAvatar(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Center(
        child: Text(
          contact.pseudo.isNotEmpty ? contact.pseudo[0].toUpperCase() : '?',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: size * 0.4,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  Widget _defaultGridPlaceholder() {
    return Container(
      color: AppColors.surface,
      child: Center(
        child: Text(
          contact.pseudo.isNotEmpty ? contact.pseudo[0].toUpperCase() : '?',
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }
}
