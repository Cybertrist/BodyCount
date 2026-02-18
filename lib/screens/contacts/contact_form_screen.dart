import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/contact.dart';
import '../../providers/contacts_provider.dart';
import '../../utils/constants.dart' as constants;
import '../../utils/image_helper.dart';
import '../../widgets/rating_stars.dart';
import '../../widgets/tag_chip.dart';
import '../../models/encounter.dart';
import '../../providers/encounters_provider.dart';

class ContactFormScreen extends ConsumerStatefulWidget {
  final int? contactId;

  const ContactFormScreen({super.key, this.contactId});

  @override
  ConsumerState<ContactFormScreen> createState() => _ContactFormScreenState();
}

class _ContactFormScreenState extends ConsumerState<ContactFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pseudoController = TextEditingController();
  final _profileUrlController = TextEditingController();
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();

  String? _selectedPlatform;
  List<String> _selectedTags = [];
  String? _photoPath;
  int _rating = 3;
  DateTime _encounterDate = DateTime.now();
  bool _isLoading = false;
  bool _addEncounter = true;

  bool get _isEditing => widget.contactId != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) _loadContact();
  }

  @override
  void dispose() {
    _pseudoController.dispose();
    _profileUrlController.dispose();
    _ageController.dispose();
    _heightController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadContact() async {
    final contact = await ref.read(contactByIdProvider(widget.contactId!).future);
    if (contact != null && mounted) {
      setState(() {
        _pseudoController.text = contact.pseudo;
        _profileUrlController.text = contact.profileUrl ?? '';
        _ageController.text = contact.age?.toString() ?? '';
        _heightController.text = contact.height?.toString() ?? '';
        _descriptionController.text = contact.description ?? '';
        _selectedPlatform = contact.platform;
        _selectedTags = List.from(contact.tags);
        _photoPath = contact.mainPhotoPath;
        _addEncounter = false;
      });
    }
  }

  Future<void> _pickPhoto() async {
    final source = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: AppColors.primary),
              title: const Text('Galerie'),
              onTap: () => Navigator.pop(context, 'gallery'),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded, color: AppColors.primary),
              title: const Text('Appareil photo'),
              onTap: () => Navigator.pop(context, 'camera'),
            ),
          ],
        ),
      ),
    );

    if (source == null) return;

    final file = source == 'gallery'
        ? await ImageHelper.pickFromGallery()
        : await ImageHelper.pickFromCamera();

    if (file != null) {
      final savedPath = await ImageHelper.saveToPrivateStorage(file);
      setState(() => _photoPath = savedPath);
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _encounterDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_encounterDate),
      );
      setState(() {
        _encounterDate = DateTime(
          date.year, date.month, date.day,
          time?.hour ?? 20, time?.minute ?? 0,
        );
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final contact = Contact(
        id: widget.contactId,
        pseudo: _pseudoController.text.trim(),
        platform: _selectedPlatform,
        profileUrl: _profileUrlController.text.trim().isEmpty ? null : _profileUrlController.text.trim(),
        age: _ageController.text.isNotEmpty ? int.tryParse(_ageController.text) : null,
        height: _heightController.text.isNotEmpty ? int.tryParse(_heightController.text) : null,
        description: _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
        tags: _selectedTags,
        mainPhotoPath: _photoPath,
      );

      final notifier = ref.read(contactsNotifierProvider.notifier);

      if (_isEditing) {
        await notifier.updateContact(contact);
        if (mounted) context.pop();
      } else {
        final contactId = await notifier.addContact(contact);

        if (_addEncounter) {
          final encounter = Encounter(
            contactId: contactId,
            date: _encounterDate,
            locationName: _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
            notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
            rating: _rating,
          );
          await ref.read(encountersNotifierProvider.notifier).addEncounter(encounter);
        }

        if (mounted) context.pop();
      }
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
        title: Text(_isEditing ? 'Modifier' : 'Nouvelle rencontre'),
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
            // Photo — square, sharp corners
            Center(
              child: GestureDetector(
                onTap: _pickPhoto,
                child: _photoPath != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: Image.file(
                          File(_photoPath!),
                          width: 100, height: 100, fit: BoxFit.cover,
                        ),
                      )
                    : Container(
                        width: 100, height: 100,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo_rounded, color: AppColors.primary, size: 28),
                            SizedBox(height: 2),
                            Text('Photo', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                          ],
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 20),

            // Pseudo
            TextFormField(
              controller: _pseudoController,
              decoration: const InputDecoration(
                labelText: 'Pseudo / Prénom *',
                prefixIcon: Icon(Icons.person_rounded),
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Requis' : null,
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 12),

            // Platform
            DropdownButtonFormField<String>(
              initialValue: _selectedPlatform,
              decoration: const InputDecoration(
                labelText: 'Plateforme',
                prefixIcon: Icon(Icons.apps_rounded),
              ),
              dropdownColor: AppColors.card,
              items: constants.Platform.values.map((p) {
                return DropdownMenuItem(value: p.name, child: Text(p.label));
              }).toList(),
              onChanged: (v) => setState(() => _selectedPlatform = v),
            ),
            const SizedBox(height: 12),

            // Profile URL
            TextFormField(
              controller: _profileUrlController,
              decoration: const InputDecoration(
                labelText: 'Lien profil',
                prefixIcon: Icon(Icons.link_rounded),
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 12),

            // Age + Height
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _ageController,
                    decoration: const InputDecoration(
                      labelText: 'Âge',
                      prefixIcon: Icon(Icons.cake_rounded),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    controller: _heightController,
                    decoration: const InputDecoration(
                      labelText: 'Taille (cm)',
                      prefixIcon: Icon(Icons.height_rounded),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                prefixIcon: Icon(Icons.description_rounded),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Tags
            const Text('TAGS', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: constants.PredefinedTags.all.map((tag) {
                final selected = _selectedTags.contains(tag);
                return TagChip(
                  label: tag,
                  selected: selected,
                  onTap: () {
                    setState(() {
                      if (selected) {
                        _selectedTags.remove(tag);
                      } else {
                        _selectedTags.add(tag);
                      }
                    });
                  },
                );
              }).toList(),
            ),

            // Encounter section (new contact only)
            if (!_isEditing) ...[
              const SizedBox(height: 20),
              const Divider(color: Color(0xFF1A1A1A)),
              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Première rencontre',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  Switch(
                    value: _addEncounter,
                    onChanged: (v) => setState(() => _addEncounter = v),
                    activeThumbColor: AppColors.primary,
                  ),
                ],
              ),

              if (_addEncounter) ...[
                const SizedBox(height: 12),

                // Date
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 20),
                  title: Text(
                    '${_encounterDate.day}/${_encounterDate.month}/${_encounterDate.year} à ${_encounterDate.hour}h${_encounterDate.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  onTap: _pickDate,
                ),
                const SizedBox(height: 8),

                TextFormField(
                  controller: _locationController,
                  decoration: const InputDecoration(
                    labelText: 'Lieu',
                    prefixIcon: Icon(Icons.location_on_rounded),
                  ),
                ),
                const SizedBox(height: 12),

                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes',
                    prefixIcon: Icon(Icons.notes_rounded),
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 12),

                const Text('ÉVALUATION', style: TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                const SizedBox(height: 6),
                Center(
                  child: RatingStars(
                    rating: _rating,
                    size: 36,
                    interactive: true,
                    onChanged: (v) => setState(() => _rating = v),
                  ),
                ),
              ],
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
