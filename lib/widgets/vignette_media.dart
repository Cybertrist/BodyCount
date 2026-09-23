import 'package:flutter/material.dart';

import '../domaine/note.dart';
import '../security/vault_image.dart';

/// La vignette d'une photo ou d'une vidéo de la galerie.
///
/// Une vidéo n'a pas d'image à montrer sans être déchiffrée en entier,
/// ce qu'on ne fait pas pour une vignette : elle s'affiche en aplat, avec
/// le triangle de lecture et sa durée, ce qui suffit à la reconnaître.
class VignetteMedia extends StatelessWidget {
  const VignetteMedia({super.key, required this.media});

  final Photo media;

  @override
  Widget build(BuildContext context) {
    if (!media.video) return VaultImage(path: media.chemin);

    final duree = media.dureeMs;
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2A1450), Color(0xFF12071F)],
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          const Center(
            child: Icon(
              Icons.play_circle_fill_rounded,
              size: 30,
              color: Color(0xE6FFFFFF),
            ),
          ),
          if (duree != null)
            Positioned(
              right: 6,
              bottom: 5,
              child: Text(
                formaterDuree(Duration(milliseconds: duree)),
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  shadows: [Shadow(blurRadius: 4, color: Colors.black)],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// « 0:42 », « 12:05 », « 1:02:13 ».
String formaterDuree(Duration d) {
  final s = (d.inSeconds % 60).toString().padLeft(2, '0');
  if (d.inHours > 0) {
    final m = (d.inMinutes % 60).toString().padLeft(2, '0');
    return '${d.inHours}:$m:$s';
  }
  return '${d.inMinutes}:$s';
}
