import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../domaine/etiquette.dart';
import '../domaine/note.dart';
import '../providers/donnees.dart';
import '../security/photo_vault.dart';
import '../security/vault_image.dart';
import '../utils/image_helper.dart';
import '../widgets/pastilles.dart';
import '../widgets/echec.dart';

/// Les étiquettes d'une personne.
///
/// L'ordre compte : les deux premières sont mises en avant sur la fiche.
/// On les réordonne en les faisant glisser, ce qui évite d'avoir à
/// expliquer la règle quelque part.
class EcranEtiquettes extends ConsumerStatefulWidget {
  const EcranEtiquettes({super.key, required this.personneId});

  final int personneId;

  @override
  ConsumerState<EcranEtiquettes> createState() => _EcranEtiquettesState();
}

/// Un vocabulaire de départ, rangé par famille.
///
/// Sans lui, la première fiche se retrouve devant un champ vide, et on
/// invente à chaque fois des mots différents pour la même chose. Les
/// propositions disparaissent une fois choisies, et le vocabulaire
/// réellement employé remonte au dessus au fil du temps.
const _familles = <String, List<String>>{
  'Physique': [
    'Sportif',
    'Musclé',
    'Mince',
    'Costaud',
    'Rond',
    'Grand',
    'Petit',
    'Tatoué',
    'Barbu',
    'Poilu',
    'Imberbe',
  ],
  'Au lit': [
    'Grosse bite',
    'Endurant',
    'Embrasse bien',
    'Doux',
    'Brutal',
    'Bavard',
    'Silencieux',
    'Câlin après',
  ],
  'Caractère': [
    'Drôle',
    'Cash',
    'Attachant',
    'Distant',
    'Ponctuel',
    'Compliqué',
  ],
  'Pratique': [
    'Chez lui',
    'Chez moi',
    'A une voiture',
    'Dispo le soir',
    'En couple',
  ],
};

class _EcranEtiquettesState extends ConsumerState<EcranEtiquettes> {
  List<String>? _choisies;
  final _champ = TextEditingController();

  @override
  void dispose() {
    _champ.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final actuelles =
        ref.watch(etiquettesPersonneProvider(widget.personneId)).valueOrNull;
    final vocabulaire =
        ref.watch(vocabulaireProvider(PorteeEtiquette.personne)).valueOrNull ??
            const <Etiquette>[];

    if (actuelles == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
      );
    }

    final choisies =
        _choisies ??= actuelles.map((e) => e.libelle).toList();
    final propositions = vocabulaire
        .map((e) => e.libelle)
        .where((l) => !choisies.contains(l))
        .take(12)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Étiquettes'),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () async {
              await depotEtiquettes.definirPourPersonne(
                widget.personneId,
                choisies,
              );
              if (!context.mounted) return;
              rafraichir(ref, personneId: widget.personneId);
              context.pop();
            },
            child: const Text('Enregistrer'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 8, 22, 40),
        children: [
          TextField(
            controller: _champ,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              hintText: 'Écris ce que tu veux',
              suffixIcon: IconButton(
                icon: const Icon(Icons.add_rounded),
                tooltip: 'Ajouter',
                onPressed: _ajouter,
              ),
            ),
            onSubmitted: (_) => _ajouter(),
          ),
          const SizedBox(height: 22),
          Text('SUR LA FICHE · ${choisies.length}',
              style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 6),
          const Text(
            'Les deux premières sont mises en avant. Fais glisser pour '
            'changer l\'ordre.',
            style: TextStyle(fontSize: 12.5, color: AppColors.textTertiary),
          ),
          const SizedBox(height: 12),
          if (choisies.isEmpty)
            const Text(
              'Aucune étiquette pour l\'instant.',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            )
          else
            ReorderableListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              buildDefaultDragHandles: true,
              // onReorderItem corrige déjà l'indice après le retrait,
              // contrairement à l'ancien onReorder où il fallait le faire
              // à la main, source classique d'un décalage d'un cran.
              onReorderItem: (depuis, vers) {
                setState(() {
                  final element = choisies.removeAt(depuis);
                  choisies.insert(vers, element);
                });
              },
              children: [
                for (var i = 0; i < choisies.length; i++)
                  _LigneEtiquette(
                    key: ValueKey(choisies[i]),
                    libelle: choisies[i],
                    enAvant: i < 2,
                    onRetirer: () =>
                        setState(() => choisies.removeAt(i)),
                  ),
              ],
            ),
          if (propositions.isNotEmpty) ...[
            const SizedBox(height: 26),
            Text('DÉJÀ UTILISÉES', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final libelle in propositions)
                  Pastille(
                    texte: libelle,
                    onTap: () => setState(() => choisies.add(libelle)),
                  ),
              ],
            ),
          ],
          for (final famille in _familles.entries) ...[
            const SizedBox(height: 26),
            Text(famille.key.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final libelle in famille.value)
                  if (!choisies.any((l) =>
                      Etiquette.normaliser(l) == Etiquette.normaliser(libelle)))
                    Pastille(
                      texte: libelle,
                      onTap: () => setState(() => choisies.add(libelle)),
                    ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _ajouter() {
    final libelle = _champ.text.trim();
    if (libelle.isEmpty) return;
    final choisies = _choisies!;
    final cle = Etiquette.normaliser(libelle);
    if (choisies.any((l) => Etiquette.normaliser(l) == cle)) {
      _champ.clear();
      return;
    }
    setState(() {
      choisies.add(libelle);
      _champ.clear();
    });
  }
}

class _LigneEtiquette extends StatelessWidget {
  const _LigneEtiquette({
    super.key,
    required this.libelle,
    required this.enAvant,
    required this.onRetirer,
  });

  final String libelle;
  final bool enAvant;
  final VoidCallback onRetirer;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0x0BFFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.panel),
          border: Border.all(
            color: enAvant
                ? AppColors.primary.withValues(alpha: 0.42)
                : AppColors.cardBorder,
          ),
        ),
        child: Row(
          children: [
            const Icon(Icons.drag_indicator_rounded,
                size: 18, color: Color(0xFF6F6191)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                libelle,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: enAvant ? FontWeight.w800 : FontWeight.w600,
                  color: enAvant
                      ? const Color(0xFFE9D5FF)
                      : AppColors.textPrimary,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close_rounded, size: 18),
              tooltip: 'Retirer',
              onPressed: onRetirer,
            ),
          ],
        ),
      ),
    );
  }
}

/// Écrire une note.
class EcranNote extends ConsumerStatefulWidget {
  const EcranNote({super.key, required this.personneId, this.noteId});

  final int personneId;

  /// Renseigné quand on reprend une note déjà écrite.
  final int? noteId;

  bool get estModification => noteId != null;

  @override
  ConsumerState<EcranNote> createState() => _EcranNoteState();
}

class _EcranNoteState extends ConsumerState<EcranNote> {
  final _champ = TextEditingController();
  bool _enregistre = false;

  /// La note reprise, une fois chargée. Null en écriture.
  Note? _existante;

  @override
  void initState() {
    super.initState();
    if (widget.estModification) _charger();
  }

  Future<void> _charger() async {
    final notes = await depotNotes.pourPersonne(widget.personneId);
    final trouvee = notes.where((n) => n.id == widget.noteId).firstOrNull;
    if (!mounted || trouvee == null) return;
    setState(() {
      _existante = trouvee;
      _champ.text = trouvee.texte;
    });
  }

  /// Supprime la note, après confirmation.
  Future<void> _supprimer() async {
    final sur = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer cette note ?'),
        content: const Text(
          'Le texte disparaît de la fiche. La rencontre à laquelle elle '
          'se rattachait, si elle en avait une, reste en place.',
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
              'Supprimer',
              style: TextStyle(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );

    if (sur != true || !mounted) return;
    await depotNotes.supprimer(widget.noteId!);
    if (!mounted) return;
    rafraichir(ref, personneId: widget.personneId);
    context.pop();
  }

  @override
  void dispose() {
    _champ.dispose();
    super.dispose();
  }

  Future<void> _enregistrer() async {
    final texte = _champ.text.trim();
    if (texte.isEmpty) return;

    setState(() => _enregistre = true);

    final ancienne = _existante;
    if (ancienne != null) {
      // La date d'écriture ne bouge pas : elle dit quand la chose s'est
      // passée, pas quand on a corrigé la faute de frappe.
      await depotNotes.modifier(Note(
        id: ancienne.id,
        personneId: ancienne.personneId,
        rencontreId: ancienne.rencontreId,
        texte: texte,
        ecriteLe: ancienne.ecriteLe,
      ));
    } else {
      await depotNotes.ajouter(Note(
        personneId: widget.personneId,
        texte: texte,
        ecriteLe: DateTime.now(),
      ));
    }

    if (!mounted) return;
    rafraichir(ref, personneId: widget.personneId);
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.estModification ? 'Reprendre la note' : 'Nouvelle note'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Annuler',
          onPressed: () => context.pop(),
        ),
        actions: [
          if (widget.estModification)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded,
                  color: AppColors.danger),
              tooltip: 'Supprimer',
              onPressed: _supprimer,
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(22, 8, 22, 22),
        child: TextField(
          controller: _champ,
          autofocus: true,
          maxLines: null,
          expands: false,
          textCapitalization: TextCapitalization.sentences,
          style: const TextStyle(fontSize: 15, height: 1.55),
          decoration: const InputDecoration(
            hintText: 'Ce que tu veux retenir…',
          ),
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(22, 0, 22, 26),
        child: FilledButton(
          onPressed: _enregistre ? null : _enregistrer,
          child: const Text('Enregistrer'),
        ),
      ),
    );
  }
}

/// Les photos d'une personne.
class EcranPhotos extends ConsumerWidget {
  const EcranPhotos({super.key, required this.personneId});

  final int personneId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final photos = ref.watch(photosProvider(personneId));

    return Scaffold(
      appBar: AppBar(title: const Text('Photos'), centerTitle: true),
      body: photos.when(
        loading: () =>
            const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
        error: (e, _) => Echec(titre: 'Impossible de lire les photos', erreur: e),
        data: (liste) => GridView.builder(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 110),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.78,
          ),
          itemCount: liste.length,
          itemBuilder: (context, index) {
            final photo = liste[index];
            return GestureDetector(
              onLongPress: () => _menu(context, ref, photo),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.panel),
                    child: VaultImage(path: photo.chemin),
                  ),
                  if (photo.principale)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.star_rounded,
                            size: 13, color: Color(0xFF12071F)),
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'ajout-photos',
        onPressed: () => _ajouter(context, ref),
        icon: const Icon(Icons.add_photo_alternate_outlined, size: 20),
        label: const Text('Ajouter'),
      ),
    );
  }

  Future<void> _ajouter(BuildContext context, WidgetRef ref) async {
    final fichiers = await ImageHelper.pickMultipleFromGallery();
    if (fichiers.isEmpty) return;

    for (final fichier in fichiers) {
      final chemin = await PhotoVault.instance.absorb(fichier);
      await depotPhotos.ajouter(Photo(
        personneId: personneId,
        chemin: chemin,
        ajouteeLe: DateTime.now(),
      ));
    }

    if (!context.mounted) return;
    rafraichir(ref, personneId: personneId);
  }

  Future<void> _menu(BuildContext context, WidgetRef ref, Photo photo) async {
    final choix = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!photo.principale)
              ListTile(
                leading: const Icon(Icons.star_outline_rounded),
                title: const Text('Mettre en avant'),
                onTap: () => Navigator.pop(ctx, 'principale'),
              ),
            ListTile(
              leading: const Icon(Icons.delete_outline_rounded,
                  color: AppColors.danger),
              title: const Text('Supprimer',
                  style: TextStyle(color: AppColors.danger)),
              onTap: () => Navigator.pop(ctx, 'supprimer'),
            ),
          ],
        ),
      ),
    );

    if (choix == 'principale') {
      await depotPhotos.definirPrincipale(personneId, photo.chemin);
    } else if (choix == 'supprimer') {
      await depotPhotos.supprimer(photo);
    } else {
      return;
    }

    if (!context.mounted) return;
    rafraichir(ref, personneId: personneId);
  }
}
