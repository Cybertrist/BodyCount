import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'photo_vault.dart';

/// Source d'image branchée sur le coffre.
///
/// Se comporte comme un `FileImage` du point de vue de Flutter, y compris
/// pour le cache d'images et pour `photo_view`, sauf que les octets sont
/// déchiffrés au vol et n'existent jamais en clair sur le disque.
@immutable
class VaultImageProvider extends ImageProvider<VaultImageProvider> {
  const VaultImageProvider(this.path, {this.scale = 1.0});

  final String path;
  final double scale;

  @override
  Future<VaultImageProvider> obtainKey(ImageConfiguration configuration) {
    return SynchronousFuture<VaultImageProvider>(this);
  }

  @override
  ImageStreamCompleter loadImage(
    VaultImageProvider key,
    ImageDecoderCallback decode,
  ) {
    return MultiFrameImageStreamCompleter(
      codec: _decode(key, decode),
      scale: key.scale,
      debugLabel: key.path,
    );
  }

  Future<ui.Codec> _decode(
    VaultImageProvider key,
    ImageDecoderCallback decode,
  ) async {
    final bytes = await PhotoVault.instance.read(key.path);
    if (bytes == null || bytes.isEmpty) {
      // Laisse le cache oublier cette image plutôt que de garder un échec.
      PaintingBinding.instance.imageCache.evict(key);
      throw StateError('Photo absente ou altérée : ${key.path}');
    }
    final buffer = await ui.ImmutableBuffer.fromUint8List(bytes);
    return decode(buffer);
  }

  @override
  bool operator ==(Object other) =>
      other is VaultImageProvider &&
      other.path == path &&
      other.scale == scale;

  @override
  int get hashCode => Object.hash(path, scale);

  @override
  String toString() => 'VaultImageProvider("$path")';
}

/// Affiche une photo du coffre.
///
/// Pendant le déchiffrement, montre un aplat sombre plutôt qu'un blanc :
/// sur une grille de fiches, une série de rectangles clairs qui clignotent
/// attire l'œil bien plus que les photos elles-mêmes.
class VaultImage extends StatelessWidget {
  const VaultImage({
    super.key,
    required this.path,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.alignment = Alignment.center,
  });

  final String path;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    return Image(
      image: VaultImageProvider(path),
      fit: fit,
      width: width,
      height: height,
      alignment: alignment,
      gaplessPlayback: true,
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded || frame != null) return child;
        return _Placeholder(width: width, height: height);
      },
      errorBuilder: (context, error, stack) {
        return _Placeholder(width: width, height: height, broken: true);
      },
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder({this.width, this.height, this.broken = false});

  final double? width;
  final double? height;
  final bool broken;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      color: const Color(0xFF1B0C36),
      alignment: Alignment.center,
      child: broken
          ? const Icon(Icons.image_not_supported_outlined,
              size: 20, color: Color(0xFF6F6191))
          : null,
    );
  }
}
