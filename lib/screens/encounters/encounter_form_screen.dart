import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/encounter.dart';
import '../../models/photo.dart';
import '../../providers/encounters_provider.dart';
import '../../database/photo_dao.dart';
import '../../utils/image_helper.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/rating_stars.dart';

class EncounterFormScreen extends ConsumerStatefulWidget {
  final int contactId;
  final int? encounterId;

  const EncounterFormScreen({
    super.key,
    required this.contactId,
    this.encounterId,
  });

  @override
  ConsumerState<EncounterFormScreen> createState() => _EncounterFormScreenState();
}

class _EncounterFormScreenState extends ConsumerState<EncounterFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();

  DateTime _date = DateTime.now();
  int _rating = 3;
  final List<File> _newPhotos = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_date),
      );
      setState(() {
        _date = DateTime(
          date.year, date.month, date.day,
          time?.hour ?? 20, time?.minute ?? 0,
        );
      });
    }
  }

  Future<void> _addPhotos() async {
    final files = await ImageHelper.pickMultipleFromGallery();
    if (files.isNotEmpty) {
      setState(() => _newPhotos.addAll(files));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final encounter = Encounter(
        contactId: widget.contactId,
        date: _date,
        locationName: _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        rating: _rating,
      );

      final notifier = ref.read(encountersNotifierProvider.notifier);
      final encounterId = await notifier.addEncounter(encounter);

      final photoDao = PhotoDao();
      for (final file in _newPhotos) {
        final savedPath = await ImageHelper.saveToPrivateStorage(file);
        await photoDao.insert(Photo(
          contactId: widget.contactId,
          encounterId: encounterId,
          filePath: savedPath,
        ));
      }

      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur : $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouvelle rencontre'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _save,
            child: _isLoading
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('OK', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Date
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 20),
              title: Text(DateFormatter.formatDateTime(_date), style: const TextStyle(fontSize: 14)),
              subtitle: Text(DateFormatter.timeAgo(_date), style: const TextStyle(fontSize: 12)),
              onTap: _pickDate,
            ),
            const SizedBox(height: 12),

            // Rating
            const Text('ÉVALUATION', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
            const SizedBox(height: 6),
            Center(
              child: RatingStars(
                rating: _rating,
                size: 40,
                interactive: true,
                onChanged: (v) => setState(() => _rating = v),
              ),
            ),
            const SizedBox(height: 20),

            // Location
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Lieu',
                prefixIcon: Icon(Icons.location_on_rounded),
                hintText: 'Chez lui, hôtel, etc.',
              ),
            ),
            const SizedBox(height: 12),

            // Notes
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes',
                prefixIcon: Icon(Icons.notes_rounded),
                hintText: 'Comment ça s\'est passé...',
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 20),

            // Photos
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('PHOTOS', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                TextButton.icon(
                  onPressed: _addPhotos,
                  icon: const Icon(Icons.add_photo_alternate_rounded, size: 16),
                  label: const Text('Ajouter', style: TextStyle(fontSize: 13)),
                ),
              ],
            ),
            if (_newPhotos.isNotEmpty) ...[
              const SizedBox(height: 6),
              SizedBox(
                height: 90,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _newPhotos.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 4),
                  itemBuilder: (context, index) {
                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: Image.file(
                            _newPhotos[index],
                            width: 90, height: 90, fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 2, right: 2,
                          child: GestureDetector(
                            onTap: () => setState(() => _newPhotos.removeAt(index)),
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: AppColors.danger,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close, size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
