import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/theme.dart';
import '../domaine/etiquette.dart';
import '../domaine/note.dart';
import '../domaine/personne.dart';
import '../domaine/rencontre.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../utils/date_formatter.dart';
import '../widgets/pastilles.dart';

/// Enregistrer une rencontre.
///
/// Tout est pré-rempli : la personne, la date du jour, l'heure qu'il est,
/// la dernière ville connue. Le geste normal se réduit à régler la note
/// et à valider. C'est l'écran qui sera ouvert le plus souvent, souvent
/// tard, souvent d'une main.
class EcranFormulaireRencontre extends ConsumerStatefulWidget {
  const EcranFormulaireRencontre({
    super.key,
    required this.personneId,
    this.rencontreId,
  });

  final int personneId;

  /// Renseigné quand on reprend une rencontre déjà enregistrée.
  final int? rencontreId;

  bool get estModification => rencontreId != null;

  @override
  ConsumerState<EcranFormulaireRencontre> createState() =>
      _EcranFormulaireRencontreState();
}

class _EcranFormulaireRencontreState
    extends ConsumerState<EcranFormulaireRencontre> {
  DateTime _quand = DateTime.now();
  final _lieu = TextEditingController();
  final _note = TextEditingController();
  final _montant = TextEditingController();
  int _demiPoints = 7;
  final _etiquettes = <String>{};
  bool _enregistre = false;

  /// La rencontre reprise, une fois chargée. Null en création.
  Rencontre? _existante;

  @override
  void initState() {
    super.initState();
    if (widget.estModification) {
      _charger();
    } else {
      _prefixerLieu();
    }
  }

  /// Relit la rencontre et ses étiquettes pour pré-remplir le formulaire.
  Future<void> _charger() async {
    final rencontres = await depotRencontres.pourPersonne(widget.personneId);
    final trouvee = rencontres
        .where((r) => r.id == widget.rencontreId)
        .firstOrNull;
    final etiquettes =
        await depotEtiquettes.pourRencontre(widget.rencontreId!);
    if (!mounted || trouvee == null) return;

    setState(() {
      _existante = trouvee;
      _quand = trouvee.quand;
      _lieu.text = trouvee.lieu ?? '';
      _demiPoints = trouvee.noteDemiPoints ?? 7;
      _montant.text = trouvee.montantAffiche?.replaceAll(' €', '') ?? '';
      _etiquettes
        ..clear()
        ..addAll(etiquettes.map((e) => e.libelle));
    });
  }

  /// Supprime la rencontre, après confirmation.
  ///
  /// Les étiquettes du soir partent avec elle par la cascade du schéma,
  /// et les notes qui s'y rattachaient perdent leur rattachement sans
  /// disparaître : elles parlent de la personne, pas seulement du soir.
  Future<void> _supprimer() async {
    final sur = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer cette rencontre ?'),
        content: const Text(
          'Elle disparaît des statistiques, de la carte et du calendrier. '
          'Les notes écrites ce soir là restent sur la fiche.',
          style: TextStyle(height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
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
    await depotRencontres.supprimer(widget.rencontreId!);
    if (!mounted) return;
    rafraichir(ref, personneId: widget.personneId);
    context.pop();
  }

  /// Reprend le dernier lieu connu : on revoit les gens aux mêmes
  /// endroits, donc c'est presque toujours la bonne réponse.
  Future<void> _prefixerLieu() async {
    final rencontres = await depotRencontres.pourPersonne(widget.personneId);
    final dernier = rencontres
        .map((r) => r.lieu)
        .firstWhere((l) => l != null && l.isNotEmpty, orElse: () => null);
    if (dernier == null) {
      final fiche = await depotPersonnes.parId(widget.personneId);
      if (!mounted) return;
      _lieu.text = fiche?.personne.ville ?? '';
      return;
    }
    if (!mounted) return;
    _lieu.text = dernier;
  }

  @override
  void dispose() {
    _lieu.dispose();
    _note.dispose();
    _montant.dispose();
    super.dispose();
  }

  Future<void> _choisirDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _quand,
      firstDate: DateTime(2015),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (date == null || !mounted) return;
    setState(() {
      _quand = DateTime(
          date.year, date.month, date.day, _quand.hour, _quand.minute);
    });
  }

  Future<void> _choisirHeure() async {
    final heure = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_quand),
    );
    if (heure == null || !mounted) return;
    setState(() {
      _quand = DateTime(
          _quand.year, _quand.month, _quand.day, heure.hour, heure.minute);
    });
  }

  /// Lit le montant saisi, en centimes.
  ///
  /// Le champ accepte la virgule comme le point, parce que personne ne
  /// tape un point pour des euros. Vide rend null, et non zéro : une
  /// rencontre sans argent n'est pas une rencontre à zéro euro.
  int? _centimes() {
    final brut = _montant.text.trim().replaceAll(',', '.').replaceAll(' ', '');
    if (brut.isEmpty) return null;
    final euros = double.tryParse(brut);
    if (euros == null || euros <= 0) return null;
    return (euros * 100).round();
  }

  Future<void> _enregistrer() async {
    setState(() => _enregistre = true);
    final maintenant = DateTime.now();

    final ancienne = _existante;
    final int id;

    if (ancienne != null) {
      final reprise = Rencontre(
        id: ancienne.id,
        personneId: ancienne.personneId,
        quand: _quand,
        lieu: _lieu.text.trim().isEmpty ? null : _lieu.text.trim(),
        latitude: ancienne.latitude,
        longitude: ancienne.longitude,
        noteDemiPoints: _demiPoints,
        montantCentimes: _centimes(),
        creeLe: ancienne.creeLe,
      );
      await depotRencontres.modifier(reprise);
      id = ancienne.id!;
    } else {
      id = await depotRencontres.creer(Rencontre(
        personneId: widget.personneId,
        quand: _quand,
        lieu: _lieu.text.trim().isEmpty ? null : _lieu.text.trim(),
        noteDemiPoints: _demiPoints,
        montantCentimes: _centimes(),
        creeLe: maintenant,
      ));
    }

    // Toujours redéfinir, même vide : sur une reprise, retirer une
    // étiquette doit la retirer pour de bon.
    await depotEtiquettes.definirPourRencontre(id, _etiquettes.toList());

    final texte = widget.estModification ? '' : _note.text.trim();
    if (texte.isNotEmpty) {
      await depotNotes.ajouter(Note(
        personneId: widget.personneId,
        rencontreId: id,
        texte: texte,
        ecriteLe: maintenant,
      ));
    }

    if (!mounted) return;
    rafraichir(ref, personneId: widget.personneId);
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final fiche = ref.watch(fichePersonneProvider(widget.personneId));
    final vocabulaire = ref
            .watch(vocabulaireProvider(PorteeEtiquette.rencontre))
            .valueOrNull ??
        const <Etiquette>[];

    final suggestions = <String>{
      ...vocabulaire.take(8).map((e) => e.libelle),
      ..._etiquettes,
      if (vocabulaire.isEmpty) ...['Chez lui', 'Chez moi', 'Dehors'],
    };

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.estModification ? 'Reprendre la rencontre' : 'Nouvelle rencontre',
        ),
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
      body: ListView(
        padding: const EdgeInsets.fromLTRB(22, 8, 22, 120),
        children: [
          fiche.when(
            loading: () => const SizedBox(height: 74),
            error: (_, _) => const SizedBox(height: 74),
            data: (valeur) => valeur == null
                ? const SizedBox(height: 74)
                : _Bandeau(fiche: valeur),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _Bouton(
                  icone: Icons.calendar_today_rounded,
                  legende: 'Date',
                  valeur: DateFormatter.jourCourt(_quand),
                  onTap: _choisirDate,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _Bouton(
                  icone: Icons.schedule_rounded,
                  legende: 'Heure',
                  valeur: DateFormatter.formatTime(_quand),
                  onTap: _choisirHeure,
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          Text('OÙ', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          TextField(
            controller: _lieu,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              hintText: 'Chez lui, Vannes, Le Fébrile…',
              prefixIcon: Icon(Icons.place_outlined, size: 19),
              prefixIconConstraints:
                  BoxConstraints(minWidth: 46, minHeight: 46),
            ),
          ),
          const SizedBox(height: 22),
          Text('CE QUE ÇA A RAPPORTÉ',
              style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          TextField(
            controller: _montant,
            keyboardType:
                const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              hintText: 'Rien, ou 100',
              suffixText: '€',
              suffixStyle: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: AppColors.gold,
              ),
              prefixIcon:
                  Icon(Icons.savings_outlined, size: 19, color: AppColors.gold),
              prefixIconConstraints:
                  BoxConstraints(minWidth: 46, minHeight: 46),
            ),
          ),
          const SizedBox(height: 22),
          Text('TA NOTE', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          _Notation(
            demiPoints: _demiPoints,
            onChange: (v) => setState(() => _demiPoints = v),
          ),
          const SizedBox(height: 22),
          Text('CETTE FOIS LÀ', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final libelle in suggestions)
                Pastille(
                  texte: libelle,
                  ton: _etiquettes.contains(libelle)
                      ? TonPastille.pleine
                      : TonPastille.douce,
                  hauteur: 32,
                  onTap: () => setState(() {
                    if (!_etiquettes.remove(libelle)) _etiquettes.add(libelle);
                  }),
                ),
              PastilleAjout(onTap: _ajouterEtiquette),
            ],
          ),
          const SizedBox(height: 22),
          Text('UNE NOTE ?', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          TextField(
            controller: _note,
            maxLines: 3,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              hintText: 'Ce que tu veux retenir de cette fois là…',
            ),
          ),
        ],
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

  Future<void> _ajouterEtiquette() async {
    final champ = TextEditingController();
    final libelle = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nouvelle étiquette'),
        content: TextField(
          controller: champ,
          autofocus: true,
          textCapitalization: TextCapitalization.sentences,
          decoration: const InputDecoration(hintText: 'Toute la nuit'),
          onSubmitted: (v) => Navigator.pop(ctx, v),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, champ.text),
            child: const Text('Ajouter'),
          ),
        ],
      ),
    );
    if (libelle == null || libelle.trim().isEmpty) return;
    setState(() => _etiquettes.add(libelle.trim()));
  }
}

class _Bandeau extends StatelessWidget {
  const _Bandeau({required this.fiche});

  final FichePersonne fiche;

  @override
  Widget build(BuildContext context) {
    final personne = fiche.personne;
    final prochaine = fiche.nombreRencontres + 1;

    return Container(
      height: 74,
      padding: const EdgeInsets.fromLTRB(8, 0, 14, 0),
      decoration: BoxDecoration(
        color: const Color(0x0DFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(17),
            child: SizedBox(
              width: 58,
              height: 58,
              child: personne.photoPrincipale == null
                  ? const ColoredBox(color: Color(0xFF1B0C36))
                  : VaultImage(path: personne.photoPrincipale!),
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  personne.prenom,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  fiche.derniereFois == null
                      ? 'Première fois'
                      : '$prochaine e fois · la dernière '
                          '${DateFormatter.timeAgo(fiche.derniereFois!)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Bouton extends StatelessWidget {
  const _Bouton({
    required this.icone,
    required this.legende,
    required this.valeur,
    required this.onTap,
  });

  final IconData icone;
  final String legende;
  final String valeur;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.button),
      child: Container(
        height: 58,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0x0DFFFFFF),
          borderRadius: BorderRadius.circular(AppRadius.button),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Icon(icone, size: 17, color: const Color(0xFFC084FC)),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(legende.toUpperCase(),
                      style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 3),
                  Text(
                    valeur,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Les cinq étoiles, par demi-points.
///
/// Un appui sur la moitié gauche d'une étoile donne le demi-point, sur la
/// moitié droite l'étoile entière. C'est le geste habituel, et ça évite
/// un curseur à faire glisser au millimètre.
class _Notation extends StatelessWidget {
  const _Notation({required this.demiPoints, required this.onChange});

  final int demiPoints;
  final ValueChanged<int> onChange;

  @override
  Widget build(BuildContext context) {
    final texte = (demiPoints / 2).toStringAsFixed(1).replaceAll('.', ',');

    return Container(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
      decoration: BoxDecoration(
        color: const Color(0x0DFFFFFF),
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                texte,
                style: const TextStyle(
                  fontSize: 42,
                  height: 1,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -1.4,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'sur 5',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          LayoutBuilder(
            builder: (context, contraintes) {
              final largeur = contraintes.maxWidth / 5;
              return GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTapDown: (details) {
                  final position = details.localPosition.dx / largeur;
                  final valeur = (position * 2).ceil().clamp(1, 10);
                  onChange(valeur);
                },
                child: Row(
                  children: [
                    for (var i = 0; i < 5; i++)
                      SizedBox(
                        width: largeur,
                        child: _Etoile(
                          remplissage: (demiPoints - i * 2).clamp(0, 2) / 2,
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _Etoile extends StatelessWidget {
  const _Etoile({required this.remplissage});

  /// 0, 0,5 ou 1.
  final double remplissage;

  @override
  Widget build(BuildContext context) {
    const taille = 34.0;
    return Stack(
      alignment: Alignment.centerLeft,
      children: [
        const Icon(Icons.star_rounded, size: taille, color: Color(0x1FFFFFFF)),
        ClipRect(
          clipper: _Moitie(remplissage),
          child: const Icon(Icons.star_rounded,
              size: taille, color: AppColors.accent),
        ),
      ],
    );
  }
}

class _Moitie extends CustomClipper<Rect> {
  const _Moitie(this.part);

  final double part;

  @override
  Rect getClip(Size taille) =>
      Rect.fromLTWH(0, 0, taille.width * part, taille.height);

  @override
  bool shouldReclip(_Moitie ancien) => ancien.part != part;
}
