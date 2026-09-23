import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../providers/donnees.dart';
import '../security/photo_vault.dart';
import '../security/vault_image.dart';
import '../utils/image_helper.dart';

/// Créer ou modifier une fiche.
///
/// Six champs, et un seul obligatoire. Une fiche doit se remplir en
/// trente secondes, sinon elle ne se remplit jamais et le répertoire
/// meurt au bout de deux semaines.
class EcranFormulairePersonne extends ConsumerStatefulWidget {
  const EcranFormulairePersonne({super.key, this.personneId});

  final int? personneId;

  bool get estModification => personneId != null;

  @override
  ConsumerState<EcranFormulairePersonne> createState() =>
      _EcranFormulairePersonneState();
}

class _EcranFormulairePersonneState
    extends ConsumerState<EcranFormulairePersonne> {
  final _prenom = TextEditingController();
  final _age = TextEditingController();
  final _ville = TextEditingController();
  final _telephone = TextEditingController();
  final _adresse = TextEditingController();

  String? _source;
  String? _photo;
  Genre? _genre;
  RoleSexuel? _role;
  bool _charge = false;

  /// La fiche telle qu'elle était à l'ouverture, en modification.
  Personne? _avant;
  bool _enregistre = false;

  static const _sources = [
    'Grindr',
    'Tinder',
    'En soirée',
    'Dans la rue',
    'Par un ami',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.estModification) _remplir();
  }

  Future<void> _remplir() async {
    final fiche = await depotPersonnes.parId(widget.personneId!);
    if (fiche == null || !mounted) return;
    final p = fiche.personne;
    setState(() {
      _avant = p;
      _prenom.text = p.prenom;
      _age.text = p.age?.toString() ?? '';
      _ville.text = p.ville ?? '';
      _telephone.text = p.telephone ?? '';
      _adresse.text = p.adresse ?? '';
      _source = p.rencontreSur;
      _photo = p.photoPrincipale;
      _genre = p.genre;
      _role = p.role;
      _charge = true;
    });
  }

  @override
  void dispose() {
    _prenom.dispose();
    _age.dispose();
    _ville.dispose();
    _telephone.dispose();
    _adresse.dispose();
    super.dispose();
  }

  Future<void> _choisirPhoto() async {
    final fichier = await ImageHelper.pickFromGallery();
    if (fichier == null) return;
    final chemin = await PhotoVault.instance.absorb(fichier);
    if (!mounted) return;
    setState(() => _photo = chemin);
  }

  Future<void> _enregistrer() async {
    final prenom = _prenom.text.trim();
    if (prenom.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Il faut au moins un prénom.')),
      );
      return;
    }

    setState(() => _enregistre = true);
    final maintenant = DateTime.now();

    final personne = Personne(
      id: widget.personneId,
      prenom: prenom,
      age: int.tryParse(_age.text.trim()),
      ville: _vide(_ville.text),
      rencontreSur: _source,
      telephone: _vide(_telephone.text),
      adresse: _vide(_adresse.text),
      photoPrincipale: _photo,
      genre: _genre,
      role: _role,
      // La date de création est celle d'origine : la remplacer à chaque
      // modification faisait passer une vieille fiche pour une nouvelle.
      creeLe: _avant?.creeLe ?? maintenant,
      modifieLe: maintenant,
    );

    int id;
    if (widget.estModification) {
      await depotPersonnes.modifier(personne);
      id = widget.personneId!;
      final ancienne = _avant?.ville;
      if (ancienne != null &&
          ancienne.trim().toLowerCase() !=
              (personne.ville ?? '').trim().toLowerCase()) {
        await depotRencontres.renommerLieu(id, ancienne, personne.ville);
      }
    } else {
      id = await depotPersonnes.creer(personne);
    }

    // La photo choisie au formulaire entre aussi dans la galerie, sinon
    // elle n'existerait que comme vignette de la fiche.
    if (_photo != null) {
      final photos = await depotPhotos.pourPersonne(id);
      if (!photos.any((p) => p.chemin == _photo)) {
        await depotPhotos.ajouter(Photo(
          personneId: id,
          chemin: _photo!,
          principale: true,
          ajouteeLe: maintenant,
        ));
      }
    }

    if (!mounted) return;
    rafraichir(ref, personneId: id);
    if (widget.estModification) {
      context.pop();
    } else {
      context.pushReplacement('/personne/$id');
    }
  }

  String? _vide(String valeur) {
    final t = valeur.trim();
    return t.isEmpty ? null : t;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.estModification && !_charge) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.estModification ? 'Modifier' : 'Nouvelle fiche'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Annuler',
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 8, 22, 120),
        children: [
          _ZonePhoto(chemin: _photo, onTap: _choisirPhoto),
          const SizedBox(height: 22),
          _Champ(
            libelle: 'Prénom',
            controleur: _prenom,
            indice: 'Noa',
            capitalisation: TextCapitalization.words,
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 104,
                child: _Champ(
                  libelle: 'Âge',
                  controleur: _age,
                  indice: '24',
                  clavier: TextInputType.number,
                  filtres: [FilteringTextInputFormatter.digitsOnly],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _Champ(
                  libelle: 'Ville',
                  controleur: _ville,
                  indice: 'Vannes',
                  capitalisation: TextCapitalization.words,
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          Text('GENRE', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final g in Genre.values)
                _ChoixSource(
                  libelle: g.libelle,
                  actif: _genre == g,
                  onTap: () => setState(
                    () => _genre = _genre == g ? null : g,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          Text('RÔLE', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final r in RoleSexuel.values)
                _ChoixSource(
                  libelle: r.libelle,
                  actif: _role == r,
                  onTap: () => setState(
                    () => _role = _role == r ? null : r,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          Text('RENCONTRÉ SUR',
              style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final source in _sources)
                _ChoixSource(
                  libelle: source,
                  actif: _source == source,
                  onTap: () => setState(
                    () => _source = _source == source ? null : source,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          _Champ(
            libelle: 'Téléphone',
            controleur: _telephone,
            indice: '06 51 24 88 03',
            clavier: TextInputType.phone,
          ),
          const SizedBox(height: 22),
          _Champ(
            libelle: 'Adresse',
            controleur: _adresse,
            indice: '12 rue Thiers, Vannes',
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(22, 0, 22, 26),
        child: FilledButton(
          onPressed: _enregistre ? null : _enregistrer,
          child: Text(
            widget.estModification ? 'Enregistrer' : 'Créer la fiche',
          ),
        ),
      ),
    );
  }
}

class _ZonePhoto extends StatelessWidget {
  const _ZonePhoto({required this.chemin, required this.onTap});

  final String? chemin;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.card),
      child: Container(
        height: 168,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: const Color(0x09FFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(color: const Color(0x38FFFFFF)),
        ),
        child: chemin == null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0x4DA855F7), Color(0x38D946EF)],
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(Icons.photo_camera_outlined,
                        size: 22, color: Color(0xFFE9D5FF)),
                  ),
                  const SizedBox(height: 11),
                  const Text(
                    'Ajouter une photo',
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Elle ne quitte jamais ce téléphone',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              )
            : Stack(
                fit: StackFit.expand,
                children: [
                  VaultImage(path: chemin!, fit: BoxFit.cover),
                  const DecoratedBox(
                    decoration: BoxDecoration(gradient: AppColors.photoGrade),
                  ),
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Container(
                      height: 30,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: const Color(0xB30B0616),
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                      child: const Text(
                        'Changer',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _Champ extends StatelessWidget {
  const _Champ({
    required this.libelle,
    required this.controleur,
    required this.indice,
    this.clavier,
    this.filtres,
    this.capitalisation = TextCapitalization.none,
  });

  final String libelle;
  final TextEditingController controleur;
  final String indice;
  final TextInputType? clavier;
  final List<TextInputFormatter>? filtres;
  final TextCapitalization capitalisation;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(libelle.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall),
        const SizedBox(height: 8),
        TextField(
          controller: controleur,
          keyboardType: clavier,
          inputFormatters: filtres,
          textCapitalization: capitalisation,
          style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w600),
          decoration: InputDecoration(hintText: indice),
        ),
      ],
    );
  }
}

class _ChoixSource extends StatelessWidget {
  const _ChoixSource({
    required this.libelle,
    required this.actif,
    required this.onTap,
  });

  final String libelle;
  final bool actif;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      child: Container(
        height: 36,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        decoration: BoxDecoration(
          gradient: actif ? AppColors.brandGradient : null,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: actif
              ? null
              : Border.all(color: const Color(0x24FFFFFF)),
        ),
        child: Center(
          widthFactor: 1,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (actif) ...[
                const Icon(Icons.check_rounded,
                    size: 15, color: Color(0xFF12071F)),
                const SizedBox(width: 5),
              ],
              Text(
                libelle,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: actif ? FontWeight.w800 : FontWeight.w600,
                  color: actif
                      ? const Color(0xFF12071F)
                      : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
