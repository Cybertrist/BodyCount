import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:video_player/video_player.dart';

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

  static const _extensionsVideo = {
    '.mp4', '.mov', '.m4v', '.3gp', '.webm', '.mkv', '.avi',
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
        final duree = await _duree(fichier);
        final chemin = await VideoVault.instance.absorber(fichier);
        await depotPhotos.ajouter(Photo(
          personneId: personneId,
          chemin: chemin,
          ajouteeLe: DateTime.now(),
          video: true,
          dureeMs: duree?.inMilliseconds,
        ));
      } else {
        final chemin = await PhotoVault.instance.absorb(fichier);
        await depotPhotos.ajouter(Photo(
          personneId: personneId,
          chemin: chemin,
          ajouteeLe: DateTime.now(),
        ));
      }
      ranges++;
    }
    return ranges;
  }

  /// La durée, lue une fois sur le fichier encore en clair, avant qu'il
  /// entre au coffre. Null si le lecteur n'y arrive pas : la vidéo est
  /// gardée quand même, sa vignette dira seulement moins de choses.
  static Future<Duration?> _duree(File fichier) async {
    final lecteur = VideoPlayerController.file(fichier);
    try {
      await lecteur.initialize();
      return lecteur.value.duration;
    } catch (_) {
      return null;
    } finally {
      await lecteur.dispose();
    }
  }
}
