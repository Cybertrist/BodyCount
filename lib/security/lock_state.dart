import 'package:flutter/foundation.dart';

/// État du verrou, partagé entre le routeur et le reste de l'application.
///
/// GoRouter a besoin d'un [Listenable] pour réévaluer ses redirections ;
/// c'est la raison d'être de cette classe, qui reste la seule source de
/// vérité sur « l'application est-elle ouverte ».
class EtatVerrou extends ChangeNotifier {
  EtatVerrou._();

  static final EtatVerrou instance = EtatVerrou._();

  bool _unlocked = false;
  bool get isUnlocked => _unlocked;

  /// Instant du passage en arrière plan, pour le reverrouillage automatique.
  DateTime? pausedAt;

  int _retenues = 0;

  /// Vrai pendant un travail qui ne doit pas être coupé : une sauvegarde,
  /// une restauration, le chiffrement d'une vidéo, un passage par le
  /// sélecteur de fichiers du système. Le verrouillage automatique attend
  /// qu'il finisse : couper la clé au milieu laisserait une restauration à
  /// moitié faite, et une vidéo de cinq minutes se chiffre sans qu'on
  /// touche l'écran.
  bool get retenu => _retenues > 0;

  /// Retient le verrou le temps de [travail], puis le relâche. Relâcher
  /// prévient les écouteurs, qui relancent alors le compte à rebours.
  Future<T> retenir<T>(Future<T> Function() travail) async {
    _retenues++;
    try {
      return await travail();
    } finally {
      _retenues--;
      if (_retenues == 0) notifyListeners();
    }
  }

  void setUnlocked(bool value) {
    if (_unlocked == value) return;
    _unlocked = value;
    notifyListeners();
  }
}
