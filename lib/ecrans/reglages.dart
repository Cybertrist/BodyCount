import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../donnees/base.dart';
import '../donnees/demonstration.dart';
import '../providers/auth_provider.dart';
import '../providers/donnees.dart';
import '../providers/settings_provider.dart';
import '../utils/export_helper.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reglages = ref.watch(reglagesProvider);
    final personnes = ref.watch(repertoireProvider).valueOrNull?.length;
    final rencontres = ref.watch(journalProvider).valueOrNull?.length;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 8, 22, 40),
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 19),
                  tooltip: 'Retour',
                ),
                const SizedBox(width: 4),
                Text('Réglages',
                    style: Theme.of(context).textTheme.headlineMedium),
              ],
            ),
            const SizedBox(height: 18),
            _Resume(personnes: personnes, rencontres: rencontres),
            const SizedBox(height: 22),

            const _Intitule('Sécurité'),
            _Bloc(
              children: [
                _LigneBascule(
                  icone: Icons.fingerprint_rounded,
                  titre: 'Empreinte à l\'ouverture',
                  sousTitre: reglages.verrouActif
                      ? 'C\'est elle qui charge la clé de déchiffrement'
                      : 'Coupée : la clé se charge sans rien demander',
                  valeur: reglages.verrouActif,
                  onChanged: (v) => _basculerVerrou(context, ref, v),
                ),
                _LigneBascule(
                  icone: Icons.visibility_off_rounded,
                  titre: 'Masquer dans le multitâche',
                  sousTitre: 'Bloque aussi les captures d\'écran',
                  valeur: reglages.ecranProtege,
                  onChanged: (v) =>
                      ref.read(reglagesProvider.notifier).setEcranProtege(v),
                ),
                _LigneChoix(
                  icone: Icons.timer_outlined,
                  titre: 'Verrouillage automatique',
                  valeur: reglages.verrouActif
                      ? _libelleDelai(reglages.delaiVerrou)
                      : 'Sans effet',
                  sousTitre: 'Sans geste à l\'écran, ou en arrière-plan',
                  onTap: () => _choisirDelai(context, ref),
                ),
              ],
            ),
            const SizedBox(height: 22),

            const _Intitule('Données'),
            _Bloc(
              children: [
                const _Ligne(
                  icone: Icons.shield_outlined,
                  teinte: AppColors.success,
                  titre: 'Tout reste sur ce téléphone',
                  sousTitre: 'Base chiffrée, aucun compte, aucun serveur',
                ),
                _LigneChoix(
                  icone: Icons.ios_share_rounded,
                  titre: 'Exporter, chiffré',
                  valeur: 'Phrase de passe',
                  onTap: () => _exporter(context),
                ),
              ],
            ),
            const SizedBox(height: 22),

            const _Intitule('Essais'),
            _Bloc(
              children: [
                _LigneChoix(
                  icone: Icons.auto_awesome_outlined,
                  titre: 'Remplir avec un jeu d\'essai',
                  valeur: '18 fiches',
                  onTap: () => _remplir(context, ref),
                ),
              ],
            ),
            const SizedBox(height: 22),

            _BoutonDanger(onTap: () => _toutEffacer(context, ref)),
            const SizedBox(height: 18),
            const Center(
              child: Text(
                'BodyCount 1.0 · hors ligne, sans compte',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF574A73),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _libelleDelai(Duration d) {
    if (d.inSeconds < 60) return 'Après ${d.inSeconds} s';
    if (d.inMinutes == 1) return 'Après 1 minute';
    return 'Après ${d.inMinutes} minutes';
  }

  /// Coupe ou remet le verrou, en disant ce que ça change.
  ///
  /// Le chiffrement, lui, ne bouge pas : la base reste chiffrée, la clé
  /// reste dans le Keystore. Ce qui change, c'est qu'elle se charge sans
  /// preuve d'identité, donc que quiconque tient le téléphone déverrouillé
  /// ouvre le journal.
  Future<void> _basculerVerrou(
    BuildContext context,
    WidgetRef ref,
    bool actif,
  ) async {
    if (actif) {
      await ref.read(reglagesProvider.notifier).setVerrouActif(true);
      return;
    }

    final sur = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ouvrir sans empreinte ?'),
        content: const Text(
          'La base restera chiffrée et la clé restera dans le Keystore. '
          'Mais elle se chargera sans rien demander : quiconque tient ton '
          'téléphone déverrouillé ouvrira le journal.\n\n'
          'Le verrouillage automatique n\'aura plus d\'effet non plus.',
          style: TextStyle(height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text(
              'Couper le verrou',
              style: TextStyle(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );

    if (sur != true) return;
    await ref.read(reglagesProvider.notifier).setVerrouActif(false);
  }

  Future<void> _choisirDelai(BuildContext context, WidgetRef ref) async {
    const choix = [
      Duration(seconds: 15),
      Duration(seconds: 45),
      Duration(minutes: 2),
      Duration(minutes: 5),
    ];
    final actuel = ref.read(reglagesProvider).delaiVerrou;

    final choisi = await showDialog<Duration>(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: const Text('Verrouiller après'),
        children: [
          for (final d in choix)
            ListTile(
              title: Text(_libelleDelai(d)),
              trailing: d == actuel
                  ? const Icon(Icons.check_rounded,
                      size: 20, color: AppColors.primary)
                  : null,
              onTap: () => Navigator.pop(ctx, d),
            ),
        ],
      ),
    );

    if (choisi != null) {
      await ref.read(reglagesProvider.notifier).setDelaiVerrou(choisi);
    }
  }

  Future<void> _exporter(BuildContext context) async {
    final phrase = await _demanderPhrase(context);
    if (phrase == null || !context.mounted) return;

    _patienter(context, 'Chiffrement de la sauvegarde…');
    try {
      final chemin = await ExportHelper.exportEncrypted(phrase);
      if (context.mounted) Navigator.pop(context);
      await ExportHelper.shareFile(chemin);
      // Le fichier temporaire a fait son travail une fois partagé.
      await ExportHelper.cleanUp(chemin);
    } catch (e) {
      if (!context.mounted) return;
      Navigator.pop(context);
      _erreur(context, '$e');
    }
  }

  Future<String?> _demanderPhrase(BuildContext context) {
    final champ = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Phrase de passe'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Elle protège la sauvegarde, et elle seule permettra de la '
              'relire. Personne ne peut la retrouver à ta place.',
              style: TextStyle(fontSize: 13, height: 1.45),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: champ,
              autofocus: true,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Au moins 8 caractères',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              if (champ.text.length >= 8) Navigator.pop(ctx, champ.text);
            },
            child: const Text('Exporter'),
          ),
        ],
      ),
    );
  }

  /// Ajoute un jeu d'essai, pour juger les écrans.
  ///
  /// Sans données, un graphique mensuel n'a qu'une barre et un classement
  /// qu'une ligne : impossible de voir si le dessin tient. Les fiches
  /// créées ici s'effacent comme les autres.
  Future<void> _remplir(BuildContext context, WidgetRef ref) async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ajouter un jeu d\'essai ?'),
        content: const Text(
          'Dix-huit profils complets, photos comprises, et cent onze '
          'rencontres réparties sur deux ans, pour voir ce que donnent les '
          'graphiques. Elles s\'ajoutent à tes données, elles ne les '
          'remplacent pas.',
          style: TextStyle(height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );

    if (confirme != true || !context.mounted) return;

    _patienter(context, 'Création des fiches…');
    await const Demonstration().remplir();
    if (!context.mounted) return;
    Navigator.pop(context);
    toutOublier(ref);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Jeu d\'essai ajouté.')),
    );
  }

  void _toutEffacer(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tout effacer ?'),
        content: const Text(
          'Les fiches, les rencontres et les photos sont détruites, et la '
          'clé de chiffrement avec elles. Rien ne sera récupérable, même '
          'avec un outil spécialisé.',
          style: TextStyle(height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);

              // Verrouiller d'abord, détruire ensuite. Dans l'autre sens,
              // la clé disparaissait pendant que les écrans de données
              // étaient encore montés : le premier à redemander la base
              // ne l'obtenait pas et gardait l'erreur en mémoire, même
              // après une nouvelle empreinte. Le verrou ramène à l'écran
              // d'ouverture, donc plus rien ne lit une base qu'on est en
              // train d'effacer, et les providers sont vidés à la
              // réouverture.
              await ref.read(authServiceProvider).lock();
              await Base.instance.toutDetruire();
            },
            child: const Text(
              'Tout effacer',
              style: TextStyle(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }

  void _patienter(BuildContext context, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        content: Row(
          children: [
            const SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.4),
            ),
            const SizedBox(width: 18),
            Expanded(child: Text(message)),
          ],
        ),
      ),
    );
  }

  void _erreur(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.danger),
    );
  }
}

class _Resume extends StatelessWidget {
  const _Resume({this.personnes, this.rencontres});

  final int? personnes;
  final int? rencontres;

  @override
  Widget build(BuildContext context) {
    // Les deux lignes se lisent comme des titres, pas comme une phrase :
    // « 18 Personnes » au dessus de « 111 Rencontres », chacune ouvrant
    // la sienne, donc chacune avec sa majuscule.
    final detail = rencontres == null
        ? ''
        : '$rencontres ${rencontres! <= 1 ? 'Rencontre' : 'Rencontres'}';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0x38A855F7), Color(0x24D946EF)],
        ),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(15),
            child: Image.asset('assets/logo.png',
                width: 48, height: 48, fit: BoxFit.cover),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  personnes == null
                      ? '—'
                      : '$personnes ${personnes! <= 1 ? 'Personne' : 'Personnes'}',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                if (detail.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    detail,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFB9A9D6),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Intitule extends StatelessWidget {
  const _Intitule(this.texte);

  final String texte;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 2, bottom: 9),
      child: Text(
        texte.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall,
      ),
    );
  }
}

class _Bloc extends StatelessWidget {
  const _Bloc({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0x0BFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(height: 1),
            children[i],
          ],
        ],
      ),
    );
  }
}

class _Pastille extends StatelessWidget {
  const _Pastille({required this.icone, this.teinte = AppColors.primary});

  final IconData icone;
  final Color teinte;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        color: teinte.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(10),
      ),
      alignment: Alignment.center,
      child: Icon(icone, size: 16, color: teinte),
    );
  }
}

class _Ligne extends StatelessWidget {
  const _Ligne({
    required this.icone,
    required this.titre,
    this.sousTitre,
    this.teinte = AppColors.primary,
  });

  final IconData icone;
  final String titre;
  final String? sousTitre;
  final Color teinte;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      leading: _Pastille(icone: icone, teinte: teinte),
      title: Text(titre, style: const TextStyle(fontSize: 14)),
      subtitle: sousTitre == null
          ? null
          : Text(sousTitre!,
              style: const TextStyle(
                  fontSize: 11.5, color: AppColors.textTertiary)),
    );
  }
}

class _LigneBascule extends StatelessWidget {
  const _LigneBascule({
    required this.icone,
    required this.titre,
    required this.valeur,
    required this.onChanged,
    this.sousTitre,
  });

  final IconData icone;
  final String titre;
  final String? sousTitre;
  final bool valeur;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      secondary: _Pastille(icone: icone),
      title: Text(titre, style: const TextStyle(fontSize: 14)),
      subtitle: sousTitre == null
          ? null
          : Text(sousTitre!,
              style: const TextStyle(
                  fontSize: 11.5, color: AppColors.textTertiary)),
      value: valeur,
      onChanged: onChanged,
    );
  }
}

class _LigneChoix extends StatelessWidget {
  const _LigneChoix({
    required this.icone,
    required this.titre,
    required this.valeur,
    required this.onTap,
    this.sousTitre,
  });

  final IconData icone;
  final String titre;
  final String valeur;
  final String? sousTitre;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      leading: _Pastille(icone: icone),
      title: Text(titre, style: const TextStyle(fontSize: 14)),
      subtitle: sousTitre == null
          ? null
          : Text(
              sousTitre!,
              style: const TextStyle(
                fontSize: 12,
                height: 1.35,
                color: AppColors.textTertiary,
              ),
            ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(valeur,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary)),
          const SizedBox(width: 6),
          const Icon(Icons.chevron_right_rounded,
              size: 18, color: Color(0xFF6F6191)),
        ],
      ),
      onTap: onTap,
    );
  }
}

class _BoutonDanger extends StatelessWidget {
  const _BoutonDanger({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.panel),
      child: Container(
        height: 58,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        decoration: BoxDecoration(
          color: AppColors.danger.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppRadius.panel),
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.22)),
        ),
        child: Row(
          children: [
            _Pastille(icone: Icons.delete_outline_rounded, teinte: AppColors.danger),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Effacer toutes les données',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.danger,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
