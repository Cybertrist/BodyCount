import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/contact_dao.dart';
import '../models/contact.dart';

final contactDaoProvider = Provider<ContactDao>((ref) => ContactDao());

// Filtres et tri
final contactSearchProvider = StateProvider<String>((ref) => '');
final contactSortProvider = StateProvider<String>((ref) => 'updated_at DESC');
final contactPlatformFilterProvider = StateProvider<String?>((ref) => null);
final contactRatingFilterProvider = StateProvider<int?>((ref) => null);
final contactTagFilterProvider = StateProvider<String?>((ref) => null);

// Liste des contacts avec filtres appliqués
final contactsProvider = FutureProvider<List<Contact>>((ref) async {
  final dao = ref.read(contactDaoProvider);
  final search = ref.watch(contactSearchProvider);
  final sort = ref.watch(contactSortProvider);
  final platform = ref.watch(contactPlatformFilterProvider);
  final rating = ref.watch(contactRatingFilterProvider);
  final tag = ref.watch(contactTagFilterProvider);

  return dao.getAll(
    search: search.isNotEmpty ? search : null,
    orderBy: sort,
    platform: platform,
    minRating: rating,
    tag: tag,
  );
});

// Contact unique par ID
final contactByIdProvider = FutureProvider.family<Contact?, int>((ref, id) async {
  final dao = ref.read(contactDaoProvider);
  return dao.getById(id);
});

// Contacts récents pour le dashboard
final recentContactsProvider = FutureProvider<List<Contact>>((ref) async {
  final dao = ref.read(contactDaoProvider);
  return dao.getRecent(limit: 5);
});

// Top contacts pour les stats
final topContactsProvider = FutureProvider<List<Contact>>((ref) async {
  final dao = ref.read(contactDaoProvider);
  return dao.getTopContacts(limit: 5);
});

// Nombre total de contacts
final contactCountProvider = FutureProvider<int>((ref) async {
  final dao = ref.read(contactDaoProvider);
  return dao.getCount();
});

// Auto-complétion des pseudos
final pseudoSuggestionsProvider = FutureProvider<List<String>>((ref) async {
  final dao = ref.read(contactDaoProvider);
  return dao.getAllPseudos();
});

// Notifier pour les opérations CRUD
class ContactsNotifier extends StateNotifier<AsyncValue<void>> {
  final ContactDao _dao;
  final Ref _ref;

  ContactsNotifier(this._dao, this._ref) : super(const AsyncValue.data(null));

  Future<int> addContact(Contact contact) async {
    state = const AsyncValue.loading();
    try {
      final id = await _dao.insert(contact);
      _ref.invalidate(contactsProvider);
      _ref.invalidate(contactCountProvider);
      _ref.invalidate(recentContactsProvider);
      state = const AsyncValue.data(null);
      return id;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> updateContact(Contact contact) async {
    state = const AsyncValue.loading();
    try {
      await _dao.update(contact);
      _ref.invalidate(contactsProvider);
      _ref.invalidate(contactByIdProvider(contact.id!));
      _ref.invalidate(recentContactsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteContact(int id) async {
    state = const AsyncValue.loading();
    try {
      await _dao.delete(id);
      _ref.invalidate(contactsProvider);
      _ref.invalidate(contactCountProvider);
      _ref.invalidate(recentContactsProvider);
      _ref.invalidate(topContactsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final contactsNotifierProvider = StateNotifierProvider<ContactsNotifier, AsyncValue<void>>((ref) {
  return ContactsNotifier(ref.read(contactDaoProvider), ref);
});
