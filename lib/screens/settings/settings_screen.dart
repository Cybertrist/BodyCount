import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../database/database_helper.dart';
import '../../utils/export_helper.dart';
import '../../providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final biometricEnabled = ref.watch(biometricEnabledProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Paramètres')),
      body: ListView(
        children: [
          // Biometric
          SwitchListTile(
            secondary: const Icon(Icons.fingerprint_rounded, color: AppColors.primary),
            title: const Text('Biométrie'),
            subtitle: const Text('Verrouillage par empreinte/face', style: TextStyle(fontSize: 12)),
            value: biometricEnabled,
            activeThumbColor: AppColors.primary,
            onChanged: (v) {
              ref.read(biometricEnabledProvider.notifier).state = v;
            },
          ),
          const Divider(color: Color(0xFF1A1A1A)),

          // Export JSON
          ListTile(
            leading: const Icon(Icons.file_download_rounded, color: AppColors.primary),
            title: const Text('Exporter (JSON)'),
            subtitle: const Text('Données sans photos', style: TextStyle(fontSize: 12)),
            onTap: () => _exportJson(context),
          ),

          // Export ZIP
          ListTile(
            leading: const Icon(Icons.archive_rounded, color: AppColors.primary),
            title: const Text('Exporter (ZIP)'),
            subtitle: const Text('Données + photos', style: TextStyle(fontSize: 12)),
            onTap: () => _exportZip(context),
          ),
          const Divider(color: Color(0xFF1A1A1A)),

          // Delete all
          ListTile(
            leading: const Icon(Icons.delete_forever_rounded, color: AppColors.danger),
            title: const Text('Tout supprimer', style: TextStyle(color: AppColors.danger)),
            subtitle: const Text('Action irréversible', style: TextStyle(fontSize: 12)),
            onTap: () => _deleteAll(context, ref),
          ),
          const Divider(color: Color(0xFF1A1A1A)),

          // About
          const ListTile(
            leading: Icon(Icons.info_outline_rounded, color: AppColors.textSecondary),
            title: Text('BodyCount'),
            subtitle: Text('v1.0.0', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Future<void> _exportJson(BuildContext context) async {
    try {
      _showLoading(context, 'Export...');
      final path = await ExportHelper.exportToJson();
      if (context.mounted) Navigator.pop(context);
      await ExportHelper.shareFile(path);
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        _showError(context, 'Erreur: $e');
      }
    }
  }

  Future<void> _exportZip(BuildContext context) async {
    try {
      _showLoading(context, 'Export...');
      final path = await ExportHelper.exportToZip();
      if (context.mounted) Navigator.pop(context);
      await ExportHelper.shareFile(path);
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        _showError(context, 'Erreur: $e');
      }
    }
  }

  void _deleteAll(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tout supprimer ?'),
        content: const Text('Toutes les données seront perdues définitivement.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _confirmDeleteAll(context, ref);
            },
            child: const Text('Confirmer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteAll(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Dernière chance'),
        content: const Text('Cette action est irréversible.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await DatabaseHelper().deleteAllData();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Données supprimées')),
                );
              }
            },
            child: const Text('Tout supprimer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  void _showLoading(BuildContext context, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 16),
            Text(message),
          ],
        ),
      ),
    );
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.danger),
    );
  }
}
