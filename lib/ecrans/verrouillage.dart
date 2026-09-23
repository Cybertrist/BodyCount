import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/settings_provider.dart';

/// Écran d'ouverture.
///
/// Il n'y a pas de code à quatre chiffres maison : l'empreinte, et à
/// défaut le code de déverrouillage du téléphone, sont vérifiés par
/// Android lui-même. Un code inventé ici serait plus faible, et surtout
/// il ne protégerait rien, puisque c'est cette étape qui charge la clé
/// du trousseau. Sans elle, la base reste un bloc d'octets illisible.
class LockScreen extends ConsumerStatefulWidget {
  const LockScreen({super.key});

  @override
  ConsumerState<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends ConsumerState<LockScreen> {
  bool _enCours = false;
  String? _refus;
  bool _premierEssai = true;
  bool _sansVerrou = false;

  @override
  void initState() {
    super.initState();
    // Le premier essai part tout seul : ouvrir l'application et poser le
    // doigt doivent être le même geste.
    WidgetsBinding.instance.addPostFrameCallback((_) => _ouvrir());
  }

  /// Ouvre, en demandant l'empreinte ou non.
  ///
  /// Quand le verrou est coupé dans les réglages, cet écran ne fait que
  /// passer : la clé se charge et on entre. Il reste le seul point de
  /// chargement de la clé, ce qui évite d'avoir deux chemins d'entrée à
  /// tenir à jour.
  Future<void> _ouvrir() async {
    if (_enCours) return;

    // Le réglage est relu dans le coffre, pas dans le provider.
    //
    // Le provider charge ses valeurs depuis le stockage sécurisé, donc de
    // façon asynchrone : au démarrage, cet écran s'affiche avant que la
    // lecture soit revenue et voyait encore la valeur par défaut, c'est à
    // dire « verrou actif ». L'empreinte était donc réclamée même après
    // l'avoir coupée.
    final verrouActif = await ReglagesStore.verrouActif();
    if (!mounted) return;

    if (!verrouActif) {
      await ref.read(authServiceProvider).ouvrirSansVerrou();
      return;
    }

    setState(() {
      _enCours = true;
      _refus = null;
    });

    final service = ref.read(authServiceProvider);
    final resultat = await service.authenticate();
    final nu = resultat.ouvert ? false : await service.sansVerrouConfigure();

    if (!mounted) return;
    setState(() {
      _enCours = false;
      _premierEssai = false;
      _refus = resultat.raison;
      _sansVerrou = nu;
    });
    // La redirection est faite par le routeur dès que le verrou s'ouvre :
    // pas de navigation à la main ici, donc pas de chemin par lequel un
    // écran s'afficherait sans que la clé soit chargée.
  }

  @override
  Widget build(BuildContext context) {
    final court = MediaQuery.sizeOf(context).height < 800;

    return Scaffold(
      body: Stack(
        children: [
          // Halos violets, repris du dégradé du logo.
          Positioned(
            top: -150,
            left: -110,
            child: _Halo(
              size: 420,
              color: AppColors.primary.withValues(alpha: 0.30),
            ),
          ),
          Positioned(
            bottom: -180,
            right: -120,
            child: _Halo(
              size: 440,
              color: AppColors.accent.withValues(alpha: 0.22),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                children: [
                  SizedBox(height: court ? 48 : 90),
                  // Le fichier du logo porte son propre fond sombre, dont
                  // les angles carrés se détachaient du violet de la page.
                  // L'arrondi le fait passer pour une icône posée là, et
                  // le halo derrière raccorde les deux fonds.
                  Container(
                    width: court ? 92 : 108,
                    height: court ? 92 : 108,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(court ? 26 : 30),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.34),
                          blurRadius: 44,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(court ? 26 : 30),
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.cover,
                        filterQuality: FilterQuality.medium,
                      ),
                    ),
                  ),
                  const SizedBox(height: 26),
                  Text(
                    'BodyCount',
                    style: Theme.of(context)
                        .textTheme
                        .headlineLarge
                        ?.copyWith(fontSize: court ? 36 : 42),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Tout reste sur cet appareil. Aucun compte, '
                    'aucun serveur, aucune requête réseau.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  _BoutonEmpreinte(
                    enCours: _enCours,
                    onTap: _ouvrir,
                  ),
                  const SizedBox(height: 18),
                  Text(
                    _message(),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: _refus == null
                          ? AppColors.textSecondary
                          : AppColors.danger,
                    ),
                  ),
                  if (_sansVerrou) ...[
                    const SizedBox(height: 22),
                    TextButton(
                      onPressed: () =>
                          ref.read(authServiceProvider).ouvrirSansVerrou(),
                      child: const Text('Ouvrir sans verrou'),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Ce téléphone n\'a ni empreinte ni code. '
                        'Tes fiches seront chiffrées, mais rien ne '
                        'protégera leur ouverture.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          height: 1.45,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                  ],
                  const Spacer(),
                  const _Mention(),
                  SizedBox(height: court ? 16 : 28),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _message() {
    if (_enCours) return 'Vérification…';
    final refus = _refus;
    if (refus != null) return '$refus\nTouche pour réessayer.';
    if (_premierEssai) return 'Touche le capteur pour ouvrir';
    return 'Touche pour réessayer';
  }
}

class _BoutonEmpreinte extends StatelessWidget {
  const _BoutonEmpreinte({required this.enCours, required this.onTap});

  final bool enCours;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Déverrouiller avec l\'empreinte',
      child: InkWell(
        onTap: enCours ? null : onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 108,
          height: 108,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.brandGradient,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.42),
                blurRadius: 38,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: enCours
              ? const SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.6,
                    color: Color(0xFF12071F),
                  ),
                )
              : const Icon(
                  Icons.fingerprint_rounded,
                  size: 46,
                  color: Color(0xFF12071F),
                ),
        ),
      ),
    );
  }
}

class _Mention extends StatelessWidget {
  const _Mention();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.lock_rounded,
          size: 13,
          color: AppColors.success.withValues(alpha: 0.9),
        ),
        const SizedBox(width: 7),
        const Flexible(
          child: Text(
            'Base chiffrée, clé rangée dans le Keystore',
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textTertiary,
            ),
          ),
        ),
      ],
    );
  }
}

class _Halo extends StatelessWidget {
  const _Halo({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [color, color.withValues(alpha: 0)],
            stops: const [0.0, 0.72],
          ),
        ),
      ),
    );
  }
}
