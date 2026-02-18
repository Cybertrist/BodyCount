import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/encounter_dao.dart';
import '../models/encounter.dart';
import 'contacts_provider.dart';

final encounterDaoProvider = Provider<EncounterDao>((ref) => EncounterDao());

// Rencontres par contact
final encountersByContactProvider = FutureProvider.family<List<Encounter>, int>((ref, contactId) async {
  final dao = ref.read(encounterDaoProvider);
  return dao.getByContact(contactId);
});

// Toutes les rencontres (pour timeline)
final allEncountersProvider = FutureProvider<List<Encounter>>((ref) async {
  final dao = ref.read(encounterDaoProvider);
  return dao.getAll();
});

// Rencontres avec localisation (pour carte)
final encountersWithLocationProvider = FutureProvider<List<Encounter>>((ref) async {
  final dao = ref.read(encounterDaoProvider);
  return dao.getWithLocation();
});

// Nombre total de rencontres
final encounterCountProvider = FutureProvider<int>((ref) async {
  final dao = ref.read(encounterDaoProvider);
  return dao.getCount();
});

// Notifier pour les opérations CRUD
class EncountersNotifier extends StateNotifier<AsyncValue<void>> {
  final EncounterDao _dao;
  final Ref _ref;

  EncountersNotifier(this._dao, this._ref) : super(const AsyncValue.data(null));

  Future<int> addEncounter(Encounter encounter) async {
    state = const AsyncValue.loading();
    try {
      final id = await _dao.insert(encounter);
      _invalidateAll(encounter.contactId);
      state = const AsyncValue.data(null);
      return id;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> updateEncounter(Encounter encounter) async {
    state = const AsyncValue.loading();
    try {
      await _dao.update(encounter);
      _invalidateAll(encounter.contactId);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteEncounter(int id, int contactId) async {
    state = const AsyncValue.loading();
    try {
      await _dao.delete(id);
      _invalidateAll(contactId);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void _invalidateAll(int contactId) {
    _ref.invalidate(encountersByContactProvider(contactId));
    _ref.invalidate(allEncountersProvider);
    _ref.invalidate(encountersWithLocationProvider);
    _ref.invalidate(encounterCountProvider);
    _ref.invalidate(contactByIdProvider(contactId));
    _ref.invalidate(contactsProvider);
    _ref.invalidate(recentContactsProvider);
    _ref.invalidate(topContactsProvider);
  }
}

final encountersNotifierProvider = StateNotifierProvider<EncountersNotifier, AsyncValue<void>>((ref) {
  return EncountersNotifier(ref.read(encounterDaoProvider), ref);
});
