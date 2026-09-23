import 'package:flutter/material.dart';

import '../domaine/note.dart';
import '../security/vault_image.dart';

/// La vignette d'une photo ou d'une vidéo de la galerie.
///
/// Une vidéo montre l'image tirée à son import, avec le triangle de
/// lecture et sa durée. Une vidéo importée sans vignette, parce qu'Android
/// n'a pas su la décoder, garde un aplat.
class VignetteMedia extends StatelessWidget {
  const VignetteMedia({super.key, required this.media});

  final Photo media;

  @override
  Widget build(BuildContext context) {
    if (!media.video) return VaultImage(path: media.chemin);

    final duree = media.dureeMs;
    final vignette = media.vignette;
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
          if (vignette != null) ...[
            VaultImage(path: vignette),
            // Un voile, pour que le triangle et la durée se lisent sur
            // n'importe quelle image.
            const ColoredBox(color: Color(0x33000000)),
          ],
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
