import 'dart:math';

import 'package:flutter/material.dart';

import '../config/theme.dart';
import '../donnees/coordonnees.dart';
import '../donnees/geometrie_france.dart';

/// La carte des lieux, sur la vraie France.
///
/// Les versions précédentes posaient les villes en spirale ou en
/// constellation. C'était décoratif et faux : Quimper se retrouvait à
/// l'est de Rennes. Ici le fond est la géométrie réelle du pays, côtes et
/// îles comprises, et chaque ville est à sa place.
///
/// La carte se pince pour zoomer et se traîne pour se déplacer. Ce n'est
/// pas un agrément : à l'échelle du pays, six villes bretonnes se
/// chevauchent, et aucun placement malin ne remplace le fait de pouvoir
/// s'approcher.
class PlanFrance extends StatefulWidget {
  const PlanFrance({
    super.key,
    required this.villes,
    this.points = const [],
    this.hauteur = 340,
    this.onPrise,
  });

  final List<({String ville, int nombre})> villes;

  /// Les rencontres posées à la main, dessinées en points fins une fois
  /// qu'on s'est approché : à l'échelle du pays, elles se confondraient
  /// avec les pastilles des villes.
  final List<Coordonnee> points;

  final double hauteur;

  /// Prévient quand un doigt tient la carte agrandie.
  ///
  /// La carte vit dans une liste qui défile, et les deux se disputent le
  /// même glissement vertical. Plutôt que de forcer l'arbitrage des
  /// gestes, ce qui finit par planter, on demande à la liste de se taire
  /// le temps du déplacement.
  final ValueChanged<bool>? onPrise;

  @override
  State<PlanFrance> createState() => _PlanFranceState();
}

class _PlanFranceState extends State<PlanFrance>
    with TickerProviderStateMixin {
  /// L'arrivée : la terre monte, les traits se tirent, les villes
  /// tombent. Joué une fois.
  late final AnimationController _arrivee = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  );

  /// La vie de la carte : scintillement des étoiles, ondes du chef-lieu,
  /// navettes le long des liaisons. En boucle, et volontairement lente.
  late final AnimationController _vie = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 4200),
  )..repeat();

  Future<GeometrieFrance>? _geo;

  double _zoom = 1;
  Offset _pan = Offset.zero;

  // L'état au début du pincement, pour que le point sous le doigt ne
  // bouge pas pendant qu'on écarte les doigts.
  double _zoomDepart = 1;
  Offset _panDepart = Offset.zero;
  Offset _foyerDepart = Offset.zero;
  bool _tenue = false;

  /// Vrai dès que la vue d'ouverture a été calculée. Elle dépend des
  /// villes et de la taille du cadre, donc elle ne peut pas être fixée
  /// avant la première mise en page.
  bool _ouvert = false;

  /// Les chemins du fond de carte, construits une seule fois par cadrage
  /// de base. Quarante-cinq mille points : les reconstruire à chaque
  /// image de pincement ferait tomber la carte à dix images par seconde.
  /// Le zoom est appliqué au moment de peindre, par une matrice.
  Path? _terre;
  Path? _departements;
  Object? _clefChemins;

  @override
  void initState() {
    super.initState();
    _geo = GeometrieFrance.charger();
    _arrivee.forward();
  }

  @override
  void dispose() {
    _arrivee.dispose();
    _vie.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Tout ce qui est en France est posé : un nom mal orthographié tombe
    // sur la commune la plus proche par le nom. Seul l'étranger reste à
    // l'écart, la carte ne dessine que la France, et il figure déjà dans
    // le classement des lieux.
    final situees = <_Ville>[];
    for (final v in widget.villes) {
      final ou = coordonneesEnFrance(v.ville);
      if (ou != null) {
        situees.add(_Ville(v.ville, v.nombre, ou.longitude, ou.latitude));
      }
    }

    if (situees.isEmpty) return const SizedBox.shrink();

    final maximum = situees.first.nombre;
    for (final v in situees) {
      v.part = maximum == 0 ? 0 : v.nombre / maximum;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.card),
          child: SizedBox(
            height: widget.hauteur,
            child: LayoutBuilder(
              builder: (context, contraintes) {
                final taille =
                    Size(contraintes.maxWidth, contraintes.maxHeight);
                if (!_ouvert) {
                  _ouvert = true;
                  _cadrerSur(situees, taille);
                }
                final cadrage = _Cadrage(taille, zoom: _zoom, pan: _pan);
                final groupes = _grouper(
                  situees,
                  cadrage,
                  taille,
                  MediaQuery.textScalerOf(context),
                );

                return FutureBuilder<GeometrieFrance>(
                  future: _geo,
                  builder: (context, instantane) {
                    final geo = instantane.data;
                    if (geo != null) _preparerChemins(geo, cadrage);

                    final carte = _Carte(
                      terre: _terre,
                      departements: _departements,
                      groupes: groupes,
                      cadrage: cadrage,
                      taille: taille,
                      arrivee: _arrivee,
                      vie: _vie,
                      zoom: _zoom,
                      onRecadrer: _recadrer,
                      charge: geo != null,
                      points: [
                        for (final p in widget.points)
                          cadrage.projeter(p.longitude, p.latitude),
                      ],
                    );

                    void debut(ScaleStartDetails d) {
                      _zoomDepart = _zoom;
                      _panDepart = _pan;
                      _foyerDepart = d.localFocalPoint;
                    }

                    // Au cadrage d'origine, il n'y a rien à déplacer et
                    // le doigt appartient à la page. Une fois la carte
                    // agrandie, on gèle le défilement le temps du geste :
                    // sans adversaire dans l'arbitrage, le pincement
                    // l'emporte sans qu'on ait à tricher.
                    return Listener(
                      onPointerDown: (_) => _prendre(true),
                      onPointerUp: (_) => _prendre(false),
                      onPointerCancel: (_) => _prendre(false),
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onScaleStart: debut,
                        onScaleUpdate: (d) => _pincer(d, taille),
                        onDoubleTapDown: (d) =>
                            _approcher(d.localPosition, taille),
                        onDoubleTap: () {},
                        child: carte,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  /// Calcule la vue d'ouverture : serrée sur tes villes.
  ///
  /// Le cadrage de base est le pays entier, ce qui permet de tout
  /// dézoomer pour se resituer. Mais s'ouvrir sur la France quand on a
  /// onze villes bretonnes n'apprend rien : on part donc au plus près,
  /// avec la marge qu'il faut pour voir la côte autour.
  void _cadrerSur(List<_Ville> villes, Size taille) {
    final base = _Cadrage(taille);

    // On ne cadre pas sur toutes les villes : un seul week-end à
    // Marseille suffirait à rouvrir sur la France entière, avec le vrai
    // sujet réduit à trois points collés en Bretagne. On part donc de la
    // ville principale et on s'élargit, de proche en proche, jusqu'à
    // couvrir les deux tiers des rencontres. Le reste s'atteint en
    // dézoomant, ce qui est précisément à quoi sert le zoom.
    final total = villes.fold<int>(0, (a, v) => a + v.nombre);
    final tete = villes.first;
    final triees = [...villes]..sort((a, b) {
        final da = pow(a.longitude - tete.longitude, 2) +
            pow(a.latitude - tete.latitude, 2);
        final db = pow(b.longitude - tete.longitude, 2) +
            pow(b.latitude - tete.latitude, 2);
        return da.compareTo(db);
      });

    final coeur = <_Ville>[];
    var cumul = 0;
    for (final v in triees) {
      coeur.add(v);
      cumul += v.nombre;
      if (cumul * 3 >= total * 2) break;
    }

    var minX = double.infinity, maxX = -double.infinity;
    var minY = double.infinity, maxY = -double.infinity;
    for (final v in coeur) {
      final p = base.projeterBase(v.longitude, v.latitude);
      minX = min(minX, p.dx);
      maxX = max(maxX, p.dx);
      minY = min(minY, p.dy);
      maxY = max(maxY, p.dy);
    }

    // Un plancher sur l'étendue : sur une seule ville, ou sur trois
    // villes voisines, une vue collée aux points ne montrerait aucune
    // côte et ne dirait donc pas où on est.
    final plancher = taille.shortestSide * 0.16;
    final largeur = max(maxX - minX, plancher) * 1.45;
    final hauteur = max(maxY - minY, plancher) * 1.45;
    final ajuste = min(taille.width / largeur, taille.height / hauteur);

    // On s'en tient à ce cadrage. Une version précédente montait jusqu'au
    // grossissement qui sépare Vannes d'Auray, dix-sept kilomètres plus
    // loin : on ouvrait à neuf fois, collé sur le golfe, sans plus voir
    // la Bretagne. Deux villes trop proches se réunissent en une bulle,
    // c'est fait pour, et s'approcher les sépare.
    final zoom = ajuste.clamp(1.0, 12.0).toDouble();

    final centre = Offset(taille.width / 2, taille.height / 2);
    final milieu = Offset((minX + maxX) / 2, (minY + maxY) / 2);
    var pan = centre - (milieu - centre) * zoom - centre;

    final limiteX = max(0.0, taille.width * (zoom - 1) / 2);
    final limiteY = max(0.0, taille.height * (zoom - 1) / 2);
    pan = Offset(
      pan.dx.clamp(-limiteX, limiteX),
      pan.dy.clamp(-limiteY, limiteY),
    );

    if (!zoom.isFinite || !pan.dx.isFinite || !pan.dy.isFinite) return;
    _zoom = zoom;
    _pan = pan;
  }

  /// Zoom et déplacement, le point sous les doigts restant immobile.
  ///
  /// Sans cette correction, écarter les doigts en bas à droite de la
  /// carte ramène brutalement le centre du pays sous la main : on perd
  /// ce qu'on regardait au moment même où on s'en approche.
  void _pincer(ScaleUpdateDetails d, Size taille) {
    final centre = Offset(taille.width / 2, taille.height / 2);
    final zoom = (_zoomDepart * d.scale).clamp(1.0, 20.0);

    // Le point du cadrage de base qui se trouvait sous le doigt au début.
    final ancre = (_foyerDepart - centre - _panDepart) / _zoomDepart + centre;
    var pan = d.localFocalPoint - centre - (ancre - centre) * zoom;

    // On empêche la carte de sortir du cadre : au delà, on regarde du
    // vide en se demandant où est passée la France.
    final limiteX = max(0.0, taille.width * (zoom - 1) / 2);
    final limiteY = max(0.0, taille.height * (zoom - 1) / 2);
    pan = Offset(
      pan.dx.clamp(-limiteX, limiteX),
      pan.dy.clamp(-limiteY, limiteY),
    );

    // Un NaN qui passe jusqu'à un Positioned fait tomber l'application
    // sur une assertion de mise en page, loin d'ici et sans rapport
    // apparent. On refuse la valeur sur place.
    if (!zoom.isFinite || !pan.dx.isFinite || !pan.dy.isFinite) return;

    setState(() {
      _zoom = zoom;
      _pan = pan;
    });
  }

  /// Le double tap approche, centré sur l'endroit touché.
  ///
  /// C'est le geste que tout le monde essaie en premier sur une carte,
  /// et il évite d'avoir à pincer d'une seule main.
  void _approcher(Offset ou, Size taille) {
    final centre = Offset(taille.width / 2, taille.height / 2);
    const zoom = 3.2;
    final ancre = (ou - centre - _pan) / _zoom + centre;
    // Le point touché doit finir au centre du cadre.
    var pan = -(ancre - centre) * zoom;

    final limiteX = max(0.0, taille.width * (zoom - 1) / 2);
    final limiteY = max(0.0, taille.height * (zoom - 1) / 2);
    pan = Offset(
      pan.dx.clamp(-limiteX, limiteX),
      pan.dy.clamp(-limiteY, limiteY),
    );

    if (!pan.dx.isFinite || !pan.dy.isFinite) return;

    setState(() {
      _zoom = zoom;
      _pan = pan;
    });
  }

  /// Gèle ou rend le défilement de la page qui contient la carte.
  void _prendre(bool tenue) {
    // Le seuil d'un serait faux ici : la carte s'ouvre déjà zoomée, donc
    // il y a quelque chose à déplacer dès le premier contact.
    final utile = tenue && _zoom > 1.001;
    if (utile == _tenue) return;
    _tenue = utile;
    widget.onPrise?.call(utile);
  }

  /// Remet la vue d'ouverture, c'est à dire serrée sur tes villes.
  ///
  /// Revenir au cadrage de base montrerait la France entière avec un
  /// paquet de points minuscules dans un coin : ce n'est pas un retour à
  /// la normale, c'est un dézoom complet, qui reste accessible au
  /// pincement.
  void _recadrer() {
    _prendre(false);
    _ouvert = false;
    setState(() {});
  }

  /// Reconstruit les chemins du fond, mais seulement quand le cadrage de
  /// base a changé. Le zoom n'en fait pas partie : il est appliqué par
  /// une matrice au moment de peindre.
  void _preparerChemins(GeometrieFrance geo, _Cadrage cadrage) {
    final fenetre = cadrage.fenetreDegres();

    // On ne garde que les anneaux qui touchent la fenêtre. La signature
    // de cette sélection sert de clé : tant qu'elle ne change pas, les
    // chemins restent valables, et déplacer la carte à l'intérieur d'une
    // même zone ne recalcule rien.
    final retenus = StringBuffer()..write(cadrage.clefBase);
    for (var i = 0; i < geo.bornesCote.length; i++) {
      if (geo.bornesCote[i].overlaps(fenetre)) retenus.write('|$i');
    }
    final clef = retenus.toString();
    if (_clefChemins == clef && _terre != null) return;
    _clefChemins = clef;

    _terre = GeometrieFrance.cheminDe(
      geo.cote,
      cadrage.projeterBase,
      fenetre: fenetre,
      bornes: geo.bornesCote,
    );
    _departements = GeometrieFrance.cheminDe(
      geo.departements,
      cadrage.projeterBase,
      fenetre: fenetre,
      bornes: geo.bornesDepartements,
    );
  }

  /// Réunit les villes trop proches, puis cherche où écrire les noms.
  ///
  /// Les disques ne se déplacent jamais d'un pixel. Quand deux villes
  /// sont trop près pour tenir côte à côte, on ne les écarte pas : on en
  /// fait une bulle, qui porte la somme et le nom de la principale. Elle
  /// se scinde d'elle même dès qu'on s'approche assez. C'est la seule
  /// façon d'avoir à la fois des points qui disent vrai et des nombres
  /// toujours lisibles.
  List<_Groupe> _grouper(
    List<_Ville> villes,
    _Cadrage cadrage,
    Size taille,
    TextScaler echelleTexte,
  ) {
    final maximum = villes.first.nombre;
    // Les disques varient peu, de quatorze à vingt-deux points : tous
    // ont la place d'afficher deux chiffres, et aucun n'écrase l'autre.
    // C'est la couleur qui porte l'intensité.
    final maigreur = (1 / (1 + (cadrage.zoom - 1) * 0.10)).clamp(0.78, 1.0);
    double rayonDe(int n) =>
        (14 + sqrt((n / maximum).clamp(0.0, 1.0)) * 8) * maigreur;

    var groupes = [
      for (final v in villes)
        _Groupe(
          villes: [v],
          nombre: v.nombre,
          centre: cadrage.projeter(v.longitude, v.latitude),
          rayon: rayonDe(v.nombre),
          part: (v.nombre / maximum).clamp(0.0, 1.0),
        ),
    ];

    // Fusion gloutonne, en plusieurs passes : réunir deux bulles peut en
    // rapprocher une troisième.
    for (var passe = 0; passe < 8; passe++) {
      groupes.sort((a, b) => b.nombre.compareTo(a.nombre));
      var fusion = false;

      for (var i = 0; i < groupes.length; i++) {
        for (var j = i + 1; j < groupes.length; j++) {
          final a = groupes[i], b = groupes[j];
          final distance = (b.centre - a.centre).distance;
          if (distance >= a.rayon + b.rayon + 5) continue;

          // Le centre de la bulle est le barycentre pondéré : elle se
          // place là où le gros des rencontres a eu lieu.
          final n = a.nombre + b.nombre;
          groupes[i] = _Groupe(
            villes: [...a.villes, ...b.villes]
              ..sort((u, v) => v.nombre.compareTo(u.nombre)),
            nombre: n,
            centre: Offset(
              (a.centre.dx * a.nombre + b.centre.dx * b.nombre) / n,
              (a.centre.dy * a.nombre + b.centre.dy * b.nombre) / n,
            ),
            rayon: rayonDe(n),
            part: (n / maximum).clamp(0.0, 1.0),
          );
          groupes.removeAt(j);
          fusion = true;
          j--;
        }
      }
      if (!fusion) break;
    }

    _placerNoms(groupes, taille, echelleTexte);
    return groupes;
  }

  /// Pose chaque nom sous sa bulle, ou pas du tout.
  ///
  /// Toujours dessous : un nom au dessus ou sur le côté oblige à chercher
  /// à quelle bulle il appartient, ce qui est exactement ce qu'une
  /// étiquette doit éviter. Quand la place manque, le nom ne s'affiche
  /// pas, et le classement sous la carte donne le détail.
  ///
  /// La largeur est mesurée pour de vrai. Elle était estimée à cinq
  /// virgule six points par caractère, ce qui sous-estimait les
  /// majuscules espacées : « QUIMPER » se retrouvait coupé en « QUIM… »
  /// alors qu'il y avait la place.
  void _placerNoms(
    List<_Groupe> groupes,
    Size taille,
    TextScaler echelleTexte,
  ) {
    final pris = <Rect>[
      for (final g in groupes)
        Rect.fromCircle(center: g.centre, radius: g.rayon + 2),
    ];
    const hauteurNom = 16.0;

    for (final g in groupes) {
      final peintre = TextPainter(
        text: TextSpan(
          text: g.libelle.toUpperCase(),
          style: const TextStyle(
            fontSize: 9,
            height: 1.25,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.55,
          ),
        ),
        textDirection: TextDirection.ltr,
        textScaler: echelleTexte,
      )..layout();

      // Le texte mesuré, le rembourrage de l'étiquette, son trait, et
      // deux points de jeu. Sans ce jeu, l'arrondi au demi-pixel suffit
      // à rogner la dernière lettre : « QUIMPER » devenait « QUIMPEF ».
      final largeur = peintre.width.ceilToDouble() + 20;
      final centre = Offset(
        g.centre.dx,
        g.centre.dy + g.rayon + 4 + hauteurNom / 2,
      );
      final cadre = Rect.fromCenter(
        center: centre,
        width: largeur,
        height: hauteurNom,
      );

      if (cadre.left < 2 ||
          cadre.right > taille.width - 2 ||
          cadre.bottom > taille.height - 18) {
        continue;
      }
      if (pris.any(cadre.overlaps)) continue;

      g.placeNom = centre;
      g.largeurNom = largeur;
      pris.add(cadre);
    }
  }
}

/// Une bulle : une ville, ou plusieurs trop proches pour être séparées.
class _Groupe {
  _Groupe({
    required this.villes,
    required this.nombre,
    required this.centre,
    required this.rayon,
    required this.part,
  });

  /// De la plus fréquentée à la moins. La première donne son nom.
  final List<_Ville> villes;

  final int nombre;
  final Offset centre;
  final double rayon;

  /// Part du maximum, qui donne la teinte.
  final double part;

  Offset? placeNom;
  double largeurNom = 40;

  bool get seule => villes.length == 1;

  /// Le nom de la ville principale, même quand la bulle en réunit
  /// plusieurs. Un « +2 » collé au nom obligeait à se demander lequel
  /// des deux chiffres lire ; le classement sous la carte détaille ville
  /// par ville, et s'approcher sépare les bulles.
  String get libelle => villes.first.nom;
}

/// Une ville, de sa position sur le globe à sa pastille à l'écran.
class _Ville {
  _Ville(this.nom, this.nombre, this.longitude, this.latitude);

  final String nom;
  final int nombre;
  final double longitude;
  final double latitude;

  /// Part du maximum : conservée pour le tri, la bulle recalcule la
  /// sienne à partir de la somme.
  double part = 0;
}

/// Le cadrage : quelle portion du pays occupe le cadre.
///
/// La projection est une équirectangulaire, la longitude corrigée par le
/// cosinus de la latitude moyenne. À l'échelle d'un pays et sur trois
/// cents pixels, l'écart avec une projection sérieuse est inférieur au
/// pixel, et la formule tient en deux lignes.
class _Cadrage {
  _Cadrage(this.taille, {this.zoom = 1, this.pan = Offset.zero}) {
    _cos = cos(_latMoyenne * pi / 180);

    // Les quatre coins du pays, corrigés en longitude.
    final minX = _lonOuest * _cos;
    final maxX = _lonEst * _cos;
    const minY = -_latNord;
    const maxY = -_latSud;

    var largeur = (maxX - minX) * 1.04;
    var hauteur = (maxY - minY) * 1.04;

    // On aligne les proportions du cadre sur celles de l'écran, sinon la
    // France serait étirée dans un sens ou dans l'autre.
    final rapportCadre = taille.width / taille.height;
    if (largeur / hauteur < rapportCadre) {
      largeur = hauteur * rapportCadre;
    } else {
      hauteur = largeur / rapportCadre;
    }

    _centreX = (minX + maxX) / 2;
    _centreY = (minY + maxY) / 2;
    _echelle = taille.width / largeur;
  }

  /// Les bornes de la France métropolitaine, Corse comprise. Ce sont
  /// elles qui définissent le cadrage de base, c'est à dire ce qu'on
  /// voit quand on a tout dézoomé.
  static const _lonOuest = -5.15;
  static const _lonEst = 9.66;
  static const _latSud = 41.33;
  static const _latNord = 51.09;
  static const _latMoyenne = 46.2;

  final Size taille;
  final double zoom;
  final Offset pan;

  late final double _cos;
  late final double _centreX;
  late final double _centreY;
  late final double _echelle;

  Offset get _centreEcran => Offset(taille.width / 2, taille.height / 2);

  /// La projection sans zoom : celle qui sert à bâtir les chemins du
  /// fond, et à calculer le cadrage d'ouverture.
  Offset projeterBase(double lon, double lat) => Offset(
        taille.width / 2 + (lon * _cos - _centreX) * _echelle,
        taille.height / 2 + (-lat - _centreY) * _echelle,
      );

  Offset projeter(double lon, double lat) {
    final p = projeterBase(lon, lat);
    return (p - _centreEcran) * zoom + _centreEcran + pan;
  }

  /// La zone visible, en degrés, avec une marge d'un dixième.
  ///
  /// C'est l'inverse de la projection, appliqué aux quatre coins du
  /// cadre. La marge évite qu'un trait de côte disparaisse au bord
  /// pendant qu'on déplace la carte.
  Rect fenetreDegres() {
    final marge = Offset(taille.width * 0.1, taille.height * 0.1);
    final hautGauche = _inverser(-marge);
    final basDroite = _inverser(
      Offset(taille.width, taille.height) + marge,
    );
    return Rect.fromLTRB(
      min(hautGauche.dx, basDroite.dx),
      min(hautGauche.dy, basDroite.dy),
      max(hautGauche.dx, basDroite.dx),
      max(hautGauche.dy, basDroite.dy),
    );
  }

  /// D'un point de l'écran vers une longitude et une latitude.
  Offset _inverser(Offset ecran) {
    final base = (ecran - _centreEcran - pan) / zoom + _centreEcran;
    final lon = ((base.dx - taille.width / 2) / _echelle + _centreX) / _cos;
    final lat = -((base.dy - taille.height / 2) / _echelle + _centreY);
    return Offset(lon, lat);
  }

  /// Ce qui identifie le cadrage de base, zoom et déplacement exclus.
  Object get clefBase => Object.hash(taille.width, taille.height);

  /// Un degré de latitude fait 111,2 km : de quoi graduer la règle.
  double get kmParPixel => 111.2 / (_echelle * zoom);
}

/// L'assemblage : la mer, la terre, les animations, les pastilles.
class _Carte extends StatelessWidget {
  const _Carte({
    required this.terre,
    required this.departements,
    required this.groupes,
    required this.cadrage,
    required this.taille,
    required this.arrivee,
    required this.vie,
    required this.zoom,
    required this.onRecadrer,
    required this.charge,
    this.points = const [],
  });

  final List<Offset> points;
  final Path? terre;
  final Path? departements;
  final List<_Groupe> groupes;
  final _Cadrage cadrage;
  final Size taille;
  final Animation<double> arrivee;
  final Animation<double> vie;
  final double zoom;
  final VoidCallback onRecadrer;
  final bool charge;

  @override
  Widget build(BuildContext context) {
    final montee = CurvedAnimation(parent: arrivee, curve: Curves.easeOutCubic);

    return Stack(
      fit: StackFit.expand,
      children: [
        // La mer, immobile. C'est le seul aplat de l'écran, tout le reste
        // se pose dessus.
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(-0.4, -0.5),
              radius: 1.4,
              colors: [Color(0xFF1B1044), Color(0xFF120B2A), Color(0xFF090413)],
              stops: [0.0, 0.5, 1.0],
            ),
          ),
        ),

        // La terre. Le chemin est bâti une fois ; le zoom passe par une
        // matrice, donc s'approcher ne coûte rien.
        if (terre != null)
          FadeTransition(
            opacity: montee,
            child: ScaleTransition(
              scale: Tween(begin: 0.95, end: 1.0).animate(montee),
              child: RepaintBoundary(
                child: CustomPaint(
                  painter: _PeintreTerre(
                    terre: terre!,
                    departements: departements,
                    zoom: cadrage.zoom,
                    pan: cadrage.pan,
                  ),
                  size: taille,
                ),
              ),
            ),
          ),

        // Le balayage de lumière, une seule fois, à l'arrivée.
        _Balayage(arrivee: arrivee),

        // Ce qui bouge en continu : étoiles, ondes, navettes, plus les
        // fils qui relient une pastille écartée à son point exact.
        CustomPaint(
          painter: _PeintreVie(
            groupes: groupes,
            vie: vie,
            arrivee: arrivee,
            kmParPixel: cadrage.kmParPixel,
            points: points,
            // Les points précis apparaissent entre 2,5 et 4 fois : avant,
            // ils se perdent dans la bulle de leur ville.
            opacitePoints: ((zoom - 2.5) / 1.5).clamp(0.0, 1.0),
          ),
          size: taille,
        ),

        // Les noms d'abord, les disques par dessus : une étiquette ne
        // doit jamais passer devant le point qu'elle désigne.
        for (var i = 0; i < groupes.length; i++)
          _Nom(groupe: groupes[i], rang: i, arrivee: arrivee),

        // Et les disques du plus petit au plus grand, pour que la bulle
        // principale finisse au-dessus si d'aventure deux se frôlaient.
        for (var i = groupes.length - 1; i >= 0; i--)
          _Pastille(groupe: groupes[i], rang: i, arrivee: arrivee, vie: vie),

        // Toujours monté, seulement rendu visible : le faire
        // apparaître et disparaître au franchissement d'un seuil le
        // faisait clignoter pendant le pincement.
        Positioned(
          top: 10,
          right: 10,
          child: IgnorePointer(
            ignoring: zoom <= 1.04,
            child: AnimatedOpacity(
              opacity: zoom > 1.04 ? 1 : 0,
              duration: const Duration(milliseconds: 180),
              child: _Recadrer(zoom: zoom, onTap: onRecadrer),
            ),
          ),
        ),

        if (!charge)
          const Center(
            child: SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2.2),
            ),
          ),
      ],
    );
  }
}

/// Le bouton qui remet la carte d'aplomb, avec le facteur de zoom.
class _Recadrer extends StatelessWidget {
  const _Recadrer({required this.zoom, required this.onTap});

  final double zoom;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 11),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0xCC090413),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.zoom_out_map_rounded,
                size: 13, color: AppColors.accentLight),
            const SizedBox(width: 6),
            Text(
              '${zoom.toStringAsFixed(1).replaceAll('.', ',')}×',
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: AppColors.accentLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Le fond de carte : terre, côtes, départements.
class _PeintreTerre extends CustomPainter {
  _PeintreTerre({
    required this.terre,
    required this.departements,
    required this.zoom,
    required this.pan,
  });

  final Path terre;
  final Path? departements;
  final double zoom;
  final Offset pan;

  @override
  void paint(Canvas toile, Size taille) {
    final cadre = Offset.zero & taille;
    final centre = Offset(taille.width / 2, taille.height / 2);

    // Le cadre sert de limite de rendu : le moteur peut écarter ce qui
    // tombe dehors sans le tesseler.
    toile.clipRect(cadre);

    toile.save();
    // Le zoom est une matrice : les chemins, eux, ne sont refaits que
    // quand la sélection d'anneaux visibles change.
    toile.translate(centre.dx + pan.dx, centre.dy + pan.dy);
    toile.scale(zoom);
    toile.translate(-centre.dx, -centre.dy);

    // La lueur sous la côte, en trois traits de plus en plus fins.
    //
    // C'était un MaskFilter.blur, qui oblige le moteur à rendre le
    // chemin dans une couche séparée avant de la flouter. À fort zoom la
    // boîte de ce chemin dépasse largement l'écran, la couche devient
    // gigantesque, et la carte tombait à quelques images par seconde.
    // Trois contours superposés donnent le même halo pour rien.
    for (final (largeur, opacite) in [(9.0, 0.10), (5.0, 0.16), (2.5, 0.22)]) {
      toile.drawPath(
        terre,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = largeur / zoom
          ..strokeJoin = StrokeJoin.round
          ..color = AppColors.primary.withValues(alpha: opacite),
      );
    }

    // La terre, en dégradé : plus claire au nord-ouest, plus profonde au
    // sud-est, pour que la masse ait un relief.
    toile.drawPath(
      terre,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF3B2470), Color(0xFF2C1857), Color(0xFF1E1040)],
          stops: [0.0, 0.55, 1.0],
        ).createShader(cadre),
    );

    // Les départements, en filigrane. Ils ne servent pas à se repérer :
    // ils donnent à la masse la texture d'une carte plutôt que celle
    // d'une tache. Et en s'approchant, ils deviennent utiles.
    final dept = departements;
    if (dept != null) {
      // Pas de clipPath : les limites de départements sont déjà des
      // contours terrestres, elles ne débordent nulle part. Détourer par
      // un chemin de quarante-cinq mille points ne servait qu'à ralentir.
      toile.drawPath(
        dept,
        Paint()
          ..style = PaintingStyle.stroke
          // Divisé par le zoom : sans ça, les traits épaississent en
          // même temps que la carte et finissent par la manger.
          ..strokeWidth = 0.7 / zoom
          ..color = Colors.white
              .withValues(alpha: (0.085 + (zoom - 1) * 0.02).clamp(0.0, 0.2)),
      );
    }

    // Le trait de côte, net, par-dessus tout le reste.
    toile.drawPath(
      terre,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.15 / zoom
        ..strokeJoin = StrokeJoin.round
        ..color = AppColors.accentLight.withValues(alpha: 0.55),
    );

    toile.restore();
  }

  @override
  bool shouldRepaint(_PeintreTerre ancien) =>
      ancien.terre != terre ||
      ancien.departements != departements ||
      ancien.zoom != zoom ||
      ancien.pan != pan;
}

/// Un trait de lumière qui traverse la carte une fois, à l'ouverture.
class _Balayage extends StatelessWidget {
  const _Balayage({required this.arrivee});

  final Animation<double> arrivee;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: arrivee,
      builder: (context, _) {
        // Le balayage passe entre 15 % et 75 % de l'arrivée, puis
        // disparaît pour de bon.
        final t = ((arrivee.value - 0.15) / 0.6).clamp(0.0, 1.0);
        if (t <= 0 || t >= 1) return const SizedBox.shrink();

        return IgnorePointer(
          child: FractionalTranslation(
            translation: Offset(-1.4 + t * 2.8, 0),
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.transparent,
                    Colors.white.withValues(alpha: 0.055 * sin(t * pi)),
                    Colors.transparent,
                  ],
                  stops: const [0.34, 0.5, 0.66],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Tout ce qui bouge en permanence, plus les fils d'ancrage.
class _PeintreVie extends CustomPainter {
  _PeintreVie({
    required this.groupes,
    required this.vie,
    required this.arrivee,
    required this.kmParPixel,
    this.points = const [],
    this.opacitePoints = 0,
  }) : super(repaint: Listenable.merge([vie, arrivee]));

  final List<Offset> points;
  final double opacitePoints;

  final List<_Groupe> groupes;
  final Animation<double> vie;
  final Animation<double> arrivee;
  final double kmParPixel;

  @override
  void paint(Canvas toile, Size taille) {
    _etoiles(toile, taille);
    _liaisons(toile);
    _ondes(toile);
    _points(toile);
    _regle(toile, taille);
  }

  /// Les rencontres posées à la main : un point blanc cerclé d'un halo
  /// fuchsia qui respire, plus discret qu'une ville.
  void _points(Canvas toile) {
    if (opacitePoints <= 0) return;
    final souffle = 0.6 + 0.4 * sin(vie.value * 2 * pi);
    for (final p in points) {
      toile.drawCircle(
        p,
        7 + 2 * souffle,
        Paint()
          ..color = AppColors.accent
              .withValues(alpha: 0.18 * souffle * opacitePoints),
      );
      toile.drawCircle(
        p,
        3,
        Paint()..color = Colors.white.withValues(alpha: opacitePoints),
      );
    }
  }

  /// Des étoiles dans la mer, qui scintillent lentement et à contretemps.
  /// La suite est déterministe : le ciel doit être le même à chaque
  /// ouverture, sinon la carte clignote au lieu de respirer.
  void _etoiles(Canvas toile, Size taille) {
    final pinceau = Paint();
    var graine = 12345;
    double suivant() {
      graine = (graine * 1103515245 + 12345) & 0x7fffffff;
      return (graine % 100000) / 100000;
    }

    for (var i = 0; i < 54; i++) {
      final x = suivant() * taille.width;
      final y = suivant() * taille.height;
      final base = 0.07 + suivant() * 0.2;
      final rayon = 0.5 + suivant() * 0.8;
      final phase = suivant() * 2 * pi;

      final battement = 0.55 + 0.45 * sin(phase + vie.value * 2 * pi);
      toile.drawCircle(
        Offset(x, y),
        rayon,
        pinceau
          ..color = Colors.white
              .withValues(alpha: base * battement * arrivee.value),
      );
    }
  }

  /// Les liaisons depuis le chef-lieu, avec une navette qui les parcourt.
  ///
  /// Comme les positions sont justes, ces traits sont de vrais trajets :
  /// la navette met plus de temps pour Nantes que pour Auray.
  void _liaisons(Canvas toile) {
    if (groupes.length < 2) return;
    final depart = groupes.first.centre;

    for (var i = 1; i < groupes.length; i++) {
      final arrivee2 = groupes[i].centre;
      final tire = ((arrivee.value - 0.2) / 0.5).clamp(0.0, 1.0);
      if (tire <= 0) continue;

      final bout = Offset.lerp(depart, arrivee2, tire)!;
      toile.drawLine(
        depart,
        bout,
        Paint()
          ..strokeWidth = 1
          ..shader = LinearGradient(
            colors: [
              AppColors.accentLight.withValues(alpha: 0.34),
              AppColors.primary.withValues(alpha: 0.07),
            ],
          ).createShader(Rect.fromPoints(depart, arrivee2)),
      );

      if (tire < 1) continue;

      // Une navette par liaison, décalée pour qu'elles ne partent pas
      // toutes ensemble.
      final decalage = (i * 0.17) % 1.0;
      final t = (vie.value + decalage) % 1.0;
      // Elle glisse sur les deux premiers tiers du cycle, puis attend :
      // un point qui revient en boucle sans répit donne le tournis.
      if (t > 0.72) continue;

      final avance = Curves.easeInOut.transform(t / 0.72);
      final ou = Offset.lerp(depart, arrivee2, avance)!;
      final eclat = sin(avance * pi);

      toile.drawCircle(
        ou,
        4.5,
        Paint()
          ..color = AppColors.accentLight.withValues(alpha: 0.22 * eclat)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4),
      );
      toile.drawCircle(
        ou,
        1.7,
        Paint()..color = Colors.white.withValues(alpha: 0.85 * eclat),
      );
    }
  }

  /// Deux ondes concentriques sur le chef-lieu, en décalé.
  void _ondes(Canvas toile) {
    if (arrivee.value < 0.6) return;
    final tete = groupes.first;

    for (var n = 0; n < 2; n++) {
      final t = (vie.value + n * 0.5) % 1.0;
      // L'onde ne vit que la moitié du cycle : sinon il y en a toujours
      // une à l'écran, et l'effet de pulsation disparaît.
      if (t > 0.55) continue;

      final avance = t / 0.55;
      final rayon = tete.rayon * (1 + avance * 2.4);
      toile.drawCircle(
        tete.centre,
        rayon,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6 * (1 - avance)
          ..color = AppColors.accent.withValues(alpha: 0.42 * (1 - avance)),
      );
    }
  }

  /// La règle graphique. Sans elle, rien ne dit si la vue couvre un
  /// département ou le pays entier, et le zoom rend la question pressante.
  void _regle(Canvas toile, Size taille) {
    if (kmParPixel <= 0 || !kmParPixel.isFinite) return;

    const paliers = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    var km = paliers.last;
    for (final palier in paliers) {
      if (palier / kmParPixel >= 46) {
        km = palier;
        break;
      }
    }
    final longueur = (km / kmParPixel).clamp(36.0, taille.width / 2);

    final y = taille.height - 14;
    const x = 15.0;
    final trait = Paint()
      ..strokeWidth = 1.2
      ..color = Colors.white.withValues(alpha: 0.34 * arrivee.value);

    toile.drawLine(Offset(x, y), Offset(x + longueur, y), trait);
    toile.drawLine(Offset(x, y - 3.5), Offset(x, y + 3.5), trait);
    toile.drawLine(
      Offset(x + longueur, y - 3.5),
      Offset(x + longueur, y + 3.5),
      trait,
    );

    final peintre = TextPainter(
      text: TextSpan(
        text: km >= 1 ? '$km km' : '$km km',
        style: TextStyle(
          fontSize: 9,
          height: 1,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.4,
          color: Colors.white.withValues(alpha: 0.44 * arrivee.value),
          shadows: const [Shadow(color: Color(0xCC08040F), blurRadius: 4)],
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    peintre.paint(
      toile,
      Offset(x + longueur / 2 - peintre.width / 2, y - 15),
    );
  }

  @override
  bool shouldRepaint(_PeintreVie ancien) => true;
}

/// La pastille d'une ville, avec son nom.
class _Pastille extends StatelessWidget {
  const _Pastille({
    required this.groupe,
    required this.rang,
    required this.arrivee,
    required this.vie,
  });

  final _Groupe groupe;
  final int rang;
  final Animation<double> arrivee;
  final Animation<double> vie;

  @override
  Widget build(BuildContext context) {
    // Les grosses villes arrivent d'abord : le regard part de
    // l'essentiel, puis descend le classement.
    final debut = (0.32 + rang * 0.055).clamp(0.0, 0.85);
    final chute = CurvedAnimation(
      parent: arrivee,
      curve: Interval(debut, min(debut + 0.4, 1.0), curve: Curves.easeOutBack),
    );

    final teinte = Color.lerp(
      const Color(0xFF7C3AED),
      const Color(0xFFF0ABFC),
      groupe.part,
    )!;

    return AnimatedBuilder(
      animation: Listenable.merge([chute, vie]),
      builder: (context, _) {
        final t = chute.value;
        if (t <= 0) return const SizedBox.shrink();

        // Le chef-lieu respire, très légèrement. Les autres sont fixes :
        // si tout bouge, plus rien ne ressort.
        final souffle = rang == 0
            ? 1 + 0.028 * sin(vie.value * 2 * pi)
            : 1.0;
        final rayon = groupe.rayon * souffle;

        // Elle tombe de quelques points au-dessus de sa place, et s'y
        // arrête pile : le centre du disque est la ville.
        final y = groupe.centre.dy - (1 - t) * 18;

        return Positioned(
          left: groupe.centre.dx - rayon,
          top: y - rayon,
          width: rayon * 2,
          height: rayon * 2,
          child: IgnorePointer(
            child: Opacity(
              opacity: t.clamp(0.0, 1.0),
              child: _Disque(rayon: rayon, teinte: teinte, groupe: groupe),
            ),
          ),
        );
      },
    );
  }
}

class _Disque extends StatelessWidget {
  const _Disque({
    required this.rayon,
    required this.teinte,
    required this.groupe,
  });

  final double rayon;
  final Color teinte;
  final _Groupe groupe;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: rayon * 2,
      height: rayon * 2,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color.lerp(teinte, Colors.white, 0.34)!,
            teinte,
            Color.lerp(teinte, const Color(0xFF2E1065), 0.45)!,
          ],
          stops: const [0.0, 0.46, 1.0],
        ),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.42),
          width: 1.4,
        ),
        boxShadow: [
          // Un halo court : il valait 1,3 fois le rayon, ce qui autour
          // d'un gros disque faisait une tache pâle de la taille d'un
          // département.
          BoxShadow(
            color: teinte.withValues(alpha: 0.45),
            blurRadius: 10,
            spreadRadius: -2,
          ),
          const BoxShadow(
            color: Color(0x66000000),
            blurRadius: 12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      // Toujours le nombre : c'est la seule chose que la pastille a à
      // dire, et un disque muet ne sert à rien.
      child: Text(
              '${groupe.nombre}',
              style: TextStyle(
                fontSize: 11.5 + groupe.part * 3,
                height: 1,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                shadows: const [
                  Shadow(color: Color(0x9908040F), blurRadius: 5),
                ],
              ),
            ),
    );
  }
}

/// Le nom d'une ville, posé là où il y avait de la place.
///
/// Il vit maintenant à part du disque : celui-ci ne bouge jamais, alors
/// que le nom se range dessous, dessus ou sur un côté selon ce qui est
/// libre. Quand rien ne l'est, il ne s'affiche pas du tout, et c'est
/// préférable à deux noms superposés.
///
/// L'étiquette est sombre parce que posée à même la carte, le texte
/// devenait illisible dès qu'il tombait sur une zone claire.
class _Nom extends StatelessWidget {
  const _Nom({
    required this.groupe,
    required this.rang,
    required this.arrivee,
  });

  final _Groupe groupe;
  final int rang;
  final Animation<double> arrivee;

  @override
  Widget build(BuildContext context) {
    final place = groupe.placeNom;
    if (place == null) return const SizedBox.shrink();

    final debut = (0.42 + rang * 0.05).clamp(0.0, 0.9);
    final venue = CurvedAnimation(
      parent: arrivee,
      curve: Interval(debut, 1, curve: Curves.easeOut),
    );

    return AnimatedBuilder(
      animation: venue,
      // Sans largeur ni hauteur imposées : l'étiquette prend sa taille
      // naturelle, donc elle ne peut pas rogner son propre texte. La
      // largeur mesurée ne sert plus qu'à la centrer et à savoir si elle
      // tient sans en recouvrir une autre.
      builder: (context, enfant) => Positioned(
        left: place.dx - groupe.largeurNom / 2,
        top: place.dy - 8,
        child: IgnorePointer(
          child: Opacity(opacity: venue.value.clamp(0.0, 1.0), child: enfant),
        ),
      ),
      child: _Etiquette(groupe: groupe),
    );
  }
}

class _Etiquette extends StatelessWidget {
  const _Etiquette({required this.groupe});

  final _Groupe groupe;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: const Color(0xB3090413),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.11)),
      ),
      alignment: Alignment.center,
      child: Text(
        groupe.libelle.toUpperCase(),
        maxLines: 1,
        softWrap: false,
        overflow: TextOverflow.visible,
        style: TextStyle(
          fontSize: 9,
          height: 1.25,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.55,
          color: Colors.white.withValues(alpha: 0.92),
        ),
      ),
    );
  }
}
