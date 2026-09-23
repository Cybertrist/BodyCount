import 'dart:io';

import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;

import '../domaine/note.dart';
import '../providers/donnees.dart';
import '../security/photo_vault.dart';
import '../security/lock_state.dart';
import '../security/video_vault.dart';
import 'fichiers.dart';

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
    void Function(double part)? allegement,
  }) async {
    // Android renvoie l'avancement du réencodage par le même canal.
    _canal.setMethodCallHandler((appel) async {
      if (appel.method == 'avancement') {
        allegement?.call(((appel.arguments as num?) ?? 0) / 100);
      }
    });
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
        final allegee = await _alleger(fichier);
        final String chemin;
        if (allegee != null) {
          chemin = await VideoVault.instance.absorber(allegee);
          // L'original ne sert plus : c'est la version allégée qui entre.
          try {
            await fichier.delete();
          } on FileSystemException {
            // Le sélecteur le nettoiera.
          }
        } else {
          chemin = await VideoVault.instance.absorber(fichier);
        }
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

  /// Demande à Android une version allégée de la vidéo : 720 points sur le
  /// petit côté, H.264 à 2,5 Mb/s. Null quand la vidéo est déjà légère,
  /// que le gain ne vaut pas la perte, ou que l'encodeur échoue : c'est
  /// alors l'original qui entre au coffre.
  static Future<File?> _alleger(File f) async {
    try {
      final chemin = await _canal.invokeMethod<String>(
        'alleger',
        {'chemin': f.path},
      );
      return chemin == null ? null : File(chemin);
    } on PlatformException {
      return null;
    }
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
  /// Sort un média du coffre et le range, en clair, dans la galerie du
  /// téléphone : Images/BodyCount pour une photo, Films/BodyCount pour une
  /// vidéo. Avant Android 10, où la galerie demanderait un droit sur tout
  /// le stockage, le sélecteur « enregistrer sous » prend le relais.
  static Future<RangementGalerie> versGalerie(Photo media) {
    // Déchiffrer une longue vidéo prend du temps sans geste à l'écran.
    return EtatVerrou.instance.retenir(() async {
      final quand = DateTime.now();
      final horodatage = '${quand.year}${_deux(quand.month)}${_deux(quand.day)}'
          '-${_deux(quand.hour)}${_deux(quand.minute)}${_deux(quand.second)}';

      if (!media.video) {
        final octets = await PhotoVault.instance.read(media.chemin);
        if (octets == null) return RangementGalerie.echec;
        final (mime, ext) = _typeImage(octets);
        final nom = 'bodycount-$horodatage.$ext';
        final r = await _canal.invokeMethod<String>('versGalerie', {
          'nom': nom,
          'mime': mime,
          'video': false,
          'octets': octets,
        });
        if (r == 'ok') return RangementGalerie.galerie;
        if (r != 'nonGere') return RangementGalerie.echec;
        final dir = await getTemporaryDirectory();
        final temporaire = File(p.join(dir.path, nom));
        await temporaire.writeAsBytes(octets, flush: true);
        try {
          return await Fichiers.enregistrer(temporaire.path, nom)
              ? RangementGalerie.fichier
              : RangementGalerie.annule;
        } finally {
          await temporaire.delete();
        }
      }

      final clair =
          await VideoVault.instance.dechiffrerPourLecture(media.chemin);
      if (clair == null) return RangementGalerie.echec;
      try {
        final debut = await clair.openRead(0, 12).expand((b) => b).toList();
        final (mime, ext) = _typeVideo(debut);
        final nom = 'bodycount-$horodatage.$ext';
        final r = await _canal.invokeMethod<String>('versGalerie', {
          'nom': nom,
          'mime': mime,
          'video': true,
          'chemin': clair.path,
        });
        if (r == 'ok') return RangementGalerie.galerie;
        if (r != 'nonGere') return RangementGalerie.echec;
        return await Fichiers.enregistrer(clair.path, nom)
            ? RangementGalerie.fichier
            : RangementGalerie.annule;
      } finally {
        await VideoVault.instance.oublierLecture(clair);
      }
    });
  }

  static String _deux(int n) => n.toString().padLeft(2, '0');

  /// Le type d'une image, lu dans ses premiers octets plutôt que supposé :
  /// le sélecteur rend du JPEG, le jeu d'essai du PNG ou du WebP.
  static (String, String) _typeImage(List<int> o) {
    if (o.length > 3 && o[0] == 0x89 && o[1] == 0x50) {
      return ('image/png', 'png');
    }
    if (o.length > 11 && o[8] == 0x57 && o[9] == 0x45 && o[10] == 0x42) {
      return ('image/webp', 'webp');
    }
    return ('image/jpeg', 'jpg');
  }

  /// MP4 ou MOV, reconnus à leur marque « ftyp ».
  static (String, String) _typeVideo(List<int> o) {
    final marque =
        o.length >= 12 ? String.fromCharCodes(o.sublist(8, 12)) : '';
    if (marque == 'qt  ') return ('video/quicktime', 'mov');
    if (o.length >= 4 && o[0] == 0x1A && o[1] == 0x45) {
      return ('video/webm', 'webm');
    }
    return ('video/mp4', 'mp4');
  }
}

/// Où est allé un média sorti du coffre.
enum RangementGalerie { galerie, fichier, annule, echec }
