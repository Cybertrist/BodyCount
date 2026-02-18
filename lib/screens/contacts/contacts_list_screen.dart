import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/contacts_provider.dart';
import '../../widgets/contact_card.dart';
import '../../widgets/common/empty_state.dart';

class ContactsListScreen extends ConsumerStatefulWidget {
  const ContactsListScreen({super.key});

  @override
  ConsumerState<ContactsListScreen> createState() => _ContactsListScreenState();
}

class _ContactsListScreenState extends ConsumerState<ContactsListScreen> {
  bool _isGridView = true; // Default to grid (Grindr-style)
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final contactsAsync = ref.watch(contactsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Répertoire'),
        actions: [
          IconButton(
            icon: Icon(
              _isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded,
              size: 22,
            ),
            onPressed: () => setState(() => _isGridView = !_isGridView),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort_rounded, size: 22),
            color: AppColors.card,
            onSelected: (value) {
              ref.read(contactSortProvider.notifier).state = value;
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'updated_at DESC', child: Text('Plus récent')),
              const PopupMenuItem(value: 'pseudo ASC', child: Text('Nom A-Z')),
              const PopupMenuItem(value: 'last_encounter_date DESC', child: Text('Dernière rencontre')),
              const PopupMenuItem(value: 'encounter_count DESC', child: Text('Plus rencontré')),
              const PopupMenuItem(value: 'average_rating DESC', child: Text('Mieux noté')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 6),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(contactSearchProvider.notifier).state = '';
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
              onChanged: (value) {
                ref.read(contactSearchProvider.notifier).state = value;
              },
            ),
          ),

          // Platform filter chips
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _filterChip('Tous', ref.watch(contactPlatformFilterProvider) == null, () {
                  ref.read(contactPlatformFilterProvider.notifier).state = null;
                }),
                const SizedBox(width: 6),
                _filterChip('Grindr', ref.watch(contactPlatformFilterProvider) == 'grindr', () {
                  ref.read(contactPlatformFilterProvider.notifier).state = 'grindr';
                }),
                const SizedBox(width: 6),
                _filterChip('Scruff', ref.watch(contactPlatformFilterProvider) == 'scruff', () {
                  ref.read(contactPlatformFilterProvider.notifier).state = 'scruff';
                }),
                const SizedBox(width: 6),
                _filterChip('Tinder', ref.watch(contactPlatformFilterProvider) == 'tinder', () {
                  ref.read(contactPlatformFilterProvider.notifier).state = 'tinder';
                }),
              ],
            ),
          ),
          const SizedBox(height: 6),

          // Content
          Expanded(
            child: contactsAsync.when(
              data: (contacts) {
                if (contacts.isEmpty) {
                  return const EmptyState(
                    icon: Icons.people_rounded,
                    title: 'Aucun contact',
                    subtitle: 'Ajoute ta première rencontre avec le +',
                  );
                }

                if (_isGridView) {
                  return GridView.builder(
                    padding: const EdgeInsets.all(2),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3, // Grindr-style 3 columns
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 2,
                      mainAxisSpacing: 2,
                    ),
                    itemCount: contacts.length,
                    itemBuilder: (context, index) {
                      final contact = contacts[index];
                      return ContactCard(
                        contact: contact,
                        gridView: true,
                        onTap: () => context.push('/contacts/${contact.id}'),
                      );
                    },
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.only(bottom: 80),
                  itemCount: contacts.length,
                  separatorBuilder: (_, _) => const Divider(height: 1, indent: 76),
                  itemBuilder: (context, index) {
                    final contact = contacts[index];
                    return ContactCard(
                      contact: contact,
                      onTap: () => context.push('/contacts/${contact.id}'),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erreur: $e')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/contacts/new'),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _filterChip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.black : AppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
