import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domaine/etiquette.dart';
import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../donnees/depots.dart';
import '../donnees/statistiques.dart';

// ------------------------------------------------------------------ dépôts

const depotPersonnes = DepotPersonnes();
const depotRencontres = DepotRencontres();
const depotEtiquettes = DepotEtiquettes();
const depotNotes = DepotNotes();
const depotPhotos = DepotPhotos();
const depotStatistiques = DepotStatistiques();

// ------------------------------------------------------------- répertoire

/// Filtres courants du répertoire : recherche, tri, ville, étiquette.
final filtreProvider = StateProvider<FiltreRepertoire>(
  (ref) => const FiltreRepertoire(),
);

/// La grille des fiches. Se recalcule dès qu'un filtre bouge, et dès
/// qu'une écriture invalide [rafraichir].
final repertoireProvider = FutureProvider<List<FichePersonne>>((ref) {
  final filtre = ref.watch(filtreProvider);
  return depotPersonnes.lister(filtre);
});

final villesProvider = FutureProvider<List<String>>((ref) {
  return depotPersonnes.villes();
});

final fichePersonneProvider =
    FutureProvider.family<FichePersonne?, int>((ref, id) {
  return depotPersonnes.parId(id);
});

final rangProvider =
    FutureProvider.family<({int rang, int total})?, int>((ref, id) {
  return depotPersonnes.rang(id);
});

// ------------------------------------------------------------- rencontres

final rencontresProvider =
    FutureProvider.family<List<Rencontre>, int>((ref, personneId) {
  return depotRencontres.pourPersonne(personneId);
});

final journalProvider = FutureProvider<List<EntreeJournal>>((ref) {
  return depotRencontres.journal();
});

// ------------------------------------------------------- notes et photos

final notesProvider =
    FutureProvider.family<List<Note>, int>((ref, personneId) {
  return depotNotes.pourPersonne(personneId);
});

final photosProvider =
    FutureProvider.family<List<Photo>, int>((ref, personneId) {
  return depotPhotos.pourPersonne(personneId);
});

// ------------------------------------------------------------ étiquettes

final etiquettesPersonneProvider =
    FutureProvider.family<List<Etiquette>, int>((ref, personneId) {
  return depotEtiquettes.pourPersonne(personneId);
});

final vocabulaireProvider =
    FutureProvider.family<List<Etiquette>, PorteeEtiquette>((ref, portee) {
  return depotEtiquettes.vocabulaire(portee);
});

// ----------------------------------------------------------- statistiques

final anneeProvider = StateProvider<int>((ref) => DateTime.now().year);

final anneesProvider = FutureProvider<List<int>>((ref) {
  return depotStatistiques.anneesRenseignees();
});

final statistiquesProvider = FutureProvider<Statistiques>((ref) {
  final annee = ref.watch(anneeProvider);
  return depotStatistiques.pourAnnee(annee);
});

// ------------------------------------------------------------- écritures

/// Invalide tout ce qui dépend des données.
///
/// Les écrans lisent par providers ; après une écriture il faut leur dire
/// de reprendre. Une seule fonction, appelée depuis chaque enregistrement,
/// évite d'oublier un écran qui afficherait alors des chiffres périmés.
void rafraichir(WidgetRef ref, {int? personneId}) {
  ref.invalidate(repertoireProvider);
  ref.invalidate(villesProvider);
  ref.invalidate(journalProvider);
  ref.invalidate(statistiquesProvider);
  ref.invalidate(anneesProvider);
  ref.invalidate(vocabulaireProvider);

  if (personneId != null) {
    ref.invalidate(fichePersonneProvider(personneId));
    ref.invalidate(rangProvider(personneId));
    ref.invalidate(rencontresProvider(personneId));
    ref.invalidate(notesProvider(personneId));
    ref.invalidate(photosProvider(personneId));
    ref.invalidate(etiquettesPersonneProvider(personneId));
  }
}

/// Oublie absolument tout, familles par fiche comprises.
///
/// Après un effacement total, [rafraichir] ne suffisait pas : il reprend
/// les listes mais laisse leur cache aux providers indexés par
/// identifiant. La grille réaffichait donc les fiches d'avant, avec des
/// photos devenues illisibles puisque le coffre venait d'être détruit, et
/// un appui ouvrait « cette fiche n'existe plus ». Invalider une famille
/// sans argument vide toutes ses instances d'un coup.
void toutOublier(WidgetRef ref) {
  rafraichir(ref);
  ref.invalidate(fichePersonneProvider);
  ref.invalidate(rangProvider);
  ref.invalidate(rencontresProvider);
  ref.invalidate(notesProvider);
  ref.invalidate(photosProvider);
  ref.invalidate(etiquettesPersonneProvider);

  // Les filtres aussi : chercher « Vannes » dans une base vide donnerait
  // une grille vide sans qu'on comprenne pourquoi.
  ref.invalidate(filtreProvider);
  ref.invalidate(anneeProvider);
}
