import 'dart:math';

import '../donnees/coordonnees.dart';

/// La distance entre deux villes, en kilomètres, ou null si l'une des
/// deux ne figure pas dans la table embarquée.
///
/// Formule de la haversine, sur une sphère de 6371 km. À l'échelle d'un
/// pays l'écart avec un ellipsoïde est de quelques kilomètres, ce qui
/// n'a aucune importance pour décider si un trajet dépasse deux cents.
double? distanceEntreVilles(String a, String b) {
  final da = coordonneesDe(a);
  final db = coordonneesDe(b);
  if (da == null || db == null) return null;

  const rayon = 6371.0;
  final dLat = _rad(db.latitude - da.latitude);
  final dLon = _rad(db.longitude - da.longitude);
  final h = sin(dLat / 2) * sin(dLat / 2) +
      cos(_rad(da.latitude)) *
          cos(_rad(db.latitude)) *
          sin(dLon / 2) *
          sin(dLon / 2);
  return rayon * 2 * atan2(sqrt(h), sqrt(1 - h));
}

double _rad(double degres) => degres * pi / 180;
