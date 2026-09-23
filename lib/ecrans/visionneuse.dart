import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';

import '../config/theme.dart';
import '../domaine/note.dart';
import '../providers/donnees.dart';
import '../security/vault_image.dart';
import '../security/video_vault.dart';
import '../widgets/vignette_media.dart';

/// Les photos et vidéos d'une personne, en plein écran.
///
/// On glisse d'un média à l'autre, on pince une photo pour l'agrandir, on
/// touche une vidéo pour la mettre en pause. Le menu du haut reprend ce
/// que faisait l'appui long de la galerie : mettre en avant, supprimer.
class EcranVisionneuse extends ConsumerStatefulWidget {
  const EcranVisionneuse({
    super.key,
    required this.personneId,
    required this.depart,
  });

  final int personneId;

  /// Rang du média ouvert en premier.
  final int depart;

  @override
  ConsumerState<EcranVisionneuse> createState() => _EcranVisionneuseState();
}

class _EcranVisionneuseState extends ConsumerState<EcranVisionneuse> {
  late final PageController _pages =
      PageController(initialPage: widget.depart);
  late int _rang = widget.depart;

  /// Vrai pendant qu'une photo est agrandie : glisser la déplace, au lieu
  /// de passer à la suivante.
  bool _agrandie = false;

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  Future<void> _menu(Photo media) async {
    final choix = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.card,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!media.video && !media.principale)
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
      await depotPhotos.definirPrincipale(widget.personneId, media.chemin);
    } else if (choix == 'supprimer') {
      await depotPhotos.supprimer(media);
    } else {
      return;
    }
    if (!mounted) return;
    rafraichir(ref, personneId: widget.personneId);
  }

  @override
  Widget build(BuildContext context) {
    final liste =
        ref.watch(photosProvider(widget.personneId)).valueOrNull ?? const [];

    // Le dernier média vient d'être supprimé : plus rien à montrer.
    if (liste.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && context.canPop()) context.pop();
      });
      return const Scaffold(backgroundColor: Colors.black);
    }

    final rang = _rang.clamp(0, liste.length - 1);
    final courant = liste[rang];

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: const Color(0x66000000),
        foregroundColor: Colors.white,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          tooltip: 'Fermer',
          onPressed: () => context.pop(),
        ),
        title: Text(
          '${rang + 1} / ${liste.length}',
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            tooltip: 'Actions',
            onPressed: () => _menu(courant),
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pages,
        physics: _agrandie
            ? const NeverScrollableScrollPhysics()
            : const PageScrollPhysics(),
        itemCount: liste.length,
        onPageChanged: (i) => setState(() {
          _rang = i;
          _agrandie = false;
        }),
        itemBuilder: (context, i) {
          final media = liste[i];
          if (media.video) {
            // La clé fait qu'une vidéo quittée est vraiment libérée : son
            // lecteur s'arrête et sa copie en clair est effacée.
            return _Video(key: ValueKey(media.chemin), media: media);
          }
          return _Photo(
            key: ValueKey(media.chemin),
            chemin: media.chemin,
            onAgrandie: (v) {
              if (v != _agrandie) setState(() => _agrandie = v);
            },
          );
        },
      ),
    );
  }
}

class _Photo extends StatefulWidget {
  const _Photo({super.key, required this.chemin, required this.onAgrandie});

  final String chemin;
  final ValueChanged<bool> onAgrandie;

  @override
  State<_Photo> createState() => _PhotoState();
}

class _PhotoState extends State<_Photo> {
  final _transformation = TransformationController();

  @override
  void dispose() {
    _transformation.dispose();
    super.dispose();
  }

  /// Double toucher : agrandit deux fois et demie à l'endroit touché, ou
  /// revient à la taille d'origine.
  void _basculer(TapDownDetails d) {
    if (_transformation.value.getMaxScaleOnAxis() > 1.01) {
      _transformation.value = Matrix4.identity();
      widget.onAgrandie(false);
      return;
    }
    const facteur = 2.5;
    final point = d.localPosition;
    _transformation.value = Matrix4.identity()
      ..translateByDouble(
          -point.dx * (facteur - 1), -point.dy * (facteur - 1), 0, 1)
      ..scaleByDouble(facteur, facteur, 1, 1);
    widget.onAgrandie(true);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTapDown: _basculer,
      onDoubleTap: () {},
      child: InteractiveViewer(
        transformationController: _transformation,
        minScale: 1,
        maxScale: 6,
        onInteractionEnd: (_) => widget
            .onAgrandie(_transformation.value.getMaxScaleOnAxis() > 1.01),
        child: SizedBox.expand(
          child: VaultImage(path: widget.chemin, fit: BoxFit.contain),
        ),
      ),
    );
  }
}

class _Video extends StatefulWidget {
  const _Video({super.key, required this.media});

  final Photo media;

  @override
  State<_Video> createState() => _VideoState();
}

class _VideoState extends State<_Video> {
  File? _clair;
  VideoPlayerController? _lecteur;
  bool _echec = false;
  bool _ferme = false;

  @override
  void initState() {
    super.initState();
    _ouvrir();
  }

  Future<void> _ouvrir() async {
    final clair =
        await VideoVault.instance.dechiffrerPourLecture(widget.media.chemin);
    if (clair == null) {
      if (mounted) setState(() => _echec = true);
      return;
    }
    if (_ferme) {
      await VideoVault.instance.oublierLecture(clair);
      return;
    }
    _clair = clair;

    final lecteur = VideoPlayerController.file(clair);
    try {
      await lecteur.initialize();
    } catch (_) {
      await lecteur.dispose();
      if (mounted) setState(() => _echec = true);
      return;
    }
    if (_ferme) {
      await lecteur.dispose();
      return;
    }
    await lecteur.setLooping(true);
    await lecteur.play();
    setState(() => _lecteur = lecteur);
  }

  @override
  void dispose() {
    _ferme = true;
    final lecteur = _lecteur;
    final clair = _clair;
    () async {
      await lecteur?.dispose();
      if (clair != null) await VideoVault.instance.oublierLecture(clair);
    }();
    super.dispose();
  }

  void _basculer() {
    final lecteur = _lecteur;
    if (lecteur == null) return;
    setState(() {
      lecteur.value.isPlaying ? lecteur.pause() : lecteur.play();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_echec) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.videocam_off_outlined,
                size: 34, color: AppColors.textTertiary),
            SizedBox(height: 10),
            Text(
              'Vidéo illisible',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    final lecteur = _lecteur;
    if (lecteur == null) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(strokeWidth: 2.4),
            SizedBox(height: 14),
            Text(
              'Déchiffrement…',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _basculer,
      child: Stack(
        children: [
          Center(
            child: AspectRatio(
              aspectRatio: lecteur.value.aspectRatio,
              child: VideoPlayer(lecteur),
            ),
          ),
          if (!lecteur.value.isPlaying)
            const Center(
              child: Icon(
                Icons.play_circle_fill_rounded,
                size: 72,
                color: Color(0xCCFFFFFF),
              ),
            ),
          Positioned(
            left: 18,
            right: 18,
            bottom: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _Barre(lecteur: lecteur),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// La position dans la vidéo, qu'on peut faire glisser.
class _Barre extends StatelessWidget {
  const _Barre({required this.lecteur});

  final VideoPlayerController lecteur;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<VideoPlayerValue>(
      valueListenable: lecteur,
      builder: (context, valeur, _) {
        return Row(
          children: [
            Text(
              formaterDuree(valeur.position),
              style: const TextStyle(fontSize: 12, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: VideoProgressIndicator(
                lecteur,
                allowScrubbing: true,
                padding: const EdgeInsets.symmetric(vertical: 12),
                colors: const VideoProgressColors(
                  playedColor: AppColors.accent,
                  bufferedColor: Color(0x40FFFFFF),
                  backgroundColor: Color(0x26FFFFFF),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              formaterDuree(valeur.duration),
              style: const TextStyle(fontSize: 12, color: Colors.white),
            ),
          ],
        );
      },
    );
  }
}
