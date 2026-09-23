import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/services.dart' show rootBundle;

/// La géométrie de la France, embarquée avec l'application.
///
/// Le trait de côte et les limites de départements viennent de données
/// ouvertes, compactées dans un fichier binaire de 180 Ko : chaque point
/// tient sur quatre octets, longitude et latitude quantifiées au
/// 1/2000e de degré, soit une cinquantaine de mètres. À l'écran d'un
/// téléphone, la perte est invisible, et le décodage prend quelques
/// millisecondes là où un GeoJSON de 1,2 Mo coûterait une seconde.
///
/// Rien n'est téléchargé. Une carte à tuiles enverrait à un serveur, à
/// chaque déplacement, la liste des endroits regardés, ce qui pour cette
/// application est exactement la chose à ne pas faire.
class GeometrieFrance {
  GeometrieFrance._(this.cote, this.departements)
      : bornesCote = bornesDe(cote),
        bornesDepartements = bornesDe(departements);

  /// Trait de côte et frontières, îles comprises. C'est le dessin de la
  /// terre : c'est lui qu'on remplit.
  final List<Float32List> cote;

  /// Limites intérieures des départements, tracées en filigrane.
  final List<Float32List> departements;

  /// L'étendue de chaque anneau, en degrés. Calculée une fois au
  /// chargement : c'est elle qui permet d'écarter d'un seul test les
  /// anneaux qui ne touchent pas la zone regardée.
  final List<Rect> bornesCote;
  final List<Rect> bornesDepartements;

  static const origineLon = -6.0;
  static const origineLat = 41.0;
  static const _echelle = 2000.0;

  static Future<GeometrieFrance>? _chargement;

  /// Charge la géométrie une fois pour toute la durée de vie du
  /// processus. Les appels suivants rendent le même futur.
  static Future<GeometrieFrance> charger() {
    return _chargement ??= _lire();
  }

  static Future<GeometrieFrance> _lire() async {
    final octets = await rootBundle.load('assets/carte/france.bin');
    final vue = ByteData.view(
      octets.buffer,
      octets.offsetInBytes,
      octets.lengthInBytes,
    );

    // « FRA1 », puis le nombre de couches.
    if (vue.getUint8(0) != 0x46 ||
        vue.getUint8(1) != 0x52 ||
        vue.getUint8(2) != 0x41) {
      throw StateError('Fichier de carte illisible.');
    }

    var position = 8;
    final couches = <List<Float32List>>[];
    final nbCouches = vue.getUint32(4, Endian.little);

    for (var c = 0; c < nbCouches; c++) {
      final nbAnneaux = vue.getUint32(position, Endian.little);
      position += 4;

      final anneaux = <Float32List>[];
      for (var a = 0; a < nbAnneaux; a++) {
        final nbPoints = vue.getUint32(position, Endian.little);
        position += 4;

        // On restitue des degrés dès le décodage : le dessin n'a plus
        // qu'à projeter, sans repasser par la quantification.
        final points = Float32List(nbPoints * 2);
        for (var i = 0; i < nbPoints; i++) {
          points[i * 2] =
              vue.getUint16(position, Endian.little) / _echelle + origineLon;
          points[i * 2 + 1] = vue.getUint16(position + 2, Endian.little) /
                  _echelle +
              origineLat;
          position += 4;
        }
        anneaux.add(points);
      }
      couches.add(anneaux);
    }

    return GeometrieFrance._(couches[0], couches[1]);
  }

  /// Convertit des anneaux en chemin, dans le repère de l'écran.
  ///
  /// [projeter] reçoit une longitude et une latitude et rend un point en
  /// pixels : c'est la vue qui décide du cadrage, pas la géométrie.
  ///
  /// [fenetre] limite le travail aux anneaux qui touchent la zone
  /// visible, en degrés. Sans elle, s'approcher de Vannes coûtait aussi
  /// cher que d'afficher le pays : le moteur graphique paie tous les
  /// segments d'un chemin, y compris ceux qui tombent à des écrans de
  /// distance, et l'application ramait d'autant plus qu'on zoomait.
  static Path cheminDe(
    List<Float32List> anneaux,
    Offset Function(double lon, double lat) projeter, {
    bool fermer = true,
    Rect? fenetre,
    List<Rect>? bornes,
  }) {
    final chemin = Path();

    for (var a = 0; a < anneaux.length; a++) {
      final anneau = anneaux[a];
      if (anneau.length < 6) continue;
      if (fenetre != null && bornes != null && !bornes[a].overlaps(fenetre)) {
        continue;
      }

      var premier = true;
      for (var i = 0; i < anneau.length; i += 2) {
        final p = projeter(anneau[i], anneau[i + 1]);
        if (premier) {
          chemin.moveTo(p.dx, p.dy);
          premier = false;
        } else {
          chemin.lineTo(p.dx, p.dy);
        }
      }
      if (fermer) chemin.close();
    }

    return chemin;
  }

  /// L'étendue de chaque anneau, en degrés, calculée une fois au
  /// chargement : c'est ce qui permet d'écarter d'un test ceux qui ne
  /// touchent pas la zone regardée.
  static List<Rect> bornesDe(List<Float32List> anneaux) {
    return [
      for (final anneau in anneaux)
        () {
          if (anneau.length < 2) return Rect.zero;
          var minL = anneau[0], maxL = anneau[0];
          var minA = anneau[1], maxA = anneau[1];
          for (var i = 2; i < anneau.length; i += 2) {
            final l = anneau[i], a = anneau[i + 1];
            if (l < minL) minL = l;
            if (l > maxL) maxL = l;
            if (a < minA) minA = a;
            if (a > maxA) maxA = a;
          }
          return Rect.fromLTRB(minL, minA, maxL, maxA);
        }(),
    ];
  }
}
