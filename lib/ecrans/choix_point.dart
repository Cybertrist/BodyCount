import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../config/theme.dart';
import '../donnees/coordonnees.dart';
import '../donnees/geometrie_france.dart';

/// Poser une rencontre à un point précis, à la main.
///
/// Sans tuiles, il n'y a ni rues ni bâtiments à montrer : la carte ne
/// connaît que la côte, les départements et les communes. Ce sont donc
/// les communes voisines, avec leur nom, qui servent de repère, les plus
/// peuplées d'abord. De quoi poser un point « entre Arradon et Séné »,
/// sans rien demander à un serveur.
///
/// Rend la position choisie, ou null si on ressort sans rien poser.
class EcranChoixPoint extends StatefulWidget {
  const EcranChoixPoint({super.key, this.depart, this.point});

  /// Où ouvrir la carte, en général la commune du lieu saisi.
  final Coordonnee? depart;

  /// Le point déjà posé, s'il y en a un.
  final Coordonnee? point;

  @override
  State<EcranChoixPoint> createState() => _EcranChoixPointState();
}

class _EcranChoixPointState extends State<EcranChoixPoint> {
  late final Future<GeometrieFrance> _geo = GeometrieFrance.charger();

  /// Le centre de la vue, en degrés.
  late double _lon;
  late double _lat;

  /// Pixels par degré de longitude corrigé, c'est à dire par degré de
  /// latitude : la projection garde les distances à peu près justes
  /// autour de la latitude moyenne de la France.
  double _echelle = 0;

  Coordonnee? _point;

  // L'état au début d'un geste.
  double _echelleDepart = 0;
  Offset _foyerDepart = Offset.zero;
  double _lonDepart = 0;
  double _latDepart = 0;

  static final _cos = math.cos(46.2 * math.pi / 180);

  @override
  void initState() {
    super.initState();
    _point = widget.point;
    final centre = widget.point ?? widget.depart;
    _lon = centre?.longitude ?? 2.4;
    _lat = centre?.latitude ?? 46.6;
  }

  /// Un degré vers l'écran, et l'inverse.
  Offset _versEcran(double lon, double lat, Size taille) => Offset(
    taille.width / 2 + (lon - _lon) * _cos * _echelle,
    taille.height / 2 - (lat - _lat) * _echelle,
  );

  Coordonnee _versDegres(Offset p, Size taille) => (
    longitude: _lon + (p.dx - taille.width / 2) / (_cos * _echelle),
    latitude: _lat - (p.dy - taille.height / 2) / _echelle,
  );

  void _debut(ScaleStartDetails d) {
    _echelleDepart = _echelle;
    _foyerDepart = d.localFocalPoint;
    _lonDepart = _lon;
    _latDepart = _lat;
  }

  /// Pincer et glisser d'un même geste : le point sous les doigts au
  /// départ reste sous les doigts.
  void _geste(ScaleUpdateDetails d, Size taille) {
    setState(() {
      final avant = _echelleDepart;
      final apres = (avant * d.scale).clamp(_echelleMin(taille), 90000.0);
      // Le lieu sous le foyer au départ du geste.
      final lonFoyer =
          _lonDepart + (_foyerDepart.dx - taille.width / 2) / (_cos * avant);
      final latFoyer =
          _latDepart - (_foyerDepart.dy - taille.height / 2) / avant;
      _echelle = apres;
      _lon =
          lonFoyer - (d.localFocalPoint.dx - taille.width / 2) / (_cos * apres);
      _lat = latFoyer + (d.localFocalPoint.dy - taille.height / 2) / apres;
    });
  }

  /// Au plus loin, la France entière tient dans l'écran.
  double _echelleMin(Size taille) => taille.width / (15 * _cos);

  void _poser(TapUpDetails d, Size taille) {
    setState(() => _point = _versDegres(d.localPosition, taille));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Point précis'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Annuler',
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: LayoutBuilder(
        builder: (context, contraintes) {
          final taille = Size(contraintes.maxWidth, contraintes.maxHeight);
          // Première mise en page : vingt-cinq kilomètres de large autour
          // du départ, ou la France entière faute de départ.
          if (_echelle == 0) {
            _echelle = widget.point != null || widget.depart != null
                ? taille.width / (0.32 * _cos)
                : _echelleMin(taille);
          }

          return FutureBuilder<GeometrieFrance>(
            future: _geo,
            builder: (context, instantane) {
              return GestureDetector(
                behavior: HitTestBehavior.opaque,
                onScaleStart: _debut,
                onScaleUpdate: (d) => _geste(d, taille),
                onTapUp: (d) => _poser(d, taille),
                child: CustomPaint(
                  size: taille,
                  painter: _PeintreChoix(
                    geo: instantane.data,
                    versEcran: (lon, lat) => _versEcran(lon, lat, taille),
                    versDegres: (p) => _versDegres(p, taille),
                    echelle: _echelle,
                    point: _point,
                  ),
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 12, 22, 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _point == null
                    ? 'Touche la carte pour poser le point.'
                    : '${_point!.latitude.toStringAsFixed(4)} N, '
                          '${_point!.longitude.abs().toStringAsFixed(4)} '
                          '${_point!.longitude < 0 ? 'O' : 'E'}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _point == null
                    ? null
                    : () => Navigator.pop(context, _point),
                child: const Text('Poser ici'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PeintreChoix extends CustomPainter {
  _PeintreChoix({
    required this.geo,
    required this.versEcran,
    required this.versDegres,
    required this.echelle,
    required this.point,
  });

  final GeometrieFrance? geo;
  final Offset Function(double lon, double lat) versEcran;
  final Coordonnee Function(Offset p) versDegres;
  final double echelle;
  final Coordonnee? point;

  @override
  void paint(Canvas toile, Size taille) {
    // La mer, franche et sombre, pour que la côte se lise d'un coup
    // d'oeil à n'importe quel zoom.
    toile.drawRect(
      Offset.zero & taille,
      Paint()..color = const Color(0xFF07030F),
    );

    // La zone visible, en degrés, pour ne bâtir que ce qui s'y trouve.
    final coin1 = versDegres(Offset.zero);
    final coin2 = versDegres(Offset(taille.width, taille.height));
    final fenetre = Rect.fromLTRB(
      coin1.longitude,
      coin2.latitude,
      coin2.longitude,
      coin1.latitude,
    );

    final g = geo;
    if (g != null) {
      final terre = GeometrieFrance.cheminDe(
        g.cote,
        versEcran,
        fenetre: fenetre,
        bornes: g.bornesCote,
      );
      toile.drawPath(terre, Paint()..color = const Color(0xFF261650));
      toile.drawPath(
        terre,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.4
          ..color = AppColors.accent.withValues(alpha: 0.55),
      );
      // Pas de limites de départements : à l'échelle d'une commune,
      // leurs segments simplifiés traversent la mer en lignes droites.
    }

    _communes(toile, taille, fenetre);
    _regle(toile, taille);

    final p = point;
    if (p != null) _epingle(toile, versEcran(p.longitude, p.latitude));
  }

  /// Les communes visibles, un point et un nom, les plus peuplées d'abord.
  /// Un nom qui en chevaucherait un autre n'est pas écrit : mieux vaut
  /// moins de repères que des repères illisibles.
  void _communes(Canvas toile, Size taille, Rect fenetre) {
    final communes = communesDans(
      fenetre.left,
      fenetre.top,
      fenetre.right,
      fenetre.bottom,
      maximum: 140,
    );
    final occupees = <Rect>[];
    var ecrites = 0;
    for (final c in communes) {
      final ici = versEcran(c.position.longitude, c.position.latitude);
      toile.drawCircle(
        ici,
        2.2,
        Paint()..color = Colors.white.withValues(alpha: 0.55),
      );
      if (ecrites >= 45) continue;

      final texte = TextPainter(
        text: TextSpan(
          text: c.nom,
          style: TextStyle(
            fontSize: ecrites < 6 ? 12.5 : 11,
            fontWeight: ecrites < 6 ? FontWeight.w700 : FontWeight.w600,
            color: Colors.white.withValues(alpha: ecrites < 6 ? 0.92 : 0.66),
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      final boite = Rect.fromLTWH(
        ici.dx + 6,
        ici.dy - texte.height / 2,
        texte.width,
        texte.height,
      );
      if (occupees.any((o) => o.overlaps(boite.inflate(3)))) continue;
      occupees.add(boite);
      texte.paint(toile, boite.topLeft);
      ecrites++;
    }
  }

  /// La règle, en bas à gauche : la distance d'une centaine de pixels,
  /// arrondie à une valeur ronde.
  void _regle(Canvas toile, Size taille) {
    final kmParPixel = 111.2 / echelle;
    final brut = kmParPixel * 110;
    final puissance = math.pow(10, (math.log(brut) / math.ln10).floor());
    final valeur = [1, 2, 5, 10]
        .map((m) => m * puissance)
        .lastWhere((v) => v <= brut, orElse: () => puissance);
    final longueur = valeur / kmParPixel;
    final y = taille.height - 22;
    final pinceau = Paint()
      ..color = Colors.white.withValues(alpha: 0.7)
      ..strokeWidth = 1.4;
    toile.drawLine(Offset(18, y), Offset(18 + longueur, y), pinceau);
    toile.drawLine(Offset(18, y - 4), Offset(18, y + 4), pinceau);
    toile.drawLine(
      Offset(18 + longueur, y - 4),
      Offset(18 + longueur, y + 4),
      pinceau,
    );
    final libelle = valeur >= 1
        ? '${valeur.round()} km'
        : '${(valeur * 1000).round()} m';
    (TextPainter(
      text: TextSpan(
        text: libelle,
        style: const TextStyle(fontSize: 11, color: Colors.white70),
      ),
      textDirection: TextDirection.ltr,
    )..layout()).paint(toile, Offset(18, y - 20));
  }

  /// L'épingle, la pointe exactement sur le point.
  void _epingle(Canvas toile, Offset p) {
    toile.drawCircle(
      p,
      14,
      Paint()..color = AppColors.accent.withValues(alpha: 0.22),
    );
    final forme = Path()
      ..moveTo(p.dx, p.dy)
      ..cubicTo(p.dx - 4, p.dy - 10, p.dx - 13, p.dy - 16, p.dx - 13, p.dy - 26)
      ..arcToPoint(
        Offset(p.dx + 13, p.dy - 26),
        radius: const Radius.circular(13),
      )
      ..cubicTo(p.dx + 13, p.dy - 16, p.dx + 4, p.dy - 10, p.dx, p.dy)
      ..close();
    toile.drawPath(
      forme,
      Paint()
        ..shader = AppColors.brandGradient.createShader(
          Rect.fromCircle(center: p.translate(0, -24), radius: 16),
        ),
    );
    toile.drawCircle(p.translate(0, -26), 4.5, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_PeintreChoix ancien) => true;
}
