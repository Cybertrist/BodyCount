import 'dart:io';

import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;

import '../domaine/note.dart';
import '../providers/donnees.dart';
import '../security/photo_vault.dart';
import '../security/video_vault.dart';

/// Ajout de photos et de vidéos à la galerie d'une personne.
///
/// Un seul sélecteur pour les deux : on choisit dans sa galerie ce qu'on
/// veut garder, sans avoir à savoir d'avance s'il fallait le bouton des
/// photos ou celui des vidéos. Chaque fichier entre chiffré dans le coffre
/// et l'original temporaire est effacé.
class Medias {
  static final ImagePicker _picker = ImagePicker();
  static const _canal = MethodChannel('bodycount/medias');

  static const _extensionsVideo = {
    '.mp4',
    '.mov',
    '.m4v',
    '.3gp',
    '.webm',
    '.mkv',
    '.avi',
  };

  static bool _estVideo(XFile f) {
    final type = f.mimeType;
    if (type != null) return type.startsWith('video/');
    return _extensionsVideo.contains(p.extension(f.path).toLowerCase());
  }

  /// Ouvre le sélecteur, puis range chaque fichier choisi.
  ///
  /// [progression] est appelé avant chaque fichier, avec son rang et le
  /// total, pour que l'écran dise où on en est : chiffrer une longue
  /// vidéo prend quelques secondes.
  static Future<int> importer(
    int personneId, {
    void Function(int rang, int total, bool video)? progression,
  }) async {
    final choisis = await _picker.pickMultipleMedia(
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );

    var ranges = 0;
    for (var i = 0; i < choisis.length; i++) {
      final choisi = choisis[i];
      final video = _estVideo(choisi);
      progression?.call(i + 1, choisis.length, video);
      final fichier = File(choisi.path);

      if (video) {
        // Durée et vignette se lisent sur le fichier encore en clair,
        // avant qu'il entre au coffre et que l'original soit effacé.
        final apercu = await _apercu(fichier);
        final image = apercu?.image;
        final vignette = image == null
            ? null
            : await PhotoVault.instance.store(image);
        final chemin = await VideoVault.instance.absorber(fichier);
        await depotPhotos.ajouter(
          Photo(
            personneId: personneId,
            chemin: chemin,
            ajouteeLe: DateTime.now(),
            video: true,
            dureeMs: apercu?.dureeMs,
            vignette: vignette,
          ),
        );
      } else {
        final chemin = await PhotoVault.instance.absorb(fichier);
        await depotPhotos.ajouter(
          Photo(
            personneId: personneId,
            chemin: chemin,
            ajouteeLe: DateTime.now(),
          ),
        );
      }
      ranges++;
    }
    return ranges;
  }

  /// La durée et une image de la vidéo, demandées à Android : son
  /// lecteur de métadonnées lit l'en-tête et décode une seule image, là où
  /// ouvrir un lecteur vidéo complet prendrait plus longtemps pour ne
  /// donner que la durée. Null si Android n'y arrive pas : la vidéo est
  /// gardée quand même, sa vignette dira seulement moins de choses.
  static Future<({int? dureeMs, Uint8List? image})?> _apercu(File f) async {
    try {
      final r = await _canal.invokeMapMethod<String, Object?>('apercu', {
        'chemin': f.path,
      });
      if (r == null) return null;
      return (
        dureeMs: (r['duree'] as num?)?.toInt(),
        image: r['image'] as Uint8List?,
      );
    } on PlatformException {
      return null;
    }
  }
}
