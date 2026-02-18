import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';

final localAuthProvider = Provider<LocalAuthentication>((ref) {
  return LocalAuthentication();
});

final isAuthenticatedProvider = StateProvider<bool>((ref) => false);

final biometricEnabledProvider = StateProvider<bool>((ref) => true);

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref);
});

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

  Future<bool> authenticate() async {
    try {
      final authenticated = await _auth.authenticate(
        localizedReason: 'Authentifie-toi pour accéder à BodyCount',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
      _ref.read(isAuthenticatedProvider.notifier).state = authenticated;
      return authenticated;
    } catch (_) {
      return false;
    }
  }

  void lock() {
    _ref.read(isAuthenticatedProvider.notifier).state = false;
  }
}
