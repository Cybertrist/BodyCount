import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/theme.dart';
import '../../providers/encounters_provider.dart';
import '../../models/encounter.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/rating_stars.dart';
import '../../widgets/common/empty_state.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final encountersAsync = ref.watch(encountersWithLocationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Carte'),
      ),
      body: encountersAsync.when(
        data: (encounters) {
          if (encounters.isEmpty) {
            return const EmptyState(
              icon: Icons.map_rounded,
              title: 'Aucun lieu',
              subtitle: 'Ajoute des coordonnées GPS à tes rencontres',
            );
          }

          final center = LatLng(
            encounters.map((e) => e.latitude!).reduce((a, b) => a + b) / encounters.length,
            encounters.map((e) => e.longitude!).reduce((a, b) => a + b) / encounters.length,
          );

          return FlutterMap(
            options: MapOptions(
              initialCenter: center,
              initialZoom: 11,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.bodycount.bodycount',
              ),
              MarkerLayer(
                markers: encounters.map((e) => _buildMarker(context, e)).toList(),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
      ),
    );
  }

  Marker _buildMarker(BuildContext context, Encounter encounter) {
    return Marker(
      point: LatLng(encounter.latitude!, encounter.longitude!),
      width: 36,
      height: 36,
      child: GestureDetector(
        onTap: () => _showEncounterPopup(context, encounter),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Colors.black, width: 2),
          ),
          child: const Icon(Icons.location_on_rounded, color: Colors.black, size: 20),
        ),
      ),
    );
  }

  void _showEncounterPopup(BuildContext context, Encounter encounter) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (encounter.contactPseudo != null)
              Text(
                encounter.contactPseudo!,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
            const SizedBox(height: 6),
            Text(
              DateFormatter.formatDateTime(encounter.date),
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 6),
            RatingStars(rating: encounter.rating, size: 18),
            if (encounter.locationName != null) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(encounter.locationName!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            ],
            if (encounter.notes != null && encounter.notes!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(encounter.notes!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13), maxLines: 3),
            ],
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
