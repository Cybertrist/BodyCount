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

  void setUnlocked(bool value) {
    if (_unlocked == value) return;
    _unlocked = value;
    notifyListeners();
  }
}
