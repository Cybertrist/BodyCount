import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';

class LockScreen extends ConsumerStatefulWidget {
  const LockScreen({super.key});

  @override
  ConsumerState<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends ConsumerState<LockScreen> {
  String _pin = '';
  String? _error;
  final bool _useBiometric = true;
  static const _correctPin = '1234';

  @override
  void initState() {
    super.initState();
    _tryBiometric();
  }

  Future<void> _tryBiometric() async {
    final authService = ref.read(authServiceProvider);
    final available = await authService.isBiometricAvailable();
    if (available && _useBiometric) {
      final success = await authService.authenticate();
      if (success && mounted) {
        context.go('/home');
      }
    }
  }

  void _onPinDigit(String digit) {
    if (_pin.length >= 4) return;
    setState(() {
      _pin += digit;
      _error = null;
    });
    if (_pin.length == 4) _validatePin();
  }

  void _onPinDelete() {
    if (_pin.isEmpty) return;
    setState(() {
      _pin = _pin.substring(0, _pin.length - 1);
      _error = null;
    });
  }

  void _validatePin() {
    if (_pin == _correctPin) {
      ref.read(isAuthenticatedProvider.notifier).state = true;
      context.go('/home');
    } else {
      setState(() {
        _pin = '';
        _error = 'PIN incorrect';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // Logo
              const Icon(Icons.lock_rounded, size: 48, color: AppColors.primary),
              const SizedBox(height: 12),
              const Text(
                'BODYCOUNT',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 32),

              // PIN dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (i) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: i < _pin.length ? AppColors.primary : Colors.transparent,
                      border: Border.all(
                        color: _error != null ? AppColors.danger : AppColors.primary,
                        width: 2,
                      ),
                    ),
                  );
                }),
              ),

              if (_error != null) ...[
                const SizedBox(height: 10),
                Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13)),
              ],

              const SizedBox(height: 32),

              // Numpad
              ...List.generate(3, (row) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (col) {
                      final digit = '${row * 3 + col + 1}';
                      return _pinButton(digit, () => _onPinDigit(digit));
                    }),
                  ),
                );
              }),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _pinButton(
                      '',
                      _tryBiometric,
                      icon: Icons.fingerprint_rounded,
                    ),
                    _pinButton('0', () => _onPinDigit('0')),
                    _pinButton(
                      '',
                      _onPinDelete,
                      icon: Icons.backspace_rounded,
                    ),
                  ],
                ),
              ),

              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _pinButton(String label, VoidCallback onTap, {IconData? icon}) {
    return Padding(
      padding: const EdgeInsets.all(4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(36),
        child: Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.surface,
          ),
          child: Center(
            child: icon != null
                ? Icon(icon, color: AppColors.primary, size: 26)
                : Text(
                    label,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
          ),
        ),
      ),
    );
  }
}
