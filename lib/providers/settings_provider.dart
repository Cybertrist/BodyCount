import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../security/screen_guard.dart';

/// Réglages persistés.
///
/// Ils tiennent dans le stockage sécurisé, déjà présent pour la clé : deux
/// booléens ne justifient pas d'embarquer une dépendance de plus, et ça
/// évite qu'ils traînent dans un fichier XML lisible.
class ReglagesStore {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _cleEcran = 'reglage_ecran_protege';
  static const _cleDelai = 'reglage_delai_verrou';
  static const _cleVerrou = 'reglage_verrou_actif';
  static const _cleSauvegarde = 'derniere_sauvegarde';
  static const _cleRappel = 'rappel_sauvegarde_repousse';

  /// Éteint par défaut pendant la phase d'essai, pour laisser passer les
  /// captures d'écran. À rebasculer avant un usage réel.
  static Future<bool> ecranProtege() async {
    final valeur = await _storage.read(key: _cleEcran);
    return valeur == 'oui';
  }

  static Future<void> setEcranProtege(bool actif) async {
    await _storage.write(key: _cleEcran, value: actif ? 'oui' : 'non');
    await ScreenGuard.setProtected(actif);
  }

  /// Le verrou à l'ouverture. Actif par défaut : sur une application
  /// dont c'est tout le sujet, le réglage sûr est celui qu'on trouve en
  /// arrivant, pas celui qu'on doit aller chercher.
  static Future<bool> verrouActif() async {
    final valeur = await _storage.read(key: _cleVerrou);
    return valeur != 'non';
  }

  static Future<void> setVerrouActif(bool actif) async {
    await _storage.write(key: _cleVerrou, value: actif ? 'oui' : 'non');
  }

  /// Le dernier export mené à son terme, enregistré ou partagé.
  static Future<DateTime?> derniereSauvegarde() async {
    final valeur = await _storage.read(key: _cleSauvegarde);
    return valeur == null ? null : DateTime.tryParse(valeur);
  }

  static Future<void> noterSauvegarde(DateTime quand) async {
    await _storage.write(key: _cleSauvegarde, value: quand.toIso8601String());
  }

  /// Jusqu'à quand le rappel se tait, après un « plus tard ».
  static Future<DateTime?> rappelRepousse() async {
    final valeur = await _storage.read(key: _cleRappel);
    return valeur == null ? null : DateTime.tryParse(valeur);
  }

  static Future<void> repousserRappel(DateTime jusqua) async {
    await _storage.write(key: _cleRappel, value: jusqua.toIso8601String());
  }

  static Future<int> delaiVerrouSecondes() async {
    final valeur = await _storage.read(key: _cleDelai);
    return int.tryParse(valeur ?? '') ?? 45;
  }

  static Future<void> setDelaiVerrou(int secondes) async {
    await _storage.write(key: _cleDelai, value: '$secondes');
  }
}

/// État en mémoire des réglages, chargé au démarrage puis suivi par l'UI.
class ReglagesNotifier extends StateNotifier<Reglages> {
  ReglagesNotifier() : super(const Reglages()) {
    _charger();
  }

  Future<void> _charger() async {
    final ecran = await ReglagesStore.ecranProtege();
    final delai = await ReglagesStore.delaiVerrouSecondes();
    final verrou = await ReglagesStore.verrouActif();
    if (!mounted) return;
    state = Reglages(
      ecranProtege: ecran,
      delaiVerrou: Duration(seconds: delai),
      verrouActif: verrou,
    );
    // Réapplique la protection telle qu'elle avait été réglée : le drapeau
    // est remis à chaque démarrage côté Android, il faut le retirer si
    // l'utilisateur l'avait désactivé.
    await ScreenGuard.setProtected(ecran);
  }

  Future<void> setEcranProtege(bool actif) async {
    state = state.copyWith(ecranProtege: actif);
    await ReglagesStore.setEcranProtege(actif);
  }

  Future<void> setDelaiVerrou(Duration delai) async {
    state = state.copyWith(delaiVerrou: delai);
    await ReglagesStore.setDelaiVerrou(delai.inSeconds);
  }

  Future<void> setVerrouActif(bool actif) async {
    state = state.copyWith(verrouActif: actif);
    await ReglagesStore.setVerrouActif(actif);
  }
}

class Reglages {
  const Reglages({
    this.ecranProtege = false,
    this.delaiVerrou = const Duration(seconds: 45),
    this.verrouActif = true,
  });

  final bool ecranProtege;
  final Duration delaiVerrou;

  /// Demander l'empreinte à l'ouverture. Coupé, l'application s'ouvre
  /// seule et le verrouillage automatique ne sert plus à rien.
  final bool verrouActif;

  Reglages copyWith({
    bool? ecranProtege,
    Duration? delaiVerrou,
    bool? verrouActif,
  }) {
    return Reglages(
      ecranProtege: ecranProtege ?? this.ecranProtege,
      delaiVerrou: delaiVerrou ?? this.delaiVerrou,
      verrouActif: verrouActif ?? this.verrouActif,
    );
  }
}

final reglagesProvider =
    StateNotifierProvider<ReglagesNotifier, Reglages>((ref) {
  return ReglagesNotifier();
});

/// Où en est la sauvegarde, pour le rappel du répertoire et les réglages.
class EtatSauvegarde {
  const EtatSauvegarde({this.derniere, this.repousseJusqua});

  /// Au delà, une sauvegarde est jugée ancienne. Un mois : assez long pour
  /// ne pas harceler, assez court pour que perdre le téléphone ne coûte
  /// qu'un mois.
  static const perime = Duration(days: 30);

  /// Un « plus tard » tait le rappel une semaine.
  static const repit = Duration(days: 7);

  final DateTime? derniere;
  final DateTime? repousseJusqua;

  /// Vrai quand il faut en parler : jamais faite, ou trop vieille, et pas
  /// repoussée.
  bool aRappeler(DateTime maintenant) {
    final repousse = repousseJusqua;
    if (repousse != null && maintenant.isBefore(repousse)) return false;
    final d = derniere;
    return d == null || maintenant.difference(d) > perime;
  }
}

final sauvegardeProvider = FutureProvider<EtatSauvegarde>((ref) async {
  return EtatSauvegarde(
    derniere: await ReglagesStore.derniereSauvegarde(),
    repousseJusqua: await ReglagesStore.rappelRepousse(),
  );
});
