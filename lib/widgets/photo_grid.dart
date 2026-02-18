import 'dart:io';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../config/theme.dart';
import '../models/photo.dart';

class PhotoGrid extends StatelessWidget {
  final List<Photo> photos;
  final VoidCallback? onAddPhoto;
  final ValueChanged<Photo>? onDeletePhoto;
  final ValueChanged<Photo>? onSetAsMain;

  const PhotoGrid({
    super.key,
    required this.photos,
    this.onAddPhoto,
    this.onDeletePhoto,
    this.onSetAsMain,
  });

  void _openGallery(BuildContext context, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenGallery(
          photos: photos,
          initialIndex: initialIndex,
          onDelete: onDeletePhoto,
          onSetAsMain: onSetAsMain,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
      ),
      itemCount: photos.length + (onAddPhoto != null ? 1 : 0),
      itemBuilder: (context, index) {
        if (onAddPhoto != null && index == 0) {
          return _buildAddButton();
        }
        final photoIndex = onAddPhoto != null ? index - 1 : index;
        final photo = photos[photoIndex];
        return _buildPhotoTile(context, photo, photoIndex);
      },
    );
  }

  Widget _buildAddButton() {
    return GestureDetector(
      onTap: onAddPhoto,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(4),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_rounded, color: AppColors.primary, size: 24),
            SizedBox(height: 2),
            Text('Ajouter', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoTile(BuildContext context, Photo photo, int index) {
    return GestureDetector(
      onTap: () => _openGallery(context, index),
      child: Stack(
        fit: StackFit.expand,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: Image.file(
              File(photo.filePath),
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(
                color: AppColors.surface,
                child: const Icon(Icons.broken_image_rounded, color: AppColors.textSecondary),
              ),
            ),
          ),
          if (photo.isMain)
            Positioned(
              top: 3,
              left: 3,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
                child: const Text(
                  'MAIN',
                  style: TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.w800),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _FullScreenGallery extends StatefulWidget {
  final List<Photo> photos;
  final int initialIndex;
  final ValueChanged<Photo>? onDelete;
  final ValueChanged<Photo>? onSetAsMain;

  const _FullScreenGallery({
    required this.photos,
    required this.initialIndex,
    this.onDelete,
    this.onSetAsMain,
  });

  @override
  State<_FullScreenGallery> createState() => _FullScreenGalleryState();
}

class _FullScreenGalleryState extends State<_FullScreenGallery> {
  late int _currentIndex;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('${_currentIndex + 1} / ${widget.photos.length}'),
        actions: [
          if (widget.onSetAsMain != null)
            IconButton(
              icon: const Icon(Icons.star_rounded),
              tooltip: 'Définir comme principale',
              onPressed: () {
                widget.onSetAsMain?.call(widget.photos[_currentIndex]);
                Navigator.pop(context);
              },
            ),
          if (widget.onDelete != null)
            IconButton(
              icon: const Icon(Icons.delete_rounded, color: AppColors.danger),
              tooltip: 'Supprimer',
              onPressed: () {
                widget.onDelete?.call(widget.photos[_currentIndex]);
                Navigator.pop(context);
              },
            ),
        ],
      ),
      body: PhotoViewGallery.builder(
        pageController: _pageController,
        itemCount: widget.photos.length,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        builder: (context, index) {
          return PhotoViewGalleryPageOptions(
            imageProvider: FileImage(File(widget.photos[index].filePath)),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 3,
          );
        },
        backgroundDecoration: const BoxDecoration(color: Colors.black),
      ),
    );
  }
}
