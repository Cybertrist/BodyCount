import 'package:flutter/painting.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';

import '../donnees/base.dart';
import '../security/key_vault.dart';
import '../security/lock_state.dart';
import '../security/photo_vault.dart';
import '../security/video_vault.dart';

final localAuthProvider = Provider<LocalAuthentication>((ref) {
  return LocalAuthentication();
});

final isAuthenticatedProvider = StateProvider<bool>((ref) => false);

final biometricEnabledProvider = StateProvider<bool>((ref) => true);

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref);
});

/// Déverrouillage de l'application.
///
/// L'empreinte ne sert pas à masquer un écran : tant qu'elle n'a pas été
/// présentée, la clé du trousseau n'est pas chargée, donc la base et les
/// photos restent des octets illisibles. Contourner l'écran de garde ne
/// donnerait accès à rien.
class AuthService {
  final Ref _ref;
  final LocalAuthentication _auth = LocalAuthentication();

  AuthService(this._ref);

  Future<bool> isBiometricAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      return canCheck && isDeviceSupported;
    } catch (_) {
      return false;
    }
  }

  /// Demande l'empreinte, et rend la raison d'un échec plutôt qu'un
  /// simple faux.
  ///
  /// Un « Refusé » muet est intenable sur un écran qui garde l'unique
  /// porte d'entrée : sans le motif, impossible de distinguer un doigt
  /// mal posé d'un téléphone sans verrou configuré.
  Future<ResultatOuverture> authenticate() async {
    bool authentifie;
    try {
      authentifie = await _auth.authenticate(
        localizedReason: 'Déverrouille BodyCount',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } on PlatformException catch (e) {
      return ResultatOuverture.echec(_expliquer(e));
    } catch (e) {
      return ResultatOuverture.echec('Erreur inattendue : $e');
    }

    if (!authentifie) {
      return const ResultatOuverture.echec('Annulé.');
    }

    // La clé n'entre en mémoire qu'ici, une fois l'identité prouvée.
    await KeyVault.instance.unlock();
    _ref.read(isAuthenticatedProvider.notifier).state = true;
    EtatVerrou.instance.setUnlocked(true);
    return const ResultatOuverture.succes();
  }

  /// Ouvre sans authentification, quand le téléphone n'a aucun verrou.
  ///
  /// Refuser l'accès dans ce cas n'apporterait rien : sur un téléphone
  /// sans code ni empreinte, quiconque l'a en main est déjà entré. Et
  /// enfermer l'utilisateur dehors sans recours serait pire que tout.
  /// Le chiffrement reste actif, la clé est simplement chargée sans
  /// preuve d'identité préalable.
  Future<void> ouvrirSansVerrou() async {
    await KeyVault.instance.unlock();
    _ref.read(isAuthenticatedProvider.notifier).state = true;
    EtatVerrou.instance.setUnlocked(true);
  }

  /// Vrai si aucune empreinte ni code n'est enregistré sur l'appareil.
  Future<bool> sansVerrouConfigure() async {
    try {
      final supporte = await _auth.isDeviceSupported();
      if (!supporte) return true;
      final moyens = await _auth.getAvailableBiometrics();
      final possible = await _auth.canCheckBiometrics;
      return moyens.isEmpty && !possible;
    } catch (_) {
      return true;
    }
  }

  /// Traduit les codes d'erreur d'Android en phrases utiles.
  String _expliquer(PlatformException e) {
    switch (e.code) {
      case 'NotAvailable':
        return 'Le capteur ne répond pas. Réessaie dans un instant.';
      case 'NotEnrolled':
        return 'Aucune empreinte ni code enregistré sur ce téléphone.\n'
            'Ajoute un verrou dans les réglages Android, puis reviens.';
      case 'LockedOut':
        return 'Trop d\'essais. Attends trente secondes.';
      case 'PermanentlyLockedOut':
        return 'Capteur bloqué. Déverrouille le téléphone avec ton code, '
            'puis rouvre BodyCount.';
      case 'no_fragment_activity':
        return 'Erreur d\'installation : l\'application n\'utilise pas '
            'l\'activité attendue par le lecteur d\'empreinte.';
      default:
        return '${e.code} · ${e.message ?? "sans détail"}';
    }
  }

  /// Referme tout : la connexion à la base, le cache des photos, les clés.
  ///
  /// Rien ne survit en mémoire, donc une capture de la mémoire du processus
  /// après verrouillage ne rend ni la clé ni une image.
  Future<void> lock() async {
    _ref.read(isAuthenticatedProvider.notifier).state = false;
    EtatVerrou.instance.setUnlocked(false);
    await Base.instance.fermer();
    PhotoVault.instance.forget();
    await VideoVault.instance.oublierLectures();
    imageCache.clear();
    imageCache.clearLiveImages();
    KeyVault.instance.lock();
  }
}

/// Le résultat d'une tentative d'ouverture.
class ResultatOuverture {
  const ResultatOuverture.succes() : raison = null;
  const ResultatOuverture.echec(this.raison);

  /// Null quand tout s'est bien passé.
  final String? raison;

  bool get ouvert => raison == null;
}
