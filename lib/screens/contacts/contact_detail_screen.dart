import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../models/contact.dart';
import '../../models/photo.dart';
import '../../providers/contacts_provider.dart';
import '../../providers/encounters_provider.dart';
import '../../database/photo_dao.dart';
import '../../utils/image_helper.dart';
import '../../widgets/rating_stars.dart';
import '../../widgets/tag_chip.dart';
import '../../widgets/platform_icon.dart';
import '../../widgets/encounter_tile.dart';
import '../../widgets/photo_grid.dart';

final _contactPhotosProvider = FutureProvider.family<List<Photo>, int>((ref, contactId) async {
  return PhotoDao().getByContact(contactId);
});

class ContactDetailScreen extends ConsumerWidget {
  final int contactId;

  const ContactDetailScreen({super.key, required this.contactId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactAsync = ref.watch(contactByIdProvider(contactId));
    final encountersAsync = ref.watch(encountersByContactProvider(contactId));
    final photosAsync = ref.watch(_contactPhotosProvider(contactId));

    return contactAsync.when(
      data: (contact) {
        if (contact == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Contact introuvable')),
          );
        }
        return _buildDetail(context, ref, contact, encountersAsync, photosAsync);
      },
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Erreur: $e')),
      ),
    );
  }

  Widget _buildDetail(
    BuildContext context,
    WidgetRef ref,
    Contact contact,
    AsyncValue encountersAsync,
    AsyncValue photosAsync,
  ) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // SliverAppBar with photo
          SliverAppBar(
            expandedHeight: contact.mainPhotoPath != null ? 320 : 160,
            pinned: true,
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_rounded, size: 22),
                onPressed: () => context.push('/contacts/$contactId/edit'),
              ),
              PopupMenuButton(
                color: AppColors.card,
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'delete',
                    child: Text('Supprimer', style: TextStyle(color: AppColors.danger)),
                  ),
                ],
                onSelected: (value) {
                  if (value == 'delete') _confirmDelete(context, ref);
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                contact.pseudo,
                style: const TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.3),
              ),
              background: contact.mainPhotoPath != null
                  ? Hero(
                      tag: 'contact_photo_$contactId',
                      child: Image.file(
                        File(contact.mainPhotoPath!),
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(color: AppColors.surface),
                      ),
                    )
                  : Container(
                      color: AppColors.surface,
                      child: Center(
                        child: Text(
                          contact.pseudo.isNotEmpty ? contact.pseudo[0].toUpperCase() : '?',
                          style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w800, color: AppColors.primary),
                        ),
                      ),
                    ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick info row
                  Row(
                    children: [
                      if (contact.platform != null) ...[
                        PlatformIcon(platform: contact.platform, size: 26),
                        const SizedBox(width: 8),
                      ],
                      if (contact.averageRating != null)
                        RatingStars(rating: contact.averageRating!.round(), size: 16),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${contact.encounterCount}x',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Age / Height chips
                  if (contact.age != null || contact.height != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          if (contact.age != null)
                            _infoChip('${contact.age} ans'),
                          if (contact.age != null && contact.height != null)
                            const SizedBox(width: 8),
                          if (contact.height != null)
                            _infoChip('${contact.height} cm'),
                        ],
                      ),
                    ),

                  if (contact.description != null && contact.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        contact.description!,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
                      ),
                    ),

                  if (contact.profileUrl != null && contact.profileUrl!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GestureDetector(
                        onTap: () => _openUrl(contact.profileUrl!),
                        child: Row(
                          children: [
                            const Icon(Icons.link_rounded, size: 14, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                contact.profileUrl!,
                                style: const TextStyle(color: AppColors.primary, fontSize: 13),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Tags
                  if (contact.tags.isNotEmpty) ...[
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: contact.tags.map((t) => TagChip(label: t, selected: true)).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],

                  const Divider(color: Color(0xFF1A1A1A)),
                  const SizedBox(height: 8),

                  // Photos gallery
                  photosAsync.when(
                    data: (photos) {
                      if (photos.isEmpty) return const SizedBox.shrink();
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('PHOTOS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 1)),
                          const SizedBox(height: 8),
                          PhotoGrid(
                            photos: photos as List<Photo>,
                            onAddPhoto: () => _addPhoto(ref),
                            onDeletePhoto: (photo) => _deletePhoto(ref, photo),
                            onSetAsMain: (photo) => _setMainPhoto(ref, photo),
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: Color(0xFF1A1A1A)),
                          const SizedBox(height: 8),
                        ],
                      );
                    },
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                  ),

                  // Encounters
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('RENCONTRES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 1)),
                      TextButton.icon(
                        onPressed: () => context.push('/contacts/$contactId/encounter/new'),
                        icon: const Icon(Icons.add_rounded, size: 16),
                        label: const Text('Ajouter', style: TextStyle(fontSize: 13)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  encountersAsync.when(
                    data: (encounters) {
                      if (encounters.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Center(
                            child: Text('Aucune rencontre', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                          ),
                        );
                      }
                      return Column(
                        children: encounters.map((e) => EncounterTile(encounter: e)).toList(),
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Erreur: $e'),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/contacts/$contactId/encounter/new'),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _infoChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
      ),
    );
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _addPhoto(WidgetRef ref) async {
    final file = await ImageHelper.pickFromGallery();
    if (file != null) {
      final savedPath = await ImageHelper.saveToPrivateStorage(file);
      await PhotoDao().insert(Photo(contactId: contactId, filePath: savedPath));
      ref.invalidate(_contactPhotosProvider(contactId));
    }
  }

  Future<void> _deletePhoto(WidgetRef ref, Photo photo) async {
    await ImageHelper.deleteImage(photo.filePath);
    await PhotoDao().delete(photo.id!);
    ref.invalidate(_contactPhotosProvider(contactId));
  }

  Future<void> _setMainPhoto(WidgetRef ref, Photo photo) async {
    await PhotoDao().setAsMain(photo.id!, contactId);
    ref.invalidate(_contactPhotosProvider(contactId));
    ref.invalidate(contactByIdProvider(contactId));
    ref.invalidate(contactsProvider);
  }

  void _confirmDelete(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer ce contact ?'),
        content: const Text('Toutes les rencontres et photos associées seront supprimées.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(contactsNotifierProvider.notifier).deleteContact(contactId);
              if (context.mounted) context.go('/contacts');
            },
            child: const Text('Supprimer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }
}
